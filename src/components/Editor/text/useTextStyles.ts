/**
 * @file Text Styles Hook
 *
 * Manages style segments for rich text editing.
 * Converts style segments into tokens that the renderer can use.
 */

import { useMemo, useCallback, type CSSProperties } from "react";
import type { TextStyleSegment, TextStyle, StyleToken } from "./types";
import type { Token, Tokenizer, TokenStyleMap } from "../code/types";

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
// Constants
// =============================================================================

/** Default token type for unstyled text */
const DEFAULT_TOKEN_TYPE = "text";

/** Default style (empty) */
const DEFAULT_STYLE: TextStyle = {};

// =============================================================================
// Helpers
// =============================================================================

/**
 * Generate a unique token type for a style segment.
 */
function generateTokenType(index: number): string {
  return `styled-${index}`;
}

/**
 * Convert TextStyle to CSSProperties for the renderer.
 */
function textStyleToCss(style: TextStyle): CSSProperties {
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    color: style.color,
  };
}

/**
 * Build a style lookup map for quick offset-based queries.
 * Returns a sorted array of style segments with their token types.
 */
type StyleEntry = {
  readonly start: number;
  readonly end: number;
  readonly tokenType: string;
  readonly style: TextStyle;
};

function buildStyleEntries(styles: readonly TextStyleSegment[]): readonly StyleEntry[] {
  return styles.map((segment, index) => ({
    start: segment.start,
    end: segment.end,
    tokenType: generateTokenType(index),
    style: segment.style,
  })).sort((a, b) => a.start - b.start);
}

/**
 * Find all style entries that overlap with a given range.
 */
function findOverlappingEntries(
  entries: readonly StyleEntry[],
  rangeStart: number,
  rangeEnd: number
): readonly StyleEntry[] {
  return entries.filter((e) => e.start < rangeEnd && e.end > rangeStart);
}

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
  const tokenStyles = useMemo((): TokenStyleMap => {
    const map: Record<string, CSSProperties> = {
      [DEFAULT_TOKEN_TYPE]: {},
    };

    for (const entry of styleEntries) {
      map[entry.tokenType] = textStyleToCss(entry.style);
    }

    return map;
  }, [styleEntries]);

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

      // eslint-disable-next-line no-restricted-syntax -- Accumulator pattern
      let currentPos = lineStart;

      for (const entry of overlapping) {
        // Gap before this segment
        if (currentPos < entry.start) {
          result.push({
            text: "",
            start: currentPos - lineStart,
            end: entry.start - lineStart,
            style: DEFAULT_STYLE,
          });
          currentPos = entry.start;
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
          currentPos = end;
        }
      }

      // Gap after last segment
      if (currentPos < lineEnd) {
        result.push({
          text: "",
          start: currentPos - lineStart,
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
        // eslint-disable-next-line no-restricted-syntax -- Accumulator pattern
        let currentPos = 0;

        for (const entry of overlapping) {
          const entryStartInLine = Math.max(0, entry.start - lineStart);
          const entryEndInLine = Math.min(line.length, entry.end - lineStart);

          // Gap before this entry
          if (currentPos < entryStartInLine) {
            tokens.push({
              type: DEFAULT_TOKEN_TYPE,
              text: line.slice(currentPos, entryStartInLine),
              start: currentPos,
              end: entryStartInLine,
            });
            currentPos = entryStartInLine;
          }

          // This entry
          if (entryStartInLine < entryEndInLine) {
            tokens.push({
              type: entry.tokenType,
              text: line.slice(entryStartInLine, entryEndInLine),
              start: entryStartInLine,
              end: entryEndInLine,
            });
            currentPos = entryEndInLine;
          }
        }

        // Gap after last entry
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
