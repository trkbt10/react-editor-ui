/**
 * @file Text Editor Types
 *
 * Type definitions for the text editor layer (rich text editing).
 * Uses BlockDocument for block-based architecture.
 */

import type { CSSProperties } from "react";
import type {
  CursorPosition,
  EditorConfig,
  SelectionRange,
  TextStyle,
} from "../core/types";
import type { BlockDocument } from "../block/blockDocument";
import type { ViewportConfig } from "../renderers/viewport/types";

// =============================================================================
// Text Editor Props
// =============================================================================

/**
 * Text editor component props.
 *
 * @example
 * ```tsx
 * const [doc, setDoc] = useState(() => createBlockDocument("Hello World"));
 * <TextEditor document={doc} onDocumentChange={setDoc} />
 * ```
 */
export type TextEditorProps = {
  /** Block document */
  readonly document: BlockDocument;
  /** Called when document changes */
  readonly onDocumentChange: (doc: BlockDocument) => void;
  /** Renderer type */
  readonly renderer?: "svg" | "canvas";
  /** Editor configuration */
  readonly config?: Partial<EditorConfig>;
  /** Custom container style */
  readonly style?: CSSProperties;
  /** Read-only mode */
  readonly readOnly?: boolean;
  /** Called when cursor position changes */
  readonly onCursorChange?: (position: CursorPosition) => void;
  /** Called when selection changes (basic) */
  readonly onSelectionChange?: (selection: SelectionRange | undefined) => void;
  /**
   * Called when text selection changes with enhanced metadata.
   * Includes anchor rect for SelectionToolbar positioning.
   */
  readonly onTextSelectionChange?: (event: TextSelectionEvent | null) => void;
  /** Tab size in spaces */
  readonly tabSize?: number;
  /**
   * Viewport configuration for fixed viewport mode.
   * When provided, enables viewport-based rendering.
   */
  readonly viewportConfig?: ViewportConfig;
};

// =============================================================================
// Style Token
// =============================================================================

/**
 * Style token for rendering.
 * Similar to Token but carries text style instead of token type.
 */
export type StyleToken = {
  /** Token text content */
  readonly text: string;
  /** Start position within the line (0-based) */
  readonly start: number;
  /** End position within the line (0-based, exclusive) */
  readonly end: number;
  /** Style to apply */
  readonly style: TextStyle;
};

// =============================================================================
// Selection Event
// =============================================================================

/**
 * Anchor rectangle for SelectionToolbar positioning.
 * Represents the bounding box of the selection in viewport coordinates.
 */
export type SelectionAnchorRect = {
  /** X coordinate of the anchor (viewport-relative) */
  readonly x: number;
  /** Y coordinate of the anchor (viewport-relative) */
  readonly y: number;
  /** Width of the anchor rectangle */
  readonly width: number;
  /** Height of the anchor rectangle */
  readonly height: number;
};

/**
 * Text selection event with additional metadata for SelectionToolbar.
 * Emitted when text is selected in the TextEditor.
 */
export type TextSelectionEvent = {
  /** Selection range in line/column coordinates */
  readonly range: SelectionRange;
  /** Start offset in the document (0-based character index) */
  readonly startOffset: number;
  /** End offset in the document (0-based character index) */
  readonly endOffset: number;
  /** Anchor rectangle for SelectionToolbar positioning */
  readonly anchorRect: SelectionAnchorRect;
  /** Text content that is selected */
  readonly selectedText: string;
  /** Tags currently applied to the selection (for active state) */
  readonly activeTags: readonly string[];
};

// =============================================================================
// TextEditor Handle
// =============================================================================

/**
 * Parameters for commands that require additional data.
 * Used for color commands and other parameterized operations.
 */
export type CommandParams = {
  /** Text color to apply */
  readonly color?: string;
  /** Background color to apply */
  readonly backgroundColor?: string;
};

/**
 * Ref handle exposed by TextEditor via forwardRef.
 * Allows parent components to control the editor programmatically.
 */
export type TextEditorHandle = {
  /**
   * Execute a style command on the current selection.
   * @param commandId - Command ID (e.g., "bold", "italic", "textColor")
   * @param params - Optional parameters for commands like textColor
   */
  readonly executeCommand: (commandId: string, params?: CommandParams) => void;
  /** Focus the editor */
  readonly focus: () => void;
  /** Get the current selection offsets */
  readonly getSelection: () => { start: number; end: number } | null;
};
