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

// Pure Functions - Line Index
export {
  buildLineOffsets,
  findLineIndex,
  offsetToLineColumnFromIndex,
  lineColumnToOffsetFromIndex,
} from "./lineIndex";
export type { LineColumnToOffsetOptions } from "./lineIndex";

// Pure Functions - Editor State
export {
  createCursorState,
  createSelectionHighlight,
  createCompositionHighlight,
  combineHighlights,
} from "./editorState";

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
} from "./coordinates";
export type {
  CoordinateOptions,
  CoordinatesToPositionOptions,
  LineColumnToCoordinatesOptions,
  SelectionRectsOptions,
} from "./coordinates";
export { useFontMetrics } from "./useFontMetrics";
export { useHistory } from "./useHistory";
export type { UseHistoryConfig, UseHistoryResult } from "./useHistory";
export { useLineIndex } from "./useLineIndex";
export { useSelectionChange } from "./useSelectionChange";
export { useTextareaInput } from "./useTextareaInput";
export type { UseTextareaInputConfig, UseTextareaInputResult } from "./useTextareaInput";
export { useVirtualScroll } from "./useVirtualScroll";
export type { UseVirtualScrollResult, VirtualScrollConfig } from "./useVirtualScroll";

// Block-Based Document Model
export type {
  BlockId,
  BlockType,
  Block,
  BlockDocument,
  LocalStyleSegment,
} from "./blockDocument";

export {
  createBlockId,
  createBlock,
  createEmptyBlock,
  createEmptyBlockDocument,
  createBlockDocument,
  getBlockDocumentText,
  getBlockDocumentLength,
  getBlockById,
  getBlockIndexById,
  getBlockAtGlobalOffset,
  updateBlock,
  insertTextInBlock,
  deleteRangeInBlock,
  replaceRangeInBlock,
  insertTextInDocument,
  deleteRangeInDocument,
  replaceRangeInDocument,
  fromStyledDocument,
  toStyledDocument,
  applyStyleToBlock,
  removeStylesFromBlock,
  splitBlock,
  mergeBlocks,
} from "./blockDocument";

// Block Position
export type {
  BlockPosition,
  BlockSelection,
  BlockCursor,
} from "./blockPosition";

export {
  createBlockPosition,
  createBlockCursor,
  createBlockSelection,
  isSelectionCollapsed,
  getSelectionBounds,
  isPositionInSelection,
  globalOffsetToBlockPosition,
  blockPositionToGlobalOffset,
  blockSelectionToGlobalOffsets,
  getLineColumnInBlock,
  getOffsetInBlockFromLineColumn,
  getGlobalLineColumn,
  globalLineColumnToBlockPosition,
  movePositionForward,
  movePositionBackward,
  getBlockStart,
  getBlockEnd,
  getDocumentStart,
  getDocumentEnd,
  comparePositions,
  positionsEqual,
} from "./blockPosition";

// Block Composition
export type { BlockCompositionState } from "./useBlockComposition";

export {
  INITIAL_BLOCK_COMPOSITION_STATE,
  useBlockComposition,
  getCompositionEndPosition,
  isPositionInComposition,
  getCompositionRange,
  computeBlockDisplayContent,
  adjustBlockStyleForComposition,
} from "./useBlockComposition";

// Block Editor Core
export { useBlockEditorCore } from "./useBlockEditorCore";
export type {
  UseBlockEditorCoreConfig,
  UseBlockEditorCoreResult,
} from "./useBlockEditorCore";
