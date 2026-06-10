// components/UserMenu.jsx
// ----------------------------------------------------------------------------
// The logged-in user's avatar button that opens a dropdown: Account, Settings,
// Admin (if admin), and Logout. Closes when you click anywhere outside it
// (a ref + a document mousedown listener — the standard dropdown pattern).
// ----------------------------------------------------------------------------

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";

export default function UserMenu() {
  const { user, isAdmin, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close the menu on any click outside of it.
  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const initial = user?.username?.[0]?.toUpperCase() || "U";
  const itemCls = "block w-full text-left px-4 py-2 text-sm hover:bg-gray-100";

  return (
    <div className="relative" ref={ref}>
      {/* Avatar button: a circle with the user's first initial. */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={user?.username}
        aria-haspopup="true"
        aria-expanded={open}
        className="w-9 h-9 rounded-full bg-white text-green-700 font-bold flex items-center justify-center hover:ring-2 hover:ring-white/60"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 rounded-lg shadow-lg py-1 z-50">
          <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100">
            {t("nav.greeting")} <strong>{user?.username}</strong>
          </div>
          <Link to="/account" onClick={() => setOpen(false)} className={itemCls}>
            {t("nav.account")}
          </Link>
          <Link to="/settings" onClick={() => setOpen(false)} className={itemCls}>
            {t("nav.settings")}
          </Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)} className={itemCls}>
              {t("nav.admin")}
            </Link>
          )}
          <button
            onClick={handleLogout}
            className={`${itemCls} text-red-600 border-t border-gray-100`}
          >
            {t("nav.logout")}
          </button>
        </div>
      )}
    </div>
  );
}
