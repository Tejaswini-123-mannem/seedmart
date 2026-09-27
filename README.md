# SeedMart

A bilingual (English / Telugu) seed catalog and farmer review platform.

**Live:** [Frontend](https://sripullareddyseeds.vercel.app/) · [API health](https://seedmart-nxys.onrender.com/api/health)

## Why

Farmers in Telugu-speaking regions often have to choose seeds from English-only listings and unverified marketing claims. SeedMart lets them browse seeds in their own language and read crop-result reviews from real farmers, and every review is checked by an admin before it is published.

## Features

- **Bilingual UI**: every screen switches between English and Telugu through a custom `t()` translation layer (`client/src/i18n`).
- **Seed catalog**: home landing page, `/catalog` with brand filtering, admin-flagged featured products, and a wishlist.
- **Farmer review verification**: farmers submit crop results, and an admin reviews and approves each one. Approval runs inside a **MongoDB transaction**, so a review is either fully published or not at all.
- **Admin dashboard**: manage products, pending submissions, live reviews and site settings (about text, socials, footer addresses).
- **Auth and security**: JWT authentication, bcrypt password hashing, role-based admin routes.
- **Media**: product and review photos uploaded to Cloudinary through Multer.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, React Router 7, Tailwind CSS 4, Vite |
| Backend | Node.js, Express 5 (ES modules), Mongoose 9 |
| Database | MongoDB (Atlas in production, local replica set in dev) |
| Auth | JSON Web Tokens, bcryptjs |
| Media | Cloudinary, Multer |
| Hosting | Vercel (client), Render (server), MongoDB Atlas (DB) |

## Architecture

```
Browser ──► Vercel (React UI, static files)
              │
              │  fetch(VITE_API_URL + "/api/...")
              ▼
            Render (Express REST API) ──► Cloudinary (images)
              │
              ▼
            MongoDB Atlas
```

## Project Structure

```
seedmart/
├── client/            React frontend (deployed to Vercel)
│   ├── src/api/       API call helpers
│   ├── src/pages/     Route pages (Home, Catalog, About, Admin, ...)
│   ├── src/components/
│   ├── src/context/   Auth / language context
│   ├── src/i18n/      EN / Telugu dictionary
│   └── vercel.json    SPA rewrites so client routes survive refresh
└── server/            Express API (deployed to Render)
    ├── config/        db.js (Mongo connection), cloudinary.js
    ├── models/        User, Product, Review, ReviewSubmission, Settings
    ├── routes/        auth, products, upload, submissions, reviews, wishlist, settings
    ├── controllers/
    ├── middleware/    auth / admin guards
    ├── scripts/       seedAdmin.js
    └── server.js      entry point
```

## API Routes

| Prefix | Purpose |
|---|---|
| `GET /api/health` | Health check |
| `/api/auth` | Login / register |
| `/api/products` | Catalog CRUD |
| `/api/upload` | Image uploads to Cloudinary |
| `/api/submissions` | Farmer review submissions (pending) |
| `/api/reviews` | Published reviews |
| `/api/wishlist` | User wishlist |
| `/api/settings` | Site settings (about, socials, footer) |

## Local Setup

**Prerequisites:** Node.js 20+, MongoDB running locally **as a replica set** (transactions need one), and a Cloudinary account.

```bash
# 1. Backend
cd server
npm install
cp .env.example .env        # fill in the values (see below)
npm run seed:admin          # creates the first admin account
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000
npm run dev                 # http://localhost:5173
```

## Environment Variables

**server/.env**

| Variable | Description |
|---|---|
| `PORT` | Port Express listens on (default 5000) |
| `MONGO_URI` | Mongo connection string. For Atlas, the DB name goes **before** the `?`: `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/seedmart?retryWrites=true` |
| `JWT_SECRET` | Secret used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_PHONE` | First admin, used by `seed:admin` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS, comma-separated, no trailing slash. Leave blank in dev. |

**client/.env**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (local or Render) |

`.env` files are gitignored. Never commit them.

## Deployment

| Part | Host | Settings |
|---|---|---|
| Frontend | Vercel | Root directory `client/`, env `VITE_API_URL` = Render URL |
| Backend | Render | Root directory `server/`, start command `npm start`, all server env vars, `CLIENT_URL` = Vercel URL |
| Database | MongoDB Atlas | Network Access `0.0.0.0/0`; Atlas is a replica set, so transactions work |

**Notes**
- The production DB starts empty. Create the admin by temporarily pointing your local `server/.env` `MONGO_URI` at Atlas and running `npm run seed:admin`, then switch it back. The Render free tier has no shell.
- The Render free tier sleeps when idle, so the first request after a while can take about 30 seconds.

## Troubleshooting

### Vercel UI loads but no products appear, and Render shows "Deploy failed"

Vercel only serves static files, so the UI still loads while the backend is down. The products come from Render. `server/config/db.js` calls `process.exit(1)` when MongoDB can't be reached, and Render reports that as a failed deploy.

**Check Render → Logs** for `MongoDB connection error:` and match the message:

| Log message | Cause | Fix |
|---|---|---|
| `Server selection timed out` / `querySrv ENOTFOUND` | Atlas free cluster **paused** after inactivity, or IP not allowed | Atlas → Database → **Resume**; Network Access → allow `0.0.0.0/0` |
| `bad auth : authentication failed` | Wrong DB user or password | Atlas → Database Access; update `MONGO_URI` on Render |
| `option seedmart is not supported` | DB name placed after the query string | Move `/seedmart` before the `?` |
| `Cannot find module ...` | Build or dependency issue | Check the Render build logs and `package.json` |

**After fixing:** Render → **Manual Deploy → Deploy latest commit**, then open `<render-url>/api/health` and expect `{"status":"ok"}`.

> **Incident, 2026-09:** the Atlas free cluster was paused after a long period of inactivity. The Render deploy failed and the site showed no products. Resuming the cluster in Atlas and redeploying on Render fixed it.

### Other common issues

- **CORS error in the browser console**: `CLIENT_URL` on Render must exactly match the Vercel URL (no trailing slash).
- **Page 404 on refresh**: make sure `client/vercel.json` with the SPA rewrite is deployed.
- **Env values `undefined` at startup**: `import "dotenv/config"` must be the first import in `server.js`, because ES modules hoist imports.
- **Transaction errors locally**: local MongoDB must run as a replica set (e.g. `rs0`).
