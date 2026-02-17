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
  const computedTokenStyles = useMemo((): TokenStyleMap => {
    const map: Record<string, CSSProperties> = {
      [DEFAULT_TOKEN_TYPE]: {},
    };

    for (const entry of styleEntries) {
      map[entry.tokenType] = textStyleToCss(entry.style);
    }

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

        // Build tokens based on style segments
        const tokens: Token[] = [];
        const pos = { current: 0 };

        for (const entry of overlapping) {
          const entryStartInLine = Math.max(0, entry.start - lineStart);
          const entryEndInLine = Math.min(line.length, entry.end - lineStart);

          // Gap before this entry
          if (pos.current < entryStartInLine) {
            tokens.push({
              type: DEFAULT_TOKEN_TYPE,
              text: line.slice(pos.current, entryStartInLine),
              start: pos.current,
              end: entryStartInLine,
            });
            pos.current = entryStartInLine;
          }

          // This entry
          if (entryStartInLine < entryEndInLine) {
            tokens.push({
              type: entry.tokenType,
              text: line.slice(entryStartInLine, entryEndInLine),
              start: entryStartInLine,
              end: entryEndInLine,
            });
            pos.current = entryEndInLine;
          }
        }

        // Gap after last entry
        if (pos.current < line.length) {
          tokens.push({
            type: DEFAULT_TOKEN_TYPE,
            text: line.slice(pos.current),
            start: pos.current,
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
