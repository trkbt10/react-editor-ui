/**
 * @file Style constants for react-editor-ui components
 *
 * All style values are defined here with CSS variable fallbacks.
 * Users can override these via CSS variables (--rei-*) or ThemeProvider.
 *
 * DEFAULT: Light theme (white-based)
 * Use ThemeProvider to switch to dark or other themes.
 *
 * All CSS variables use the unified prefix: --rei- (react-editor-ui)
 *
 * @example
 * // In your CSS:
 * :root {
 *   --rei-color-primary: #ff0000;
 * }
 *
 * @example
 * // Or use ThemeProvider:
 * <ThemeProvider theme="dark">
 *   <App />
 * </ThemeProvider>
 */

// ========================================
// CSS VARIABLE PREFIX
// ========================================

/**
 * Unified CSS variable prefix for all react-editor-ui variables
 * All theme variables use this prefix: --rei-*
 */
export const CSS_VAR_PREFIX = "rei";

// ========================================
// COLORS
// ========================================

/**
 * Primary colors - used for interactive elements
 */
export const COLOR_PRIMARY = "var(--rei-color-primary, #2563eb)";
export const COLOR_PRIMARY_HOVER = "var(--rei-color-primary-hover, #1d4ed8)";
export const COLOR_PRIMARY_ACTIVE = "var(--rei-color-primary-active, #1e40af)";

/**
 * Surface colors - backgrounds (Light theme default)
 */
export const COLOR_SURFACE = "var(--rei-color-surface, #ffffff)";
export const COLOR_SURFACE_RAISED = "var(--rei-color-surface-raised, #f9fafb)";
export const COLOR_SURFACE_OVERLAY = "var(--rei-color-surface-overlay, #f3f4f6)";

/**
 * Text colors (Light theme default)
 */
export const COLOR_TEXT = "var(--rei-color-text, #111827)";
export const COLOR_TEXT_MUTED = "var(--rei-color-text-muted, #6b7280)";
export const COLOR_TEXT_DISABLED = "var(--rei-color-text-disabled, #9ca3af)";

/**
 * Border colors (Light theme default)
 */
export const COLOR_BORDER = "var(--rei-color-border, #e5e7eb)";
export const COLOR_BORDER_FOCUS = "var(--rei-color-border-focus, #2563eb)";

/**
 * State colors
 */
export const COLOR_SUCCESS = "var(--rei-color-success, #16a34a)";
export const COLOR_WARNING = "var(--rei-color-warning, #d97706)";
export const COLOR_ERROR = "var(--rei-color-error, #dc2626)";

/**
 * Error state colors (backgrounds and borders)
 */
export const COLOR_ERROR_BG = "var(--rei-color-error-bg, rgba(239, 68, 68, 0.1))";
export const COLOR_ERROR_BG_HOVER = "var(--rei-color-error-bg-hover, rgba(239, 68, 68, 0.15))";
export const COLOR_ERROR_BG_ACTIVE = "var(--rei-color-error-bg-active, rgba(239, 68, 68, 0.2))";
export const COLOR_ERROR_BORDER = "var(--rei-color-error-border, rgba(239, 68, 68, 0.3))";
export const COLOR_ERROR_BORDER_HOVER = "var(--rei-color-error-border-hover, rgba(239, 68, 68, 0.4))";

/**
 * Backdrop / overlay
 */
export const COLOR_BACKDROP = "var(--rei-color-backdrop, rgba(0, 0, 0, 0.4))";

// ========================================
// SPACING
// ========================================

export const SPACE_XS = "var(--rei-space-xs, 2px)";
export const SPACE_SM = "var(--rei-space-sm, 4px)";
export const SPACE_MD = "var(--rei-space-md, 8px)";
export const SPACE_LG = "var(--rei-space-lg, 12px)";
export const SPACE_XL = "var(--rei-space-xl, 16px)";
export const SPACE_2XL = "var(--rei-space-2xl, 24px)";

// ========================================
// SIZING
// ========================================

/**
 * Font sizes (Figma-style compact)
 */
export const SIZE_FONT_XS = "var(--rei-size-font-xs, 9px)";
export const SIZE_FONT_SM = "var(--rei-size-font-sm, 11px)";
export const SIZE_FONT_MD = "var(--rei-size-font-md, 12px)";
export const SIZE_FONT_LG = "var(--rei-size-font-lg, 14px)";

/**
 * Icon sizes (Figma-style compact)
 */
export const SIZE_ICON_SM = "var(--rei-size-icon-sm, 12px)";
export const SIZE_ICON_MD = "var(--rei-size-icon-md, 14px)";
export const SIZE_ICON_LG = "var(--rei-size-icon-lg, 18px)";
export const SIZE_ICON_XL = "var(--rei-size-icon-xl, 24px)";

/**
 * Component heights (Figma-style compact)
 */
export const SIZE_HEIGHT_SM = "var(--rei-size-height-sm, 22px)";
export const SIZE_HEIGHT_MD = "var(--rei-size-height-md, 28px)";
export const SIZE_HEIGHT_LG = "var(--rei-size-height-lg, 32px)";
export const SIZE_HEIGHT_XL = "var(--rei-size-height-xl, 40px)";

// ========================================
// BORDER RADIUS
// ========================================

export const RADIUS_SM = "var(--rei-radius-sm, 5px)";
export const RADIUS_MD = "var(--rei-radius-md, 6px)";
export const RADIUS_LG = "var(--rei-radius-lg, 10px)";
export const RADIUS_FULL = "var(--rei-radius-full, 9999px)";

// ========================================
// SHADOWS (Light theme default)
// ========================================

export const SHADOW_SM = "var(--rei-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05))";
export const SHADOW_MD = "var(--rei-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.07))";
export const SHADOW_LG = "var(--rei-shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.1))";

// ========================================
// Z-INDEX
// ========================================

export const Z_DROPDOWN = "var(--rei-z-dropdown, 1000)";
export const Z_STICKY = "var(--rei-z-sticky, 1100)";
export const Z_MODAL = "var(--rei-z-modal, 1200)";
export const Z_POPOVER = "var(--rei-z-popover, 1300)";
export const Z_TOOLTIP = "var(--rei-z-tooltip, 1400)";

// ========================================
// TRANSITIONS
// ========================================

export const DURATION_FAST = "var(--rei-duration-fast, 100ms)";
export const DURATION_NORMAL = "var(--rei-duration-normal, 200ms)";
export const DURATION_SLOW = "var(--rei-duration-slow, 300ms)";

export const EASING_DEFAULT = "var(--rei-easing-default, cubic-bezier(0.4, 0, 0.2, 1))";
export const EASING_IN = "var(--rei-easing-in, cubic-bezier(0.4, 0, 1, 1))";
export const EASING_OUT = "var(--rei-easing-out, cubic-bezier(0, 0, 0.2, 1))";

// ========================================
// INTERACTIVE STATES (Light theme default)
// ========================================

export const COLOR_HOVER = "var(--rei-color-hover, rgba(0, 0, 0, 0.04))";
export const COLOR_ACTIVE = "var(--rei-color-active, rgba(0, 0, 0, 0.08))";
export const COLOR_SELECTED = "var(--rei-color-selected, rgba(37, 99, 235, 0.1))";
export const COLOR_SELECTED_SUBTLE = "var(--rei-color-selected-subtle, rgba(37, 99, 235, 0.05))";
export const COLOR_DROP_TARGET = "var(--rei-color-drop-target, rgba(37, 99, 235, 0.15))";
export const COLOR_FOCUS_RING = "var(--rei-color-focus-ring, rgba(37, 99, 235, 0.4))";

// ========================================
// ICON COLORS (Light theme default)
// ========================================

export const COLOR_ICON = "var(--rei-color-icon, #6b7280)";
export const COLOR_ICON_HOVER = "var(--rei-color-icon-hover, #374151)";
export const COLOR_ICON_ACTIVE = "var(--rei-color-icon-active, #2563eb)";

// ========================================
// COMPONENT-SPECIFIC SIZES
// ========================================

export const SIZE_TOOLBAR_HEIGHT = "var(--rei-size-toolbar-height, 44px)";
export const SIZE_TABBAR_HEIGHT = "var(--rei-size-tabbar-height, 32px)";
export const SIZE_STATUSBAR_HEIGHT = "var(--rei-size-statusbar-height, 24px)";
export const SIZE_PANEL_HEADER_HEIGHT = "var(--rei-size-panel-header-height, 40px)";
export const SIZE_TREE_INDENT = "var(--rei-size-tree-indent, 16px)";
export const SIZE_PROPERTY_LABEL = "var(--rei-size-property-label, 100px)";

/**
 * Checkbox sizes (Figma-style compact)
 */
export const SIZE_CHECKBOX_SM = "var(--rei-size-checkbox-sm, 12px)";
export const SIZE_CHECKBOX_MD = "var(--rei-size-checkbox-md, 14px)";

/**
 * Color swatch sizes (Figma-style compact)
 */
export const SIZE_COLOR_SWATCH_SM = "var(--rei-size-color-swatch-sm, 14px)";
export const SIZE_COLOR_SWATCH_MD = "var(--rei-size-color-swatch-md, 18px)";
export const SIZE_COLOR_SWATCH_LG = "var(--rei-size-color-swatch-lg, 22px)";

// ========================================
// DIVIDER (Light theme default)
// ========================================

export const COLOR_DIVIDER = "var(--rei-color-divider, #e5e7eb)";
export const SIZE_DIVIDER_WIDTH = "var(--rei-size-divider-width, 1px)";

// ========================================
// INPUT (Light theme default)
// ========================================

export const COLOR_INPUT_BG = "var(--rei-color-input-bg, #ffffff)";
export const COLOR_INPUT_BORDER = "var(--rei-color-input-border, #d1d5db)";
export const COLOR_INPUT_BORDER_FOCUS = "var(--rei-color-input-border-focus, #2563eb)";

// ========================================
// LOG LEVELS
// ========================================

export const COLOR_LOG_INFO = "var(--rei-color-log-info, #6b7280)";
export const COLOR_LOG_WARNING = "var(--rei-color-log-warning, #d97706)";
export const COLOR_LOG_ERROR = "var(--rei-color-log-error, #dc2626)";
export const COLOR_LOG_DEBUG = "var(--rei-color-log-debug, #7c3aed)";
export const COLOR_LOG_SUCCESS = "var(--rei-color-log-success, #16a34a)";

// ========================================
// TOOLTIP
// ========================================

export const COLOR_TOOLTIP_BG = "var(--rei-tooltip-bg, #1f2937)";
export const COLOR_TOOLTIP_TEXT = "var(--rei-tooltip-color, #ffffff)";

// ========================================
// CANVAS
// ========================================

export const COLOR_CANVAS_RULER_BG = "var(--rei-canvas-ruler-bg, #2d2d2d)";
export const COLOR_CANVAS_RULER_TEXT = "var(--rei-canvas-ruler-text, #9ca3af)";
export const COLOR_CANVAS_RULER_TICK = "var(--rei-canvas-ruler-tick, #6b7280)";
export const COLOR_CANVAS_RULER_INDICATOR = "var(--rei-canvas-ruler-indicator, #ef4444)";
export const COLOR_CANVAS_GRID_MAJOR = "var(--rei-canvas-grid-major, rgba(255, 255, 255, 0.1))";
export const COLOR_CANVAS_GRID_MINOR = "var(--rei-canvas-grid-minor, rgba(255, 255, 255, 0.04))";
export const COLOR_CANVAS_GRID_ORIGIN = "var(--rei-canvas-grid-origin, rgba(59, 130, 246, 0.6))";
export const COLOR_CANVAS_GUIDE = "var(--rei-canvas-guide, rgba(59, 130, 246, 0.8))";
export const COLOR_CANVAS_CHECKER_LIGHT = "var(--rei-canvas-checker-light, #3a3a3a)";
export const COLOR_CANVAS_CHECKER_DARK = "var(--rei-canvas-checker-dark, #2d2d2d)";
export const SIZE_CANVAS_RULER = "var(--rei-canvas-ruler-size, 20px)";
