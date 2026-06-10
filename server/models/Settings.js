// models/Settings.js
// ----------------------------------------------------------------------------
// SINGLETON: the whole collection holds AT MOST ONE document — the site-wide
// configuration the admin edits and the public reads (contact info, hero text,
// social links). We never expose a "create" path; reads/writes target "the one
// doc" and create it on demand, so there can never be zero-at-render or two.
// ----------------------------------------------------------------------------

import mongoose from "mongoose";

// Same bilingual pattern as Product: a { en, te } pair with no own _id.
const bilingualText = new mongoose.Schema(
  {
    en: { type: String, trim: true, default: "" },
    te: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    shopName: { type: bilingualText, default: () => ({}) },
    shopDescription: { type: bilingualText, default: () => ({}) },
    logo: { type: String, trim: true, default: "" }, // Cloudinary URL of the shop logo

    // Admin-curated list of brand names to feature on the Home page. If empty,
    // the Home page falls back to ALL distinct product companies.
    topBrands: { type: [String], default: [] },

    // Shop photos/videos shown in a slider on the Home page (below the header).
    mediaSlides: {
      type: [
        new mongoose.Schema(
          {
            type: { type: String, enum: ["image", "video"], default: "image" },
            url: { type: String, default: "" },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    whatsappNumber: { type: String, trim: true, default: "" },
    contactPhone: { type: String, trim: true, default: "" },
    contactEmail: { type: String, trim: true, lowercase: true, default: "" },

    // Up to a few named contact numbers the admin can edit. The first one also
    // gets a tap-to-call link in the footer.
    contacts: {
      type: [
        new mongoose.Schema(
          {
            label: { type: String, trim: true, default: "" },
            phone: { type: String, trim: true, default: "" },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    address: { type: bilingualText, default: () => ({}) },
    heroTagline: { type: bilingualText, default: () => ({}) },
    announcement: { type: bilingualText, default: () => ({}) },

    socialLinks: {
      type: new mongoose.Schema(
        {
          facebook: { type: String, trim: true, default: "" },
          instagram: { type: String, trim: true, default: "" },
          youtube: { type: String, trim: true, default: "" },
          whatsapp: { type: String, trim: true, default: "" },
        },
        { _id: false }
      ),
      default: () => ({}),
    },

    // About-page content: the proprietor and the shop's story (bilingual).
    about: {
      type: new mongoose.Schema(
        {
          proprietorName: { type: String, trim: true, default: "" },
          proprietorPhoto: { type: String, trim: true, default: "" }, // Cloudinary URL
          story: { type: bilingualText, default: () => ({}) },
        },
        { _id: false }
      ),
      default: () => ({}),
    },
  },
  { timestamps: true }
);

// ── Singleton accessor ──────────────────────────────────────────────────────
// Always returns THE settings document, creating it with defaults the first
// time it's ever requested. Read endpoints use this so the public page never
// breaks just because the admin hasn't saved settings yet.
settingsSchema.statics.getSingleton = async function () {
  const existing = await this.findOne();
  if (existing) return existing;
  return this.create({}); // defaults fill every field
};

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
