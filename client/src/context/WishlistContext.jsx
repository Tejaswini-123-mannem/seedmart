// context/WishlistContext.jsx
// ----------------------------------------------------------------------------
// Holds the logged-in user's wishlist so any product card can answer
// "is this saved?" instantly, without its own API call.
//
//   items         — the full populated product list (for the Account page)
//   ids           — a Set of saved product ids (fast membership checks)
//   isWishlisted  — (id) => boolean
//   toggle        — (id) => add/remove, OPTIMISTICALLY (revert on failure)
//
// The list loads when a user logs in and clears on logout.
// ----------------------------------------------------------------------------

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { apiGet, apiPost, apiDel } from "../api/client.js";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [ids, setIds] = useState(new Set());

  // Load (or clear) the wishlist whenever auth state changes.
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setIds(new Set());
      return;
    }
    let active = true;
    apiGet("/api/wishlist")
      .then((list) => {
        if (!active) return;
        setItems(list);
        setIds(new Set(list.map((p) => p._id)));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const isWishlisted = (id) => ids.has(id);

  // Optimistic toggle: flip the id set immediately for snappy UI, then call the
  // API. The API returns the fresh populated list, which we use as the truth.
  // On error we roll back to the previous state.
  const toggle = async (id) => {
    const wasSaved = ids.has(id);
    const prevIds = ids;
    const prevItems = items;

    // 1. Optimistic local change.
    const nextIds = new Set(prevIds);
    if (wasSaved) nextIds.delete(id);
    else nextIds.add(id);
    setIds(nextIds);

    // 2. Sync with the server.
    try {
      const list = wasSaved
        ? await apiDel(`/api/wishlist/${id}`)
        : await apiPost(`/api/wishlist/${id}`);
      // Server returns the authoritative populated list.
      setItems(list);
      setIds(new Set(list.map((p) => p._id)));
    } catch {
      // 3. Roll back on failure.
      setIds(prevIds);
      setItems(prevItems);
    }
  };

  return (
    <WishlistContext.Provider value={{ items, ids, isWishlisted, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (ctx === null) {
    throw new Error("useWishlist must be used inside <WishlistProvider>");
  }
  return ctx;
}
