// pages/Catalog.jsx
// ----------------------------------------------------------------------------
// The public product catalog. Filters/search/page live in the URL query string
// (useSearchParams) so links are shareable, refresh keeps state, and the
// browser Back button works.
//
// Data flow:
//   URL params ──▶ fetch effect ──▶ products + pagination state ──▶ grid
//   search box ──(debounced)──▶ writes ?search= to the URL ──▶ effect refires
// ----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { apiGet } from "../api/client.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { useLang } from "../context/LanguageContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Pagination from "../components/Pagination.jsx";

export default function Catalog() {
  const { t, lang, tCategory } = useLang();
  const navigate = useNavigate();
  // The URL is the single source of truth for the filters.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const stock = searchParams.get("stock") || "";
  const page = parseInt(searchParams.get("page")) || 1;

  // The search box is a controlled input. We keep its raw value in local state
  // and only push it to the URL after the user pauses typing (debounce).
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Category dropdown options (only categories that actually exist).
  const [categories, setCategories] = useState([]);

  // Search autocomplete suggestions.
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Four-state fetch bookkeeping.
  const [data, setData] = useState({ products: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: merge a partial change into the URL params. Any filter change
  // resets to page 1 (unless we're explicitly changing the page).
  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k); // empty value → drop the param entirely
    });
    setSearchParams(next);
  };

  // Load category options once.
  useEffect(() => {
    let active = true;
    apiGet("/api/products/categories")
      .then((list) => active && setCategories(list))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Fetch autocomplete suggestions as the (debounced) search term changes.
  useEffect(() => {
    if (!debouncedSearch) {
      setSuggestions([]);
      return;
    }
    let active = true;
    apiGet(`/api/products?search=${encodeURIComponent(debouncedSearch)}&limit=6`)
      .then((res) => active && setSuggestions(res.products))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [debouncedSearch]);

  // When the debounced search settles, write it to the URL (and reset page).
  useEffect(() => {
    if (debouncedSearch === search) return; // no change → don't touch the URL
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set("search", debouncedSearch);
    else next.delete("search");
    next.delete("page");
    setSearchParams(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // THE fetch effect: re-runs whenever any URL-derived filter changes.
  useEffect(() => {
    // `active` guards against the stale-response race: if a newer request
    // starts before this one resolves, we ignore this (now-outdated) result.
    let active = true;
    setLoading(true);
    setError(null);

    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (category) qs.set("category", category);
    if (stock) qs.set("stock", stock);
    qs.set("page", page);
    qs.set("limit", 12);

    apiGet(`/api/products?${qs.toString()}`)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false; // cleanup: mark this request stale on re-run/unmount
    };
  }, [search, category, stock, page]);

  return (
    <div>
      <Link to="/" className="text-green-700 underline text-sm">
        {t("common.backHome")}
      </Link>
      <h1 className="text-2xl font-bold text-green-700 mb-4 mt-2">
        {t("catalog.title")}
      </h1>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-6">
        {/* Search with autocomplete suggestions */}
        <div className="relative w-full sm:flex-1 sm:min-w-48">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={t("catalog.searchPlaceholder")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          {showSuggestions && searchInput && suggestions.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
              {suggestions.map((p) => (
                <li key={p._id}>
                  <button
                    type="button"
                    // onMouseDown fires before the input's onBlur hides the list.
                    onMouseDown={() => navigate(`/product/${p._id}`)}
                    className="w-full text-left px-3 py-2 hover:bg-green-50 text-sm flex items-center gap-2"
                  >
                    {p.photos?.[0] && (
                      <img src={p.photos[0]} alt="" className="h-6 w-6 object-cover rounded" />
                    )}
                    <span className="truncate">{p.name?.[lang]}</span>
                    <span className="text-gray-400 ml-auto text-xs shrink-0">
                      {p.company}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Category dropdown — only the categories that actually exist */}
        <select
          value={category}
          onChange={(e) => updateParams({ category: e.target.value, page: "" })}
          className="w-full sm:w-auto rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">{t("catalog.allCategories")}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {tCategory(c)}
            </option>
          ))}
        </select>

        <select
          value={stock}
          onChange={(e) => updateParams({ stock: e.target.value, page: "" })}
          className="w-full sm:w-auto rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">{t("stock.all")}</option>
          <option value="inStock">{t("stock.inStock")}</option>
          <option value="limitedStock">{t("stock.limitedStock")}</option>
          <option value="outOfStock">{t("stock.outOfStock")}</option>
        </select>
      </div>

      {/* ── Four states ─────────────────────────────────────────── */}
      {loading && <p className="text-gray-500">{t("catalog.loading")}</p>}

      {error && (
        <p className="bg-red-50 text-red-700 rounded p-3">
          {t("catalog.failed", { msg: error })}
        </p>
      )}

      {!loading && !error && data.products.length === 0 && (
        <p className="text-gray-500">{t("catalog.noResults")}</p>
      )}

      {!loading && !error && data.products.length > 0 && (
        <>
          <p className="text-sm text-gray-400 mb-3">
            {t("catalog.count", { count: data.total })}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          <Pagination
            page={data.page}
            pages={data.pages}
            onPageChange={(p) => updateParams({ page: String(p) })}
          />
        </>
      )}
    </div>
  );
}
