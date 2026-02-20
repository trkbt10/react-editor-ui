/**
 * @file RichTextEditors - Rich text and code editing components
 *
 * @description
 * Unified exports for all rich text editor components including CodeEditor and TextEditor.
 * Both editors use BlockDocument for consistent architecture.
 * Provides syntax highlighting, virtual scrolling, and rich text editing.
 *
 * @example
 * ```tsx
 * import { CodeEditor, TextEditor, createBlockDocument } from "react-editor-ui/editors/RichTextEditors";
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
// Core Types
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

export { DEFAULT_EDITOR_CONFIG, INITIAL_COMPOSITION_STATE } from "./core";

// =============================================================================
// Block Document Model
// =============================================================================

export type {
  BlockDocument,
  Block,
  BlockId,
  BlockType,
  BlockTypeStyle,
  BlockTypeStyleMap,
} from "./block/blockDocument";

export {
  createBlockDocument,
  createBlockDocumentWithStyles,
  getBlockDocumentText,
  getBlockTypeStyle,
  DEFAULT_STYLE_DEFINITIONS,
  DEFAULT_BLOCK_TYPE_STYLES,
} from "./block/blockDocument";

// =============================================================================
// Markdown Parser
// =============================================================================

export {
  detectBlockType,
  parseMarkdownToBlockDocument,
  blockDocumentToMarkdown,
  parseInlineMarkdown,
} from "./block/markdownParser";

// =============================================================================
// Font & Coordinates
// =============================================================================

export { useFontMetrics } from "./font/useFontMetrics";
export { useLineIndex } from "./font/useLineIndex";
export {
  calculateSelectionRects,
  coordinatesToPosition,
  lineColumnToCoordinates,
  lineColumnToOffset,
  offsetToLineColumn,
} from "./font/coordinates";

// =============================================================================
// History
// =============================================================================

export { useHistory } from "./history/useHistory";

// =============================================================================
// User Actions
// =============================================================================

export { useSelectionChange } from "./user-actions/useSelectionChange";
export { useTextareaInput } from "./user-actions/useTextareaInput";

// =============================================================================
// Virtual Scroll
// =============================================================================

export { useVirtualScroll } from "./renderers/useVirtualScroll";

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
  CommandParams,
  // Integration types
  TextEditorWithToolbarProps,
  UseTextSelectionToolbarOptions,
  UseTextSelectionToolbarReturn,
  // Operation types
  OperationType,
  OperationDefinition,
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
  executeBlockCommand,
  // Default operations for SelectionToolbar
  createInlineOperations,
  defaultInlineOperations,
  allOperationDefinitions,
  operationDefinitionsMap,
  DEFAULT_ENABLED_OPERATIONS,
  getEnabledOperations,
  createConfiguredOperations,
  hasColorOperation,
  // Integration components
  TextEditorWithToolbar,
  ColorOperationButton,
  useTextSelectionToolbar,
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
