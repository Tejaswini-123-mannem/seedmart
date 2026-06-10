// routes/wishlistRoutes.js
// ----------------------------------------------------------------------------
// Wishlist endpoints. All require a logged-in user (no admin gate — every user
// has their own wishlist). Mounted under "/api/wishlist" in server.js.
// ----------------------------------------------------------------------------

import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/wishlist            → my saved products (populated)
router.get("/", protect, getWishlist);

// POST   /api/wishlist/:productId  → add a product    ($addToSet)
// DELETE /api/wishlist/:productId  → remove a product ($pull)
router
  .route("/:productId")
  .post(protect, addToWishlist)
  .delete(protect, removeFromWishlist);

export default router;
