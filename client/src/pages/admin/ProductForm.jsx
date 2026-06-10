// pages/admin/ProductForm.jsx
// ----------------------------------------------------------------------------
// Shared create/edit form for a product. Edit mode when there's an :id in the
// URL (pre-fills from the existing product); create mode otherwise. Submitting
// POSTs (create) or PUTs (edit) to the products API.
// ----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../../api/client.js";
import { useLang } from "../../context/LanguageContext.jsx";
import AdminNav from "../../components/admin/AdminNav.jsx";
import ImageUploader from "../../components/ImageUploader.jsx";

const EMPTY = {
  nameEn: "",
  nameTe: "",
  descEn: "",
  descTe: "",
  company: "",
  category: "",
  stockStatus: "inStock",
  featured: false,
  photos: [],
};

export default function ProductForm() {
  const { id } = useParams(); // present → edit mode
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { t } = useLang();

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // In edit mode, load the product and flatten it into the form state.
  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    apiGet(`/api/products/${id}`)
      .then((p) => {
        if (!active) return;
        setForm({
          nameEn: p.name?.en || "",
          nameTe: p.name?.te || "",
          descEn: p.description?.en || "",
          descTe: p.description?.te || "",
          company: p.company || "",
          category: p.category || "",
          stockStatus: p.stockStatus || "inStock",
          featured: !!p.featured,
          photos: p.photos || [],
        });
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    // Required: both languages of name + description, company, category.
    if (
      !form.nameEn.trim() ||
      !form.nameTe.trim() ||
      !form.descEn.trim() ||
      !form.descTe.trim() ||
      !form.company.trim() ||
      !form.category.trim()
    ) {
      setError(t("admin.form.required"));
      return;
    }

    const payload = {
      name: { en: form.nameEn, te: form.nameTe },
      description: { en: form.descEn, te: form.descTe },
      company: form.company,
      category: form.category,
      stockStatus: form.stockStatus,
      featured: form.featured,
      photos: form.photos,
    };

    setSaving(true);
    try {
      if (isEdit) await apiPut(`/api/products/${id}`, payload);
      else await apiPost("/api/products", payload);
      navigate("/admin/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-green-200";

  if (loading) return <p className="text-gray-500">{t("admin.loading")}</p>;

  return (
    <div>
      <AdminNav />
      <h1 className="text-xl font-bold text-green-700 mb-4">
        {isEdit ? t("admin.form.editTitle") : t("admin.form.newTitle")}
      </h1>

      {error && (
        <p className="bg-red-50 text-red-700 text-sm rounded p-2 mb-3">{error}</p>
      )}

      <form
        onSubmit={submit}
        className="bg-white rounded-xl shadow p-6 space-y-4 max-w-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t("admin.form.nameEn")}
            </label>
            <input name="nameEn" value={form.nameEn} onChange={update} className={input} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t("admin.form.nameTe")}
            </label>
            <input name="nameTe" value={form.nameTe} onChange={update} className={input} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t("admin.form.descEn")}
            </label>
            <textarea name="descEn" value={form.descEn} onChange={update} rows={3} className={input} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t("admin.form.descTe")}
            </label>
            <textarea name="descTe" value={form.descTe} onChange={update} rows={3} className={input} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t("admin.form.company")}
            </label>
            <input name="company" value={form.company} onChange={update} className={input} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t("admin.form.category")}
            </label>
            <input name="category" value={form.category} onChange={update} className={input} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t("admin.form.stock")}
            </label>
            <select name="stockStatus" value={form.stockStatus} onChange={update} className={input}>
              <option value="inStock">{t("stock.inStock")}</option>
              <option value="limitedStock">{t("stock.limitedStock")}</option>
              <option value="outOfStock">{t("stock.outOfStock")}</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="featured"
            checked={form.featured}
            onChange={update}
          />
          ⭐ {t("admin.form.featured")}
        </label>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            {t("admin.form.photos")}
          </label>
          <ImageUploader
            value={form.photos}
            onChange={(photos) => setForm((f) => ({ ...f, photos }))}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded px-5 py-2"
          >
            {saving ? t("admin.saving") : t("admin.save")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-5 py-2"
          >
            {t("admin.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
