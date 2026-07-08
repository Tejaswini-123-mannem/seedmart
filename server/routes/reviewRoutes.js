// routes/reviewRoutes.js
// ----------------------------------------------------------------------------
// Admin management of PUBLISHED reviews. The public per-product read lives on
// /api/products/:id/reviews (see productRoutes). These endpoints let an admin
// list, edit, and delete reviews that are already live — including legacy /
// orphaned reviews that never appear in the submission-based moderation tabs.
// Mounted under "/api/reviews" in server.js. All routes are admin-only.
// ----------------------------------------------------------------------------

import express from "express";
import {
  getAllReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/reviews            → list every published review (newest first)
router.get("/", protect, adminOnly, getAllReviews);

// PATCH  /api/reviews/:id     → edit bilingual text (also syncs the submission)
// DELETE /api/reviews/:id     → remove review + submission + Cloudinary photos
router
  .route("/:id")
  .patch(protect, adminOnly, updateReview)
  .delete(protect, adminOnly, deleteReview);

export default router;
