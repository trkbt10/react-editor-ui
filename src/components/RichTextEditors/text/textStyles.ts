/**
 * @file Text Style Utilities
 *
 * Pure functions for style segment processing and tokenization.
 */

import type { CSSProperties } from "react";
import type { TextStyleSegment, TextStyle } from "../core/types";

// =============================================================================
// Types
// =============================================================================

/**
 * Style entry with token type for renderer.
 */
export type StyleEntry = {
  readonly start: number;
  readonly end: number;
  readonly tokenType: string;
  readonly style: TextStyle;
};

// =============================================================================
// Constants
// =============================================================================

/** Default token type for unstyled text */
export const DEFAULT_TOKEN_TYPE = "text";

/** Default style (empty) */
export const DEFAULT_STYLE: TextStyle = {};

// =============================================================================
// Pure Functions
// =============================================================================

/**
 * Generate a unique token type for a style segment.
 *
 * @param index - Index of the style segment
 * @returns Unique token type string
 */
export function generateTokenType(index: number): string {
  return `styled-${index}`;
}

/**
 * Convert TextStyle to CSSProperties for the renderer.
 *
 * @param style - Text style object
 * @returns CSS properties object
 */
export function textStyleToCss(style: TextStyle): CSSProperties {
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
 *
 * @param styles - Array of style segments
 * @returns Sorted array of style entries
 */
export function buildStyleEntries(styles: readonly TextStyleSegment[]): readonly StyleEntry[] {
  return styles.map((segment, index) => ({
    start: segment.start,
    end: segment.end,
    tokenType: generateTokenType(index),
    style: segment.style,
  })).sort((a, b) => a.start - b.start);
}

/**
 * Find all style entries that overlap with a given range.
 *
 * @param entries - Array of style entries
 * @param rangeStart - Start of the range
 * @param rangeEnd - End of the range
 * @returns Array of overlapping style entries
 */
export function findOverlappingEntries(
  entries: readonly StyleEntry[],
  rangeStart: number,
  rangeEnd: number
): readonly StyleEntry[] {
  return entries.filter((e) => e.start < rangeEnd && e.end > rangeStart);
}
