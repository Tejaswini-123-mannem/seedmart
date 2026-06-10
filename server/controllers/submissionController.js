// controllers/submissionController.js
// ----------------------------------------------------------------------------
// Farmer-facing logic for the review-submission queue.
//   createSubmission  → a logged-in farmer submits a new claim
//   getMySubmissions  → a farmer lists their own submissions (any status)
//
// Admin moderation (approve/reject) and the public Review model come in 4b/4c.
// ----------------------------------------------------------------------------

import mongoose from "mongoose";
import ReviewSubmission from "../models/ReviewSubmission.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";

// ── CREATE ──────────────────────────────────────────────────────────────────
// POST /api/submissions   (logged-in farmer only)
export const createSubmission = async (req, res) => {
  try {
    // We ONLY accept the claim fields from the client. Identity fields
    // (farmerName, phone) and the status are set by the SERVER below — a client
    // must never be able to forge another farmer's identity or self-approve.
    const { product, yield: yieldResult, notes, photos } = req.body;

    // 1. Validate the product reference: must be a well-formed id AND exist.
    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const productExists = await Product.exists({ _id: product });
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 2. Snapshot identity from the DB (the trusted source), NOT the request.
    //    The JWT only carries userId, so we look the user up to copy their
    //    current name + phone into the submission as an immutable record.
    const user = await User.findById(req.user.userId).select("username phone");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Create the submission. status defaults to "pending" in the schema —
    //    we do not read it from the body, so no one can self-approve.
    const submission = await ReviewSubmission.create({
      product,
      user: user._id,
      farmerName: user.username,
      phone: user.phone,
      yield: yieldResult,
      notes,
      photos,
    });

    res.status(201).json(submission);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// ── LIST OWN SUBMISSIONS ────────────────────────────────────────────────────
// GET /api/submissions/mine   (logged-in farmer only)
export const getMySubmissions = async (req, res) => {
  try {
    // Scope strictly to the caller — a farmer can only ever see their own queue.
    const submissions = await ReviewSubmission.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      // Pull in a little product context so the UI can show which seed each
      // submission is about, without a second round-trip.
      .populate("product", "name company");

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// ADMIN MODERATION  (all routes below are gated by protect + adminOnly)
// ════════════════════════════════════════════════════════════════════════════

// ── LIST (admin queue) ──────────────────────────────────────────────────────
// GET /api/submissions?status=pending   (admin only)
// Returns submissions WITH phone — the admin needs it to verify the farmer.
export const getSubmissions = async (req, res) => {
  try {
    // Default to the pending queue; allow filtering to any valid status.
    const status = req.query.status || "pending";
    const allowed = ["pending", "approved", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status filter" });
    }

    const submissions = await ReviewSubmission.find({ status })
      .sort({ createdAt: -1 })
      .populate("product", "name company");

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── APPROVE ─────────────────────────────────────────────────────────────────
// PATCH /api/submissions/:id/approve   (admin only)
// Atomically: flip status → "approved" AND create the public Review.
export const approveSubmission = async (req, res) => {
  const { id } = req.params;

  // Crop photos are supplied by the ADMIN at approval time (collected offline
  // from the farmer), not by the farmer's submission form. Already-uploaded
  // Cloudinary URLs arrive in the body; default to none.
  const photos = Array.isArray(req.body.photos) ? req.body.photos : [];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Submission not found" });
  }

  // A session groups the two writes into ONE transaction: both commit, or
  // both roll back. There is never a half-applied approval.
  const session = await mongoose.startSession();
  try {
    let createdReview;

    // withTransaction runs the callback inside a transaction, auto-committing
    // on success and auto-aborting (and retrying on transient errors) on throw.
    await session.withTransaction(async () => {
      // 1. Load the submission inside the transaction.
      const submission = await ReviewSubmission.findById(id).session(session);
      if (!submission) {
        // Throw to abort the transaction; we map this below to a 404.
        throw { httpStatus: 404, message: "Submission not found" };
      }

      // 2. Guard: only a PENDING submission can be approved. This stops an
      //    already-moderated submission from being approved again.
      if (submission.status !== "pending") {
        throw {
          httpStatus: 409,
          message: `Submission already ${submission.status}`,
        };
      }

      // 3. Flip the audit record's status.
      submission.status = "approved";
      await submission.save({ session });

      // 4. Create the public Review from the SAFE fields only (no phone/status).
      //    create() needs the array form to accept a session.
      const reviews = await Review.create(
        [
          {
            product: submission.product,
            submission: submission._id,
            farmerName: submission.farmerName,
            yield: submission.yield,
            notes: submission.notes,
            photos, // admin-supplied crop photos (see top of function)
          },
        ],
        { session }
      );
      createdReview = reviews[0];
    });

    res.status(200).json({ message: "Submission approved", review: createdReview });
  } catch (error) {
    // Our own thrown guards carry an httpStatus.
    if (error.httpStatus) {
      return res.status(error.httpStatus).json({ message: error.message });
    }
    // Duplicate key on Review.submission → a Review already exists for this one.
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "A review already exists for this submission" });
    }
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// ── DELETE ──────────────────────────────────────────────────────────────────
// DELETE /api/submissions/:id   (admin only)
// Permanently removes a submission from the queue (any status). If it was
// approved, its public Review is removed too, and all associated images are
// cleaned up from Cloudinary.
export const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const submission = await ReviewSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // An approved submission has a derived public Review (unique on submission).
    const review = await Review.findOne({ submission: id });

    // Gather every image URL tied to this submission/review for cleanup.
    const urls = [
      ...new Set([...(submission.photos || []), ...((review && review.photos) || [])]),
    ];

    if (review) await Review.deleteOne({ _id: review._id });
    await ReviewSubmission.deleteOne({ _id: id });

    // Best-effort Cloudinary cleanup (non-Cloudinary URLs are skipped safely).
    if (urls.length) await deleteFromCloudinary(urls);

    res.status(200).json({ message: "Submission deleted", id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── REJECT ──────────────────────────────────────────────────────────────────
// PATCH /api/submissions/:id/reject   (admin only)
// Flip status → "rejected" and record an optional reason. No Review is created.
export const rejectSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const submission = await ReviewSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Same guard as approve: only a pending submission can be moderated.
    if (submission.status !== "pending") {
      return res
        .status(409)
        .json({ message: `Submission already ${submission.status}` });
    }

    submission.status = "rejected";
    submission.rejectionReason = rejectionReason || null;
    await submission.save();

    res.status(200).json({ message: "Submission rejected", submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
