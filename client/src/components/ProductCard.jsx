// components/ProductCard.jsx
// ----------------------------------------------------------------------------
// A presentational card for one product in the catalog grid. Bilingual name,
// company, stock badge, and the first photo (if any). The whole card links to
// the product detail page.
// ----------------------------------------------------------------------------

import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext.jsx";
import StockBadge from "./StockBadge.jsx";
import WishlistButton from "./WishlistButton.jsx";

export default function ProductCard({ product }) {
  const { lang, t } = useLang();

  return (
    <Link
      to={`/product/${product._id}`}
      className="relative bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden flex flex-col"
    >
      {/* ⭐ floats over the top-right corner of the card. */}
      <div className="absolute top-2 right-2 z-10 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow">
        <WishlistButton productId={product._id} />
      </div>

      {/* Image (or a placeholder block if the product has no photo yet). */}
      <div className="h-40 bg-green-100 flex items-center justify-center">
        {product.photos?.[0] ? (
          <img
            src={product.photos[0]}
            alt={product.name?.[lang]}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-green-700/40 text-sm">
            {t("product.noImage")}
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col gap-1">
        <h3 className="font-semibold text-gray-800">{product.name?.[lang]}</h3>
        <p className="text-sm text-gray-500">{product.company}</p>
        <div className="mt-2">
          <StockBadge status={product.stockStatus} />
        </div>
      </div>
    </Link>
  );
}
