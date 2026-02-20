/**
 * @file Layout Module
 *
 * Block-aware layout calculation for accurate position conversions.
 *
 * BlockLayoutIndex is the Single Source of Truth for:
 * - Line positions and heights
 * - Content padding (paddingLeft, paddingTop)
 * - Base line height
 */

// Types
export type { LineLayout, BlockLayoutIndex, LayoutConfig } from "./types";
export type { BuildBlockLayoutIndexOptions } from "./BlockLayoutIndex";

// Pure functions
export {
  buildBlockLayoutIndex,
  findLineAtY,
  getLineY,
  getLineHeight,
  getLineLayout,
  getCumulativeHeight,
} from "./BlockLayoutIndex";

// Hooks
export { useBlockLayoutIndex } from "./useBlockLayoutIndex";
