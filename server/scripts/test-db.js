// scripts/test-db.js
// ----------------------------------------------------------------------------
// Quick connectivity check for whatever MONGO_URI is in .env. Reports the host,
// the database name (should be "seedmart"), a ping, and the replica-set name
// (Atlas has one → multi-document transactions work).
//
// Run:  node scripts/test-db.js
// ----------------------------------------------------------------------------

import "dotenv/config";
import mongoose from "mongoose";

const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("✗ MONGO_URI is not set in .env");
    process.exit(1);
  }

  // Print the URI with the password masked.
  console.log("Connecting to:", uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@"));

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log("✓ Connected");
    console.log("  host    :", conn.connection.host);
    console.log("  database:", conn.connection.name, conn.connection.name === "seedmart" ? "(good)" : "(⚠ expected 'seedmart' — add /seedmart to the URI)");

    const hello = await conn.connection.db.command({ hello: 1 });
    console.log("  replica set:", hello.setName || "(none/standalone)");
    console.log("  transactions supported:", !!hello.setName);
  } catch (e) {
    console.error("✗ Connection failed:", e.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
