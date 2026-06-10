// config/cloudinary.js
// ----------------------------------------------------------------------------
// Configures the Cloudinary SDK once, using credentials from .env.
// Other files import this pre-configured `cloudinary` object.
// ----------------------------------------------------------------------------

import { v2 as cloudinary } from "cloudinary";

// cloudinary.config() stores these credentials inside the SDK so every
// upload call is automatically authenticated. The API_SECRET is sensitive —
// it lives only in .env, never in code.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
