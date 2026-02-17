/**
 * @file Viewport Types
 *
 * Type definitions for viewport-based rendering system.
 * Supports both text editor mode and canvas mode (Figma/Photoshop-like).
 */

// =============================================================================
// Viewport Mode
// =============================================================================

/**
 * Viewport scroll mode.
 * - "text": Traditional text editor scrolling (default)
 * - "canvas": Fixed viewport with overlay scroll (Figma/Photoshop-like)
 */
export type ViewportMode = "text" | "canvas";

/**
 * Viewport configuration for renderer.
 */
export type ViewportConfig = {
  /** Viewport mode */
  readonly mode: ViewportMode;
  /** Whether canvas/svg size is fixed to container */
  readonly fixedViewport: boolean;
};

/**
 * Default viewport configuration (text mode).
 */
export const DEFAULT_VIEWPORT_CONFIG: ViewportConfig = {
  mode: "text",
  fixedViewport: false,
};

// =============================================================================
// Viewport State
// =============================================================================

/**
 * 2D offset in pixels.
 */
export type Offset2D = {
  readonly x: number;
  readonly y: number;
};

/**
 * 2D size in pixels.
 */
export type Size2D = {
  readonly width: number;
  readonly height: number;
};

/**
 * Viewport state representing the "window" into the document.
 */
export type ViewportState = {
  /** Offset into document (pixels from document origin) */
  readonly offset: Offset2D;
  /** Size of viewport (container dimensions) */
  readonly size: Size2D;
};

/**
 * Create initial viewport state.
 */
export const createViewportState = (
  width: number,
  height: number,
  offsetX = 0,
  offsetY = 0
): ViewportState => ({
  offset: { x: offsetX, y: offsetY },
  size: { width, height },
});

// =============================================================================
// Visible Line Item
// =============================================================================

/**
 * Visibility status of a line in viewport.
 */
export type LineVisibility = "full" | "partial-top" | "partial-bottom" | "partial-both";

/**
 * Visible line item with pre-computed positions.
 */
export type VisibleLineItem = {
  /** Line index (0-based) */
  readonly index: number;
  /** Line's X position in document coordinates */
  readonly documentX: number;
  /** Line's Y position in document coordinates */
  readonly documentY: number;
  /** Line's X position in viewport coordinates */
  readonly viewportX: number;
  /** Line's Y position in viewport coordinates */
  readonly viewportY: number;
  /** Line width in pixels */
  readonly width: number;
  /** Line height in pixels */
  readonly height: number;
  /** Visibility status */
  readonly visibility: LineVisibility;
};

/**
 * Visible line range with items.
 */
export type VisibleLineRange = {
  /** Start line index (inclusive) */
  readonly startIndex: number;
  /** End line index (exclusive) */
  readonly endIndex: number;
  /** Visible line items with positions */
  readonly items: readonly VisibleLineItem[];
  /** Total document height */
  readonly documentHeight: number;
  /** Total document width (max line width) */
  readonly documentWidth: number;
};

// =============================================================================
// Document Dimensions
// =============================================================================

/**
 * Document dimensions for viewport calculation.
 */
export type DocumentDimensions = {
  /** Total document width (max line width) */
  readonly width: number;
  /** Total document height (sum of line heights) */
  readonly height: number;
  /** Number of lines */
  readonly lineCount: number;
};
