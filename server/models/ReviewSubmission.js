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

// A bilingual { en, te } pair (same pattern as Product/Settings). Reviews are
// bilingual: the farmer fills ONE language at submit time; the admin adds the
// other (and may edit both) at approval.
const bilingualText = new mongoose.Schema(
  {
    en: { type: String, trim: true, default: "" },
    te: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

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
    // by the server (into the submit-language slot) — never trusted from the
    // request body. The admin fills the other language at approval.
    farmerName: { type: bilingualText, default: () => ({}) },

    // SNAPSHOT of the farmer's phone — the field the admin calls to verify the
    // claim is genuine. Snapshotted so it reflects the number AS IT WAS when the
    // claim was made, even if the farmer later changes their account phone.
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // The headline claim, e.g. "32 bags/acre". Bilingual; the controller
    // validates that at least one language is present at submit time.
    yield: { type: bilingualText, default: () => ({}) },

    // Free-text context: season, soil, irrigation, practices. Bilingual.
    notes: { type: bilingualText, default: () => ({}) },

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
