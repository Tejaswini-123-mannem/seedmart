// scripts/seedAdmin.js
// ----------------------------------------------------------------------------
// One-time (idempotent) script to create the first admin account.
// Run with:  node scripts/seedAdmin.js
//
// This exists because the public /register endpoint forces role="user" for
// security. The only trusted way to mint an admin is this manually-run script.
// ----------------------------------------------------------------------------

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const seedAdmin = async () => {
  // 1. Connect to the database (the server is not running this).
  await connectDB();

  try {
    // 2. Read admin credentials from environment variables.
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    const phone = process.env.ADMIN_PHONE;

    if (!username || !password || !phone) {
      throw new Error(
        "Missing ADMIN_USERNAME, ADMIN_PASSWORD, or ADMIN_PHONE in .env"
      );
    }

    // 3. Idempotency check: if an admin with this username already exists,
    //    do nothing. This makes the script safe to run multiple times.
    const existing = await User.findOne({ username });
    if (existing) {
      console.log(`Admin user "${username}" already exists. Nothing to do.`);
      return;
    }

    // 4. Create the admin. role is explicitly "admin" here — the one place
    //    we are allowed to do this. The pre-save hook hashes the password.
    await User.create({ username, password, phone, role: "admin" });
    console.log(`Admin user "${username}" created successfully.`);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1; // mark failure without skipping the cleanup below
  } finally {
    // Always close the connection so the script exits cleanly instead of hanging.
    await mongoose.connection.close();
  }
};

seedAdmin();
