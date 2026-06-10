// middleware/upload.js
// ----------------------------------------------------------------------------
// Multer configured to parse multipart/form-data file uploads:
//   - memory storage  → files arrive as Buffers in RAM (we forward to Cloudinary)
//   - file filter     → only image types allowed
//   - limits          → max 5 MB per file
// ----------------------------------------------------------------------------

import multer from "multer";

// Keep uploaded files in memory (as file.buffer) instead of writing to disk.
// We immediately stream them to Cloudinary, so disk storage is unnecessary.
const storage = multer.memoryStorage();

// Allow image and video files. multer calls this for every incoming file.
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true); // accept the file
  } else {
    cb(
      new Error("Only image (JPEG, PNG, WEBP) and video (MP4, WEBM) files are allowed"),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB per file (videos are larger than images)
  },
});

export default upload;
