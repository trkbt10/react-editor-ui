/**
 * @file Block Layout Index
 *
 * Pure functions for building and querying block-aware layout indices.
 * Handles variable line heights from block types (headings, code blocks, etc.).
 *
 * BlockLayoutIndex is the Single Source of Truth for layout calculations.
 */

import type { BlockDocument, BlockTypeStyleMap } from "../block/blockDocument";
import { getBlockTypeStyle } from "../block/blockDocument";
import type { BlockLayoutIndex, LayoutConfig, LineLayout } from "./types";

// =============================================================================
// Build Functions
// =============================================================================

/**
 * Options for building a BlockLayoutIndex.
 */
export type BuildBlockLayoutIndexOptions = {
  /** The block document */
  readonly document: BlockDocument;
  /** Layout configuration (padding, baseLineHeight) */
  readonly config: LayoutConfig;
  /** Optional block type style overrides */
  readonly blockTypeStyles?: BlockTypeStyleMap;
};

/**
 * Build a BlockLayoutIndex from a document.
 *
 * Precomputes Y positions for each line considering block type font size multipliers.
 * This enables accurate mouse-to-cursor conversion in documents with mixed block types.
 *
 * The resulting BlockLayoutIndex is the Single Source of Truth for:
 * - Line positions and heights
 * - Content padding
 * - Base line height
 *
 * @param options - Build options including document and layout config
 * @returns BlockLayoutIndex with precomputed line positions and layout config
 *
 * @example
 * ```typescript
 * const doc = createBlockDocument("# Heading\nParagraph");
 * const layoutIndex = buildBlockLayoutIndex({
 *   document: doc,
 *   config: { paddingLeft: 8, paddingTop: 8, baseLineHeight: 21 },
 * });
 * // layoutIndex.lines[0].height = 21 * 1.75 (heading)
 * // layoutIndex.lines[1].height = 21 (paragraph)
 * // layoutIndex.config is the SSoT for position calculations
 * ```
 */
export function buildBlockLayoutIndex(options: BuildBlockLayoutIndexOptions): BlockLayoutIndex {
  const { document, config, blockTypeStyles } = options;

  const lines: LineLayout[] = [];
  const state = { y: 0, charOffset: 0 };

  for (let blockIndex = 0; blockIndex < document.blocks.length; blockIndex++) {
    const block = document.blocks[blockIndex];
    const blockStyle = getBlockTypeStyle(block.type, blockTypeStyles);
    const fontSizeMultiplier = blockStyle?.fontSizeMultiplier ?? 1;
    const lineHeight = config.baseLineHeight * fontSizeMultiplier;

    // Each block is a single line in the current model
    // (blocks are separated by newlines, each block = 1 line)
    const lineIndex = blockIndex;

    lines.push({
      index: lineIndex,
      blockIndex,
      y: state.y,
      height: lineHeight,
      charOffset: state.charOffset,
    });

    state.y += lineHeight;
    // +1 for newline between blocks (except last block)
    state.charOffset += block.content.length + (blockIndex < document.blocks.length - 1 ? 1 : 0);
  }

  // Handle empty document
  if (lines.length === 0) {
    lines.push({
      index: 0,
      blockIndex: 0,
      y: 0,
      height: config.baseLineHeight,
      charOffset: 0,
    });
  }

  return {
    totalHeight: state.y,
    lines,
    config,
  };
}

// =============================================================================
// Query Functions
// =============================================================================

/**
 * Find the line index at a given Y coordinate using binary search.
 *
 * @param layoutIndex - The precomputed layout index
 * @param y - Y coordinate (relative to document top, after scroll adjustment)
 * @returns Line index (0-based), clamped to valid range
 *
 * Time complexity: O(log n)
 *
 * @example
 * ```typescript
 * const lineIndex = findLineAtY(layoutIndex, 50);
 * ```
 */
export function findLineAtY(layoutIndex: BlockLayoutIndex, y: number): number {
  const { lines } = layoutIndex;

  if (lines.length === 0) {
    return 0;
  }

  // Handle edge cases
  if (y <= 0) {
    return 0;
  }

  if (y >= layoutIndex.totalHeight) {
    return lines.length - 1;
  }

  // Binary search for the line containing Y
  let lo = 0;
  let hi = lines.length - 1;

  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lines[mid].y <= y) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  return lo;
}

/**
 * Get the Y position of a line.
 *
 * @param layoutIndex - The precomputed layout index
 * @param lineIndex - Line index (0-based)
 * @returns Y position in pixels, or 0 if line doesn't exist
 */
export function getLineY(layoutIndex: BlockLayoutIndex, lineIndex: number): number {
  if (lineIndex < 0 || lineIndex >= layoutIndex.lines.length) {
    return 0;
  }
  return layoutIndex.lines[lineIndex].y;
}

/**
 * Get the height of a line.
 *
 * @param layoutIndex - The precomputed layout index
 * @param lineIndex - Line index (0-based)
 * @param defaultHeight - Default height if line doesn't exist
 * @returns Line height in pixels
 */
export function getLineHeight(
  layoutIndex: BlockLayoutIndex,
  lineIndex: number,
  defaultHeight: number
): number {
  if (lineIndex < 0 || lineIndex >= layoutIndex.lines.length) {
    return defaultHeight;
  }
  return layoutIndex.lines[lineIndex].height;
}

/**
 * Get the line layout at a specific index.
 *
 * @param layoutIndex - The precomputed layout index
 * @param lineIndex - Line index (0-based)
 * @returns LineLayout or undefined if out of bounds
 */
export function getLineLayout(
  layoutIndex: BlockLayoutIndex,
  lineIndex: number
): LineLayout | undefined {
  if (lineIndex < 0 || lineIndex >= layoutIndex.lines.length) {
    return undefined;
  }
  return layoutIndex.lines[lineIndex];
}

/**
 * Calculate cumulative height up to (but not including) a line.
 *
 * @param layoutIndex - The precomputed layout index
 * @param lineIndex - Line index (0-based)
 * @returns Cumulative height in pixels
 */
export function getCumulativeHeight(layoutIndex: BlockLayoutIndex, lineIndex: number): number {
  if (lineIndex <= 0) {
    return 0;
  }
  if (lineIndex >= layoutIndex.lines.length) {
    return layoutIndex.totalHeight;
  }
  return layoutIndex.lines[lineIndex].y;
}
