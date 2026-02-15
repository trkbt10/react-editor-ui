/**
 * @file Style constants for react-editor-ui components
 *
 * All style values are defined here with CSS variable fallbacks.
 * Users can override these via CSS variables (--rei-*).
 *
 * All CSS variables use the unified prefix: --rei- (react-editor-ui)
 *
 * @example
 * // In your CSS:
 * :root {
 *   --rei-color-primary: #ff0000;
 * }
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
export const COLOR_PRIMARY = "var(--rei-color-primary, #2196f3)";
export const COLOR_PRIMARY_HOVER = "var(--rei-color-primary-hover, #1976d2)";
export const COLOR_PRIMARY_ACTIVE = "var(--rei-color-primary-active, #1565c0)";

/**
 * Surface colors - backgrounds
 */
export const COLOR_SURFACE = "var(--rei-color-surface, #1e1f24)";
export const COLOR_SURFACE_RAISED = "var(--rei-color-surface-raised, #2b2d35)";
export const COLOR_SURFACE_OVERLAY = "var(--rei-color-surface-overlay, #3a3d47)";

/**
 * Text colors
 */
export const COLOR_TEXT = "var(--rei-color-text, #e4e6eb)";
export const COLOR_TEXT_MUTED = "var(--rei-color-text-muted, #9ca3af)";
export const COLOR_TEXT_DISABLED = "var(--rei-color-text-disabled, #6b7280)";

/**
 * Border colors
 */
export const COLOR_BORDER = "var(--rei-color-border, rgba(255, 255, 255, 0.1))";
export const COLOR_BORDER_FOCUS = "var(--rei-color-border-focus, #2196f3)";

/**
 * State colors
 */
export const COLOR_SUCCESS = "var(--rei-color-success, #22c55e)";
export const COLOR_WARNING = "var(--rei-color-warning, #f59e0b)";
export const COLOR_ERROR = "var(--rei-color-error, #ef4444)";

/**
 * Backdrop / overlay
 */
export const COLOR_BACKDROP = "var(--rei-color-backdrop, rgba(0, 0, 0, 0.5))";

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
 * Font sizes
 */
export const SIZE_FONT_XS = "var(--rei-size-font-xs, 10px)";
export const SIZE_FONT_SM = "var(--rei-size-font-sm, 12px)";
export const SIZE_FONT_MD = "var(--rei-size-font-md, 14px)";
export const SIZE_FONT_LG = "var(--rei-size-font-lg, 16px)";

/**
 * Icon sizes
 */
export const SIZE_ICON_SM = "var(--rei-size-icon-sm, 14px)";
export const SIZE_ICON_MD = "var(--rei-size-icon-md, 18px)";
export const SIZE_ICON_LG = "var(--rei-size-icon-lg, 24px)";

/**
 * Component heights
 */
export const SIZE_HEIGHT_SM = "var(--rei-size-height-sm, 24px)";
export const SIZE_HEIGHT_MD = "var(--rei-size-height-md, 32px)";
export const SIZE_HEIGHT_LG = "var(--rei-size-height-lg, 40px)";

// ========================================
// BORDER RADIUS
// ========================================

export const RADIUS_SM = "var(--rei-radius-sm, 2px)";
export const RADIUS_MD = "var(--rei-radius-md, 4px)";
export const RADIUS_LG = "var(--rei-radius-lg, 8px)";
export const RADIUS_FULL = "var(--rei-radius-full, 9999px)";

// ========================================
// SHADOWS
// ========================================

export const SHADOW_SM = "var(--rei-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.2))";
export const SHADOW_MD = "var(--rei-shadow-md, 0 4px 8px rgba(0, 0, 0, 0.25))";
export const SHADOW_LG = "var(--rei-shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.3))";

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
