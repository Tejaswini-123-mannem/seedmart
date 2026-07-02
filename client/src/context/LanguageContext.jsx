// context/LanguageContext.jsx
// ----------------------------------------------------------------------------
// Global language preference (English / Telugu) PLUS the translation helpers.
// useLang() gives any component:
//   lang        — "en" | "te"
//   t(key, vars)— a translated UI string ("nav.login" → "ప్రవేశం")
//   tCategory(c)— a translated category label ("cotton" → "పత్తి")
//   setLanguage / toggleLang
//
// The choice persists in localStorage so a returning visitor keeps it.
// ----------------------------------------------------------------------------

import { createContext, useContext, useState } from "react";
import { translations, categoryLabels } from "../i18n/translations.js";

const LANG_KEY = "seedmart_lang";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem(LANG_KEY) || "en"
  );

  const setLanguage = (next) => {
    setLang(next);
    localStorage.setItem(LANG_KEY, next);
  };

  const toggleLang = () => setLanguage(lang === "en" ? "te" : "en");

  // Look up a UI string for the current language. Unknown keys return the key
  // itself (so a missing translation is visible, not blank). {placeholders}
  // are filled from the optional `vars` object.
  const t = (key, vars) => {
    let str = translations[lang]?.[key] ?? translations.en[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v);
      });
    }
    return str;
  };

  // Translate a product category key to its display label.
  const tCategory = (category) =>
    categoryLabels[category]?.[lang] || category;

  // Pick a bilingual { en, te } field for the current language, falling back to
  // the other language if this one is empty. Tolerates legacy plain strings so
  // older data (stored before reviews became bilingual) still renders.
  const tf = (val) => {
    if (val == null) return "";
    if (typeof val === "string") return val;
    return val[lang] || val.en || val.te || "";
  };

  return (
    <LanguageContext.Provider
      value={{ lang, setLanguage, toggleLang, t, tCategory, tf }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (ctx === null) {
    throw new Error("useLang must be used inside <LanguageProvider>");
  }
  return ctx;
}
