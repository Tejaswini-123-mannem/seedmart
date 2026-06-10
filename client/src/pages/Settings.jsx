// pages/Settings.jsx
// ----------------------------------------------------------------------------
// The logged-in user's profile/settings. Shows the details captured at signup
// (username, phone, email). The password is never revealed (one-way hash), but
// the user can CHANGE it: verify the current password, set a new one.
// Protected route → only logged-in users.
// ----------------------------------------------------------------------------

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";
import { apiPut } from "../api/client.js";
import FormField from "../components/FormField.jsx";

// A small read-only labelled row.
function Row({ label, value, muted }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={muted ? "text-gray-400 italic" : "text-gray-800 font-medium"}>
        {value}
      </span>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { t } = useLang();

  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = t("settings.errCurrent");
    if (form.newPassword.length < 6) errs.newPassword = t("auth.errPassword");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError(null);
    setSuccess(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await apiPut("/api/auth/password", form);
      setSuccess(t("settings.changeSuccess"));
      setForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      // e.g. "Current password is incorrect" (401)
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Link to="/" className="text-green-700 underline text-sm">
        {t("common.backHome")}
      </Link>

      {/* ── Profile details ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow p-6 mt-2">
        <h1 className="text-2xl font-bold text-green-700 mb-4">
          {t("settings.title")}
        </h1>

        <Row label={t("settings.username")} value={user?.username} />
        <Row label={t("settings.phone")} value={user?.phone} />
        <Row
          label={t("settings.email")}
          value={user?.email || t("settings.noEmail")}
          muted={!user?.email}
        />

        <div className="py-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {t("settings.password")}
            </span>
            <span className="text-gray-800 tracking-widest">••••••••</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {t("settings.passwordNote")}
          </p>
        </div>
      </div>

      {/* ── Change password ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow p-6 mt-4">
        <h2 className="text-lg font-bold text-green-700 mb-3">
          {t("settings.changePassword")}
        </h2>

        {success && (
          <p className="bg-green-50 text-green-700 text-sm rounded p-2 mb-3">
            {success}
          </p>
        )}
        {serverError && (
          <p className="bg-red-50 text-red-700 text-sm rounded p-2 mb-3">
            {serverError}
          </p>
        )}

        <form onSubmit={submit} noValidate>
          <FormField
            label={t("settings.currentPassword")}
            name="currentPassword"
            type="password"
            value={form.currentPassword}
            onChange={update}
            error={errors.currentPassword}
            autoComplete="current-password"
          />
          <FormField
            label={t("settings.newPassword")}
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={update}
            error={errors.newPassword}
            autoComplete="new-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded py-2 mt-1"
          >
            {loading ? t("settings.changing") : t("settings.changeBtn")}
          </button>
        </form>
      </div>
    </div>
  );
}
