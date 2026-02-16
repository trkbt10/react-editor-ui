/**
 * @file Editor module exports
 *
 * @description
 * Unified exports for all Editor components including CodeEditor and TextEditor.
 * Both editors use BlockDocument for consistent architecture.
 * Provides syntax highlighting, virtual scrolling, and rich text editing.
 *
 * @example
 * ```tsx
 * import { CodeEditor, TextEditor, createBlockDocument } from "react-editor-ui/Editor";
 *
 * const [doc, setDoc] = useState(() => createBlockDocument(code));
 *
 * // Code editor with syntax highlighting
 * <CodeEditor
 *   document={doc}
 *   onDocumentChange={setDoc}
 *   tokenizer={myTokenizer}
 * />
 *
 * // Rich text editor
 * <TextEditor
 *   document={doc}
 *   onDocumentChange={setDoc}
 * />
 * ```
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
  // Block-based types
  BlockDocument,
  Block,
  BlockId,
} from "./core";

export {
  DEFAULT_EDITOR_CONFIG,
  INITIAL_COMPOSITION_STATE,
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
  // Block-based functions
  createBlockDocument,
  getBlockDocumentText,
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
  BlockRenderer,
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
  TextEditorHandle,
  TextSelectionEvent,
  SelectionAnchorRect,
  StyleToken,
  TextEditorCommand,
} from "./text";

export {
  TextEditor,
  useTextStyles,
  // Commands
  defaultCommands,
  defaultCommandsMap,
  getCommand,
  executeCommand,
  getActiveTagsAtRange,
  // Default operations for FloatingToolbar
  createInlineOperations,
  defaultInlineOperations,
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
