// scripts/delete-test-products.js
// ----------------------------------------------------------------------------
// Removes the temporary test products created by seed-test-products.js
// (everything with company "TESTSEED"). They have no photos, so there's nothing
// to clean up on Cloudinary.
//
// Run:  node scripts/delete-test-products.js
// ----------------------------------------------------------------------------

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";

const MARKER = "TESTSEED";

const run = async () => {
  await connectDB();
  try {
    const res = await Product.deleteMany({ company: MARKER });
    const total = await Product.countDocuments();
    console.log(`Deleted ${res.deletedCount} test products. Total products now: ${total}`);
  } catch (err) {
    console.error("Delete failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
