// pages/NotFound.jsx
// ----------------------------------------------------------------------------
// Catch-all 404 page for any unmatched URL. Bilingual via the i18n dictionary.
// ----------------------------------------------------------------------------

import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext.jsx";

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="bg-white rounded-xl shadow p-8 text-center">
      <h1 className="text-3xl font-bold text-green-700 mb-2">404</h1>
      <p className="text-gray-600 mb-4">{t("notfound.message")}</p>
      <Link to="/" className="text-green-700 underline">
        {t("notfound.gohome")}
      </Link>
    </div>
  );
}
