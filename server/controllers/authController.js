// controllers/authController.js
// ----------------------------------------------------------------------------
// Business logic for authentication: register, login, and "who am I".
// Routes call these functions; they talk to the User model and send responses.
// ----------------------------------------------------------------------------

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// ── REGISTER ────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Creates a new regular user, then returns a token so they're logged in.
export const registerUser = async (req, res) => {
  try {
    const { username, password, phone, email } = req.body;

    // 1. Basic presence validation (the schema also validates, but a clear
    //    early check gives a friendlier message).
    if (!username || !password || !phone) {
      return res
        .status(400)
        .json({ message: "Username, password, and phone are required" });
    }

    // 2. Reject duplicates BEFORE attempting to create.
    //    $or checks either field; whichever matches means "already taken".
    const existing = await User.findOne({ $or: [{ username }, { phone }] });
    if (existing) {
      return res
        .status(409) // 409 Conflict = resource already exists
        .json({ message: "Username or phone number already in use" });
    }

    // 3. Create the user. The pre-save hook hashes the password automatically.
    //    Note: we do NOT accept "role" from the request body — that would let
    //    anyone register as admin. Role defaults to "user" in the schema.
    const user = await User.create({ username, password, phone, email });

    // 4. Respond with safe fields + a fresh token. Never send the password.
    res.status(201).json({
      _id: user._id,
      username: user.username,
      phone: user.phone,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    // Mongoose validation errors (e.g. bad phone format) land here.
    res.status(500).json({ message: error.message });
  }
};

// ── LOGIN ───────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Verifies credentials and returns a token.
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // 1. Find the user by username.
    const user = await User.findOne({ username });

    // 2. Verify the user exists AND the password matches.
    //    We combine both checks into ONE generic error so we don't reveal
    //    whether the username or the password was the problem.
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Success — return safe fields + token.
    res.status(200).json({
      _id: user._id,
      username: user.username,
      phone: user.phone,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── CHANGE PASSWORD ─────────────────────────────────────────────────────────
// PUT /api/auth/password  (protected route)
// Verifies the current password, then sets a new one. The plaintext is never
// stored — the pre-save hook re-hashes the new password on save().
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    // protect middleware set req.user; load the full doc so we can use its
    // matchPassword method and trigger the hashing hook on save.
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Re-authentication: the caller must prove they know the current password.
    const ok = await user.matchPassword(currentPassword);
    if (!ok) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Assign the new password; the pre("save") hook hashes it.
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET CURRENT USER ──────────────────────────────────────────────────────
// GET /api/auth/me  (protected route)
// The "protect" middleware has already verified the token and set req.user.
// We look up the full user record to return current details.
export const getMe = async (req, res) => {
  try {
    // .select("-password") excludes the password hash from the result.
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
