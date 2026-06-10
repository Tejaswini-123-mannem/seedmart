// routes/uploadRoutes.js
// ----------------------------------------------------------------------------
// POST /api/upload — upload one or more images, get back Cloudinary URLs.
// Available to any logged-in user (admins for products, farmers for submissions).
// ----------------------------------------------------------------------------

import express from "express";
import upload from "../middleware/upload.js";
import { uploadImages } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Wrap Multer so its errors (file too large, wrong type) become clean JSON 400s
// instead of falling through to Express's default HTML error page.
// "images" is the form field name; 5 is the max number of files per request.
const handleUpload = (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// protect runs FIRST (reject unauthenticated before doing upload work),
// then Multer parses the files, then the controller pushes them to Cloudinary.
router.post("/", protect, handleUpload, uploadImages);

export default router;
