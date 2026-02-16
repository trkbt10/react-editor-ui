/**
 * @file Line Index Utilities
 *
 * Pure functions for building and querying line offset indices.
 * Provides O(log n) offset-to-line-column conversion via binary search.
 */

import type { CursorPosition } from "./types";

// =============================================================================
// Types
// =============================================================================

/**
 * Options for lineColumnToOffsetFromIndex.
 */
export type LineColumnToOffsetOptions = {
  readonly lines: readonly string[];
  readonly lineOffsets: readonly number[];
  readonly line: number;
  readonly column: number;
};

// =============================================================================
// Pure Functions
// =============================================================================

/**
 * Build line offset index from lines array.
 * lineOffsets[i] = start offset of line i (0-based).
 *
 * @param lines - Array of line strings
 * @returns Array of line start offsets
 */
export function buildLineOffsets(lines: readonly string[]): readonly number[] {
  const offsets: number[] = new Array(lines.length);
  // eslint-disable-next-line no-restricted-syntax -- Accumulator pattern requires mutation
  let offset = 0;

  for (const [i, line] of lines.entries()) {
    offsets[i] = offset;
    // +1 for newline character
    offset += line.length + 1;
  }

  return offsets;
}

/**
 * Binary search to find line index containing the given offset.
 *
 * @param lineOffsets - Array of line start offsets
 * @param offset - Flat character offset to search for
 * @returns 0-based line index
 */
export function findLineIndex(lineOffsets: readonly number[], offset: number): number {
  // Handle empty text
  if (lineOffsets.length === 0) {
    return 0;
  }

  // eslint-disable-next-line no-restricted-syntax -- Binary search requires mutable bounds
  let lo = 0;
  // eslint-disable-next-line no-restricted-syntax -- Binary search requires mutable bounds
  let hi = lineOffsets.length - 1;

  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lineOffsets[mid] <= offset) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  return lo;
}

/**
 * Convert flat offset to line/column (1-based).
 *
 * @param lines - Array of line strings
 * @param lineOffsets - Array of line start offsets
 * @param offset - Flat character offset
 * @returns 1-based line and column position
 */
export function offsetToLineColumnFromIndex(
  lines: readonly string[],
  lineOffsets: readonly number[],
  offset: number
): CursorPosition {
  if (lines.length === 0) {
    return { line: 1, column: 1 };
  }

  // Clamp offset to valid range
  const clampedOffset = Math.max(0, offset);

  const lineIndex = findLineIndex(lineOffsets, clampedOffset);
  const lineStartOffset = lineOffsets[lineIndex];
  const column = clampedOffset - lineStartOffset + 1;

  return { line: lineIndex + 1, column };
}

/**
 * Convert line/column (1-based) to flat offset.
 *
 * @param options - Lines, offsets, and position to convert
 * @returns Flat character offset
 */
export function lineColumnToOffsetFromIndex(options: LineColumnToOffsetOptions): number {
  const { lines, lineOffsets, line, column } = options;

  if (lines.length === 0) {
    return 0;
  }

  // Clamp line to valid range (1-based)
  const lineIndex = Math.max(0, Math.min(line - 1, lines.length - 1));
  const lineStartOffset = lineOffsets[lineIndex];
  const lineText = lines[lineIndex];

  // Clamp column to line length (1-based)
  const colOffset = Math.max(0, Math.min(column - 1, lineText.length));

  return lineStartOffset + colOffset;
}
