// components/FormField.jsx
// ----------------------------------------------------------------------------
// A reusable labelled input with an inline error message. For password inputs
// it shows an eye toggle so the user can reveal what they are TYPING (this only
// affects the local input — the stored password is a hash and can never be
// shown). Parent owns value/error; this is presentational.
// ----------------------------------------------------------------------------

import { useState } from "react";
import { useLang } from "../context/LanguageContext.jsx";

export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
}) {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  const isPassword = type === "password";
  // When revealed, swap the password input to a text input.
  const inputType = isPassword && show ? "text" : type;

  return (
    <div className="mb-3">
      <label htmlFor={name} className="block text-sm text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
            isPassword ? "pr-10" : ""
          } ${
            error
              ? "border-red-400 focus:ring-red-200"
              : "border-gray-300 focus:ring-green-200"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? t("common.hidePassword") : t("common.showPassword")}
            title={show ? t("common.hidePassword") : t("common.showPassword")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {show ? "🙈" : "👁"}
          </button>
        )}
      </div>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
