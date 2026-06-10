// context/SettingsContext.jsx
// ----------------------------------------------------------------------------
// Loads the PUBLIC site settings (shop name, hero, announcement, socials,
// about) once on app start, so the Navbar, Home, About, and Footer can all read
// admin-managed content without each making its own request.
//
// Exposes reload() so the admin Settings page can refresh this after saving,
// updating the whole site live (no full page reload needed).
// ----------------------------------------------------------------------------

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiGet } from "../api/client.js";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);

  const reload = useCallback(() => {
    return apiGet("/api/settings")
      .then((s) => setSettings(s))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    apiGet("/api/settings")
      .then((s) => active && setSettings(s))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, reload }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (ctx === null) {
    throw new Error("useSettings must be used inside <SettingsProvider>");
  }
  return ctx;
}
