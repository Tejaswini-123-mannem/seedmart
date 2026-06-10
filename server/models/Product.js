// models/Product.js
// ----------------------------------------------------------------------------
// The Product schema: one document per seed variety.
// Bilingual fields (name, description) are stored as { en, te } sub-objects.
// ----------------------------------------------------------------------------

import mongoose from "mongoose";

// A small reusable sub-schema for any text that must exist in both languages.
// We pass { _id: false } so Mongoose does NOT add an _id to these sub-objects —
// they're just a pair of strings, not standalone documents.
const bilingualText = new mongoose.Schema(
  {
    en: { type: String, required: true, trim: true },
    te: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // Bilingual product name. Farmers search against this.
    name: {
      type: bilingualText,
      required: true,
    },

    // The seed brand / manufacturer. Not language-specific.
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    // Bilingual description.
    description: {
      type: bilingualText,
      required: true,
    },

    // Category used for filtering, e.g. "paddy", "cotton", "chilli".
    // Stored lowercase so filtering is consistent regardless of input casing.
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,
    },

    // Array of image URLs. Empty for now; Cloudinary URLs land here in Stage 3b.
    photos: {
      type: [String],
      default: [],
    },

    // Availability badge. Only these three values are allowed.
    stockStatus: {
      type: String,
      enum: ["inStock", "limitedStock", "outOfStock"],
      default: "inStock",
    },

    // Admin-curated "featured" flag. Featured products appear in the Home page
    // slider. Toggled by the admin (Stage 11).
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Index the category for fast filtering once there are hundreds of products.
productSchema.index({ category: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
