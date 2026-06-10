// pages/admin/AdminProducts.jsx
// ----------------------------------------------------------------------------
// Admin product list: a searchable/filterable table of every product with
// Edit / Delete actions and the featured ⭐ marker. Search matches name +
// company; a dropdown filters by stock status (same backend params as the
// public catalog).
// ----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiDel } from "../../api/client.js";
import { useLang } from "../../context/LanguageContext.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";
import AdminNav from "../../components/admin/AdminNav.jsx";

export default function AdminProducts() {
  const { lang, t } = useLang();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters: search (debounced) + stock status.
  const [search, setSearch] = useState("");
  const [stock, setStock] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // Re-fetch whenever the filters change. The cleanup flag guards the stale
  // async response race (same pattern as the catalog).
  useEffect(() => {
    let active = true;
    setLoading(true);
    const qs = new URLSearchParams({ limit: "200" });
    if (debouncedSearch) qs.set("search", debouncedSearch);
    if (stock) qs.set("stock", stock);
    apiGet(`/api/products?${qs.toString()}`)
      .then((res) => active && setProducts(res.products))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [debouncedSearch, stock]);

  const remove = async (id) => {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    try {
      await apiDel(`/api/products/${id}`);
      setProducts((ps) => ps.filter((p) => p._id !== id));
    } catch {
      // on failure, leave the list as-is; the next filter change resyncs
    }
  };

  return (
    <div>
      <AdminNav />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-green-700">
          {t("admin.products.title")}
        </h1>
        <Link
          to="/admin/products/new"
          className="bg-green-600 hover:bg-green-700 text-white text-sm rounded px-4 py-2"
        >
          {t("admin.products.add")}
        </Link>
      </div>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("catalog.searchPlaceholder")}
          className="w-full sm:flex-1 sm:min-w-48 rounded-lg border border-gray-300 px-3 py-2"
        />
        <select
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full sm:w-auto rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">{t("stock.all")}</option>
          <option value="inStock">{t("stock.inStock")}</option>
          <option value="limitedStock">{t("stock.limitedStock")}</option>
          <option value="outOfStock">{t("stock.outOfStock")}</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">{t("admin.loading")}</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">{t("admin.products.none")}</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm min-w-[32rem]">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-2">{t("admin.products.colName")}</th>
                <th className="px-4 py-2">{t("admin.products.colCompany")}</th>
                <th className="px-4 py-2">{t("admin.products.colStock")}</th>
                <th className="px-4 py-2 text-right">
                  {t("admin.products.colActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-gray-100">
                  <td className="px-4 py-2">
                    {p.featured && <span title="Featured">⭐ </span>}
                    {p.name?.[lang]}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{p.company}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {t(`stock.${p.stockStatus}`)}
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <Link
                      to={`/admin/products/${p._id}/edit`}
                      className="text-green-700 hover:underline mr-3"
                    >
                      {t("admin.edit")}
                    </Link>
                    <button
                      onClick={() => remove(p._id)}
                      className="text-red-600 hover:underline"
                    >
                      {t("admin.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
