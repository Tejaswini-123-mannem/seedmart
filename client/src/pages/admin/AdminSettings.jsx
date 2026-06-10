// pages/admin/AdminSettings.jsx
// ----------------------------------------------------------------------------
// Edits the singleton Settings document (PUT /api/settings). Grouped sections:
// shop info, contact, home content, social links, and the About page (proprietor
// photo + bilingual story). On save it reloads SettingsContext so the public
// navbar/footer/home/about update live.
// ----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { apiGet, apiPut } from "../../api/client.js";
import { useLang } from "../../context/LanguageContext.jsx";
import { useSettings } from "../../context/SettingsContext.jsx";
import AdminNav from "../../components/admin/AdminNav.jsx";
import ImageUploader from "../../components/ImageUploader.jsx";
import MediaUploader from "../../components/MediaUploader.jsx";

const input =
  "w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-green-200";

// One labelled input bound to a flat form field.
function Field({ label, name, value, onChange, textarea }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      {textarea ? (
        <textarea name={name} value={value} onChange={onChange} rows={3} className={input} />
      ) : (
        <input name={name} value={value} onChange={onChange} className={input} />
      )}
    </div>
  );
}

// A titled card section. IMPORTANT: this is defined at MODULE level, not inside
// AdminSettings. If it were defined inside the component, a new function would
// be created every render, so React would remount the whole section (and its
// inputs) on each keystroke — making inputs lose focus / the cursor jump.
function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-3">
      <h2 className="font-bold text-green-700">{title}</h2>
      {children}
    </div>
  );
}

const EMPTY = {
  shopNameEn: "", shopNameTe: "",
  shopDescEn: "", shopDescTe: "",
  whatsapp: "", contactPhone: "", contactEmail: "",
  addressEn: "", addressTe: "",
  heroEn: "", heroTe: "",
  announceEn: "", announceTe: "",
  fb: "", ig: "", yt: "", wa: "",
  propName: "", storyEn: "", storyTe: "",
};

export default function AdminSettings() {
  const { t } = useLang();
  const { reload } = useSettings();

  const [f, setF] = useState(EMPTY);
  const [logo, setLogo] = useState([]); // shop logo (single, as array)
  const [photo, setPhoto] = useState([]); // proprietor photo (single, as array)
  const [contacts, setContacts] = useState([
    { label: "", phone: "" },
    { label: "", phone: "" },
    { label: "", phone: "" },
  ]);
  const [topBrands, setTopBrands] = useState([]); // selected brand names
  const [allBrands, setAllBrands] = useState([]); // available brands to pick from
  const [media, setMedia] = useState([]); // home media slides ({type,url})
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Load current settings and flatten into the form.
  useEffect(() => {
    let active = true;
    apiGet("/api/settings")
      .then((s) => {
        if (!active) return;
        setF({
          shopNameEn: s.shopName?.en || "", shopNameTe: s.shopName?.te || "",
          shopDescEn: s.shopDescription?.en || "", shopDescTe: s.shopDescription?.te || "",
          whatsapp: s.whatsappNumber || "",
          contactPhone: s.contactPhone || "", contactEmail: s.contactEmail || "",
          addressEn: s.address?.en || "", addressTe: s.address?.te || "",
          heroEn: s.heroTagline?.en || "", heroTe: s.heroTagline?.te || "",
          announceEn: s.announcement?.en || "", announceTe: s.announcement?.te || "",
          fb: s.socialLinks?.facebook || "", ig: s.socialLinks?.instagram || "",
          yt: s.socialLinks?.youtube || "", wa: s.socialLinks?.whatsapp || "",
          propName: s.about?.proprietorName || "",
          storyEn: s.about?.story?.en || "", storyTe: s.about?.story?.te || "",
        });
        setLogo(s.logo ? [s.logo] : []);
        setPhoto(s.about?.proprietorPhoto ? [s.about.proprietorPhoto] : []);
        // Load contacts, padded to 3 editable rows.
        const cs = s.contacts || [];
        setContacts([0, 1, 2].map((i) => ({
          label: cs[i]?.label || "",
          phone: cs[i]?.phone || "",
        })));
        setTopBrands(s.topBrands || []);
        setMedia(s.mediaSlides || []);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    // The list of brands the admin can choose from (distinct product companies).
    apiGet("/api/products/brands")
      .then((list) => active && setAllBrands(list))
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Auto-hide the "saved" toast after a few seconds.
  useEffect(() => {
    if (!saved) return;
    const id = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(id);
  }, [saved]);

  const toggleBrand = (brand) => {
    setTopBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setSaved(false);
  };

  const update = (e) => {
    const { name, value } = e.target;
    setF((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const updateContact = (i, key, val) => {
    setContacts((prev) => prev.map((c, idx) => (idx === i ? { ...c, [key]: val } : c)));
    setSaved(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await apiPut("/api/settings", {
        shopName: { en: f.shopNameEn, te: f.shopNameTe },
        shopDescription: { en: f.shopDescEn, te: f.shopDescTe },
        logo: logo[0] || "",
        topBrands,
        mediaSlides: media,
        whatsappNumber: f.whatsapp,
        contactPhone: f.contactPhone,
        contactEmail: f.contactEmail,
        contacts: contacts.filter((c) => c.phone.trim()),
        address: { en: f.addressEn, te: f.addressTe },
        heroTagline: { en: f.heroEn, te: f.heroTe },
        announcement: { en: f.announceEn, te: f.announceTe },
        socialLinks: { facebook: f.fb, instagram: f.ig, youtube: f.yt, whatsapp: f.wa },
        about: {
          proprietorName: f.propName,
          proprietorPhoto: photo[0] || "",
          story: { en: f.storyEn, te: f.storyTe },
        },
      });
      await reload(); // refresh the public site live
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div>
        <AdminNav />
        <p className="text-gray-500">{t("admin.loading")}</p>
      </div>
    );

  return (
    <div>
      <AdminNav />
      <h1 className="text-xl font-bold text-green-700 mb-4">{t("aset.title")}</h1>

      {error && (
        <p className="bg-red-50 text-red-700 text-sm rounded p-2 mb-3">{error}</p>
      )}

      {/* Floating success toast — visible regardless of scroll position. */}
      {saved && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
          <span className="text-base">✓</span>
          {t("aset.saved")}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4 max-w-3xl">
        <Section title={t("aset.shopInfo")}>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label={t("aset.shopNameEn")} name="shopNameEn" value={f.shopNameEn} onChange={update} />
            <Field label={t("aset.shopNameTe")} name="shopNameTe" value={f.shopNameTe} onChange={update} />
            <Field label={t("aset.shopDescEn")} name="shopDescEn" value={f.shopDescEn} onChange={update} textarea />
            <Field label={t("aset.shopDescTe")} name="shopDescTe" value={f.shopDescTe} onChange={update} textarea />
            <Field label={t("aset.addressEn")} name="addressEn" value={f.addressEn} onChange={update} />
            <Field label={t("aset.addressTe")} name="addressTe" value={f.addressTe} onChange={update} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t("aset.logo")}
            </label>
            <ImageUploader value={logo} onChange={(v) => { setLogo(v); setSaved(false); }} multiple={false} />
          </div>
        </Section>

        <Section title={t("aset.contact")}>
          <div className="grid md:grid-cols-3 gap-3">
            <Field label={t("aset.whatsapp")} name="whatsapp" value={f.whatsapp} onChange={update} />
            <Field label={t("aset.contactPhone")} name="contactPhone" value={f.contactPhone} onChange={update} />
            <Field label={t("aset.contactEmail")} name="contactEmail" value={f.contactEmail} onChange={update} />
          </div>

          {/* Up to 3 named contact numbers (first one gets the call link). */}
          <div className="pt-2">
            <p className="text-sm text-gray-700 mb-1">{t("aset.contacts")}</p>
            <div className="space-y-2">
              {contacts.map((c, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={c.label}
                    onChange={(e) => updateContact(i, "label", e.target.value)}
                    placeholder={t("aset.contactLabel")}
                    className={`${input} sm:w-1/3`}
                  />
                  <input
                    value={c.phone}
                    onChange={(e) => updateContact(i, "phone", e.target.value)}
                    placeholder={t("aset.contactNumber")}
                    className={input}
                  />
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title={t("aset.home")}>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label={t("aset.heroEn")} name="heroEn" value={f.heroEn} onChange={update} />
            <Field label={t("aset.heroTe")} name="heroTe" value={f.heroTe} onChange={update} />
            <Field label={t("aset.announceEn")} name="announceEn" value={f.announceEn} onChange={update} />
            <Field label={t("aset.announceTe")} name="announceTe" value={f.announceTe} onChange={update} />
          </div>
        </Section>

        <Section title={t("aset.media")}>
          <p className="text-xs text-gray-500">{t("aset.mediaHint")}</p>
          <MediaUploader value={media} onChange={(v) => { setMedia(v); setSaved(false); }} />
        </Section>

        <Section title={t("aset.brands")}>
          <p className="text-xs text-gray-500">{t("aset.brandsHint")}</p>
          {allBrands.length === 0 ? (
            <p className="text-sm text-gray-400">{t("aset.brandsNone")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allBrands.map((brand) => {
                const on = topBrands.includes(brand);
                return (
                  <button
                    type="button"
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={`rounded-full px-3 py-1 text-sm border ${
                      on
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-green-400"
                    }`}
                  >
                    {on ? "✓ " : ""}
                    {brand}
                  </button>
                );
              })}
            </div>
          )}
        </Section>

        <Section title={t("aset.social")}>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label={t("aset.fb")} name="fb" value={f.fb} onChange={update} />
            <Field label={t("aset.ig")} name="ig" value={f.ig} onChange={update} />
            <Field label={t("aset.yt")} name="yt" value={f.yt} onChange={update} />
            <Field label={t("aset.wa")} name="wa" value={f.wa} onChange={update} />
          </div>
        </Section>

        <Section title={t("aset.about")}>
          <Field label={t("aset.propName")} name="propName" value={f.propName} onChange={update} />
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t("aset.propPhoto")}
            </label>
            <ImageUploader value={photo} onChange={(v) => { setPhoto(v); setSaved(false); }} multiple={false} />
          </div>
          <Field label={t("aset.storyEn")} name="storyEn" value={f.storyEn} onChange={update} textarea />
          <Field label={t("aset.storyTe")} name="storyTe" value={f.storyTe} onChange={update} textarea />
        </Section>

        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded px-6 py-2"
        >
          {saving ? t("admin.saving") : t("admin.save")}
        </button>
      </form>
    </div>
  );
}
