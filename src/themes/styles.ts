/**
 * @file Style constants for react-editor-ui components
 *
 * All style values are generated from theme tokens with CSS variable fallbacks.
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

import { cssVar } from "./cssVar";

// ========================================
// COLORS
// ========================================

/**
 * Primary colors - used for interactive elements
 */
export const COLOR_PRIMARY = cssVar("color-primary");
export const COLOR_PRIMARY_HOVER = cssVar("color-primary-hover");
export const COLOR_PRIMARY_ACTIVE = cssVar("color-primary-active");

/**
 * Surface colors - backgrounds (Light theme default)
 */
export const COLOR_SURFACE = cssVar("color-surface");
export const COLOR_SURFACE_RAISED = cssVar("color-surface-raised");
export const COLOR_SURFACE_OVERLAY = cssVar("color-surface-overlay");

/**
 * Text colors (Light theme default)
 */
export const COLOR_TEXT = cssVar("color-text");
export const COLOR_TEXT_MUTED = cssVar("color-text-muted");
export const COLOR_TEXT_DISABLED = cssVar("color-text-disabled");
export const COLOR_TEXT_ON_EMPHASIS = cssVar("color-text-on-emphasis");
export const COLOR_TEXT_ON_WARNING = cssVar("color-text-on-warning");

/**
 * Border colors (Light theme default)
 */
export const COLOR_BORDER = cssVar("color-border");
export const COLOR_BORDER_FOCUS = cssVar("color-border-focus");

/**
 * State colors
 */
export const COLOR_SUCCESS = cssVar("color-success");
export const COLOR_WARNING = cssVar("color-warning");
export const COLOR_ERROR = cssVar("color-error");

/**
 * Error state colors (backgrounds and borders)
 */
export const COLOR_ERROR_BG = cssVar("color-error-bg");
export const COLOR_ERROR_BG_HOVER = cssVar("color-error-bg-hover");
export const COLOR_ERROR_BG_ACTIVE = cssVar("color-error-bg-active");
export const COLOR_ERROR_BORDER = cssVar("color-error-border");
export const COLOR_ERROR_BORDER_HOVER = cssVar("color-error-border-hover");

/**
 * Backdrop / overlay
 */
export const COLOR_BACKDROP = cssVar("color-backdrop");

// ========================================
// SPACING
// ========================================

export const SPACE_2XS = cssVar("space-2xs");
export const SPACE_XS = cssVar("space-xs");
export const SPACE_SM = cssVar("space-sm");
export const SPACE_MD = cssVar("space-md");
export const SPACE_LG = cssVar("space-lg");
export const SPACE_XL = cssVar("space-xl");
export const SPACE_2XL = cssVar("space-2xl");

// ========================================
// SIZING
// ========================================

/**
 * Font sizes (Figma-style compact)
 */
export const SIZE_FONT_XS = cssVar("size-font-xs");
export const SIZE_FONT_SM = cssVar("size-font-sm");
export const SIZE_FONT_MD = cssVar("size-font-md");
export const SIZE_FONT_LG = cssVar("size-font-lg");

/**
 * Font weights
 */
export const FONT_WEIGHT_NORMAL = cssVar("font-weight-normal");
export const FONT_WEIGHT_MEDIUM = cssVar("font-weight-medium");
export const FONT_WEIGHT_SEMIBOLD = cssVar("font-weight-semibold");
export const FONT_WEIGHT_BOLD = cssVar("font-weight-bold");

/**
 * Icon sizes (Figma-style compact)
 */
export const SIZE_ICON_SM = cssVar("size-icon-sm");
export const SIZE_ICON_MD = cssVar("size-icon-md");
export const SIZE_ICON_LG = cssVar("size-icon-lg");
export const SIZE_ICON_XL = cssVar("size-icon-xl");

/**
 * Component heights (Figma-style compact)
 */
export const SIZE_HEIGHT_XS = cssVar("size-height-xs");
export const SIZE_HEIGHT_SM = cssVar("size-height-sm");
export const SIZE_HEIGHT_MD = cssVar("size-height-md");
export const SIZE_HEIGHT_LG = cssVar("size-height-lg");
export const SIZE_HEIGHT_XL = cssVar("size-height-xl");

/**
 * Badge heights
 */
export const SIZE_BADGE_SM = cssVar("size-badge-sm");
export const SIZE_BADGE_MD = cssVar("size-badge-md");

// ========================================
// BORDER RADIUS
// ========================================

export const RADIUS_SM = cssVar("radius-sm");
export const RADIUS_MD = cssVar("radius-md");
export const RADIUS_LG = cssVar("radius-lg");
export const RADIUS_FULL = cssVar("radius-full");

// ========================================
// SHADOWS (Light theme default)
// ========================================

export const SHADOW_SM = cssVar("shadow-sm");
export const SHADOW_MD = cssVar("shadow-md");
export const SHADOW_LG = cssVar("shadow-lg");
export const SHADOW_THUMB = cssVar("shadow-thumb");

// ========================================
// Z-INDEX
// ========================================

export const Z_DROPDOWN = cssVar("z-dropdown");
export const Z_STICKY = cssVar("z-sticky");
export const Z_MODAL = cssVar("z-modal");
export const Z_POPOVER = cssVar("z-popover");
export const Z_TOOLTIP = cssVar("z-tooltip");

// ========================================
// TRANSITIONS
// ========================================

export const DURATION_FAST = cssVar("duration-fast");
export const DURATION_NORMAL = cssVar("duration-normal");
export const DURATION_SLOW = cssVar("duration-slow");

export const EASING_DEFAULT = cssVar("easing-default");
export const EASING_IN = cssVar("easing-in");
export const EASING_OUT = cssVar("easing-out");

// ========================================
// INTERACTIVE STATES (Light theme default)
// ========================================

export const COLOR_HOVER = cssVar("color-hover");
export const COLOR_ACTIVE = cssVar("color-active");
export const COLOR_SELECTED = cssVar("color-selected");
export const COLOR_SELECTED_SUBTLE = cssVar("color-selected-subtle");
export const COLOR_DROP_TARGET = cssVar("color-drop-target");
export const COLOR_FOCUS_RING = cssVar("color-focus-ring");

// ========================================
// ICON COLORS (Light theme default)
// ========================================

export const COLOR_ICON = cssVar("color-icon");
export const COLOR_ICON_HOVER = cssVar("color-icon-hover");
export const COLOR_ICON_ACTIVE = cssVar("color-icon-active");

// ========================================
// COMPONENT-SPECIFIC SIZES
// ========================================

export const SIZE_TOOLBAR_HEIGHT = cssVar("size-toolbar-height");
export const SIZE_TABBAR_HEIGHT = cssVar("size-tabbar-height");
export const SIZE_STATUSBAR_HEIGHT = cssVar("size-statusbar-height");
export const SIZE_PANEL_HEADER_HEIGHT = cssVar("size-panel-header-height");
export const SIZE_TREE_INDENT = cssVar("size-tree-indent");
export const SIZE_PROPERTY_LABEL = cssVar("size-property-label");

/**
 * Checkbox sizes (Figma-style compact)
 */
export const SIZE_CHECKBOX_SM = cssVar("size-checkbox-sm");
export const SIZE_CHECKBOX_MD = cssVar("size-checkbox-md");

/**
 * Color swatch sizes (Figma-style compact)
 */
export const SIZE_COLOR_SWATCH_SM = cssVar("size-color-swatch-sm");
export const SIZE_COLOR_SWATCH_MD = cssVar("size-color-swatch-md");
export const SIZE_COLOR_SWATCH_LG = cssVar("size-color-swatch-lg");

/**
 * Thumbnail sizes (for library browser, asset panels)
 */
export const SIZE_THUMBNAIL_SM = cssVar("size-thumbnail-sm");
export const SIZE_THUMBNAIL_MD = cssVar("size-thumbnail-md");
export const SIZE_THUMBNAIL_LG = cssVar("size-thumbnail-lg");

// ========================================
// DIVIDER (Light theme default)
// ========================================

export const COLOR_DIVIDER = cssVar("color-divider");
export const SIZE_DIVIDER_WIDTH = cssVar("size-divider-width");

// ========================================
// INPUT (Light theme default)
// ========================================

export const COLOR_INPUT_BG = cssVar("color-input-bg");
export const COLOR_INPUT_BORDER = cssVar("color-input-border");
export const COLOR_INPUT_BORDER_FOCUS = cssVar("color-input-border-focus");

// ========================================
// LOG LEVELS
// ========================================

export const COLOR_LOG_INFO = cssVar("color-log-info");
export const COLOR_LOG_WARNING = cssVar("color-log-warning");
export const COLOR_LOG_ERROR = cssVar("color-log-error");
export const COLOR_LOG_DEBUG = cssVar("color-log-debug");
export const COLOR_LOG_SUCCESS = cssVar("color-log-success");

// ========================================
// TOOLTIP
// ========================================

export const COLOR_TOOLTIP_BG = cssVar("tooltip-bg");
export const COLOR_TOOLTIP_TEXT = cssVar("tooltip-color");

// ========================================
// CANVAS
// ========================================

export const COLOR_CANVAS_RULER_BG = cssVar("canvas-ruler-bg");
export const COLOR_CANVAS_RULER_TEXT = cssVar("canvas-ruler-text");
export const COLOR_CANVAS_RULER_TICK = cssVar("canvas-ruler-tick");
export const COLOR_CANVAS_RULER_INDICATOR = cssVar("canvas-ruler-indicator");
export const COLOR_CANVAS_GRID_MAJOR = cssVar("canvas-grid-major");
export const COLOR_CANVAS_GRID_MINOR = cssVar("canvas-grid-minor");
export const COLOR_CANVAS_GRID_ORIGIN = cssVar("canvas-grid-origin");
export const COLOR_CANVAS_GUIDE = cssVar("canvas-guide");
export const COLOR_CANVAS_CHECKER_LIGHT = cssVar("canvas-checker-light");
export const COLOR_CANVAS_CHECKER_DARK = cssVar("canvas-checker-dark");
export const SIZE_CANVAS_RULER = cssVar("canvas-ruler-size");

// ========================================
// BOUNDING BOX
// ========================================

export const COLOR_BOUNDING_BOX_STROKE = cssVar("bounding-box-stroke");
export const COLOR_BOUNDING_BOX_HANDLE_FILL = cssVar("bounding-box-handle-fill");
export const COLOR_BOUNDING_BOX_HANDLE_STROKE = cssVar("bounding-box-handle-stroke");
export const COLOR_BOUNDING_BOX_LABEL_BG = cssVar("bounding-box-label-bg");
export const COLOR_BOUNDING_BOX_LABEL_TEXT = cssVar("bounding-box-label-text");
export const SIZE_BOUNDING_BOX_HANDLE = cssVar("bounding-box-handle-size");
export const SIZE_BOUNDING_BOX_STROKE_WIDTH = cssVar("bounding-box-stroke-width");

// ========================================
// LAYER ITEM SIZES
// ========================================

export const SIZE_ACTION_BUTTON = cssVar("size-action-button");
export const SIZE_EXPANDER = cssVar("size-expander");
export const SIZE_CLOSE_BUTTON = cssVar("size-close-button");
export const SIZE_DIRTY_INDICATOR = cssVar("size-dirty-indicator");
export const SIZE_DRAG_HANDLE = cssVar("size-drag-handle");
export const SIZE_LAYER_ITEM_HEIGHT = cssVar("size-layer-item-height");

// ========================================
// BOX MODEL EDITOR
// ========================================

export const COLOR_BOX_MODEL_MARGIN_BG = cssVar("box-model-margin-bg");
export const COLOR_BOX_MODEL_MARGIN_STROKE = cssVar("box-model-margin-stroke");
export const COLOR_BOX_MODEL_BORDER_BG = cssVar("box-model-border-bg");
export const COLOR_BOX_MODEL_BORDER_STROKE = cssVar("box-model-border-stroke");
export const COLOR_BOX_MODEL_PADDING_BG = cssVar("box-model-padding-bg");
export const COLOR_BOX_MODEL_PADDING_STROKE = cssVar("box-model-padding-stroke");
export const COLOR_BOX_MODEL_CONTENT_BG = cssVar("box-model-content-bg");
export const COLOR_BOX_MODEL_CONTENT_STROKE = cssVar("box-model-content-stroke");
export const COLOR_BOX_MODEL_BORDER = cssVar("box-model-border");
export const COLOR_BOX_MODEL_HANDLE = cssVar("box-model-handle");
export const COLOR_BOX_MODEL_HANDLE_HOVER = cssVar("box-model-handle-hover");
