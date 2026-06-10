// components/Lightbox.jsx
// ----------------------------------------------------------------------------
// A full-screen image viewer. Click a thumbnail to open it here at full size,
// navigate the rest with the ‹ › arrows / keyboard arrows / touch swipe, and
// close with the ✕, the Escape key, or a click on the dark backdrop.
//
// Rendered through a PORTAL into document.body so no parent's overflow or
// stacking context can clip the overlay.
// ----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "../context/LanguageContext.jsx";

export default function Lightbox({ photos, startIndex = 0, onClose }) {
  const { t } = useLang();
  const [index, setIndex] = useState(startIndex);
  const [touchX, setTouchX] = useState(null);

  const many = photos.length > 1;
  // Wrap around with modulo so prev from the first goes to the last, etc.
  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex((i) => (i + 1) % photos.length);

  // Keyboard navigation + lock background scrolling while the lightbox is open.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // photos.length is stable for a given open; prev/next use functional updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Touch swipe: compare start/end X; a big enough horizontal move flips image.
  const onTouchStart = (e) => setTouchX(e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (dx > 50) prev();
    else if (dx < -50) next();
    setTouchX(null);
  };

  return createPortal(
    // Backdrop: clicking it closes the lightbox.
    <div
      className="fixed inset-0 z-50 bg-black/85 flex flex-col"
      onClick={onClose}
    >
      {/* Top bar with the close button. */}
      <div className="flex justify-end p-4">
        <button
          onClick={onClose}
          aria-label={t("common.close")}
          className="text-white/90 hover:text-white text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
        >
          ✕
        </button>
      </div>

      {/* Image area. stopPropagation so clicking the image/arrows doesn't
          bubble up to the backdrop and close the viewer. */}
      <div
        className="flex-1 flex items-center justify-center gap-3 px-4 pb-4 select-none"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {many && (
          <button
            onClick={prev}
            aria-label="Previous"
            className="text-white/80 hover:text-white text-4xl px-2 shrink-0"
          >
            ‹
          </button>
        )}

        <img
          src={photos[index]}
          alt=""
          className="max-h-[80vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
        />

        {many && (
          <button
            onClick={next}
            aria-label="Next"
            className="text-white/80 hover:text-white text-4xl px-2 shrink-0"
          >
            ›
          </button>
        )}
      </div>

      {/* Counter, e.g. "2 / 3". */}
      {many && (
        <div className="text-center text-white/80 text-sm pb-5">
          {index + 1} / {photos.length}
        </div>
      )}
    </div>,
    document.body
  );
}
