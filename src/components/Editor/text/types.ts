/**
 * @file Text Editor Types
 *
 * Type definitions for the text editor layer (rich text editing).
 */

import type { CSSProperties } from "react";
import type {
  CompositionState,
  CursorPosition,
  CursorState,
  EditorConfig,
  HighlightRange,
  SelectionRange,
  TextStyle,
  TextStyleSegment,
} from "../core/types";
import type { StyledDocument } from "../core/styledDocument";

// =============================================================================
// Re-exports from core
// =============================================================================

export type {
  CompositionState,
  CursorPosition,
  CursorState,
  EditorConfig,
  HighlightRange,
  SelectionRange,
  TextStyle,
  TextStyleSegment,
};

export type { StyledDocument } from "../core/styledDocument";

// =============================================================================
// Text Editor Props
// =============================================================================

/**
 * Common props shared by both legacy and document-based APIs.
 */
type TextEditorCommonProps = {
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

/**
 * Legacy API props (value/onChange/styles).
 * @deprecated Use document-based API instead.
 */
type TextEditorLegacyProps = TextEditorCommonProps & {
  /** Text value */
  readonly value: string;
  /** Called when value changes */
  readonly onChange: (value: string) => void;
  /** Style segments for different parts of the text */
  readonly styles?: readonly TextStyleSegment[];
  /** Called when styles change */
  readonly onStyleChange?: (styles: readonly TextStyleSegment[]) => void;
  /** Not using document API */
  readonly document?: undefined;
  readonly onDocumentChange?: undefined;
};

/**
 * Document-based API props (recommended).
 *
 * @example
 * ```tsx
 * const [doc, setDoc] = useState(() => createDocument("Hello World"));
 * <TextEditor document={doc} onDocumentChange={setDoc} />
 * ```
 */
type TextEditorDocumentProps = TextEditorCommonProps & {
  /** Styled document (tree-based structure) */
  readonly document: StyledDocument;
  /** Called when document changes */
  readonly onDocumentChange: (doc: StyledDocument) => void;
  /** Not using legacy API */
  readonly value?: undefined;
  readonly onChange?: undefined;
  readonly styles?: undefined;
  readonly onStyleChange?: undefined;
};

/**
 * Text editor component props.
 *
 * Supports two APIs:
 * 1. Legacy API: `value`, `onChange`, `styles` (deprecated)
 * 2. Document API: `document`, `onDocumentChange` (recommended)
 */
export type TextEditorProps = TextEditorLegacyProps | TextEditorDocumentProps;

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
