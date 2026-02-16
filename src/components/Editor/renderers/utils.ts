/**
 * @file Renderer Utilities
 *
 * Shared utility functions for SVG and Canvas renderers.
 */

import type { HighlightRange, HighlightType, LineHighlight } from "./types";
import {
  EDITOR_SELECTION_BG,
  EDITOR_MATCH_BG,
  EDITOR_CURRENT_MATCH_BG,
  EDITOR_COMPOSITION_BG,
} from "../styles/tokens";

// =============================================================================
// Highlight Colors
// =============================================================================

/**
 * Map of highlight types to their CSS color values.
 */
export const HIGHLIGHT_COLORS: Record<HighlightType, string> = {
  selection: EDITOR_SELECTION_BG,
  match: EDITOR_MATCH_BG,
  currentMatch: EDITOR_CURRENT_MATCH_BG,
  composition: EDITOR_COMPOSITION_BG,
};

/**
 * Raw color values for Canvas (which can't use CSS variables directly).
 */
export const HIGHLIGHT_COLORS_RAW: Record<HighlightType, string> = {
  selection: "rgba(51, 144, 255, 0.3)",
  match: "rgba(255, 213, 0, 0.4)",
  currentMatch: "rgba(255, 140, 0, 0.6)",
  composition: "rgba(100, 100, 255, 0.2)",
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

    let startCol: number;
    let endCol: number;

    if (lineNumber === h.startLine && lineNumber === h.endLine) {
      startCol = h.startColumn;
      endCol = h.endColumn;
    } else if (lineNumber === h.startLine) {
      startCol = h.startColumn;
      endCol = lineLength + 1;
    } else if (lineNumber === h.endLine) {
      startCol = 1;
      endCol = h.endColumn;
    } else {
      startCol = 1;
      endCol = lineLength + 1;
    }

    result.push({ startColumn: startCol, endColumn: endCol, type: h.type });
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
