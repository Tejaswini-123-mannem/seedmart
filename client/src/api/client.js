// api/client.js
// ----------------------------------------------------------------------------
// One tiny wrapper around fetch() that EVERY component uses to talk to the API.
// Centralizing it means we attach the JWT, set JSON headers, and handle errors
// in exactly ONE place instead of repeating boilerplate everywhere.
// ----------------------------------------------------------------------------

// Base URL of the backend, from the .env file (must start with VITE_).
const BASE = import.meta.env.VITE_API_URL || "";

// localStorage is the single source of the token (AuthContext keeps it in sync).
// Reading it here — rather than importing AuthContext — avoids a circular import.
function authHeader() {
  const token = localStorage.getItem("seedmart_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// The core request function. Throws a clean Error on any non-2xx response so
// callers can simply `try { ... } catch (err) { err.message }`.
async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    // Only attach a body for methods that send one.
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Some responses (or network errors) may not be JSON; tolerate that.
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // Surface the server's message ("Invalid credentials", etc.) when present.
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Convenience verbs used throughout the app.
export const apiGet = (path) => request("GET", path);
export const apiPost = (path, body) => request("POST", path, body);
export const apiPut = (path, body) => request("PUT", path, body);
export const apiPatch = (path, body) => request("PATCH", path, body);
export const apiDel = (path) => request("DELETE", path);

// ── File upload ─────────────────────────────────────────────────────────────
// Sends a FormData body (multipart/form-data) — for image uploads. We must NOT
// set Content-Type ourselves: the browser adds it WITH the multipart boundary.
// We still attach the auth token.
export async function apiUpload(path, formData) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { ...authHeader() }, // no Content-Type — browser sets it
    body: formData,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || `Upload failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}
