/**
 * @file Block Layout Types
 *
 * Type definitions for block-aware layout calculation.
 * Used for accurate Y coordinate positioning when blocks have different font sizes.
 *
 * BlockLayoutIndex is the Single Source of Truth for all layout-related values:
 * - Line Y positions and heights
 * - Content padding
 * - Base line height
 *
 * This ensures position calculation and rendering use the same values.
 */

import { EDITOR_DEFAULTS } from "../styles/tokens";

// =============================================================================
// Layout Configuration
// =============================================================================

/**
 * Layout configuration for the editor content area.
 *
 * These values define how content is positioned within the editor.
 * All position calculations must use these values from BlockLayoutIndex.
 */
export type LayoutConfig = {
  /** Horizontal padding from container edge to content (pixels) */
  readonly paddingLeft: number;
  /** Vertical padding from container edge to content (pixels) */
  readonly paddingTop: number;
  /** Base line height before font size multiplier (pixels) */
  readonly baseLineHeight: number;
};

// =============================================================================
// Line Layout
// =============================================================================

/**
 * Layout information for a single line.
 *
 * Precomputed from the document structure to enable O(log n) position lookups.
 */
export type LineLayout = {
  /** Line index (0-based) */
  readonly index: number;
  /** Block index this line belongs to */
  readonly blockIndex: number;
  /** Y position from document top (pixels, excludes padding) */
  readonly y: number;
  /** Line height (= baseLineHeight * fontSizeMultiplier) */
  readonly height: number;
  /** Character offset at line start (global document offset) */
  readonly charOffset: number;
};

// =============================================================================
// Block Layout Index
// =============================================================================

/**
 * Precomputed layout index for efficient position calculations.
 *
 * Built once when document structure or styles change.
 * Enables O(log n) Y-to-line conversion even with variable line heights.
 *
 * This is the Single Source of Truth for:
 * - Line positions (y, height)
 * - Content padding (config.paddingLeft, config.paddingTop)
 * - Document dimensions (totalHeight)
 *
 * All position calculations (click-to-cursor, rendering) must use these values.
 */
export type BlockLayoutIndex = {
  /** Total document height in pixels (content only, excludes padding) */
  readonly totalHeight: number;
  /** Layout information for each line */
  readonly lines: readonly LineLayout[];
  /** Layout configuration (Single Source of Truth for padding, lineHeight) */
  readonly config: LayoutConfig;
};

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create a LayoutConfig from base line height.
 *
 * This derives layout configuration from editor configuration,
 * maintaining EDITOR_DEFAULTS as the Single Source of Truth.
 *
 * @param baseLineHeight - Base line height in pixels (defaults to EDITOR_DEFAULTS.LINE_HEIGHT_PX)
 * @param padding - Padding value (defaults to EDITOR_DEFAULTS.PADDING_PX)
 * @returns Layout configuration
 */
export function createLayoutConfig(
  baseLineHeight: number = EDITOR_DEFAULTS.LINE_HEIGHT_PX,
  padding: number = EDITOR_DEFAULTS.PADDING_PX
): LayoutConfig {
  return {
    paddingLeft: padding,
    paddingTop: padding,
    baseLineHeight,
  };
}
