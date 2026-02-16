/**
 * @file Text Editor Types
 *
 * Type definitions for the text editor layer (rich text editing).
 * Note: Import core types directly from "../core/types" and "../core/styledDocument".
 */

import type { CSSProperties } from "react";
import type {
  CursorPosition,
  EditorConfig,
  SelectionRange,
  TextStyle,
} from "../core/types";
import type { StyledDocument } from "../core/styledDocument";

// =============================================================================
// Text Editor Props
// =============================================================================

/**
 * Text editor component props.
 *
 * @example
 * ```tsx
 * const [doc, setDoc] = useState(() => createDocument("Hello World"));
 * <TextEditor document={doc} onDocumentChange={setDoc} />
 * ```
 */
export type TextEditorProps = {
  /** Styled document (tree-based structure) */
  readonly document: StyledDocument;
  /** Called when document changes */
  readonly onDocumentChange: (doc: StyledDocument) => void;
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
  /** Called when selection changes */
  readonly onSelectionChange?: (selection: SelectionRange | undefined) => void;
  /** Tab size in spaces */
  readonly tabSize?: number;
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
