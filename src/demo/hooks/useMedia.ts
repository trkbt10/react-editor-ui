/**
 * @file Custom hook for responsive media query detection
 */

import { useState, useEffect } from "react";

/**
 * Returns true if the media query matches
 * @param query - CSS media query string (e.g., "(max-width: 960px)")
 */
export function useMedia(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Set initial value
    setMatches(mql.matches);

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
