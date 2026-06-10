// controllers/settingsController.js
// ----------------------------------------------------------------------------
// Read/update the singleton Settings document.
//   getSettings    → PUBLIC: anyone can read site config
//   updateSettings → ADMIN:  create-or-update the single document (upsert)
// ----------------------------------------------------------------------------

import Settings from "../models/Settings.js";

// ── GET SETTINGS ────────────────────────────────────────────────────────────
// GET /api/settings   (public)
export const getSettings = async (req, res) => {
  try {
    // getSingleton() returns the one doc, creating it with defaults on first
    // ever call — so this never 500s just because nothing has been saved yet.
    const settings = await Settings.getSingleton();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── UPDATE SETTINGS ─────────────────────────────────────────────────────────
// PUT /api/settings   (admin only)
export const updateSettings = async (req, res) => {
  try {
    // We list the allowed fields explicitly so a client can't inject arbitrary
    // keys (e.g. timestamps) into the document.
    const {
      shopName,
      shopDescription,
      logo,
      topBrands,
      mediaSlides,
      whatsappNumber,
      contactPhone,
      contactEmail,
      contacts,
      address,
      heroTagline,
      announcement,
      socialLinks,
      about,
    } = req.body;

    const update = {
      shopName,
      shopDescription,
      logo,
      topBrands,
      mediaSlides,
      whatsappNumber,
      contactPhone,
      contactEmail,
      contacts,
      address,
      heroTagline,
      announcement,
      socialLinks,
      about,
    };

    // Drop undefined keys so a partial PUT only overwrites what was sent,
    // instead of blanking fields the admin didn't include.
    Object.keys(update).forEach(
      (k) => update[k] === undefined && delete update[k]
    );

    // The empty filter {} targets "the one" settings doc.
    //   upsert: true            → create it if it doesn't exist yet
    //   new: true               → return the document AFTER the update
    //   setDefaultsOnInsert      → apply schema defaults when upsert CREATES it
    //   runValidators            → enforce schema rules on the update
    const settings = await Settings.findOneAndUpdate({}, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    });

    res.status(200).json(settings);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
