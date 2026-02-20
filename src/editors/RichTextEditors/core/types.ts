/**
 * @file Editor Core Types
 *
 * Common type definitions for the Editor component.
 */


// =============================================================================
// Position Types
// =============================================================================

/**
 * Cursor position (1-based).
 */
export type CursorPosition = {
  /** Line number (1-based) */
  readonly line: number;
  /** Column number (1-based) */
  readonly column: number;
};

/**
 * Selection range.
 */
export type SelectionRange = {
  /** Start position */
  readonly start: CursorPosition;
  /** End position */
  readonly end: CursorPosition;
};

// =============================================================================
// IME Composition
// =============================================================================

/**
 * IME composition state.
 *
 * During composition:
 * - `baseValue` holds the text before IME started (frozen)
 * - `text` holds the current IME input
 * - Display text = baseValue.slice(0, startOffset) + text + baseValue.slice(startOffset + replacedLength)
 * - Styles are applied to baseValue, not display text (composition text has no style)
 */
export type CompositionState = {
  /** Whether currently in IME composition mode */
  readonly isComposing: boolean;
  /** Temporary composition text (current IME input) */
  readonly text: string;
  /** Offset where composition started in the base value */
  readonly startOffset: number;
  /** Length of text that was selected when composition started (will be replaced) */
  readonly replacedLength: number;
  /** The frozen value at composition start (used to compute display text) */
  readonly baseValue: string;
};

/**
 * Initial composition state.
 */
export const INITIAL_COMPOSITION_STATE: CompositionState = {
  isComposing: false,
  text: "",
  startOffset: 0,
  replacedLength: 0,
  baseValue: "",
};

// =============================================================================
// Display Text Utilities
// =============================================================================

/**
 * Compute the display text during IME composition.
 *
 * During IME input, the visual display should show:
 * baseValue with composition text inserted at startOffset.
 *
 * Display text = baseValue.slice(0, startOffset) + text + baseValue.slice(startOffset + replacedLength)
 *
 * @param value - The base value (document text, not containing IME text)
 * @param composition - Current composition state
 * @returns The text to display (with IME composition text inserted)
 */
export function computeDisplayText(value: string, composition: CompositionState): string {
  if (!composition.isComposing) {
    return value;
  }

  const { baseValue, startOffset, replacedLength, text } = composition;
  // Use baseValue for display text calculation (this is the frozen value at composition start)
  return (
    baseValue.slice(0, startOffset) +
    text +
    baseValue.slice(startOffset + replacedLength)
  );
}

/**
 * Compute cursor offset in display text during composition.
 *
 * The cursor should be at the end of the composition text.
 *
 * @param composition - Current composition state
 * @returns Cursor offset in display text
 */
export function computeDisplayCursorOffset(composition: CompositionState): number {
  return composition.startOffset + composition.text.length;
}

/**
 * Adjust a style segment for display text during composition.
 *
 * Styles are defined for baseValue offsets. When composition text is inserted,
 * style offsets after the insertion point need to be shifted.
 *
 * @param segment - Original style segment (based on baseValue)
 * @param composition - Current composition state
 * @returns Adjusted segment for display text, or null if segment is inside composition
 */
export function adjustStyleForComposition<T extends { start: number; end: number }>(
  segment: T,
  composition: CompositionState
): T | null {
  if (!composition.isComposing) {
    return segment;
  }

  const { startOffset, replacedLength, text } = composition;
  const compositionEnd = startOffset + replacedLength;
  const shift = text.length - replacedLength;

  // Segment is entirely before composition - no change
  if (segment.end <= startOffset) {
    return segment;
  }

  // Segment is entirely inside composition range - skip it
  if (segment.start >= startOffset && segment.end <= compositionEnd) {
    return null;
  }

  // Segment is entirely after composition - shift it
  if (segment.start >= compositionEnd) {
    return {
      ...segment,
      start: segment.start + shift,
      end: segment.end + shift,
    };
  }

  // Segment overlaps with composition start - truncate at composition start
  if (segment.start < startOffset && segment.end > startOffset && segment.end <= compositionEnd) {
    return {
      ...segment,
      end: startOffset,
    };
  }

  // Segment overlaps with composition end - start after composition
  if (segment.start >= startOffset && segment.start < compositionEnd && segment.end > compositionEnd) {
    return {
      ...segment,
      start: startOffset + text.length,
      end: segment.end + shift,
    };
  }

  // Segment spans entire composition - split into two parts (return first part)
  // Note: This is a simplification; ideally we'd return both parts
  if (segment.start < startOffset && segment.end > compositionEnd) {
    return {
      ...segment,
      end: startOffset,
    };
  }

  return segment;
}

// =============================================================================
// Virtual Scroll
// =============================================================================

/**
 * Virtual scroll state.
 */
export type VirtualScrollState = {
  /** Current scroll position from top */
  readonly scrollTop: number;
  /** Viewport height in pixels */
  readonly viewportHeight: number;
  /** Range of visible line indices (0-based, end is exclusive) */
  readonly visibleRange: { readonly start: number; readonly end: number };
  /** Height of spacer above visible lines */
  readonly topSpacerHeight: number;
  /** Height of spacer below visible lines */
  readonly bottomSpacerHeight: number;
  /** Total content height */
  readonly totalHeight: number;
};

// =============================================================================
// Line Index
// =============================================================================

/**
 * Line index providing efficient offset-to-line-column conversion.
 */
export type LineIndex = {
  /** Array of lines (cached split result) */
  readonly lines: readonly string[];
  /** Start offset of each line (for binary search) */
  readonly lineOffsets: readonly number[];
  /** Convert flat offset to line/column (1-based) */
  readonly getLineAtOffset: (offset: number) => CursorPosition;
  /** Convert line/column (1-based) to flat offset */
  readonly getOffsetAtLineColumn: (line: number, column: number) => number;
};

// =============================================================================
// Font Metrics
// =============================================================================

/**
 * Font metrics for text measurement.
 */
export type FontMetrics = {
  /** Whether measurement is ready (element is mounted) */
  readonly isReady: boolean;
  /** Width of a half-width character (ASCII) */
  readonly charWidth: number;
  /** Width of a full-width character (CJK, etc.) */
  readonly fullWidthCharWidth: number;
  /** Line height in pixels */
  readonly lineHeight: number;
  /**
   * Measure the width of a specific string.
   * @throws Error if called when isReady is false
   */
  readonly measureText: (text: string) => number;
  /** Get cursor X position for a given column in a line */
  readonly getColumnX: (line: string, column: number) => number;
};

// =============================================================================
// Editor Configuration
// =============================================================================

/**
 * Editor configuration.
 */
export type EditorConfig = {
  /** Line height in pixels */
  readonly lineHeight: number;
  /** Font size in pixels */
  readonly fontSize: number;
  /** Font family */
  readonly fontFamily: string;
  /** Tab size in spaces */
  readonly tabSize: number;
  /** Number of extra lines to render above/below viewport (overscan) */
  readonly overscan: number;
};

import { EDITOR_DEFAULTS, EDITOR_FONT_FAMILY } from "../styles/tokens";

/**
 * Default editor configuration.
 * Values are derived from EDITOR_DEFAULTS (Single Source of Truth).
 */
export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  lineHeight: EDITOR_DEFAULTS.LINE_HEIGHT_PX,
  fontSize: EDITOR_DEFAULTS.FONT_SIZE_PX,
  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
  tabSize: EDITOR_DEFAULTS.TAB_SIZE,
  overscan: EDITOR_DEFAULTS.OVERSCAN,
};

// =============================================================================
// Cursor Coordinates
// =============================================================================

/**
 * Visual cursor coordinates.
 */
export type CursorCoordinates = {
  readonly x: number;
  readonly y: number;
  readonly height: number;
};

/**
 * Visual selection rectangle (for a single line).
 */
export type SelectionRect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/**
 * Text measurement function type.
 */
export type MeasureTextFn = (text: string) => number;

// =============================================================================
// History
// =============================================================================

/**
 * History entry.
 */
export type HistoryEntry<T> = {
  readonly state: T;
  readonly cursorOffset: number;
};

/**
 * History state.
 */
export type HistoryState<T> = {
  readonly past: readonly HistoryEntry<T>[];
  readonly present: HistoryEntry<T>;
  readonly future: readonly HistoryEntry<T>[];
};

// =============================================================================
// Highlight
// =============================================================================

/**
 * Highlight type for selection, search matches, etc.
 */
export type HighlightType = "selection" | "match" | "currentMatch" | "composition";

/**
 * Highlight range with line/column positions.
 */
export type HighlightRange = {
  readonly startLine: number;
  readonly startColumn: number;
  readonly endLine: number;
  readonly endColumn: number;
  readonly type: HighlightType;
};

// =============================================================================
// Cursor State
// =============================================================================

/**
 * Cursor state for rendering.
 */
export type CursorState = {
  readonly line: number;
  readonly column: number;
  readonly visible: boolean;
  readonly blinking: boolean;
};

// =============================================================================
// Style Types
// =============================================================================

/**
 * Style segment for rich text.
 */
export type TextStyleSegment = {
  readonly start: number;
  readonly end: number;
  readonly style: TextStyle;
};

/**
 * Text style properties.
 */
export type TextStyle = {
  readonly fontFamily?: string;
  readonly fontSize?: string;
  readonly fontWeight?: string;
  readonly fontStyle?: "normal" | "italic";
  readonly textDecoration?: "none" | "underline" | "line-through";
  readonly color?: string;
};
