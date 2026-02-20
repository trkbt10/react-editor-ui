/**
 * @file Wrap Layout Types
 *
 * Type definitions for text wrapping and visual line mapping.
 * Enables soft wrap (automatic) and hard wrap (newline) support.
 *
 * Key concepts:
 * - Logical line: A line in the document (separated by newlines/blocks)
 * - Visual line: A line as rendered (may be multiple per logical line when wrapped)
 * - Wrap point: Position where text wraps to next visual line
 */

// =============================================================================
// Wrap Configuration
// =============================================================================

/**
 * Text wrapping mode configuration.
 */
export type WrapMode = {
  /** Enable automatic wrapping at container/column boundary */
  readonly softWrap: boolean;
  /** Break at word boundaries vs character boundaries (only applies when softWrap=true) */
  readonly wordWrap: boolean;
  /**
   * Column width for wrapping:
   * - 0 = wrap at container width (default)
   * - >0 = wrap at fixed column count (measured in characters)
   */
  readonly wrapColumn: number;
};

/**
 * Default wrap mode (no wrapping).
 */
export const DEFAULT_WRAP_MODE: WrapMode = {
  softWrap: false,
  wordWrap: true,
  wrapColumn: 0,
};

// =============================================================================
// Wrap Point
// =============================================================================

/**
 * A point where text wraps to the next visual line.
 */
export type WrapPoint = {
  /** Character offset within the logical line where wrap occurs */
  readonly offset: number;
  /**
   * Whether this is a soft wrap (automatic) or hard break (explicit newline).
   * - true = soft wrap (text wrapped due to width constraint)
   * - false = hard break (explicit newline character)
   */
  readonly isSoftWrap: boolean;
};

// =============================================================================
// Visual Line
// =============================================================================

/**
 * A visual line in the rendered document.
 *
 * When text wraps, a single logical line produces multiple visual lines.
 * This type represents one visual line segment.
 */
export type VisualLine = {
  /** Global visual line index (0-based, across entire document) */
  readonly visualIndex: number;
  /** Logical line index this visual line belongs to */
  readonly logicalLineIndex: number;
  /** Block index containing this line */
  readonly blockIndex: number;
  /** Start character offset within the logical line content */
  readonly startOffset: number;
  /** End character offset within the logical line content (exclusive) */
  readonly endOffset: number;
  /** Y position from document top (pixels, excludes padding) */
  readonly y: number;
  /** Line height (pixels) */
  readonly height: number;
  /** Whether this visual line was created by soft wrapping */
  readonly isSoftWrapped: boolean;
  /**
   * Index of this visual line within its logical line (0-based).
   * First visual line of a logical line has wrapIndex=0.
   */
  readonly wrapIndex: number;
};

// =============================================================================
// Wrap Layout Index
// =============================================================================

/**
 * Precomputed wrap layout index for efficient position calculations.
 *
 * Built when document content, container width, or wrap mode changes.
 * Enables O(log n) visual line lookup and bidirectional conversion
 * between logical and visual coordinates.
 */
export type WrapLayoutIndex = {
  /** All visual lines in document order */
  readonly visualLines: readonly VisualLine[];
  /** Total document height in pixels (content only, excludes padding) */
  readonly totalHeight: number;
  /** Container width used for wrapping (pixels) */
  readonly containerWidth: number;
  /** Wrap mode used for this index */
  readonly wrapMode: WrapMode;
  /**
   * Fast lookup: logical line index → first visual line index.
   * logicalToVisualStart[i] = index of first visual line for logical line i.
   */
  readonly logicalToVisualStart: readonly number[];
  /**
   * Fast lookup: logical line index → number of visual lines.
   * visualLinesPerLogical[i] = count of visual lines for logical line i.
   */
  readonly visualLinesPerLogical: readonly number[];
};

// =============================================================================
// Coordinate Types
// =============================================================================

/**
 * Position in logical coordinates (document model).
 */
export type LogicalPosition = {
  /** Logical line index (0-based) */
  readonly line: number;
  /** Column within logical line (0-based character offset) */
  readonly column: number;
};

/**
 * Position in visual coordinates (rendered view).
 */
export type VisualPosition = {
  /** Visual line index (0-based, global across document) */
  readonly line: number;
  /** Column within visual line segment (0-based character offset) */
  readonly column: number;
};

// =============================================================================
// Text Measurement
// =============================================================================

/**
 * Function type for measuring text width.
 * Used for calculating wrap points based on container width.
 */
export type MeasureTextFn = (text: string) => number;
