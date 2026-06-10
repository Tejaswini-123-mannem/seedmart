// pages/AboutUs.jsx
// ----------------------------------------------------------------------------
// About the shop: proprietor photo + name, the shop's story (bilingual), and
// social links — all from the admin-managed Settings.
// ----------------------------------------------------------------------------

import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import SocialLinks from "../components/SocialLinks.jsx";

export default function AboutUs() {
  const { lang, t } = useLang();
  const { settings } = useSettings();

  const about = settings?.about || {};
  const story = about.story?.[lang];

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="text-green-700 underline text-sm">
        {t("common.backHome")}
      </Link>
      <h1 className="text-2xl font-bold text-green-700 mb-6 mt-2">
        {t("about.title")}
      </h1>

      <div className="bg-white rounded-xl shadow p-6 md:flex gap-6">
        {/* Proprietor photo */}
        {about.proprietorPhoto && (
          <div className="md:w-1/3 flex-shrink-0">
            <img
              src={about.proprietorPhoto}
              alt={about.proprietorName || "Proprietor"}
              className="w-full h-48 md:h-40 object-cover rounded-lg"
            />
            {about.proprietorName && (
              <p className="text-center mt-2">
                <span className="font-semibold text-gray-800">
                  {about.proprietorName}
                </span>
                <br />
                <span className="text-xs text-gray-500">
                  {t("about.proprietor")}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Story */}
        <div className="md:flex-1 mt-4 md:mt-0">
          {story && (
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {story}
            </p>
          )}

          <div className="mt-6">
            <p className="font-semibold text-gray-800 mb-2">
              {t("about.followUs")}
            </p>
            <SocialLinks />
          </div>
        </div>
      </div>
    </div>
  );
}
