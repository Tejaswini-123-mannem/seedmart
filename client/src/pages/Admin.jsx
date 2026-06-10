// pages/Admin.jsx
// ----------------------------------------------------------------------------
// PLACEHOLDER admin page. Reaching this proves AdminRoute lets admins through
// and bounces everyone else. Real admin panel = Stage 11.
// ----------------------------------------------------------------------------

import { useLang } from "../context/LanguageContext.jsx";

export default function Admin() {
  const { t } = useLang();
  return (
    <div className="bg-white rounded-xl shadow p-8">
      <h1 className="text-2xl font-bold text-green-700 mb-2">
        {t("admin.title")}
      </h1>
      <p className="text-gray-600">{t("admin.note1")}</p>
      <p className="text-gray-400 text-sm mt-4">{t("admin.note2")}</p>
    </div>
  );
}
