// controllers/wishlistController.js
// ----------------------------------------------------------------------------
// A logged-in user's personal wishlist of products.
//
// The wishlist is just an array of Product references on the User document
// (User.wishlist). These handlers add to / remove from / read that array, and
// always operate ONLY on the caller's own user (req.user.userId).
// ----------------------------------------------------------------------------

import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";

// Small helper: return the caller's wishlist with each id resolved to the full
// product document. Used as the response of all three endpoints so the frontend
// can refresh its UI from a single response.
const populatedWishlist = (userId) =>
  User.findById(userId)
    .select("wishlist")
    .populate("wishlist", "name company photos stockStatus");

// ── GET MY WISHLIST ─────────────────────────────────────────────────────────
// GET /api/wishlist   (logged-in user)
export const getWishlist = async (req, res) => {
  try {
    const user = await populatedWishlist(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── ADD TO WISHLIST ─────────────────────────────────────────────────────────
// POST /api/wishlist/:productId   (logged-in user)
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Guard the id so a malformed value can't reach the DB as a CastError.
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    // Make sure we never store a reference to a product that doesn't exist.
    const exists = await Product.exists({ _id: productId });
    if (!exists) {
      return res.status(404).json({ message: "Product not found" });
    }

    // $addToSet adds the id ONLY if it isn't already present — clicking the
    // wishlist button twice can never create a duplicate entry.
    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { wishlist: productId },
    });

    // Return the fresh, populated list so the client can update its state.
    const user = await populatedWishlist(req.user.userId);
    res.status(200).json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── REMOVE FROM WISHLIST ────────────────────────────────────────────────────
// DELETE /api/wishlist/:productId   (logged-in user)
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    // $pull removes the matching id from the array. Removing something that
    // isn't there is a harmless no-op, so no existence check is needed.
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { wishlist: productId },
    });

    const user = await populatedWishlist(req.user.userId);
    res.status(200).json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
