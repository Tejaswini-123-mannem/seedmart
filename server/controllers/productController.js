// controllers/productController.js
// ----------------------------------------------------------------------------
// CRUD logic for products, plus listing with pagination, search, and filters.
// ----------------------------------------------------------------------------

import mongoose from "mongoose";
import Product from "../models/Product.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";

// ── CREATE ──────────────────────────────────────────────────────────────────
// POST /api/products   (admin only)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      company,
      description,
      category,
      photos,
      stockStatus,
      featured,
    } = req.body;

    // The schema enforces required fields, but we create explicitly listing
    // only the fields we allow — so a client can't inject unexpected fields.
    const product = await Product.create({
      name,
      company,
      description,
      category,
      photos,
      stockStatus,
      featured,
    });

    res.status(201).json(product);
  } catch (error) {
    // Mongoose validation errors (missing bilingual field, bad enum) → 400.
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// ── LIST (with pagination, search, filter) ──────────────────────────────────
// GET /api/products?search=&category=&stock=&page=1&limit=20   (public)
export const getProducts = async (req, res) => {
  try {
    // 1. Read query params with sensible defaults.
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;

    // 2. Build the MongoDB filter from the optional query params.
    const filter = {};

    // Search across BOTH language names AND the company/brand, case-insensitive.
    if (req.query.search) {
      const term = req.query.search;
      filter.$or = [
        { "name.en": { $regex: term, $options: "i" } },
        { "name.te": { $regex: term, $options: "i" } },
        { company: { $regex: term, $options: "i" } },
      ];
    }

    // Filter by category (stored lowercase, so lowercase the query too).
    if (req.query.category) {
      filter.category = req.query.category.toLowerCase();
    }

    // Filter by stock status.
    if (req.query.stock) {
      filter.stockStatus = req.query.stock;
    }

    // Filter to only admin-featured products (Home page slider).
    if (req.query.featured === "true") {
      filter.featured = true;
    }

    // 3. Run the count and the page query in parallel.
    //    countDocuments(filter) tells us the TOTAL matches (for page math).
    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    // 4. Return data + pagination metadata.
    res.status(200).json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── LIST DISTINCT BRANDS ────────────────────────────────────────────────────
// GET /api/products/brands   (public)
// Returns the distinct company names across all products — powers the Home
// page "Top Brands" strip. Derived automatically, so adding a product with a
// new company makes that brand appear with no extra admin work.
export const getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct("company");
    res.status(200).json(brands.filter(Boolean).sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── LIST DISTINCT CATEGORIES ────────────────────────────────────────────────
// GET /api/products/categories   (public)
// Returns the distinct category keys across all products — powers the catalog's
// category dropdown so it only ever offers categories that actually exist.
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.status(200).json(categories.filter(Boolean).sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── READ ONE ────────────────────────────────────────────────────────────────
// GET /api/products/:id   (public)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Guard against malformed ids (otherwise Mongoose throws a CastError → 500).
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── UPDATE ──────────────────────────────────────────────────────────────────
// PUT /api/products/:id   (admin only)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Capture the OLD photos first so we can clean up any that get removed.
    const before = await Product.findById(id).select("photos");
    if (!before) {
      return res.status(404).json({ message: "Product not found" });
    }

    // new: true       → return the document AFTER the update (not before)
    // runValidators   → enforce schema rules (enum, required) on the update too
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    // If the update changed photos, delete the ones that are no longer used.
    if (Array.isArray(req.body.photos)) {
      const removed = before.photos.filter(
        (url) => !product.photos.includes(url)
      );
      if (removed.length) await deleteFromCloudinary(removed);
    }

    res.status(200).json(product);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE ──────────────────────────────────────────────────────────────────
// DELETE /api/products/:id   (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Clean up the product's images on Cloudinary so they aren't orphaned.
    if (product.photos?.length) {
      await deleteFromCloudinary(product.photos);
    }

    res.status(200).json({ message: "Product deleted", id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
