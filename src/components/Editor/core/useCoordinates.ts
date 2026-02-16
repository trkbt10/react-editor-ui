/**
 * @file Coordinate utilities for Editor
 *
 * Handles conversion between text positions (line/column) and pixel coordinates.
 * Supports variable-width characters (CJK, etc.) through measurement functions.
 */

import type {
  CursorCoordinates,
  CursorPosition,
  MeasureTextFn,
  SelectionRect,
} from "./types";
import { assertMeasureText } from "./invariant";

// =============================================================================
// Constants
// =============================================================================

/** Default character width for monospace font (pixels) */
export const DEFAULT_CHAR_WIDTH = 7.8;

/** Default line height (pixels) */
export const DEFAULT_LINE_HEIGHT = 21;

/** Left padding for code area (pixels) */
export const CODE_AREA_PADDING_LEFT = 8;

/** Top padding for code area (pixels) */
export const CODE_AREA_PADDING_TOP = 8;

// =============================================================================
// Types
// =============================================================================

/**
 * Options for coordinate conversion.
 */
export type CoordinateOptions = {
  readonly lineHeight?: number;
  readonly paddingLeft?: number;
  readonly paddingTop?: number;
  /**
   * Function to measure text width (for variable-width support).
   * Required - no fallback to fixed width.
   */
  readonly measureText: MeasureTextFn;
};

/**
 * Options for lineColumnToCoordinates.
 */
export type LineColumnToCoordinatesOptions = CoordinateOptions & {
  readonly line: number;
  readonly column: number;
  /** The text content of the line (for accurate measurement) */
  readonly lineText?: string;
};

/**
 * Options for calculateSelectionRects.
 */
export type SelectionRectsOptions = CoordinateOptions & {
  readonly startLine: number;
  readonly startColumn: number;
  readonly endLine: number;
  readonly endColumn: number;
  /** All lines of text (for accurate measurement) */
  readonly lines: readonly string[];
};

/**
 * Options for coordinatesToPosition.
 */
export type CoordinatesToPositionOptions = CoordinateOptions & {
  readonly x: number;
  readonly y: number;
  readonly lines: readonly string[];
  readonly scrollTop?: number;
};

// =============================================================================
// Internal Types
// =============================================================================

/**
 * Normalized selection range.
 */
type NormalizedRange = {
  readonly sLine: number;
  readonly sCol: number;
  readonly eLine: number;
  readonly eCol: number;
};

/**
 * Selection range input.
 */
type SelectionRangeInput = {
  readonly startLine: number;
  readonly startColumn: number;
  readonly endLine: number;
  readonly endColumn: number;
};

/**
 * Line rect calculation context.
 */
type LineRectContext = {
  readonly line: number;
  readonly normalized: NormalizedRange;
  readonly lines: readonly string[];
  readonly lineHeight: number;
  readonly paddingLeft: number;
  readonly paddingTop: number;
  readonly measureText: MeasureTextFn;
};

// =============================================================================
// Offset <-> Line/Column Conversion
// =============================================================================

/**
 * Convert flat character offset to line/column position (1-based).
 */
export function offsetToLineColumn(
  text: string,
  offset: number
): CursorPosition {
  const lines = text.split("\n");

  const result = findLineColumn(lines, offset);
  if (result) {
    return result;
  }

  // Past end of text - return last position
  const lastLine = lines.length;
  const lastColumn = (lines[lastLine - 1]?.length ?? 0) + 1;
  return { line: lastLine, column: lastColumn };
}

/**
 * Helper to find line/column from offset.
 */
function findLineColumn(
  lines: readonly string[],
  offset: number
): CursorPosition | null {
  // eslint-disable-next-line no-restricted-syntax -- Accumulator pattern requires mutation
  let remaining = offset;

  for (const [i, lineText] of lines.entries()) {
    const lineLength = lineText.length;
    if (remaining <= lineLength) {
      return { line: i + 1, column: remaining + 1 };
    }
    // +1 for newline character
    remaining -= lineLength + 1;
  }

  return null;
}

/**
 * Convert line/column position (1-based) to flat character offset.
 */
export function lineColumnToOffset(
  text: string,
  line: number,
  column: number
): number {
  const lines = text.split("\n");

  // Sum lengths of all lines before target line
  const lineOffset = lines
    .slice(0, line - 1)
    .reduce((acc, l) => acc + l.length + 1, 0);

  // Add column offset (1-based, so subtract 1)
  const targetLine = lines[line - 1];
  const colOffset = computeColumnOffset(targetLine, column);

  return lineOffset + colOffset;
}

/**
 * Compute column offset, clamped to line length.
 */
function computeColumnOffset(
  targetLine: string | undefined,
  column: number
): number {
  if (targetLine === undefined) {
    return 0;
  }
  return Math.min(column - 1, targetLine.length);
}

// =============================================================================
// Line/Column <-> Pixel Coordinates
// =============================================================================

/**
 * Convert line/column position to pixel coordinates.
 *
 * Uses measureText function for accurate positioning with variable-width characters.
 * @throws Error if measureText is not provided
 */
export function lineColumnToCoordinates(
  options: LineColumnToCoordinatesOptions
): CursorCoordinates {
  const {
    line,
    column,
    lineText = "",
    lineHeight = DEFAULT_LINE_HEIGHT,
    paddingLeft = CODE_AREA_PADDING_LEFT,
    paddingTop = CODE_AREA_PADDING_TOP,
    measureText,
  } = options;

  // 0-based for pixel calculation
  const lineIndex = line - 1;

  // Measure text before cursor for accurate X position
  const textBeforeCursor = lineText.slice(0, column - 1);
  const xOffset = measureText(textBeforeCursor);

  return {
    x: paddingLeft + xOffset,
    y: paddingTop + lineIndex * lineHeight,
    height: lineHeight,
  };
}

/**
 * Convert pixel coordinates to line/column position.
 * @throws Error if measureText is not provided
 */
export function coordinatesToPosition(
  options: CoordinatesToPositionOptions
): CursorPosition {
  const {
    x,
    y,
    lines,
    scrollTop = 0,
    lineHeight = DEFAULT_LINE_HEIGHT,
    paddingLeft = CODE_AREA_PADDING_LEFT,
    paddingTop = CODE_AREA_PADDING_TOP,
    measureText,
  } = options;

  // Calculate line from Y coordinate
  const adjustedY = y + scrollTop - paddingTop;
  const lineIndex = Math.max(0, Math.min(Math.floor(adjustedY / lineHeight), lines.length - 1));
  const line = lineIndex + 1;

  // Calculate column from X coordinate
  const lineText = lines[lineIndex] ?? "";
  const adjustedX = x - paddingLeft;

  // Binary search for column
  const column = findColumnAtX(lineText, adjustedX, measureText);

  return { line, column };
}

/**
 * Find column at given X position using binary search.
 */
function findColumnAtX(
  lineText: string,
  x: number,
  measureText: MeasureTextFn
): number {
  if (x <= 0 || lineText.length === 0) {
    return 1;
  }

  // eslint-disable-next-line no-restricted-syntax -- Binary search requires mutable bounds
  let lo = 0;
  // eslint-disable-next-line no-restricted-syntax -- Binary search requires mutable bounds
  let hi = lineText.length;

  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const textWidth = measureText(lineText.slice(0, mid));
    const nextWidth = measureText(lineText.slice(0, mid + 1));
    const midPoint = (textWidth + nextWidth) / 2;

    if (x <= midPoint) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }

  return lo + 1; // Convert to 1-based
}

// =============================================================================
// Selection Rectangles
// =============================================================================

/**
 * Normalize selection range (ensure start <= end).
 */
function normalizeSelectionRange(input: SelectionRangeInput): NormalizedRange {
  const { startLine, startColumn, endLine, endColumn } = input;
  const needsSwap =
    startLine > endLine || (startLine === endLine && startColumn > endColumn);

  if (needsSwap) {
    return { sLine: endLine, sCol: endColumn, eLine: startLine, eCol: startColumn };
  }
  return { sLine: startLine, sCol: startColumn, eLine: endLine, eCol: endColumn };
}

/**
 * Calculate selection rectangles for a range.
 *
 * Returns one rectangle per line covered by the selection.
 * Uses measureText function for accurate positioning with variable-width characters.
 * @throws Error if measureText is not provided
 */
export function calculateSelectionRects(
  options: SelectionRectsOptions
): readonly SelectionRect[] {
  const {
    startLine,
    startColumn,
    endLine,
    endColumn,
    lines,
    lineHeight = DEFAULT_LINE_HEIGHT,
    paddingLeft = CODE_AREA_PADDING_LEFT,
    paddingTop = CODE_AREA_PADDING_TOP,
    measureText,
  } = options;

  const normalized = normalizeSelectionRange({
    startLine,
    startColumn,
    endLine,
    endColumn,
  });

  return range(normalized.sLine, normalized.eLine + 1)
    .map((lineNum) =>
      createSelectionRectForLine({
        line: lineNum,
        normalized,
        lines,
        lineHeight,
        paddingLeft,
        paddingTop,
        measureText,
      })
    )
    .filter((rect): rect is SelectionRect => rect !== null);
}

/**
 * Create a selection rect for a single line.
 */
function createSelectionRectForLine(ctx: LineRectContext): SelectionRect | null {
  const { line, normalized, lines, lineHeight, paddingLeft, paddingTop, measureText } = ctx;
  const lineIndex = line - 1;
  const lineText = lines[lineIndex] ?? "";
  const lineLength = lineText.length;

  // Determine column range for this line
  const colStart = line === normalized.sLine ? normalized.sCol : 1;
  const colEnd = line === normalized.eLine ? normalized.eCol : lineLength + 1;

  if (colEnd <= colStart) {
    return null;
  }

  // Measure text for accurate positioning
  const textBeforeStart = lineText.slice(0, colStart - 1);
  const selectedText = lineText.slice(colStart - 1, colEnd - 1);

  const xPos = paddingLeft + measureText(textBeforeStart);
  const yPos = paddingTop + lineIndex * lineHeight;
  const width = measureText(selectedText);

  return { x: xPos, y: yPos, width, height: lineHeight };
}

/**
 * Generate range of numbers [start, end).
 */
function range(start: number, end: number): readonly number[] {
  return Array.from({ length: end - start }, (_, idx) => start + idx);
}
