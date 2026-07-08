// server.js
// ----------------------------------------------------------------------------
// The entry point of the backend. Running "npm run dev" runs this file.
// It wires everything together: config -> database -> express -> routes.
// ----------------------------------------------------------------------------

// 1. Load environment variables from .env into process.env.
//    IMPORTANT (ES Modules gotcha): all `import` statements are hoisted and run
//    BEFORE any other code. Some modules (e.g. config/cloudinary.js) read
//    process.env at IMPORT time. So we must populate process.env via an import
//    SIDE EFFECT — `import "dotenv/config"` — placed as the very first import,
//    guaranteeing env is loaded before any later import reads it.
import "dotenv/config";

// 2. Import our dependencies and our own modules.
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js"; // note: file extension required in ES modules
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

// 3. Connect to MongoDB. (Defined in config/db.js)
connectDB();

// 4. Create the Express application. "app" represents our whole server.
const app = express();

// 5. Global middleware — runs on EVERY incoming request, in this order.

//    cors(): allows our React frontend (a different origin/domain) to call
//    this API. Without it, the browser blocks the request for security.
//    In PRODUCTION we lock this to our deployed frontend via CLIENT_URL (a
//    comma-separated list is allowed). In DEV (no CLIENT_URL set) we allow all
//    origins for convenience. CORS is enforced by the browser using the
//    Access-Control-Allow-Origin header the server sends back.
const corsOptions = process.env.CLIENT_URL
  ? { origin: process.env.CLIENT_URL.split(",").map((o) => o.trim()) }
  : {};
app.use(cors(corsOptions));

//    express.json(): reads the JSON body of incoming requests and puts it on
//    req.body. Without it, req.body would be undefined for POST/PUT requests.
app.use(express.json());

// 6. Health-check route.
//    A GET request to /api/health returns a small JSON object confirming the
//    server is alive. This is our Stage 1 proof that everything works.
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "SeedMart API is running",
    timestamp: new Date().toISOString(),
  });
});

// 7. Mount feature routes.
//    Every path inside authRoutes is prefixed with "/api/auth".
//    e.g. router.post("/login") becomes POST /api/auth/login
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/settings", settingsRoutes);

// 8. Start the server.
//    Read the port from .env, fall back to 5000 if it is missing.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
