// scripts/set-shop-content.js
// ----------------------------------------------------------------------------
// Sets the shop name, description, and a couple of contact numbers on the
// Settings singleton. The admin can edit all of these later in admin → Settings.
//
// Run:  node scripts/set-shop-content.js
// ----------------------------------------------------------------------------

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Settings from "../models/Settings.js";

const run = async () => {
  await connectDB();
  try {
    await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          shopName: {
            en: "Sri Pullareddy Seeds",
            te: "శ్రీ పుల్లారెడ్డి సీడ్స్",
          },
          shopDescription: {
            en: "Your trusted local seed shop — quality seeds and honest guidance for farmers, with verified results from real growers.",
            te: "మీ నమ్మకమైన స్థానిక విత్తన దుకాణం — రైతులకు నాణ్యమైన విత్తనాలు, నిజాయితీ సలహాలు, నిజమైన రైతుల ధృవీకరించబడిన ఫలితాలతో.",
          },
          contacts: [
            { label: "Owner", phone: "9876543210" },
            { label: "Shop", phone: "9876500000" },
          ],
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log("Shop name, description, and contacts set.");
  } catch (err) {
    console.error("Failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
