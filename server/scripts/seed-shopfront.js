// scripts/seed-shopfront.js
// ----------------------------------------------------------------------------
// Seeds placeholder shopfront content so the new Home/About pages aren't empty:
//   • marks a couple of products as `featured` (Home slider)
//   • fills Settings.about, heroTagline, announcement, and socialLinks
// The admin replaces all of this with real content in Stage 11.
//
// Run:  node scripts/seed-shopfront.js
// ----------------------------------------------------------------------------

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import Settings from "../models/Settings.js";

const run = async () => {
  await connectDB();
  try {
    // 1. Feature up to two products so the Home slider has content.
    const featuredNames = ["Cotton Hybrid", "Photo Test Maize"];
    const fr = await Product.updateMany(
      { "name.en": { $in: featuredNames } },
      { $set: { featured: true } }
    );
    console.log(`Featured products set: modified ${fr.modifiedCount}`);

    // 2. Fill the shopfront content on the singleton Settings document.
    await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          heroTagline: {
            en: "Trusted seeds for a better harvest",
            te: "మెరుగైన పంట కోసం నమ్మకమైన విత్తనాలు",
          },
          announcement: {
            en: "New Kharif season seeds now in stock!",
            te: "కొత్త ఖరీఫ్ సీజన్ విత్తనాలు ఇప్పుడు అందుబాటులో ఉన్నాయి!",
          },
          socialLinks: {
            facebook: "https://facebook.com/seedmart",
            instagram: "https://instagram.com/seedmart",
            youtube: "https://youtube.com/@seedmart",
            whatsapp: "https://wa.me/919876543210",
          },
          about: {
            proprietorName: "Ravi Kumar",
            proprietorPhoto: "https://picsum.photos/seed/proprietor/300/300",
            story: {
              en: "SeedMart has served farmers across the region for over 20 years, supplying trusted, high-quality seeds and honest advice. We list verified results from real farmers so you can choose with confidence.",
              te: "విత్తన మార్ట్ 20 సంవత్సరాలకు పైగా ఈ ప్రాంతంలోని రైతులకు నమ్మకమైన, అధిక నాణ్యత గల విత్తనాలను మరియు నిజాయితీ సలహాలను అందిస్తోంది. మీరు నమ్మకంగా ఎంచుకునేందుకు నిజమైన రైతుల ధృవీకరించబడిన ఫలితాలను మేము ప్రదర్శిస్తాము.",
            },
          },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log("Settings shopfront content seeded.");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
