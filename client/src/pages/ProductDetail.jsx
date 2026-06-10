// pages/ProductDetail.jsx
// ----------------------------------------------------------------------------
// One product, read from the URL's :id. Two independent fetches: the product
// itself, and its approved reviews (Stage 4c). Bilingual throughout.
// ----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "../api/client.js";
import { useLang } from "../context/LanguageContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import StockBadge from "../components/StockBadge.jsx";
import WishlistButton from "../components/WishlistButton.jsx";
import ReviewCard from "../components/ReviewCard.jsx";
import Pagination from "../components/Pagination.jsx";
import Lightbox from "../components/Lightbox.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const { lang, t, tCategory } = useLang();
  const { isAuthenticated } = useAuth();

  // Product fetch state.
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Image gallery state.
  const [imgIndex, setImgIndex] = useState(0); // which photo is shown large
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Reviews fetch state (paginated separately from the product).
  const [reviews, setReviews] = useState({ reviews: [], page: 1, pages: 1, total: 0 });
  const [reviewPage, setReviewPage] = useState(1);

  // Fetch the product whenever the id changes.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setImgIndex(0); // reset gallery when viewing a different product
    apiGet(`/api/products/${id}`)
      .then((res) => active && setProduct(res))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  // Fetch reviews whenever the id or the review page changes.
  useEffect(() => {
    let active = true;
    apiGet(`/api/products/${id}/reviews?page=${reviewPage}&limit=5`)
      .then((res) => active && setReviews(res))
      .catch(() => {}); // a review-load failure shouldn't break the page
    return () => {
      active = false;
    };
  }, [id, reviewPage]);

  if (loading) return <p className="text-gray-500">{t("detail.loading")}</p>;
  if (error)
    return (
      <div>
        <p className="bg-red-50 text-red-700 rounded p-3">{error}</p>
        <Link to="/catalog" className="text-green-700 underline mt-3 inline-block">
          {t("detail.back")}
        </Link>
      </div>
    );

  return (
    <div>
      <Link to="/catalog" className="text-green-700 underline text-sm">
        {t("detail.back")}
      </Link>

      {/* ── Product header ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow p-6 mt-3 md:flex gap-6">
        {/* Image gallery: big image + thumbnail strip; click opens the lightbox. */}
        <div className="md:w-1/2">
          <div
            onClick={() => product.photos?.length && setLightboxOpen(true)}
            className={`h-60 bg-green-100 rounded-lg flex items-center justify-center overflow-hidden ${
              product.photos?.length ? "cursor-pointer" : ""
            }`}
          >
            {product.photos?.[imgIndex] ? (
              <img
                src={product.photos[imgIndex]}
                alt={product.name?.[lang]}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-green-700/40">{t("product.noImage")}</span>
            )}
          </div>

          {product.photos?.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {product.photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  onClick={() => setImgIndex(i)}
                  className={`h-14 w-14 object-cover rounded cursor-pointer border-2 shrink-0 ${
                    i === imgIndex ? "border-green-600" : "border-transparent opacity-70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="md:w-1/2 mt-4 md:mt-0">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold text-gray-800">
              {product.name?.[lang]}
            </h1>
            <WishlistButton productId={product._id} className="text-2xl mt-1" />
          </div>
          <p className="text-gray-500">{product.company}</p>
          <div className="my-2">
            <StockBadge status={product.stockStatus} />
          </div>
          <p className="text-gray-700 mt-2">{product.description?.[lang]}</p>
          <p className="text-xs text-gray-400 mt-3">
            {t("detail.category")} {tCategory(product.category)}
          </p>
        </div>
      </div>

      {/* ── Submit-your-result — a formal block directly below the product ── */}
      {isAuthenticated && (
        <div className="bg-white rounded-xl shadow p-4 mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600">{t("submit.prompt")}</p>
          <Link
            to={`/submit-review/${product._id}`}
            className="bg-green-600 hover:bg-green-700 text-white text-sm rounded px-4 py-2 text-center whitespace-nowrap"
          >
            {t("submit.title")}
          </Link>
        </div>
      )}

      {/* ── Reviews (Stage 4c) ─────────────────────────────────── */}
      <h2 className="text-xl font-bold text-green-700 mt-8 mb-3">
        {t("detail.reviewsTitle")} ({reviews.total})
      </h2>

      {reviews.reviews.length === 0 ? (
        <p className="text-gray-500">{t("detail.noReviews")}</p>
      ) : (
        <>
          <div className="space-y-3">
            {reviews.reviews.map((r) => (
              <ReviewCard key={r._id} review={r} />
            ))}
          </div>
          <Pagination
            page={reviews.page}
            pages={reviews.pages}
            onPageChange={setReviewPage}
          />
        </>
      )}

      {/* Full-screen product image gallery (swipe / arrows / close). */}
      {lightboxOpen && product.photos?.length > 0 && (
        <Lightbox
          photos={product.photos}
          startIndex={imgIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
