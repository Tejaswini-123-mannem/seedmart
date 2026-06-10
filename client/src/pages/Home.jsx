// pages/Home.jsx
// ----------------------------------------------------------------------------
// The landing page (now at "/"). Sections:
//   • Hero — shop name + tagline (from Settings) + an "All Products" button
//   • Announcement strip (from Settings, if set)
//   • Top Brands (auto-derived from product companies)
//   • Featured Products slider (admin-curated `featured` products)
// The full searchable/paginated catalog now lives at /catalog.
// ----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api/client.js";
import { useLang } from "../context/LanguageContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import ProductSlider from "../components/ProductSlider.jsx";
import BrandsStrip from "../components/BrandsStrip.jsx";
import MediaSlider from "../components/MediaSlider.jsx";

export default function Home() {
  const { lang, t } = useLang();
  const { settings } = useSettings();

  const [featured, setFeatured] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    let active = true;
    apiGet("/api/products?featured=true&limit=12")
      .then((res) => active && setFeatured(res.products))
      .catch(() => {});
    apiGet("/api/products/brands")
      .then((list) => active && setBrands(list))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const shopName = settings?.shopName?.[lang] || "SeedMart";
  const logo = settings?.logo;
  // Admin-curated brands take priority; otherwise show all distinct brands.
  const displayBrands =
    settings?.topBrands?.length > 0 ? settings.topBrands : brands;
  const hero = settings?.heroTagline?.[lang];
  const description = settings?.shopDescription?.[lang];
  const announcement = settings?.announcement?.[lang];

  return (
    <div className="space-y-10">
      {/* ── Hero: logo on the left, name/tagline/description on the right ── */}
      <section className="bg-gradient-to-r from-green-700 to-green-600 text-white rounded-2xl p-8 md:p-12">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {logo && (
            <img
              src={logo}
              alt={shopName}
              className="h-40 w-40 sm:h-52 sm:w-52 object-cover rounded-full shrink-0 shadow-lg ring-4 ring-white"
            />
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{shopName}</h1>
            {hero && <p className="text-green-50 text-lg mb-3">{hero}</p>}
            {description && (
              <p className="text-green-100 text-sm md:text-base max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Shop media slider (photos & videos) ──────────────────── */}
      <MediaSlider slides={settings?.mediaSlides} />

      {/* ── Announcement strip ───────────────────────────────────── */}
      {announcement && (
        <div className="bg-amber-100 text-amber-800 rounded-lg px-4 py-3 text-center font-medium">
          {announcement}
        </div>
      )}

      {/* ── Top brands ───────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-green-700 mb-3">
          {t("home.topBrands")}
        </h2>
        <BrandsStrip brands={displayBrands} />
      </section>

      {/* ── Featured products ────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-green-700">
            {t("home.featured")}
          </h2>
          <Link to="/catalog" className="text-green-700 text-sm underline">
            {t("home.viewAll")}
          </Link>
        </div>
        <ProductSlider products={featured} />
      </section>
    </div>
  );
}
