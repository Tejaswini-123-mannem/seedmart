// hooks/useDebounce.js
// ----------------------------------------------------------------------------
// A reusable custom hook: returns a value that "lags behind" the input by
// `delay` ms. Used so the catalog fires a search request only after the user
// pauses typing, instead of on every keystroke.
// ----------------------------------------------------------------------------

import { useState, useEffect } from "react";

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Start a timer; if `value` changes again before it fires, the cleanup
    // below clears it and we start over. Net effect: only the LAST value after
    // a quiet period of `delay` ms gets committed.
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
