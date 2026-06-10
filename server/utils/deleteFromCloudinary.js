// utils/deleteFromCloudinary.js
// ----------------------------------------------------------------------------
// Deletes images from Cloudinary given their secure URLs. We store only URLs on
// products, so we first reconstruct each image's `public_id` from its URL, then
// call cloudinary.uploader.destroy().
//
// A Cloudinary URL looks like:
//   https://res.cloudinary.com/<cloud>/image/upload/v1717000000/seedmart/products/abc123.jpg
// The public_id is everything AFTER "/upload/" (minus an optional vNNN/ version
// prefix) and WITHOUT the file extension:  seedmart/products/abc123
// ----------------------------------------------------------------------------

import cloudinary from "../config/cloudinary.js";

// Pull the public_id out of a Cloudinary delivery URL. Returns null if the URL
// doesn't look like a Cloudinary upload (so we skip non-Cloudinary images).
export const publicIdFromUrl = (url) => {
  try {
    const afterUpload = url.split("/upload/")[1];
    if (!afterUpload) return null;
    const noVersion = afterUpload.replace(/^v\d+\//, ""); // drop "v123456/"
    return noVersion.replace(/\.[^./]+$/, ""); // drop ".jpg" / ".png" / ...
  } catch {
    return null;
  }
};

// Delete an array of image URLs from Cloudinary. Failures are swallowed per
// image (logged) so one bad delete never blocks the overall operation — the
// DB record is the source of truth, an orphaned remote file is non-fatal.
export const deleteFromCloudinary = async (urls = []) => {
  await Promise.all(
    urls.map(async (url) => {
      const publicId = publicIdFromUrl(url);
      if (!publicId) return;
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error(`Cloudinary delete failed for ${publicId}: ${err.message}`);
      }
    })
  );
};

export default deleteFromCloudinary;
