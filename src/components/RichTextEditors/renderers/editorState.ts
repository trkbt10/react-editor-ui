/**
 * @file Editor State Utilities
 *
 * Pure functions for creating editor state objects (cursor, selection, highlights).
 */

import type {
  CompositionState,
  CursorPosition,
  CursorState,
  HighlightRange,
  LineIndex,
} from "../core/types";

// =============================================================================
// Cursor State
// =============================================================================

/**
 * Create cursor state from selection info.
 *
 * @param cursorPos - Current cursor position
 * @param hasFocus - Whether editor has focus
 * @param hasSelection - Whether there is a selection
 * @param isComposing - Whether IME composition is active
 * @returns Cursor state object
 */
export function createCursorState(
  cursorPos: CursorPosition,
  hasFocus: boolean,
  hasSelection: boolean,
  isComposing: boolean
): CursorState {
  return {
    line: cursorPos.line,
    column: cursorPos.column,
    visible: hasFocus,
    blinking: hasFocus && !hasSelection && !isComposing,
  };
}

// =============================================================================
// Highlights
// =============================================================================

/**
 * Create selection highlight from start/end positions.
 *
 * @param startPos - Selection start position
 * @param endPos - Selection end position
 * @returns Selection highlight range
 */
export function createSelectionHighlight(
  startPos: CursorPosition,
  endPos: CursorPosition
): HighlightRange {
  return {
    startLine: startPos.line,
    startColumn: startPos.column,
    endLine: endPos.line,
    endColumn: endPos.column,
    type: "selection",
  };
}

/**
 * Create composition highlight from composition state.
 *
 * @param composition - Current composition state
 * @param lineIndex - Line index for offset conversion
 * @returns Composition highlight range, or null if not composing
 */
export function createCompositionHighlight(
  composition: CompositionState,
  lineIndex: LineIndex
): HighlightRange | null {
  if (!composition.isComposing || composition.text.length === 0) {
    return null;
  }

  const startPos = lineIndex.getLineAtOffset(composition.startOffset);
  const endPos = lineIndex.getLineAtOffset(composition.startOffset + composition.text.length);

  return {
    startLine: startPos.line,
    startColumn: startPos.column,
    endLine: endPos.line,
    endColumn: endPos.column,
    type: "composition",
  };
}

/**
 * Combine highlights into a single array.
 *
 * @param selectionHighlight - Selection highlight, or null
 * @param compositionHighlight - Composition highlight, or null
 * @returns Array of all non-null highlights
 */
export function combineHighlights(
  selectionHighlight: HighlightRange | null,
  compositionHighlight: HighlightRange | null
): readonly HighlightRange[] {
  const result: HighlightRange[] = [];
  if (selectionHighlight) {
    result.push(selectionHighlight);
  }
  if (compositionHighlight) {
    result.push(compositionHighlight);
  }
  return result;
}
