// pages/Account.jsx
// ----------------------------------------------------------------------------
// The logged-in farmer's hub. Two tabs:
//   • My Wishlist     — saved products (from WishlistContext), reusing ProductCard
//   • My Submissions  — the farmer's review history (GET /api/submissions/mine)
//                       each with a status badge + rejection reason.
// ----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { apiGet } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function Account() {
  const { user } = useAuth();
  const { t, lang, tf } = useLang();
  const { items: wishlist } = useWishlist();

  const [tab, setTab] = useState("wishlist");
  const [submissions, setSubmissions] = useState([]);

  // Load the farmer's own submission history.
  useEffect(() => {
    let active = true;
    apiGet("/api/submissions/mine")
      .then((list) => active && setSubmissions(list))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const tabBtn = (key, label) =>
    `px-4 py-2 rounded-t-lg text-sm font-medium ${
      tab === key
        ? "bg-white text-green-700 shadow"
        : "bg-transparent text-gray-500 hover:text-green-700"
    }`;

  return (
    <div>
      <Link to="/" className="text-green-700 underline text-sm">
        {t("common.backHome")}
      </Link>
      <h1 className="text-2xl font-bold text-green-700 mb-1 mt-2">
        {t("account.title")}
      </h1>
      <p className="text-gray-600 mb-4">
        {t("account.loggedInAs", {
          name: user?.username,
          role: user?.role || "user",
        })}
      </p>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-gray-200 mb-4">
        <button onClick={() => setTab("wishlist")} className={tabBtn("wishlist")}>
          {t("account.tabWishlist")}
        </button>
        <button
          onClick={() => setTab("submissions")}
          className={tabBtn("submissions")}
        >
          {t("account.tabSubmissions")}
        </button>
      </div>

      {/* ── Wishlist tab ────────────────────────────────────────── */}
      {tab === "wishlist" &&
        (wishlist.length === 0 ? (
          <p className="text-gray-500">{t("wishlist.empty")}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlist.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ))}

      {/* ── Submissions tab ─────────────────────────────────────── */}
      {tab === "submissions" &&
        (submissions.length === 0 ? (
          <p className="text-gray-500">{t("account.noSubmissions")}</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((s) => (
              <div key={s._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/product/${s.product?._id}`}
                    className="font-semibold text-gray-800 hover:underline"
                  >
                    {s.product?.name?.[lang] || "—"}
                  </Link>
                  <StatusBadge status={s.status} />
                </div>
                <p className="text-green-700 text-sm mt-1">{tf(s.yield)}</p>
                {tf(s.notes) && (
                  <p className="text-sm text-gray-600 mt-1">{tf(s.notes)}</p>
                )}
                {s.status === "pending" && (
                  <p className="text-xs text-amber-700 mt-2">
                    {t("status.pendingNote")}
                  </p>
                )}
                {s.status === "rejected" && s.rejectionReason && (
                  <p className="text-xs text-red-600 mt-2">
                    {t("status.rejectedReason")} {s.rejectionReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
