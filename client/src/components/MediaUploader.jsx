// components/MediaUploader.jsx
// ----------------------------------------------------------------------------
// Uploads shop photos AND videos to /api/upload (Cloudinary detects the type
// and returns resourceType). Builds a controlled list of { type, url } media
// items. Used by the admin Settings "Media slider" section.
// ----------------------------------------------------------------------------

import { useRef, useState } from "react";
import { apiUpload } from "../api/client.js";
import { useLang } from "../context/LanguageContext.jsx";
import Lightbox from "./Lightbox.jsx";

export default function MediaUploader({ value = [], onChange }) {
  const { t } = useLang();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null); // { urls, index } | null

  // Open the image lightbox at the clicked image (lightbox handles images only).
  const openImage = (clickedUrl) => {
    const urls = value.filter((m) => m.type === "image").map((m) => m.url);
    setLightbox({ urls, index: urls.indexOf(clickedUrl) });
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("images", f)); // backend field is "images"
      const res = await apiUpload("/api/upload", fd);
      // Map each uploaded file to a media item using Cloudinary's resource_type.
      const items = (res.files || []).map((f) => ({
        type: f.resourceType === "video" ? "video" : "image",
        url: f.url,
      }));
      onChange([...value, ...items]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((m, i) => (
            <div key={i} className="relative">
              {m.type === "video" ? (
                <>
                  {/* Click a video to open it full-size in a new tab. */}
                  <video
                    src={m.url}
                    muted
                    onClick={() => window.open(m.url, "_blank")}
                    className="h-20 w-20 object-cover rounded border bg-black cursor-pointer"
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-white text-lg pointer-events-none">
                    ▶
                  </span>
                </>
              ) : (
                // Click an image to view it in the lightbox.
                <img
                  src={m.url}
                  alt=""
                  onClick={() => openImage(m.url)}
                  className="h-20 w-20 object-cover rounded border cursor-pointer hover:opacity-80"
                />
              )}
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
        accept="image/*,video/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 text-sm rounded px-4 py-2"
      >
        {uploading ? t("upload.uploading") : t("upload.chooseMedia")}
      </button>

      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}

      {/* Full-size viewer for the image slides. */}
      {lightbox && lightbox.urls.length > 0 && (
        <Lightbox
          photos={lightbox.urls}
          startIndex={Math.max(lightbox.index, 0)}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
