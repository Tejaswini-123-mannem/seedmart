// components/LanguageToggle.jsx
// ----------------------------------------------------------------------------
// A two-button EN / తెలుగు switch for the Navbar. Reads + sets the global
// language from LanguageContext.
// ----------------------------------------------------------------------------

import { useLang } from "../context/LanguageContext.jsx";

export default function LanguageToggle() {
  const { lang, setLanguage } = useLang();

  const base = "px-2 py-0.5 rounded text-xs font-medium";
  const active = "bg-white text-green-700";
  const idle = "bg-white/15 text-white hover:bg-white/25";

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setLanguage("en")}
        className={`${base} ${lang === "en" ? active : idle}`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("te")}
        className={`${base} ${lang === "te" ? active : idle}`}
      >
        తెలుగు
      </button>
    </div>
  );
}
