// components/MediaSlider.jsx
// ----------------------------------------------------------------------------
// A carousel of shop photos and videos for the Home page (below the header).
// Shows one slide at a time with arrows, swipe, and dot indicators. Videos get
// native <video controls>; images fill the frame.
// ----------------------------------------------------------------------------

import { useState } from "react";

export default function MediaSlider({ slides = [] }) {
  const [index, setIndex] = useState(0);
  const [touchX, setTouchX] = useState(null);

  if (!slides || slides.length === 0) return null;

  const many = slides.length > 1;
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  const onTouchStart = (e) => setTouchX(e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (dx > 50) prev();
    else if (dx < -50) next();
    setTouchX(null);
  };

  const m = slides[index];

  return (
    <div
      className="relative bg-black rounded-2xl overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="h-64 sm:h-96 flex items-center justify-center">
        {m.type === "video" ? (
          <video
            src={m.url}
            controls
            className="h-full w-full object-contain bg-black"
          />
        ) : (
          <img src={m.url} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      {many && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full w-9 h-9 flex items-center justify-center"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full w-9 h-9 flex items-center justify-center"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={`w-2 h-2 rounded-full ${
                  i === index ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
