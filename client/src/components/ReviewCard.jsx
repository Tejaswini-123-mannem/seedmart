// components/ReviewCard.jsx
// ----------------------------------------------------------------------------
// One approved farmer review on the product detail page. Note there is NO phone
// here — the public Review model never carries it (Stage 4b/4c design).
//
// Crop photos are clickable thumbnails that open a full-screen Lightbox.
// ----------------------------------------------------------------------------

import { useState } from "react";
import { useLang } from "../context/LanguageContext.jsx";
import Lightbox from "./Lightbox.jsx";

export default function ReviewCard({ review }) {
  const { tf } = useLang();
  // null = closed; a number = the index of the photo to open at.
  const [openIndex, setOpenIndex] = useState(null);

  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString()
    : "";

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-800">{tf(review.farmerName)}</span>
        <span className="text-green-700 font-medium text-sm">
          {tf(review.yield)}
        </span>
      </div>
      {tf(review.notes) && (
        <p className="text-sm text-gray-600 mt-1">{tf(review.notes)}</p>
      )}

      {review.photos?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {review.photos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt="result"
              onClick={() => setOpenIndex(i)}
              className="h-16 w-16 object-cover rounded cursor-pointer hover:opacity-80 transition"
            />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">{date}</p>

      {/* The full-screen viewer, opened when a thumbnail is clicked. */}
      {openIndex !== null && (
        <Lightbox
          photos={review.photos}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}
