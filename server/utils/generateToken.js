// utils/generateToken.js
// ----------------------------------------------------------------------------
// Creates a signed JWT for a given user. Used after register and login.
// ----------------------------------------------------------------------------

import jwt from "jsonwebtoken";

// We store the userId and role in the payload.
// - userId lets us look the user up later.
// - role lets middleware authorize without a database hit.
// We do NOT store the password or any secret here — the payload is readable.
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role }, // payload
    process.env.JWT_SECRET, // secret key that signs (and later verifies) it
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } // auto-expiry
  );
};

export default generateToken;
