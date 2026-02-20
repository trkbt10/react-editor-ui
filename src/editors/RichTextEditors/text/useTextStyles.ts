/**
 * @file Text Styles Hook
 *
 * React hook for managing style segments in rich text editing.
 * Converts style segments into tokens that the renderer can use.
 */

import { useMemo, useCallback, useRef, type CSSProperties } from "react";
import type { TextStyleSegment, TextStyle } from "../core/types";
import type { StyleToken } from "./types";
import type { Token, Tokenizer, TokenStyleMap } from "../code/types";
import {
  DEFAULT_TOKEN_TYPE,
  DEFAULT_STYLE,
  textStyleToCss,
  buildStyleEntries,
  findOverlappingEntries,
  type StyleEntry,
} from "./textStyles";

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Compare two CSSProperties objects for shallow equality.
 */
function cssPropertiesAreEqual(
  a: CSSProperties,
  b: CSSProperties
): boolean {
  const keysA = Object.keys(a) as Array<keyof CSSProperties>;
  const keysB = Object.keys(b) as Array<keyof CSSProperties>;

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Compare two TokenStyleMap objects for equality.
 * Returns true if both maps have the same keys and each style is equal.
 */
function tokenStyleMapsAreEqual(
  a: TokenStyleMap,
  b: TokenStyleMap
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    const styleA = a[key];
    const styleB = b[key];

    if (!styleB) {
      return false;
    }

    if (!cssPropertiesAreEqual(styleA, styleB)) {
      return false;
    }
  }

  return true;
}

// =============================================================================
// Types
// =============================================================================

export type UseTextStylesResult = {
  /** Tokenizer that splits text based on style segments */
  readonly tokenizer: Tokenizer;
  /** Token style map for the renderer */
  readonly tokenStyles: TokenStyleMap;
  /** Get style at a specific offset */
  readonly getStyleAt: (offset: number) => TextStyle | undefined;
  /** Get styles for a line */
  readonly getLineStyles: (lineStart: number, lineEnd: number) => readonly StyleToken[];
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for managing text style segments.
 *
 * Converts style segments into tokens for the renderer.
 * Each style segment becomes a unique token type with corresponding CSS.
 *
 * @param styles - Array of style segments
 * @returns Tokenizer, tokenStyles, and style utilities
 *
 * @example
 * ```tsx
 * const { tokenizer, tokenStyles } = useTextStyles([
 *   { start: 0, end: 5, style: { fontWeight: 'bold' } },
 *   { start: 5, end: 10, style: { fontStyle: 'italic' } },
 * ]);
 *
 * <Renderer tokenizer={tokenizer} tokenStyles={tokenStyles} />
 * ```
 */
export function useTextStyles(
  styles: readonly TextStyleSegment[] = []
): UseTextStylesResult {
  // Build style entries with token types
  const styleEntries = useMemo(() => buildStyleEntries(styles), [styles]);

  // Build token style map for the renderer
  // Also generates merged styles for overlapping segments (e.g., "styled-0+styled-1")
  const computedTokenStyles = useMemo((): TokenStyleMap => {
    const map: Record<string, CSSProperties> = {
      [DEFAULT_TOKEN_TYPE]: {},
    };

    // Add individual styles
    for (const entry of styleEntries) {
      map[entry.tokenType] = textStyleToCss(entry.style);
    }

    // Pre-compute merged styles for all possible combinations
    // This handles cases where multiple styles overlap
    const generateMergedStyles = (entries: readonly StyleEntry[]): void => {
      // Generate all 2^n combinations of active entries
      const n = entries.length;
      if (n === 0 || n > 10) {
        return; // Skip for empty or too many entries (prevent exponential blowup)
      }

      for (let mask = 1; mask < (1 << n); mask++) {
        // Skip single entries (already added above)
        if ((mask & (mask - 1)) === 0) {
          continue;
        }

        const activeEntries: StyleEntry[] = [];
        for (let i = 0; i < n; i++) {
          if (mask & (1 << i)) {
            activeEntries.push(entries[i]);
          }
        }

        // Generate merged type key
        const mergedType = activeEntries.map((e) => e.tokenType).sort().join("+");

        // Skip if already computed
        if (map[mergedType]) {
          continue;
        }

        // Merge CSS properties from all active entries
        const mergedCss: CSSProperties = {};
        for (const entry of activeEntries) {
          const css = textStyleToCss(entry.style);
          Object.assign(mergedCss, css);
        }
        map[mergedType] = mergedCss;
      }
    };

    generateMergedStyles(styleEntries);

    return map;
  }, [styleEntries]);

  // Stabilize tokenStyles reference - return previous reference if content is equal
  // This prevents unnecessary re-renders when styles haven't actually changed
  const tokenStylesRef = useRef<TokenStyleMap>(computedTokenStyles);
  const tokenStyles = useMemo((): TokenStyleMap => {
    if (tokenStyleMapsAreEqual(tokenStylesRef.current, computedTokenStyles)) {
      return tokenStylesRef.current;
    }
    tokenStylesRef.current = computedTokenStyles;
    return computedTokenStyles;
  }, [computedTokenStyles]);

  // Get style at a specific offset
  const getStyleAt = useCallback(
    (offset: number): TextStyle | undefined => {
      for (const entry of styleEntries) {
        if (offset >= entry.start && offset < entry.end) {
          return entry.style;
        }
      }
      return undefined;
    },
    [styleEntries]
  );

  // Get styles for a line (returns StyleToken array)
  const getLineStyles = useCallback(
    (lineStart: number, lineEnd: number): readonly StyleToken[] => {
      const result: StyleToken[] = [];
      const overlapping = findOverlappingEntries(styleEntries, lineStart, lineEnd);

      if (overlapping.length === 0) {
        return [{
          text: "",
          start: 0,
          end: lineEnd - lineStart,
          style: DEFAULT_STYLE,
        }];
      }

      const pos = { current: lineStart };

      for (const entry of overlapping) {
        // Gap before this segment
        if (pos.current < entry.start) {
          result.push({
            text: "",
            start: pos.current - lineStart,
            end: entry.start - lineStart,
            style: DEFAULT_STYLE,
          });
          pos.current = entry.start;
        }

        // This segment (clipped to line bounds)
        const start = Math.max(entry.start, lineStart);
        const end = Math.min(entry.end, lineEnd);
        if (start < end) {
          result.push({
            text: "",
            start: start - lineStart,
            end: end - lineStart,
            style: entry.style,
          });
          pos.current = end;
        }
      }

      // Gap after last segment
      if (pos.current < lineEnd) {
        result.push({
          text: "",
          start: pos.current - lineStart,
          end: lineEnd - lineStart,
          style: DEFAULT_STYLE,
        });
      }

      return result;
    },
    [styleEntries]
  );

  // Create a tokenizer that splits text based on style segments
  // When multiple segments overlap, merge their styles
  const tokenizer = useMemo((): Tokenizer => {
    return {
      tokenize: (line: string, lineOffset?: number): readonly Token[] => {
        if (line.length === 0) {
          return [];
        }

        const offset = lineOffset ?? 0;
        const lineStart = offset;
        const lineEnd = offset + line.length;

        // Find overlapping style entries
        const overlapping = findOverlappingEntries(styleEntries, lineStart, lineEnd);

        if (overlapping.length === 0) {
          // No styles - return single default token
          return [{
            type: DEFAULT_TOKEN_TYPE,
            text: line,
            start: 0,
            end: line.length,
          }];
        }

        // Build a map of style changes at each position
        // This allows us to properly handle overlapping segments by merging styles
        type StyleChange = { pos: number; type: "start" | "end"; entry: StyleEntry };
        const changes: StyleChange[] = [];

        for (const entry of overlapping) {
          const entryStartInLine = Math.max(0, entry.start - lineStart);
          const entryEndInLine = Math.min(line.length, entry.end - lineStart);

          if (entryStartInLine < entryEndInLine) {
            changes.push({ pos: entryStartInLine, type: "start", entry });
            changes.push({ pos: entryEndInLine, type: "end", entry });
          }
        }

        // Sort changes by position, starts before ends at same position
        changes.sort((a, b) => {
          if (a.pos !== b.pos) {
            return a.pos - b.pos;
          }
          // At same position: "start" comes before "end"
          return a.type === "start" ? -1 : 1;
        });

        // Build tokens by processing changes
        const tokens: Token[] = [];
        const activeEntries = new Set<StyleEntry>();
        let currentPos = 0;

        for (const change of changes) {
          // Add gap/styled token from currentPos to change.pos
          if (change.pos > currentPos) {
            if (activeEntries.size === 0) {
              // No active styles - default token
              tokens.push({
                type: DEFAULT_TOKEN_TYPE,
                text: line.slice(currentPos, change.pos),
                start: currentPos,
                end: change.pos,
              });
            } else {
              // Merge active styles into a combined token type
              const activeArray = Array.from(activeEntries);
              const mergedType = activeArray.map((e) => e.tokenType).sort().join("+");

              tokens.push({
                type: mergedType,
                text: line.slice(currentPos, change.pos),
                start: currentPos,
                end: change.pos,
              });
            }
            currentPos = change.pos;
          }

          // Apply the change
          if (change.type === "start") {
            activeEntries.add(change.entry);
          } else {
            activeEntries.delete(change.entry);
          }
        }

        // Gap after all changes
        if (currentPos < line.length) {
          tokens.push({
            type: DEFAULT_TOKEN_TYPE,
            text: line.slice(currentPos),
            start: currentPos,
            end: line.length,
          });
        }

        return tokens;
      },
    };
  }, [styleEntries]);

  return {
    tokenizer,
    tokenStyles,
    getStyleAt,
    getLineStyles,
  };
}
