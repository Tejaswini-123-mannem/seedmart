// routes/settingsRoutes.js
// ----------------------------------------------------------------------------
// Settings endpoints. Public read, admin-only write.
// Mounted under "/api/settings" in server.js.
// ----------------------------------------------------------------------------

import express from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settingsController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// /api/settings
router
  .route("/")
  .get(getSettings) // PUBLIC: read site config
  .put(protect, adminOnly, updateSettings); // ADMIN: create-or-update

export default router;
