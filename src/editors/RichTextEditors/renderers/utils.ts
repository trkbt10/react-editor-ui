/**
 * @file Renderer Utilities
 *
 * Shared utility functions for SVG and Canvas renderers.
 */

import type { HighlightRange, HighlightType } from "../core/types";
import type { LineHighlight } from "./types";
import {
  HIGHLIGHT_COLORS,
  EDITOR_SELECTION_BG_RAW,
  EDITOR_MATCH_BG_RAW,
  EDITOR_CURRENT_MATCH_BG_RAW,
  EDITOR_COMPOSITION_BG_RAW,
} from "../styles/tokens";

// =============================================================================
// Highlight Colors (re-exported from tokens.ts)
// =============================================================================

// Re-export for backward compatibility
export { HIGHLIGHT_COLORS };

/**
 * Raw color values for Canvas (which can't use CSS variables directly).
 */
export const HIGHLIGHT_COLORS_RAW: Record<HighlightType, string> = {
  selection: EDITOR_SELECTION_BG_RAW,
  match: EDITOR_MATCH_BG_RAW,
  currentMatch: EDITOR_CURRENT_MATCH_BG_RAW,
  composition: EDITOR_COMPOSITION_BG_RAW,
};

// =============================================================================
// Priority
// =============================================================================

/**
 * Priority for sorting overlapping highlights.
 * Higher priority highlights are drawn on top.
 */
const HIGHLIGHT_PRIORITY: Record<HighlightType, number> = {
  selection: 0,
  match: 1,
  currentMatch: 2,
  composition: 3,
};

// =============================================================================
// Line Highlights
// =============================================================================

/** Compute column range for a highlight on a specific line */
function computeColumnRange(
  h: HighlightRange,
  lineNumber: number,
  lineLength: number
): { startColumn: number; endColumn: number } {
  const isStartLine = lineNumber === h.startLine;
  const isEndLine = lineNumber === h.endLine;
  const startColumn = isStartLine ? h.startColumn : 1;
  const endColumn = isEndLine ? h.endColumn : lineLength + 1;
  return { startColumn, endColumn };
}

/**
 * Get highlights that apply to a specific line.
 *
 * @param lineNumber - Line number (1-based)
 * @param lineLength - Length of the line text
 * @param highlights - All highlight ranges
 * @returns Highlights clipped to this line, sorted by priority
 */
export function getLineHighlights(
  lineNumber: number,
  lineLength: number,
  highlights: readonly HighlightRange[]
): readonly LineHighlight[] {
  const result: LineHighlight[] = [];

  for (const h of highlights) {
    if (lineNumber < h.startLine || lineNumber > h.endLine) {
      continue;
    }

    const { startColumn, endColumn } = computeColumnRange(h, lineNumber, lineLength);
    result.push({ startColumn, endColumn, type: h.type });
  }

  // Sort by priority (lower priority first, so higher priority draws on top)
  result.sort((a, b) => HIGHLIGHT_PRIORITY[a.type] - HIGHLIGHT_PRIORITY[b.type]);

  return result;
}

// =============================================================================
// X Position Calculation
// =============================================================================

/**
 * Calculate X position for a column.
 *
 * @param column - Column number (1-based)
 * @param lineText - Line text content
 * @param measureText - Text measurement function
 * @param charWidth - Fallback character width
 * @returns X position in pixels
 */
export function getColumnX(
  column: number,
  lineText: string,
  measureText: ((text: string) => number) | undefined,
  charWidth: number
): number {
  if (measureText) {
    return measureText(lineText.slice(0, column - 1));
  }
  return (column - 1) * charWidth;
}

// =============================================================================
// Line Range Generation
// =============================================================================

/**
 * Generate array of line indices for visible range.
 *
 * @param visibleRange - Start and end of visible range (0-based, end exclusive)
 * @returns Array of line indices
 */
export function getVisibleLineIndices(
  visibleRange: { readonly start: number; readonly end: number }
): readonly number[] {
  const length = visibleRange.end - visibleRange.start;
  return Array.from({ length }, (_, i) => visibleRange.start + i);
}
