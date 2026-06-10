// routes/authRoutes.js
// ----------------------------------------------------------------------------
// Maps URL paths to controller functions. Attaches middleware where needed.
// These routes get mounted under "/api/auth" in server.js.
// ----------------------------------------------------------------------------

import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

// A Router is a mini Express app for grouping related routes.
const router = express.Router();

// Public routes — no token needed.
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route — "protect" runs first. If the token is valid, it sets
// req.user and calls next(), which runs getMe. Otherwise it returns 401.
router.get("/me", protect, getMe);

// Protected — change own password (verifies the current one first).
router.put("/password", protect, changePassword);

export default router;
