// middleware/authMiddleware.js
// ----------------------------------------------------------------------------
// Two middleware functions:
//   protect   → AUTHENTICATION: is there a valid JWT? (attaches req.user)
//   adminOnly → AUTHORIZATION:  is the authenticated user an admin?
// ----------------------------------------------------------------------------

import jwt from "jsonwebtoken";

// ── protect ─────────────────────────────────────────────────────────────────
// Guards any route that requires a logged-in user.
export const protect = (req, res, next) => {
  // The client sends:  Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  // 1. Make sure the header exists and is in the expected "Bearer <token>" form.
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }

  try {
    // 2. Split "Bearer <token>" and take the token part.
    const token = authHeader.split(" ")[1];

    // 3. Verify the signature and expiry using our secret.
    //    If the token was tampered with or expired, this THROWS.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the decoded payload to the request so downstream handlers
    //    (and adminOnly) know who is making the request.
    req.user = { userId: decoded.userId, role: decoded.role };

    // 5. Let the request proceed to the next handler.
    next();
  } catch (error) {
    // verify() throws for invalid signature OR expired token.
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// ── adminOnly ─────────────────────────────────────────────────────────────
// Must run AFTER protect (it relies on req.user being set).
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  // 403 Forbidden = "we know who you are, but you're not allowed here".
  return res.status(403).json({ message: "Admin access required" });
};
