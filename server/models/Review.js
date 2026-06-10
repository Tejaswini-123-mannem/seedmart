// models/Review.js
// ----------------------------------------------------------------------------
// The PUBLIC read model. One document per APPROVED farmer claim.
//
// This collection is a clean, public-safe projection of an approved
// ReviewSubmission. By construction it contains ONLY fields the world may see —
// notably it has NO phone and NO status. A phone number or a pending claim can
// never reach the public read path because they simply don't exist here.
// ----------------------------------------------------------------------------

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // Which seed this review is about. Lets us query "all reviews for product X".
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Back-reference to the originating submission (the audit record).
    // `unique` enforces a strict 1-to-1: a submission can spawn AT MOST one
    // Review. This is our structural guard — even if "approve" were ever called
    // twice, the database itself refuses the second insert (duplicate key).
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReviewSubmission",
      required: true,
      unique: true,
    },

    // Public attribution of the verified result. Copied from the submission.
    farmerName: {
      type: String,
      required: true,
      trim: true,
    },

    // The headline result, e.g. "32 bags/acre".
    yield: {
      type: String,
      required: true,
      trim: true,
    },

    // Public context (season, soil, practices).
    notes: {
      type: String,
      trim: true,
      default: "",
    },

    // Cloudinary URLs of the crop/result photos.
    photos: {
      type: [String],
      default: [],
    },

    // NOTE: there is deliberately NO `phone` and NO `status` field here.
  },
  {
    timestamps: true, // createdAt ≈ when the admin approved it
  }
);

// The public product page reads "newest reviews for this product first".
reviewSchema.index({ product: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
