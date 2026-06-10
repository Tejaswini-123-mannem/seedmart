// routes/submissionRoutes.js
// ----------------------------------------------------------------------------
// Farmer review-submission endpoints. Both require a logged-in user.
// Mounted under "/api/submissions" in server.js.
// ----------------------------------------------------------------------------

import express from "express";
import {
  createSubmission,
  getMySubmissions,
  getSubmissions,
  approveSubmission,
  rejectSubmission,
  deleteSubmission,
} from "../controllers/submissionController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// IMPORTANT: register the specific "/mine" path BEFORE any "/:id" routes,
// so Express doesn't treat "mine" as an :id value.

// ── Farmer routes ───────────────────────────────────────────────────────────
// GET /api/submissions/mine  → the logged-in farmer's own history
router.get("/mine", protect, getMySubmissions);

// POST /api/submissions      → submit a new review (status forced to pending)
router.post("/", protect, createSubmission);

// ── Admin moderation routes ─────────────────────────────────────────────────
// GET   /api/submissions?status=pending  → the admin queue (phone visible)
router.get("/", protect, adminOnly, getSubmissions);

// PATCH /api/submissions/:id/approve     → approve (creates a public Review)
router.patch("/:id/approve", protect, adminOnly, approveSubmission);

// PATCH /api/submissions/:id/reject      → reject (records a reason)
router.patch("/:id/reject", protect, adminOnly, rejectSubmission);

// DELETE /api/submissions/:id            → remove from queue (+ its Review)
router.delete("/:id", protect, adminOnly, deleteSubmission);

export default router;
