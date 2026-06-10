// routes/productRoutes.js
// ----------------------------------------------------------------------------
// Product endpoints. Public reads, admin-only writes.
// Mounted under "/api/products" in server.js.
// ----------------------------------------------------------------------------

import express from "express";
import {
  createProduct,
  getProducts,
  getBrands,
  getCategories,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { getProductReviews } from "../controllers/reviewController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// router.route() lets us attach multiple methods to the same path cleanly.

// /api/products
router
  .route("/")
  .get(getProducts) // PUBLIC: list products
  .post(protect, adminOnly, createProduct); // ADMIN: create

// /api/products/brands & /categories — MUST be before "/:id" so they aren't
// read as an id.
router.get("/brands", getBrands); // PUBLIC: distinct brand names
router.get("/categories", getCategories); // PUBLIC: distinct category keys

// /api/products/:id
router
  .route("/:id")
  .get(getProductById) // PUBLIC: one product
  .put(protect, adminOnly, updateProduct) // ADMIN: update
  .delete(protect, adminOnly, deleteProduct); // ADMIN: delete

// /api/products/:id/reviews
// PUBLIC: approved farmer reviews for this product (paginated, newest first).
router.get("/:id/reviews", getProductReviews);

export default router;
