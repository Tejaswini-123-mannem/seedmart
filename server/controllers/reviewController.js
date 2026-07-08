// controllers/reviewController.js
// ----------------------------------------------------------------------------
// PUBLIC read access to approved farmer reviews.
//
// This reads from the "Reviews" collection — the clean, public read model.
// Because that collection only ever holds approved, phone-free data, this
// handler needs NO status filter and NO field-stripping: the safety lives in
// the schema, not the query.
// ----------------------------------------------------------------------------

import mongoose from "mongoose";
import Review from "../models/Review.js";
import ReviewSubmission from "../models/ReviewSubmission.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";

// ── LIST REVIEWS FOR A PRODUCT ──────────────────────────────────────────────
// GET /api/products/:id/reviews?page=1&limit=10   (public)
export const getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;

    // Guard the id: a malformed value would otherwise make Mongoose throw a
    // CastError → 500. We want a clean 404 instead.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Pagination — same shape as the products list (Stage 3) for consistency.
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = { product: id };

    // Count + page query in parallel. The sort+filter is served by the
    // { product: 1, createdAt: -1 } index defined on the Review model.
    const [total, reviews] = await Promise.all([
      Review.countDocuments(filter),
      Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    res.status(200).json({
      reviews,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// ADMIN MANAGEMENT  (all routes below are gated by protect + adminOnly)
//
// These act on the PUBLISHED Review collection — the moderation queue
// (submissionController) handles the pending→approved lifecycle; this is for
// managing reviews that are already live. Crucially, this also surfaces LEGACY
// / ORPHANED reviews that have no matching submission — those never appear in
// the submission-based moderation tabs, so this is the only place to see and
// delete them.
// ════════════════════════════════════════════════════════════════════════════

// ── LIST ALL PUBLISHED REVIEWS ──────────────────────────────────────────────
// GET /api/reviews   (admin only)
// Flat list of every live review, newest first, with a little product context.
//
// .lean() is deliberate: LEGACY reviews store farmerName/yield/notes as raw
// strings (pre-bilingual). Normal Mongoose hydration can't cast a string into
// the {en,te} sub-document and silently BLANKS it — which would show empty rows
// here and hide exactly the old data the admin came to review. lean() returns
// the raw BSON untouched, so legacy strings survive for display (the client's
// tf()/biFrom() tolerate both shapes). populate() still works with lean().
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate("product", "name company")
      .lean();

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── UPDATE A PUBLISHED REVIEW ───────────────────────────────────────────────
// PATCH /api/reviews/:id   (admin only)
// Edits the bilingual text of a live review. Because a Review is a copy of its
// approved submission, we update BOTH in one transaction so the moderation
// queue's "Approved" tab never drifts out of sync with the public site.
export const updateReview = async (req, res) => {
  const { id } = req.params;
  const { farmerName, yield: yieldEdit, notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Review not found" });
  }

  // Merge an admin bilingual edit onto the current value. Required fields never
  // end up with BOTH languages empty — they fall back to the original. (Same
  // rule as approveSubmission, kept identical on purpose.)
  const clean = (v) => (typeof v === "string" ? v.trim() : "");
  const applyBilingual = (edit, current, required) => {
    if (!edit || typeof edit !== "object") return current;
    const next = { en: clean(edit.en), te: clean(edit.te) };
    if (required && !next.en && !next.te) return current;
    return next;
  };

  const session = await mongoose.startSession();
  try {
    let updatedReview;

    await session.withTransaction(async () => {
      const review = await Review.findById(id).session(session);
      if (!review) {
        throw { httpStatus: 404, message: "Review not found" };
      }

      review.farmerName = applyBilingual(farmerName, review.farmerName, true);
      review.yield = applyBilingual(yieldEdit, review.yield, true);
      review.notes = applyBilingual(notes, review.notes, false);
      await review.save({ session });

      // Keep the originating submission (the audit record) in sync, if it still
      // exists. A legacy/orphaned review may have no matching submission — that
      // is fine, the public Review is the source of truth for the site.
      const submission = await ReviewSubmission.findById(review.submission).session(session);
      if (submission) {
        submission.farmerName = review.farmerName;
        submission.yield = review.yield;
        submission.notes = review.notes;
        await submission.save({ session });
      }

      updatedReview = review;
    });

    res.status(200).json({ message: "Review updated", review: updatedReview });
  } catch (error) {
    if (error.httpStatus) {
      return res.status(error.httpStatus).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// ── DELETE A PUBLISHED REVIEW ───────────────────────────────────────────────
// DELETE /api/reviews/:id   (admin only)
// Removes the live review, its originating submission (if any), and every
// associated Cloudinary image. Robust to legacy reviews whose submission link
// is missing or dangling — this is what lets the admin clean up old reviews.
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Review not found" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // The submission this review was derived from (may be absent for legacy data).
    const submission = review.submission
      ? await ReviewSubmission.findById(review.submission)
      : null;

    // Every image tied to the review and/or its submission, de-duplicated.
    const urls = [
      ...new Set([...(review.photos || []), ...((submission && submission.photos) || [])]),
    ];

    await Review.deleteOne({ _id: review._id });
    if (submission) await ReviewSubmission.deleteOne({ _id: submission._id });

    // Best-effort Cloudinary cleanup (non-Cloudinary URLs are skipped safely).
    if (urls.length) await deleteFromCloudinary(urls);

    res.status(200).json({ message: "Review deleted", id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
