// pages/Signup.jsx
// ----------------------------------------------------------------------------
// Registration form. Full client-side validation mirroring the User schema
// (username ≥3, password ≥6, phone exactly 10 digits, email optional). On
// success the API returns a token, so the new user is logged in immediately.
// ----------------------------------------------------------------------------

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";
import { apiPost } from "../api/client.js";
import FormField from "../components/FormField.jsx";

export default function Signup() {
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (form.username.trim().length < 3) errs.username = t("auth.errUsername");
    if (form.password.length < 6) errs.password = t("auth.errPassword");
    if (!/^\d{10}$/.test(form.phone)) errs.phone = t("auth.errPhone");
    // Email is optional, but if provided it must look like an email.
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = t("auth.errEmail");
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      // Drop an empty email so we don't send "" for the optional field.
      const payload = { ...form };
      if (!payload.email) delete payload.email;

      const data = await apiPost("/api/auth/register", payload);
      login(data); // register returns a token → log in right away
      navigate("/", { replace: true });
    } catch (err) {
      // e.g. "Username or phone number already in use" (409)
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
        {t("auth.signupTitle")}
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
          autoComplete="new-password"
        />
        <FormField
          label={t("auth.phone")}
          name="phone"
          type="tel"
          value={form.phone}
          onChange={update}
          error={errors.phone}
          autoComplete="tel"
        />
        <FormField
          label={t("auth.email")}
          name="email"
          type="email"
          value={form.email}
          onChange={update}
          error={errors.email}
          autoComplete="email"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded py-2 mt-1"
        >
          {loading ? t("auth.submitting") : t("auth.signupBtn")}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        {t("auth.haveAccount")}{" "}
        <Link to="/login" className="text-green-700 underline">
          {t("auth.loginLink")}
        </Link>
      </p>
    </div>
  );
}
