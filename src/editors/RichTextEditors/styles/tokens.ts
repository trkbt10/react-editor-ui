/**
 * @file Editor Style Tokens
 *
 * CSS variable definitions specific to Editor components.
 * All variables use the unified prefix: --rei-editor-*
 */

import { CSS_VAR_PREFIX } from "../../../themes/cssVar";

// =============================================================================
// Editor Prefix
// =============================================================================

const EDITOR_PREFIX = `${CSS_VAR_PREFIX}-editor`;

// =============================================================================
// Background Colors
// =============================================================================

/** Editor background color */
export const EDITOR_BG = `var(--${EDITOR_PREFIX}-bg, var(--${CSS_VAR_PREFIX}-color-surface, #ffffff))`;

/** Line number background color */
export const EDITOR_LINE_NUMBER_BG = `var(--${EDITOR_PREFIX}-line-number-bg, #f8f9fa)`;

/** Line number text color */
export const EDITOR_LINE_NUMBER_COLOR = `var(--${EDITOR_PREFIX}-line-number-color, #9aa0a6)`;

/** Line number border color */
export const EDITOR_LINE_NUMBER_BORDER = `var(--${EDITOR_PREFIX}-line-number-border, rgba(0, 0, 0, 0.08))`;

// =============================================================================
// Selection & Highlight Colors
// =============================================================================

/** Selection background color */
export const EDITOR_SELECTION_BG = `var(--${EDITOR_PREFIX}-selection-bg, rgba(51, 144, 255, 0.3))`;

/** Search match background color */
export const EDITOR_MATCH_BG = `var(--${EDITOR_PREFIX}-match-bg, rgba(255, 213, 0, 0.4))`;

/** Current search match background color */
export const EDITOR_CURRENT_MATCH_BG = `var(--${EDITOR_PREFIX}-current-match-bg, rgba(255, 140, 0, 0.6))`;

/** IME composition background color */
export const EDITOR_COMPOSITION_BG = `var(--${EDITOR_PREFIX}-composition-bg, rgba(100, 100, 255, 0.2))`;

// =============================================================================
// Cursor
// =============================================================================

/** Cursor color */
export const EDITOR_CURSOR_COLOR = `var(--${EDITOR_PREFIX}-cursor-color, var(--${CSS_VAR_PREFIX}-color-text, #000000))`;

/** Cursor width */
export const EDITOR_CURSOR_WIDTH = `var(--${EDITOR_PREFIX}-cursor-width, 2px)`;

// =============================================================================
// Typography
// =============================================================================

/** Editor font family */
export const EDITOR_FONT_FAMILY = `var(--${EDITOR_PREFIX}-font-family, 'Consolas', 'Monaco', 'Courier New', monospace)`;

/** Editor font size */
export const EDITOR_FONT_SIZE = `var(--${EDITOR_PREFIX}-font-size, 13px)`;

/** Editor line height */
export const EDITOR_LINE_HEIGHT = `var(--${EDITOR_PREFIX}-line-height, 21px)`;

// =============================================================================
// Layout
// =============================================================================

/** Line number gutter width */
export const EDITOR_LINE_NUMBER_WIDTH = `var(--${EDITOR_PREFIX}-line-number-width, 48px)`;

/** Editor padding */
export const EDITOR_PADDING = `var(--${EDITOR_PREFIX}-padding, 8px)`;

// =============================================================================
// Syntax Highlighting Colors
// =============================================================================

/** Keyword color (e.g., if, else, for) */
export const EDITOR_KEYWORD_COLOR = `var(--${EDITOR_PREFIX}-keyword, #0000ff)`;

/** Type color (e.g., String, Integer) */
export const EDITOR_TYPE_COLOR = `var(--${EDITOR_PREFIX}-type, #2b91af)`;

/** Builtin function color */
export const EDITOR_BUILTIN_COLOR = `var(--${EDITOR_PREFIX}-builtin, #795e26)`;

/** String literal color */
export const EDITOR_STRING_COLOR = `var(--${EDITOR_PREFIX}-string, #a31515)`;

/** Comment color */
export const EDITOR_COMMENT_COLOR = `var(--${EDITOR_PREFIX}-comment, #008000)`;

/** Number literal color */
export const EDITOR_NUMBER_COLOR = `var(--${EDITOR_PREFIX}-number, #098658)`;

/** Operator color */
export const EDITOR_OPERATOR_COLOR = `var(--${EDITOR_PREFIX}-operator, #000000)`;

/** Identifier color */
export const EDITOR_IDENTIFIER_COLOR = `var(--${EDITOR_PREFIX}-identifier, #000000)`;

/** Punctuation color */
export const EDITOR_PUNCTUATION_COLOR = `var(--${EDITOR_PREFIX}-punctuation, #000000)`;

// =============================================================================
// Highlight Type to Color Map
// =============================================================================

/**
 * Map of highlight types to their background colors (CSS variables).
 * Use HIGHLIGHT_COLORS_RAW for Canvas rendering.
 */
export const HIGHLIGHT_COLORS = {
  selection: EDITOR_SELECTION_BG,
  match: EDITOR_MATCH_BG,
  currentMatch: EDITOR_CURRENT_MATCH_BG,
  composition: EDITOR_COMPOSITION_BG,
} as const;

// =============================================================================
// Raw Color Values (for Canvas rendering)
// =============================================================================

/** Line number background (raw) */
export const EDITOR_LINE_NUMBER_BG_RAW = "#f8f9fa";

/** Line number text color (raw) */
export const EDITOR_LINE_NUMBER_COLOR_RAW = "#9aa0a6";

/** Line number border color (raw) */
export const EDITOR_LINE_NUMBER_BORDER_RAW = "rgba(0, 0, 0, 0.08)";

/** Cursor color (raw) */
export const EDITOR_CURSOR_COLOR_RAW = "#000000";

/** Selection background (raw) */
export const EDITOR_SELECTION_BG_RAW = "rgba(51, 144, 255, 0.3)";

/** Search match background (raw) */
export const EDITOR_MATCH_BG_RAW = "rgba(255, 213, 0, 0.4)";

/** Current match background (raw) */
export const EDITOR_CURRENT_MATCH_BG_RAW = "rgba(255, 140, 0, 0.6)";

/** Composition background (raw) */
export const EDITOR_COMPOSITION_BG_RAW = "rgba(100, 100, 255, 0.2)";

// =============================================================================
// Editor Defaults (Single Source of Truth)
// =============================================================================

/**
 * All numeric defaults for editor configuration.
 * This is the Single Source of Truth - all other files should import from here.
 */
export const EDITOR_DEFAULTS = {
  // Layout
  /** Padding from container edge to content (pixels) */
  PADDING_PX: 8,
  /** Line height in pixels */
  LINE_HEIGHT_PX: 21,
  /** Font size in pixels */
  FONT_SIZE_PX: 13,
  /** Character width for monospace font (pixels) */
  CHAR_WIDTH_PX: 7.8,
  /** Line number gutter width (pixels) */
  LINE_NUMBER_WIDTH_PX: 48,

  // Behavior
  /** Tab size in spaces */
  TAB_SIZE: 4,
  /** Number of extra lines to render above/below viewport (overscan) */
  OVERSCAN: 5,

  // Rendering
  /** Vertical baseline ratio for text (0.75 = 75% from top) */
  TEXT_BASELINE_RATIO: 0.75,
  /** Right margin for line numbers (pixels) */
  LINE_NUMBER_RIGHT_MARGIN: 8,

  // Cache
  /** Maximum cache size for measurement/viewport calculations */
  MAX_CACHE_SIZE: 2000,

  // History
  /** Maximum history entries for undo/redo */
  MAX_HISTORY: 100,
  /** Debounce delay for history entries (milliseconds) */
  HISTORY_DEBOUNCE_MS: 300,
} as const;

