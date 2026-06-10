// models/User.js
// ----------------------------------------------------------------------------
// The User schema: defines the shape of every document in the "users"
// collection, plus password-hashing behavior and a password-check method.
// ----------------------------------------------------------------------------

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// A Schema describes the structure and rules for documents in a collection.
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true, // no two users can share a username
      trim: true, // remove accidental leading/trailing spaces
      minlength: [3, "Username must be at least 3 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      // We store ONLY the bcrypt hash here, never the plain password.
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true, // one account per phone number
      trim: true,
      // 10-digit Indian mobile number. \d means digit, {10} means exactly 10.
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    email: {
      type: String,
      required: false, // optional, as decided in the architecture
      trim: true,
      lowercase: true, // store emails consistently in lowercase
    },
    role: {
      type: String,
      enum: ["user", "admin"], // only these two values are allowed
      default: "user", // new sign-ups are always regular users
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // references documents in the "products" collection
      },
    ],
  },
  {
    // Automatically add createdAt and updatedAt fields, managed by Mongoose.
    timestamps: true,
  }
);

// ── PRE-SAVE HOOK ───────────────────────────────────────────────────────────
// Runs automatically BEFORE a user document is saved.
// It hashes the password so plain text never reaches the database.
//
// Note: this is an ASYNC hook. In modern Mongoose, an async middleware function
// signals completion by resolving (or throwing) — we do NOT take a `next`
// callback. Returning early simply resolves the promise and lets the save go on.
userSchema.pre("save", async function () {
  // Only hash if the password field was newly set or changed.
  // Without this check, updating (e.g.) the email would re-hash an
  // already-hashed password, corrupting it.
  if (!this.isModified("password")) {
    return;
  }

  // Generate a salt (cost factor 10) and hash the password with it.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── INSTANCE METHOD ─────────────────────────────────────────────────────────
// Available on every user document: user.matchPassword("plainAttempt")
// Returns true if the attempt matches the stored hash, false otherwise.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Compile the schema into a model and export it.
// Mongoose will use the collection named "users" (lowercased + pluralized).
const User = mongoose.model("User", userSchema);

export default User;
