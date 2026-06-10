// config/db.js
// ----------------------------------------------------------------------------
// Responsible for ONE thing: connecting to MongoDB using Mongoose.
// server.js imports connectDB() and calls it on startup.
// ----------------------------------------------------------------------------

import mongoose from "mongoose";

// An async function because connecting to a database takes time (it talks to
// another process over the network). "await" lets us wait for it cleanly.
const connectDB = async () => {
  try {
    // Read the connection string from the environment (.env file).
    // We never hardcode it here, so the same code works in dev and production.
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If we reach this line, the connection succeeded.
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If the connection fails, log the reason and stop the whole process.
    // A backend API with no database is useless, so we exit instead of
    // pretending to run.
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // exit code 1 means "exited because of an error"
  }
};

export default connectDB;
