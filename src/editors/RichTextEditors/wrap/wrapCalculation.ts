/**
 * @file Wrap Calculation Functions
 *
 * Pure functions for calculating text wrap points.
 * Handles both soft wrap (automatic at width) and word wrap (break at word boundaries).
 */

import type { MeasureTextFn, WrapPoint } from "./types";

// =============================================================================
// Character Classification
// =============================================================================

/**
 * Check if a character is a word boundary character.
 * Word boundaries include spaces, punctuation, and certain special characters.
 */
export function isWordBoundaryChar(char: string): boolean {
  // Space and whitespace
  if (/\s/.test(char)) {
    return true;
  }
  // ASCII punctuation that typically allows breaks
  if (/[.,;:!?\-/\\|()[\]{}]/.test(char)) {
    return true;
  }
  return false;
}

/**
 * Check if a character is a CJK (Chinese, Japanese, Korean) character.
 * CJK characters can wrap at any position.
 */
export function isCJKChar(char: string): boolean {
  const code = char.charCodeAt(0);
  // CJK Unified Ideographs and common ranges
  return (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
    (code >= 0x3000 && code <= 0x303f) || // CJK Symbols and Punctuation
    (code >= 0x3040 && code <= 0x309f) || // Hiragana
    (code >= 0x30a0 && code <= 0x30ff) || // Katakana
    (code >= 0xff00 && code <= 0xffef) || // Fullwidth Forms
    (code >= 0xac00 && code <= 0xd7af)    // Hangul Syllables
  );
}

/**
 * Check if position is a valid break point for word wrapping.
 *
 * Rules:
 * - Can break after whitespace
 * - Can break after punctuation
 * - Can break before/after CJK characters
 * - Cannot break in the middle of a word
 *
 * @param line - The text line
 * @param offset - Position to check (break would occur before this position)
 * @returns true if this is a valid word break position
 */
export function isWordBreakPoint(line: string, offset: number): boolean {
  // Can always break at start or end
  if (offset <= 0 || offset >= line.length) {
    return true;
  }

  const prevChar = line[offset - 1];
  const currChar = line[offset];

  // Break after whitespace
  if (isWordBoundaryChar(prevChar)) {
    return true;
  }

  // Break before CJK character
  if (isCJKChar(currChar)) {
    return true;
  }

  // Break after CJK character
  if (isCJKChar(prevChar)) {
    return true;
  }

  return false;
}

// =============================================================================
// Wrap Position Finding
// =============================================================================

/**
 * Find the best wrap position within a line segment.
 *
 * Searches for a position where the text from startOffset fits within maxWidth.
 * When wordWrap is enabled, tries to break at word boundaries.
 *
 * @param line - The full line text
 * @param startOffset - Starting character offset
 * @param maxWidth - Maximum width in pixels
 * @param measureText - Text measurement function
 * @param wordWrap - Whether to prefer word boundaries
 * @returns Character offset where wrap should occur, or line.length if no wrap needed
 */
export function findWrapPosition(
  line: string,
  startOffset: number,
  maxWidth: number,
  measureText: MeasureTextFn,
  wordWrap: boolean
): number {
  const remaining = line.slice(startOffset);

  // Check if no wrap needed
  const fullWidth = measureText(remaining);
  if (fullWidth <= maxWidth) {
    return line.length;
  }

  // Binary search for approximate wrap position
  let lo = 0;
  let hi = remaining.length;

  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    const width = measureText(remaining.slice(0, mid));
    if (width <= maxWidth) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  // Ensure at least 1 character per line to prevent infinite loop
  if (lo === 0) {
    lo = 1;
  }

  const wrapOffset = startOffset + lo;

  // If word wrap disabled, return character position
  if (!wordWrap) {
    return wrapOffset;
  }

  // Try to find a word boundary before the wrap position
  // Search backward from wrap position
  for (let i = wrapOffset; i > startOffset; i--) {
    if (isWordBreakPoint(line, i)) {
      return i;
    }
  }

  // No word boundary found - fall back to character wrap
  // This handles very long words
  return wrapOffset;
}

// =============================================================================
// Line Wrap Point Calculation
// =============================================================================

/**
 * Options for wrap point calculation.
 */
export type CalculateWrapOptions = {
  /** Maximum width in pixels (0 = no wrap) */
  readonly maxWidth: number;
  /** Whether to break at word boundaries */
  readonly wordWrap: boolean;
};

/**
 * Calculate all wrap points for a single line.
 *
 * Returns an array of WrapPoint objects indicating where the line wraps.
 * The final wrap point has offset equal to line length.
 *
 * @param line - The line text to analyze
 * @param measureText - Text measurement function
 * @param options - Wrap options (maxWidth, wordWrap)
 * @returns Array of wrap points (empty if no wrapping needed)
 *
 * @example
 * ```typescript
 * const line = "Hello world, this is a long line";
 * const wrapPoints = calculateLineWrapPoints(line, measureText, { maxWidth: 100, wordWrap: true });
 * // Returns positions where line should wrap
 * ```
 */
export function calculateLineWrapPoints(
  line: string,
  measureText: MeasureTextFn,
  options: CalculateWrapOptions
): WrapPoint[] {
  const { maxWidth, wordWrap } = options;

  // No wrapping if maxWidth is 0 or negative
  if (maxWidth <= 0) {
    return [];
  }

  // Empty line doesn't need wrapping
  if (line.length === 0) {
    return [];
  }

  // Check if line fits without wrapping
  const totalWidth = measureText(line);
  if (totalWidth <= maxWidth) {
    return [];
  }

  const wrapPoints: WrapPoint[] = [];
  let offset = 0;

  while (offset < line.length) {
    const wrapOffset = findWrapPosition(line, offset, maxWidth, measureText, wordWrap);

    // If we're at end of line, done
    if (wrapOffset >= line.length) {
      break;
    }

    // Add wrap point
    wrapPoints.push({
      offset: wrapOffset,
      isSoftWrap: true,
    });

    // Move to next segment
    offset = wrapOffset;
  }

  return wrapPoints;
}

/**
 * Get line segments from wrap points.
 *
 * Converts wrap points into start/end offset pairs for each visual line.
 *
 * @param lineLength - Total length of the line
 * @param wrapPoints - Array of wrap points
 * @returns Array of [startOffset, endOffset] pairs
 */
export function getLineSegments(
  lineLength: number,
  wrapPoints: readonly WrapPoint[]
): Array<{ start: number; end: number; isSoftWrapped: boolean }> {
  if (wrapPoints.length === 0) {
    return [{ start: 0, end: lineLength, isSoftWrapped: false }];
  }

  const segments: Array<{ start: number; end: number; isSoftWrapped: boolean }> = [];
  let start = 0;

  for (const wp of wrapPoints) {
    segments.push({
      start,
      end: wp.offset,
      isSoftWrapped: wp.isSoftWrap,
    });
    start = wp.offset;
  }

  // Add final segment
  segments.push({
    start,
    end: lineLength,
    isSoftWrapped: false,
  });

  return segments;
}
