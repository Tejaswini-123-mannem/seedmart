// components/admin/AdminNav.jsx
// ----------------------------------------------------------------------------
// The shared sub-navigation across the admin pages. NavLink applies an active
// style automatically based on the current route.
// ----------------------------------------------------------------------------

import { NavLink } from "react-router-dom";
import { useLang } from "../../context/LanguageContext.jsx";

export default function AdminNav() {
  const { t } = useLang();

  const cls = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium ${
      isActive
        ? "bg-green-600 text-white"
        : "bg-white text-gray-600 hover:text-green-700 shadow"
    }`;

  return (
    <div className="flex gap-2 mb-6">
      <NavLink to="/admin/products" className={cls}>
        {t("admin.navProducts")}
      </NavLink>
      <NavLink to="/admin/queue" className={cls}>
        {t("admin.navQueue")}
      </NavLink>
      <NavLink to="/admin/settings" className={cls}>
        {t("admin.navSettings")}
      </NavLink>
    </div>
  );
}
