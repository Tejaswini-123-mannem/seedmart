// models/ReviewSubmission.js
// ----------------------------------------------------------------------------
// The MODERATION QUEUE. One document per farmer claim, in any state
// (pending / approved / rejected). This collection is PRIVATE — it holds the
// farmer's phone number for admin verification and keeps a full audit trail.
//
// On approval, a CLEAN, public-facing "Review" document is created from this
// one (that model arrives in Stage 4c). Splitting the two makes it
// structurally impossible to leak a phone number or an unapproved claim to
// the public read path.
// ----------------------------------------------------------------------------

import mongoose from "mongoose";

const reviewSubmissionSchema = new mongoose.Schema(
  {
    // Which seed this review is about. A REFERENCE (not a copy) — product
    // details live in the Products collection and stay the single source of truth.
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Who submitted it. Lets a farmer see their own history and ties every
    // claim to a real, logged-in account.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // SNAPSHOT of the farmer's name at submission time. Copied from the account
    // by the server — never trusted from the request body.
    farmerName: {
      type: String,
      required: true,
      trim: true,
    },

    // SNAPSHOT of the farmer's phone — the field the admin calls to verify the
    // claim is genuine. Snapshotted so it reflects the number AS IT WAS when the
    // claim was made, even if the farmer later changes their account phone.
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // The headline claim, e.g. "32 bags/acre". Kept as a String so farmers can
    // express units naturally ("32 bags/acre", "18 quintals").
    yield: {
      type: String,
      required: [true, "Yield result is required"],
      trim: true,
    },

    // Free-text context: season, soil, irrigation, practices.
    notes: {
      type: String,
      trim: true,
      default: "",
    },

    // Cloudinary URLs of the crop/result photos (reuses Stage 3b upload).
    photos: {
      type: [String],
      default: [],
    },

    // Drives the moderation workflow. New submissions are always "pending".
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Optional admin note explaining a rejection (set in Stage 4b).
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt = submitted-at, updatedAt = last moderated-at
  }
);

// The admin queue is read "newest pending first", and a farmer reads their own
// history. Indexing these keeps both fast as submissions pile up.
reviewSubmissionSchema.index({ status: 1, createdAt: -1 });
reviewSubmissionSchema.index({ user: 1, createdAt: -1 });

const ReviewSubmission = mongoose.model(
  "ReviewSubmission",
  reviewSubmissionSchema
);

export default ReviewSubmission;
