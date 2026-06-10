// context/AuthContext.jsx
// ----------------------------------------------------------------------------
// Global auth state for the whole app. Any component calls useAuth() to read
// the current user/token or to login()/logout() — no prop drilling.
//
// State is HYDRATED from localStorage on first render, so a page refresh keeps
// the user logged in (Context alone lives in memory and would be wiped).
// ----------------------------------------------------------------------------

import { createContext, useContext, useState } from "react";

const TOKEN_KEY = "seedmart_token";
const USER_KEY = "seedmart_user";

// The Context object itself. Components never use this directly — they use the
// useAuth() hook below.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Lazy initializers run ONCE on mount and read from localStorage, so we start
  // already-logged-in if a token was saved in a previous session.
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  // Called after a successful /register or /login. The API returns the user
  // fields AND a token in one object; we split them apart.
  const login = (data) => {
    const { token: newToken, ...userFields } = data;
    setToken(newToken);
    setUser(userFields);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userFields));
  };

  // Clears both memory and persisted state.
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin: user?.role === "admin",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The hook every component uses. Throwing here catches the bug of using it
// outside the provider.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
