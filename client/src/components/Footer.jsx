// components/Footer.jsx
// ----------------------------------------------------------------------------
// Site footer on every page: brand (from Settings), quick nav links, contact
// numbers (the first is a tap-to-call link), social icons, and a rights line.
// ----------------------------------------------------------------------------

import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import SocialLinks from "./SocialLinks.jsx";

export default function Footer() {
  const { t, lang } = useLang();
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();

  const shopName = settings?.shopName?.[lang] || "SeedMart";
  const contacts = (settings?.contacts || []).filter((c) => c.phone);

  return (
    <footer className="bg-green-800 text-green-50 mt-12">
      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Brand */}
        <div>
          <p className="text-xl font-bold text-white">{shopName}</p>
          <p className="text-sm text-green-200 mt-1">
            {t("footer.rights", { name: shopName })}
          </p>
        </div>

        {/* Quick links — mirror the navbar */}
        <div>
          <p className="font-semibold text-white mb-2">
            {t("footer.quickLinks")}
          </p>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/" className="hover:underline">
                {t("nav.home")}
              </Link>
            </li>
            <li>
              <Link to="/catalog" className="hover:underline">
                {t("nav.catalog")}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link
                to={isAuthenticated ? "/account" : "/login"}
                className="hover:underline"
              >
                {isAuthenticated ? t("nav.account") : t("nav.login")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact numbers — first is a tap-to-call link */}
        {contacts.length > 0 && (
          <div>
            <p className="font-semibold text-white mb-2">{t("footer.contact")}</p>
            <ul className="space-y-1 text-sm">
              {contacts.map((c, i) => (
                <li key={i}>
                  {c.label && <span className="text-green-200">{c.label}: </span>}
                  {i === 0 ? (
                    <a href={`tel:+91${c.phone}`} className="hover:underline">
                      +91 {c.phone}
                    </a>
                  ) : (
                    <span>+91 {c.phone}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Social */}
        <div>
          <p className="font-semibold text-white mb-2">{t("footer.followUs")}</p>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
