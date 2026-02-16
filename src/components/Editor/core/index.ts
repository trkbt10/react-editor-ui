/**
 * @file Core module exports
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

// Styled Document (tree-based decoration structure)
export type {
  StyledDocument,
  StyledNode,
  StyledElement,
  TextNode,
  StyleDefinitions,
  OverlayLayer,
} from "./styledDocument";

export {
  createDocument,
  createEmptyDocument,
  text,
  element,
  getPlainText,
  getDocumentText,
  getNodeLength,
  getNodePathAtOffset,
  getTagsAtOffset,
  insertText,
  deleteRange,
  replaceRange,
  wrapWithTag,
  unwrapTag,
  setStyleDefinition,
  setOverlayLayer,
  removeOverlayLayer,
  toFlatSegments,
  getDisplayDocumentForComposition,
} from "./styledDocument";

// Hooks
export { useComposition } from "./useComposition";
export { useEditorCore } from "./useEditorCore";
export type { UseEditorCoreConfig, UseEditorCoreResult, GetOffsetFromPositionFn } from "./useEditorCore";
export {
  calculateSelectionRects,
  coordinatesToPosition,
  lineColumnToCoordinates,
  lineColumnToOffset,
  offsetToLineColumn,
  CODE_AREA_PADDING_LEFT,
  CODE_AREA_PADDING_TOP,
  DEFAULT_CHAR_WIDTH,
  DEFAULT_LINE_HEIGHT,
} from "./useCoordinates";
export type {
  CoordinateOptions,
  CoordinatesToPositionOptions,
  LineColumnToCoordinatesOptions,
  SelectionRectsOptions,
} from "./useCoordinates";
export { useFontMetrics } from "./useFontMetrics";
export { useHistory } from "./useHistory";
export type { UseHistoryConfig, UseHistoryResult } from "./useHistory";
export {
  buildLineOffsets,
  findLineIndex,
  lineColumnToOffsetFromIndex,
  offsetToLineColumnFromIndex,
  useLineIndex,
} from "./useLineIndex";
export { useSelectionChange } from "./useSelectionChange";
export { useTextareaInput } from "./useTextareaInput";
export type { UseTextareaInputConfig, UseTextareaInputResult } from "./useTextareaInput";
export { useVirtualScroll } from "./useVirtualScroll";
export type { UseVirtualScrollResult, VirtualScrollConfig } from "./useVirtualScroll";
