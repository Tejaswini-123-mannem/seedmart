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
