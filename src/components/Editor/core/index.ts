/**
 * @file Core module exports
 *
 * This module only exports types and utilities that remain in core/.
 * For other modules, import directly from their respective directories:
 * - block/ - Block-based document model (blockDocument, blockPosition, useBlockComposition)
 * - history/ - Undo/Redo management (useHistory, useCursorRestoration)
 * - font/ - Font metrics and coordinates (useFontMetrics, coordinates, lineIndex, useLineIndex)
 * - text/ - Text styling (styledDocument)
 * - renderers/ - Rendering utilities (useVirtualScroll, editorState)
 * - user-actions/ - User input handling (useTextareaInput, useSelectionChange)
 */

// Types
export type {
  CompositionState,
  CursorCoordinates,
  CursorPosition,
  CursorState,
  EditorConfig,
  FontMetrics,
  HighlightRange,
  HighlightType,
  HistoryEntry,
  HistoryState,
  LineIndex,
  MeasureTextFn,
  SelectionRange,
  SelectionRect,
  TextStyle,
  TextStyleSegment,
  VirtualScrollState,
} from "./types";

export {
  DEFAULT_EDITOR_CONFIG,
  INITIAL_COMPOSITION_STATE,
  computeDisplayText,
  computeDisplayCursorOffset,
  adjustStyleForComposition,
} from "./types";

// Invariant assertions
export {
  invariant,
  assertDefined,
  assertMeasureElement,
  assertMeasureText,
} from "./invariant";

// Block Editor Core
export { useBlockEditorCore } from "./useBlockEditorCore";
export type {
  UseBlockEditorCoreConfig,
  UseBlockEditorCoreResult,
  GetOffsetFromPositionFn,
} from "./useBlockEditorCore";
