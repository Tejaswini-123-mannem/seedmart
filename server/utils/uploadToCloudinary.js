// utils/uploadToCloudinary.js
// ----------------------------------------------------------------------------
// Uploads a single in-memory file buffer to Cloudinary and resolves with the
// resulting secure URL and public_id.
// ----------------------------------------------------------------------------

import cloudinary from "../config/cloudinary.js";

// cloudinary.uploader.upload_stream is callback-based and returns a writable
// stream. We wrap it in a Promise so callers can use async/await.
//
// buffer → the raw bytes from multer (file.buffer)
// folder → the Cloudinary folder to organize uploads (e.g. "seedmart/products")
const uploadToCloudinary = (buffer, folder = "seedmart") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", // let Cloudinary detect image vs video
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        // Return the URL, the id (for deletion), and the kind (image/video).
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
        });
      }
    );

    // Push the buffer into the stream and signal we're done writing.
    stream.end(buffer);
  });
};

export default uploadToCloudinary;
