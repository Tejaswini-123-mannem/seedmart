// scripts/fix-telugu-data.js
// ----------------------------------------------------------------------------
// One-off data fix: the seeded test products had their Telugu name/description
// typed in ENGLISH letters (e.g. "mokkajonna") instead of Telugu script
// ("మొక్కజొన్న"). This rewrites them to proper Telugu. It also drops a couple of
// sample crop photos onto the existing approved review so the review image
// display can be seen working (real photos will be admin-uploaded in Stage 11).
//
// Run:  node scripts/fix-telugu-data.js
// ----------------------------------------------------------------------------

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";

// Proper Telugu-script values keyed by the English name we already have.
const FIXES = {
  "Photo Test Maize": {
    nameTe: "మొక్కజొన్న",
    descTe: "నిజమైన ఫోటోతో",
  },
  "Chilli Guntur": {
    nameTe: "గుంటూరు మిరప",
    descTe: "ఘాటైన రకం",
  },
  "Cotton Hybrid": {
    nameTe: "పత్తి హైబ్రిడ్",
    descTe: "బోల్‌గార్డ్",
  },
};

const run = async () => {
  await connectDB();
  try {
    // 1. Fix each product's Telugu fields (company stays English — untouched).
    for (const [en, fix] of Object.entries(FIXES)) {
      const res = await Product.updateOne(
        { "name.en": en },
        { $set: { "name.te": fix.nameTe, "description.te": fix.descTe } }
      );
      console.log(`Product "${en}": matched ${res.matchedCount}, modified ${res.modifiedCount}`);
    }

    // 2. Add sample crop photos to any review that has none, so the image
    //    rendering in the review section is visible. (Stage 11 lets the admin
    //    upload real ones.)
    const samplePhotos = [
      "https://picsum.photos/seed/seedmart-crop1/300/200",
      "https://picsum.photos/seed/seedmart-crop2/300/200",
    ];
    const r = await Review.updateMany(
      { $or: [{ photos: { $size: 0 } }, { photos: { $exists: false } }] },
      { $set: { photos: samplePhotos } }
    );
    console.log(`Reviews given sample photos: modified ${r.modifiedCount}`);
  } catch (err) {
    console.error("Fix failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
