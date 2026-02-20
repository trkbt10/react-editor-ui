/**
 * @file Styled Measurement Utilities
 *
 * Pure functions for style-aware text measurement helpers.
 */

import type { TextStyleSegment, TextStyle, CursorPosition } from "../core/types";
import { EDITOR_DEFAULTS } from "../styles/tokens";

// =============================================================================
// Types
// =============================================================================

/**
 * Options for styled coordinate conversion.
 */
export type StyledCoordinatesToPositionOptions = {
  readonly x: number;
  readonly y: number;
  readonly lines: readonly string[];
  readonly lineOffsets: readonly number[];
  readonly scrollTop?: number;
  readonly lineHeight?: number;
  readonly paddingLeft?: number;
  readonly paddingTop?: number;
  readonly findColumnAtStyledX: (line: string, x: number, lineOffset: number) => number;
};

// =============================================================================
// Pure Functions
// =============================================================================

/**
 * Parse font size string to number.
 *
 * @param size - Font size string (e.g., "16px", "1.2em", "120%")
 * @param baseSize - Base font size in pixels
 * @returns Font size in pixels
 */
export function parseFontSize(size: string | undefined, baseSize: number): number {
  if (!size) {
    return baseSize;
  }
  if (size.endsWith("px")) {
    return parseFloat(size);
  }
  if (size.endsWith("em")) {
    return parseFloat(size) * baseSize;
  }
  if (size.endsWith("%")) {
    return (parseFloat(size) / 100) * baseSize;
  }
  const num = parseFloat(size);
  return Number.isNaN(num) ? baseSize : num;
}

/**
 * Find the style at a specific offset.
 *
 * @param offset - Character offset in the document
 * @param styles - Array of style segments
 * @returns Style at the offset, or undefined if no style applies
 */
export function findStyleAtOffset(
  offset: number,
  styles: readonly TextStyleSegment[]
): TextStyle | undefined {
  for (const segment of styles) {
    if (offset >= segment.start && offset < segment.end) {
      return segment.style;
    }
  }
  return undefined;
}

/**
 * Convert pixel coordinates to line/column position with styled measurement.
 *
 * @param options - Coordinate conversion options
 * @returns Line and column position (1-based)
 */
export function styledCoordinatesToPosition(
  options: StyledCoordinatesToPositionOptions
): CursorPosition {
  const {
    x,
    y,
    lines,
    lineOffsets,
    scrollTop = 0,
    lineHeight = EDITOR_DEFAULTS.LINE_HEIGHT_PX,
    paddingLeft = 8,
    paddingTop = 8,
    findColumnAtStyledX,
  } = options;

  // Calculate line from Y coordinate
  const adjustedY = y + scrollTop - paddingTop;
  const lineIndex = Math.max(0, Math.min(Math.floor(adjustedY / lineHeight), lines.length - 1));
  const line = lineIndex + 1;

  // Calculate column from X coordinate using styled measurement
  const lineText = lines[lineIndex] ?? "";
  const lineOffset = lineOffsets[lineIndex] ?? 0;
  const adjustedX = x - paddingLeft;

  const column = findColumnAtStyledX(lineText, adjustedX, lineOffset);

  return { line, column };
}
