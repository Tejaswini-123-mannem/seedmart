// components/ProductSlider.jsx
// ----------------------------------------------------------------------------
// A horizontal, scrollable row of product cards (the Home "Featured" slider).
// Reuses ProductCard. The ‹ › buttons scroll the row; it's also swipeable /
// drag-scrollable natively via overflow-x.
// ----------------------------------------------------------------------------

import { useRef } from "react";
import ProductCard from "./ProductCard.jsx";

export default function ProductSlider({ products }) {
  const trackRef = useRef(null);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="relative">
      {/* Scroll-left button */}
      <button
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full w-8 h-8 items-center justify-center hover:bg-gray-50"
      >
        ‹
      </button>

      {/* The scrollable track. Each card has a fixed min width so they line up. */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x"
      >
        {products.map((p) => (
          <div key={p._id} className="min-w-44 max-w-44 snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Scroll-right button */}
      <button
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full w-8 h-8 items-center justify-center hover:bg-gray-50"
      >
        ›
      </button>
    </div>
  );
}
