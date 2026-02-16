/**
 * @file Code Editor Types
 *
 * Type definitions for the code editor layer.
 */

import type { CSSProperties } from "react";
import type {
  CompositionState,
  CursorPosition,
  CursorState,
  EditorConfig,
  HighlightRange,
  SelectionRange,
} from "../core/types";

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
};

// =============================================================================
// Token Types
// =============================================================================

/**
 * Token representing a segment of text with a type.
 */
export type Token = {
  /** Token type (e.g., "keyword", "string", "comment") */
  readonly type: string;
  /** Token text content */
  readonly text: string;
  /** Start position within the line (0-based) */
  readonly start: number;
  /** End position within the line (0-based, exclusive) */
  readonly end: number;
};

/**
 * Tokenizer interface for syntax highlighting.
 * Users implement this interface to provide custom syntax highlighting.
 */
export type Tokenizer = {
  /** Tokenize a single line of text */
  readonly tokenize: (line: string) => readonly Token[];
};

/**
 * Token style map for syntax highlighting.
 * Maps token types to CSS styles.
 */
export type TokenStyleMap = {
  readonly [tokenType: string]: CSSProperties;
};

/**
 * Token cache interface for efficient tokenization.
 */
export type TokenCache = {
  /** Get tokens for a line, using cache if available */
  readonly getTokens: (line: string) => readonly Token[];
  /** Clear the cache */
  readonly clear: () => void;
};

// =============================================================================
// Code Editor Props
// =============================================================================

/**
 * Code editor component props.
 */
export type CodeEditorProps = {
  /** Text value */
  readonly value: string;
  /** Called when value changes */
  readonly onChange: (value: string) => void;
  /** Tokenizer for syntax highlighting (required) */
  readonly tokenizer: Tokenizer;
  /** Token styles for syntax highlighting */
  readonly tokenStyles?: TokenStyleMap;
  /** Renderer type */
  readonly renderer?: "svg" | "canvas";
  /** Editor configuration */
  readonly config?: Partial<EditorConfig>;
  /** Custom container style */
  readonly style?: CSSProperties;
  /** Read-only mode */
  readonly readOnly?: boolean;
  /** Show line numbers */
  readonly showLineNumbers?: boolean;
  /** Highlight ranges (for search results, etc.) */
  readonly highlights?: readonly HighlightRange[];
  /** Called when cursor position changes */
  readonly onCursorChange?: (position: CursorPosition) => void;
  /** Called when selection changes */
  readonly onSelectionChange?: (selection: SelectionRange | undefined) => void;
  /** Tab size in spaces */
  readonly tabSize?: number;
};

// =============================================================================
// Key Handler Types
// =============================================================================

/**
 * Key handler action.
 */
export type KeyAction =
  | { readonly type: "undo" }
  | { readonly type: "redo" }
  | { readonly type: "insertTab"; readonly value: string; readonly cursorOffset: number }
  | { readonly type: "none" };
