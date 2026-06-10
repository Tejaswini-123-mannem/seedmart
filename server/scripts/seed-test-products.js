// scripts/seed-test-products.js
// ----------------------------------------------------------------------------
// TEMPORARY: inserts 15 clearly-marked test products (company "TESTSEED") so the
// catalog crosses its 12-per-page limit and pagination can be verified.
// Remove them later with:  node scripts/delete-test-products.js
//
// Run:  node scripts/seed-test-products.js
// ----------------------------------------------------------------------------

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";

const MARKER = "TESTSEED"; // company value used to find & delete these later

const run = async () => {
  await connectDB();
  try {
    const stocks = ["inStock", "limitedStock", "outOfStock"];
    const docs = Array.from({ length: 15 }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      return {
        name: { en: `Test Product ${n}`, te: `పరీక్ష ఉత్పత్తి ${n}` },
        description: { en: `Test description ${n}`, te: `పరీక్ష వివరణ ${n}` },
        company: MARKER,
        category: "test",
        stockStatus: stocks[i % stocks.length],
        photos: [],
        featured: false,
      };
    });

    const created = await Product.insertMany(docs);
    const total = await Product.countDocuments();
    console.log(`Inserted ${created.length} test products (company="${MARKER}").`);
    console.log(`Total products now: ${total} → catalog pages at 12/page: ${Math.ceil(total / 12)}`);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
