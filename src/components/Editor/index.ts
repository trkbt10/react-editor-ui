/**
 * @file Editor module exports
 *
 * Unified exports for all Editor components.
 */

// =============================================================================
// Core
// =============================================================================

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
} from "./core";

export {
  DEFAULT_EDITOR_CONFIG,
  INITIAL_COMPOSITION_STATE,
  useComposition,
  useFontMetrics,
  useHistory,
  useLineIndex,
  useSelectionChange,
  useTextareaInput,
  useVirtualScroll,
  calculateSelectionRects,
  coordinatesToPosition,
  lineColumnToCoordinates,
  lineColumnToOffset,
  offsetToLineColumn,
} from "./core";

// =============================================================================
// Renderers
// =============================================================================

export type {
  LineHighlight,
  RendererComponent,
  RendererProps,
  RendererType,
  Token,
  TokenCache,
  Tokenizer,
  TokenStyleMap,
} from "./renderers";

export {
  SvgRenderer,
  CanvasRenderer,
  getLineHighlights,
  HIGHLIGHT_COLORS,
} from "./renderers";

// =============================================================================
// Code Editor
// =============================================================================

export type {
  CodeEditorProps,
  KeyAction,
} from "./code";

export {
  CodeEditor,
  useTokenCache,
} from "./code";

export { useKeyHandlers } from "./user-actions";

// =============================================================================
// Text Editor
// =============================================================================

export type {
  TextEditorProps,
  StyleToken,
} from "./text";

export {
  TextEditor,
  useTextStyles,
} from "./text";

// =============================================================================
// Styles
// =============================================================================

export {
  EDITOR_BG,
  EDITOR_CURSOR_COLOR,
  EDITOR_FONT_FAMILY,
  EDITOR_FONT_SIZE,
  EDITOR_LINE_HEIGHT,
  EDITOR_LINE_NUMBER_BG,
  EDITOR_LINE_NUMBER_COLOR,
  EDITOR_MATCH_BG,
  EDITOR_SELECTION_BG,
  useEditorStyles,
  injectCursorAnimation,
} from "./styles";

export type { EditorStyles, EditorStylesConfig } from "./styles";
