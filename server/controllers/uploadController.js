// controllers/uploadController.js
// ----------------------------------------------------------------------------
// Handles image uploads. Multer has already parsed the files into req.files.
// We forward each buffer to Cloudinary and return the resulting URLs.
// ----------------------------------------------------------------------------

import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// POST /api/upload   (protect — any logged-in user)
// Expects multipart/form-data with one or more files under the field "images".
export const uploadImages = async (req, res) => {
  try {
    // Multer puts the array of files here. If empty, the client sent nothing.
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files provided" });
    }

    // Upload all files in parallel. Each returns { url, publicId }.
    const results = await Promise.all(
      req.files.map((file) =>
        uploadToCloudinary(file.buffer, "seedmart/products")
      )
    );

    // Return both a flat list of urls (convenient for the frontend) and the
    // detailed objects (url + publicId) in case we want public_id later.
    res.status(200).json({
      urls: results.map((r) => r.url),
      files: results,
    });
  } catch (error) {
    res.status(500).json({ message: `Upload failed: ${error.message}` });
  }
};
