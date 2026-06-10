// components/Navbar.jsx
// ----------------------------------------------------------------------------
// Responsive top navigation.
//   Desktop (sm+): brand · Home · Catalog · About · language · user/Login inline.
//   Mobile:        brand · language · user/Login · ☰ hamburger. The nav links
//                  drop into a panel under the bar when the hamburger is tapped,
//                  so nothing overlaps on small screens.
// ----------------------------------------------------------------------------

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import LanguageToggle from "./LanguageToggle.jsx";
import UserMenu from "./UserMenu.jsx";

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const { t, lang } = useLang();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);

  const shopName = settings?.shopName?.[lang] || "SeedMart";
  const close = () => setOpen(false);

  // The three primary links, reused in the desktop row and the mobile panel.
  const links = (
    <>
      <Link to="/" onClick={close} className="hover:underline">
        {t("nav.home")}
      </Link>
      <Link to="/catalog" onClick={close} className="hover:underline">
        {t("nav.catalog")}
      </Link>
      <Link to="/about" onClick={close} className="hover:underline">
        {t("nav.about")}
      </Link>
    </>
  );

  return (
    <nav className="bg-green-700 text-white shadow sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
        <Link to="/" className="text-xl font-bold shrink-0">
          {shopName}
        </Link>

        <div className="flex items-center gap-3 sm:gap-4 text-sm">
          {/* Inline links — desktop only */}
          <div className="hidden sm:flex items-center gap-4">{links}</div>

          <LanguageToggle />

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Link
              to="/login"
              className="bg-white/15 hover:bg-white/25 rounded px-3 py-1"
            >
              {t("nav.login")}
            </Link>
          )}

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
            className="sm:hidden text-2xl leading-none w-8 h-8 flex items-center justify-center"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel with the nav links */}
      {open && (
        <div className="sm:hidden border-t border-white/20 px-4 pb-3 pt-1 flex flex-col gap-2 text-sm">
          {links}
        </div>
      )}
    </nav>
  );
}
