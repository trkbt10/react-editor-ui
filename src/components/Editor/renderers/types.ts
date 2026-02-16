/**
 * @file Renderer Types
 *
 * Shared types and interfaces for code rendering in SVG and Canvas.
 * Note: Import core types directly from "../core/types".
 */

import type { ReactNode, CSSProperties } from "react";
import type {
  CursorState,
  HighlightRange,
  HighlightType,
  MeasureTextFn,
} from "../core/types";

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
 */
export type Tokenizer = {
  /** Tokenize a single line of text */
  readonly tokenize: (line: string) => readonly Token[];
};

/**
 * Token style map for syntax highlighting.
 */
export type TokenStyleMap = {
  readonly [tokenType: string]: CSSProperties;
};

/**
 * Token cache interface for efficient tokenization.
 */
export type TokenCache = {
  /**
   * Get tokens for a line, using cache if available.
   * @param line - The line content
   * @param lineIndex - Optional line index (0-based) for offset-based styling
   */
  readonly getTokens: (line: string, lineIndex?: number) => readonly Token[];
  /** Clear the cache */
  readonly clear: () => void;
};

// =============================================================================
// Renderer Types
// =============================================================================

/**
 * Available renderer types.
 */
export type RendererType = "svg" | "canvas";

/**
 * Common props for all code renderers.
 */
export type RendererProps = {
  /** All lines of code */
  readonly lines: readonly string[];
  /** Range of lines to render (0-based, end is exclusive) */
  readonly visibleRange: { readonly start: number; readonly end: number };
  /** Height of spacer above visible lines */
  readonly topSpacerHeight: number;
  /** Height of spacer below visible lines */
  readonly bottomSpacerHeight: number;
  /** Token cache for efficient tokenization */
  readonly tokenCache: TokenCache;
  /** Line height in pixels */
  readonly lineHeight: number;
  /** Padding in pixels */
  readonly padding: number;
  /** Container width (for canvas/svg sizing) */
  readonly width?: number;
  /** Container height (for canvas/svg sizing) */
  readonly height?: number;
  /** Function to measure text width (for variable-width character support) */
  readonly measureText?: MeasureTextFn;

  // === Rendering options ===

  /** Show line numbers */
  readonly showLineNumbers?: boolean;
  /** Line number gutter width in pixels */
  readonly lineNumberWidth?: number;
  /** Highlight ranges (selection, search matches) */
  readonly highlights?: readonly HighlightRange[];
  /** Cursor state */
  readonly cursor?: CursorState;
  /** Token style map for syntax highlighting */
  readonly tokenStyles?: TokenStyleMap;
  /** Font family */
  readonly fontFamily?: string;
  /** Font size in pixels */
  readonly fontSize?: number;
  /**
   * Line offsets for style-aware positioning (optional).
   * lineOffsets[i] = character offset where line i starts.
   * Required for TextEditor with variable font styles.
   */
  readonly lineOffsets?: readonly number[];
};

/**
 * Code renderer component type.
 */
export type RendererComponent = (props: RendererProps) => ReactNode;

// =============================================================================
// Line Highlight
// =============================================================================

/**
 * Highlight segment within a single line.
 */
export type LineHighlight = {
  readonly startColumn: number;
  readonly endColumn: number;
  readonly type: HighlightType;
};

// =============================================================================
// Constants
// =============================================================================

/** Default line number width */
export const DEFAULT_LINE_NUMBER_WIDTH = 48;

/** Default font family */
export const DEFAULT_FONT_FAMILY = "'Consolas', 'Monaco', 'Courier New', monospace";

/** Default font size */
export const DEFAULT_FONT_SIZE = 13;
