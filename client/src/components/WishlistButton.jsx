// components/WishlistButton.jsx
// ----------------------------------------------------------------------------
// A ⭐ toggle for a product. Filled when saved, outline when not. Logged-out
// users are sent to /login (UX gate; the backend still requires auth).
//
// Used inside ProductCard (which is itself a <Link>), so we stopPropagation +
// preventDefault to avoid navigating to the product when the star is clicked.
// ----------------------------------------------------------------------------

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";

export default function WishlistButton({ productId, className = "" }) {
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const { t } = useLang();
  const navigate = useNavigate();

  const saved = isWishlisted(productId);

  const handleClick = (e) => {
    e.preventDefault(); // don't follow a parent <Link>
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    toggle(productId);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? t("wishlist.remove") : t("wishlist.add")}
      title={saved ? t("wishlist.remove") : t("wishlist.add")}
      className={`text-xl leading-none transition ${
        saved ? "text-amber-500" : "text-gray-300 hover:text-amber-400"
      } ${className}`}
    >
      {saved ? "★" : "☆"}
    </button>
  );
}
