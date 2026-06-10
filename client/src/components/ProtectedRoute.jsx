// components/ProtectedRoute.jsx
// ----------------------------------------------------------------------------
// A guard for routes that require a logged-in user. If there's no user, we
// redirect to /login AND remember where they were headed (location state), so
// Login can send them back there after authenticating.
//
// NOTE: UX only — the real security is the backend `protect` middleware.
// ----------------------------------------------------------------------------

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Stash the attempted location so /login can redirect back to it.
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}
