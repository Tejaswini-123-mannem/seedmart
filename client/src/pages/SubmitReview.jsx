// pages/SubmitReview.jsx
// ----------------------------------------------------------------------------
// Farmer submits a result for a product. Identity (name + phone) is shown
// read-only from the logged-in account — it is NOT sent; the server snapshots
// it from the trusted DB record. No photo field (admin adds crop photos at
// approval, per project decision). Protected route → only logged-in users.
// ----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";
import { apiGet, apiPost } from "../api/client.js";
import ImageUploader from "../components/ImageUploader.jsx";

export default function SubmitReview() {
  const { id } = useParams();
  const { user } = useAuth();
  const { lang, t } = useLang();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({ yield: "", notes: "" });
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState(null);
  const [yieldError, setYieldError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load the product so we can show what's being reviewed.
  useEffect(() => {
    let active = true;
    apiGet(`/api/products/${id}`)
      .then((p) => active && setProduct(p))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [id]);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setYieldError(null);
    if (!form.yield.trim()) {
      setYieldError(t("submit.errYield"));
      return;
    }
    setLoading(true);
    try {
      // Only the claim fields — identity is set server-side. `language` tells
      // the server which bilingual slot to store this text in; the admin adds
      // the other language at approval.
      await apiPost("/api/submissions", {
        product: id,
        yield: form.yield,
        notes: form.notes,
        language: lang,
        photos,
      });
      navigate("/account", { state: { justSubmitted: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6">
      <Link to="/" className="text-green-700 underline text-sm">
        {t("common.backHome")}
      </Link>

      <h1 className="text-2xl font-bold text-green-700 mt-2 mb-1">
        {t("submit.title")}
      </h1>
      {product && (
        <p className="text-gray-600 mb-3">{product.name?.[lang]}</p>
      )}

      {/* Auto-filled identity — shown for confirmation, not editable, not sent. */}
      <p className="text-xs text-gray-500 bg-gray-50 rounded p-2 mb-4">
        {t("submit.submittingAs")}: <strong>{user?.username}</strong>
        {user?.phone ? ` · ${user.phone}` : ""}
      </p>

      {error && (
        <p className="bg-red-50 text-red-700 text-sm rounded p-2 mb-3">{error}</p>
      )}

      <form onSubmit={submit} noValidate>
        <div className="mb-3">
          <input
            name="yield"
            value={form.yield}
            onChange={update}
            placeholder={t("submit.yield")}
            className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
              yieldError
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:ring-green-200"
            }`}
          />
          {yieldError && (
            <p className="text-red-600 text-xs mt-1">{yieldError}</p>
          )}
        </div>

        <textarea
          name="notes"
          value={form.notes}
          onChange={update}
          placeholder={t("submit.notes")}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-green-200 mb-4"
        />

        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">
            {t("submit.photos")}
          </label>
          <ImageUploader value={photos} onChange={setPhotos} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded py-2"
        >
          {loading ? t("submit.sending") : t("submit.button")}
        </button>
      </form>
    </div>
  );
}
