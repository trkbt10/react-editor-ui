/**
 * @file useLocalFonts hook - Access locally installed fonts via Local Font Access API
 */

import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Font data returned by queryLocalFonts API
 */
export type LocalFontData = {
  family: string;
  fullName: string;
  postscriptName: string;
  style: string;
  blob(): Promise<Blob>;
};

/**
 * Grouped font family with its styles
 */
export type LocalFontFamily = {
  family: string;
  fonts: LocalFontData[];
  styles: string[];
};

export type LocalFontsStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "not-supported";

export type UseLocalFontsResult = {
  /**
   * Current status of the font access permission
   */
  status: LocalFontsStatus;

  /**
   * All fonts returned by queryLocalFonts
   */
  fonts: readonly LocalFontData[];

  /**
   * Fonts grouped by family name
   */
  families: readonly LocalFontFamily[];

  /**
   * Request permission and load local fonts
   */
  requestFonts: () => Promise<void>;

  /**
   * Error message if any
   */
  error: string | null;

  /**
   * Whether the Local Font Access API is supported
   */
  isSupported: boolean;
};

export type UseLocalFontsOptions = {
  /**
   * Custom queryLocalFonts function for dependency injection (useful for testing)
   */
  queryLocalFonts?: () => Promise<LocalFontData[]>;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, no-restricted-syntax -- Interface required for global declaration merging
  interface Window {
    queryLocalFonts?: () => Promise<LocalFontData[]>;
  }
}

/**
 * Groups fonts by family name
 */
function groupFontsByFamily(fonts: readonly LocalFontData[]): LocalFontFamily[] {
  const familyMap = new Map<string, LocalFontData[]>();

  for (const font of fonts) {
    const existing = familyMap.get(font.family);
    if (existing) {
      existing.push(font);
    } else {
      familyMap.set(font.family, [font]);
    }
  }

  const families: LocalFontFamily[] = [];
  for (const [family, familyFonts] of familyMap) {
    families.push({
      family,
      fonts: familyFonts,
      styles: familyFonts.map((f) => f.style),
    });
  }

  // Sort alphabetically
  families.sort((a, b) => a.family.localeCompare(b.family));

  return families;
}

/**
 * Hook to access locally installed fonts via the Local Font Access API
 *
 * @example
 * ```tsx
 * function FontPicker() {
 *   const { status, families, requestFonts, isSupported } = useLocalFonts();
 *
 *   if (!isSupported) {
 *     return <div>Local Font Access API is not supported in this browser</div>;
 *   }
 *
 *   if (status === "idle") {
 *     return <button onClick={requestFonts}>Load Local Fonts</button>;
 *   }
 *
 *   if (status === "requesting") {
 *     return <div>Requesting permission...</div>;
 *   }
 *
 *   if (status === "denied") {
 *     return <div>Permission denied</div>;
 *   }
 *
 *   return (
 *     <ul>
 *       {families.map((family) => (
 *         <li key={family.family}>{family.family}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useLocalFonts(options?: UseLocalFontsOptions): UseLocalFontsResult {
  const [status, setStatus] = useState<LocalFontsStatus>("idle");
  const [fonts, setFonts] = useState<readonly LocalFontData[]>([]);
  const [families, setFamilies] = useState<readonly LocalFontFamily[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use injected function or fall back to window.queryLocalFonts
  const queryFn = options?.queryLocalFonts ?? window.queryLocalFonts;

  const isSupported =
    typeof queryFn === "function" ||
    (typeof window !== "undefined" && typeof window.queryLocalFonts === "function");

  // Use ref to track if component is mounted
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const requestFonts = useCallback(async () => {
    if (!queryFn) {
      setStatus("not-supported");
      setError("Local Font Access API is not supported in this browser");
      return;
    }

    setStatus("requesting");
    setError(null);

    try {
      const localFonts = await queryFn();

      if (!mountedRef.current) {return;}

      setFonts(localFonts);
      setFamilies(groupFontsByFamily(localFonts));
      setStatus("granted");
    } catch (err) {
      if (!mountedRef.current) {return;}

      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setStatus("denied");
        setError("Permission to access local fonts was denied");
      } else {
        setStatus("idle");
        setError(err instanceof Error ? err.message : "Failed to load fonts");
      }
    }
  }, [queryFn]);

  return {
    status,
    fonts,
    families,
    requestFonts,
    error,
    isSupported,
  };
}
