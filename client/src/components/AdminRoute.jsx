// components/AdminRoute.jsx
// ----------------------------------------------------------------------------
// A stricter guard: the route requires an ADMIN. Non-admins (including logged-in
// regular users) are sent home. Again UX only — the backend `adminOnly`
// middleware is the real gate.
// ----------------------------------------------------------------------------

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth();

  // Not logged in at all → login. Logged in but not admin → home.
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
