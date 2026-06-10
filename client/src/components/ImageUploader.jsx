// components/ImageUploader.jsx
// ----------------------------------------------------------------------------
// Reusable image upload field. Picks files, uploads them to /api/upload (which
// stores them on Cloudinary and returns URLs), and shows removable thumbnails.
//
// Controlled: the parent owns the `value` (array of URLs) and gets changes via
// onChange. `multiple` toggles single vs many (e.g. proprietor photo = single).
// ----------------------------------------------------------------------------

import { useRef, useState } from "react";
import { apiUpload } from "../api/client.js";
import { useLang } from "../context/LanguageContext.jsx";
import Lightbox from "./Lightbox.jsx";

export default function ImageUploader({ value = [], onChange, multiple = true }) {
  const { t } = useLang();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null); // big-size viewer

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      // The backend expects the field name "images".
      files.forEach((f) => fd.append("images", f));
      const { urls } = await apiUpload("/api/upload", fd);
      // For single mode, replace; for multiple, append.
      onChange(multiple ? [...value, ...urls] : urls.slice(0, 1));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = ""; // allow re-picking same file
    }
  };

  const removeAt = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div>
      {/* Thumbnails */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((url, i) => (
            <div key={i} className="relative">
              {/* Click the image to view it full size. */}
              <img
                src={url}
                alt=""
                onClick={() => setLightboxIndex(i)}
                className="h-20 w-20 object-cover rounded border cursor-pointer hover:opacity-80"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={t("upload.remove")}
                title={t("upload.remove")}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        onChange={handleFiles}
        className="hidden"
        id="image-uploader-input"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 text-sm rounded px-4 py-2"
      >
        {uploading ? t("upload.uploading") : t("upload.choose")}
      </button>

      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}

      {/* Full-size viewer for the uploaded images. */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={value}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
