// pages/Login.jsx
// ----------------------------------------------------------------------------
// Real login form. Controlled inputs, client-side validation (mirrors the
// backend schema), server-error display, and redirect-back to wherever the
// user was headed before the guard sent them here.
// ----------------------------------------------------------------------------

import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";
import { apiPost } from "../api/client.js";
import FormField from "../components/FormField.jsx";

export default function Login() {
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to go after login: the page the guard bounced us from, else home.
  const dest = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Local validation for fast feedback. The backend re-checks everything.
  const validate = () => {
    const errs = {};
    if (form.username.trim().length < 3) errs.username = t("auth.errUsername");
    if (form.password.length < 6) errs.password = t("auth.errPassword");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await apiPost("/api/auth/login", form);
      login(data); // flips the whole app to "logged in"
      navigate(dest, { replace: true });
    } catch (err) {
      // Surfaces the backend's message, e.g. "Invalid credentials".
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow p-6">
      <Link to="/" className="text-green-700 underline text-sm">
        {t("auth.backHome")}
      </Link>
      <h1 className="text-2xl font-bold text-green-700 mb-4 mt-2">
        {t("auth.loginTitle")}
      </h1>

      {serverError && (
        <p className="bg-red-50 text-red-700 text-sm rounded p-2 mb-3">
          {serverError}
        </p>
      )}

      <form onSubmit={submit} noValidate>
        <FormField
          label={t("auth.username")}
          name="username"
          value={form.username}
          onChange={update}
          error={errors.username}
          autoComplete="username"
        />
        <FormField
          label={t("auth.password")}
          name="password"
          type="password"
          value={form.password}
          onChange={update}
          error={errors.password}
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded py-2 mt-1"
        >
          {loading ? t("auth.submitting") : t("auth.loginBtn")}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        {t("auth.noAccount")}{" "}
        <Link to="/signup" className="text-green-700 underline">
          {t("auth.signupLink")}
        </Link>
      </p>
    </div>
  );
}
