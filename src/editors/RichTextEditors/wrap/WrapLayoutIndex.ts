/**
 * @file Wrap Layout Index
 *
 * Build and query functions for the wrap layout index.
 * Handles mapping between logical coordinates (document model)
 * and visual coordinates (rendered view with wrapping).
 */

import type { BlockDocument, BlockTypeStyleMap } from "../block/blockDocument";
import { getBlockTypeStyle } from "../block/blockDocument";
import type { LayoutConfig } from "../layout/types";
import type {
  LogicalPosition,
  MeasureTextFn,
  VisualLine,
  VisualPosition,
  WrapLayoutIndex,
  WrapMode,
} from "./types";
import { DEFAULT_WRAP_MODE } from "./types";
import { calculateLineWrapPoints, getLineSegments } from "./wrapCalculation";

// =============================================================================
// Build Options
// =============================================================================

/**
 * Options for building a WrapLayoutIndex.
 */
export type BuildWrapLayoutIndexOptions = {
  /** The block document */
  readonly document: BlockDocument;
  /** Container width in pixels (used when wrapColumn=0) */
  readonly containerWidth: number;
  /** Text measurement function */
  readonly measureText: MeasureTextFn;
  /** Wrap mode configuration */
  readonly wrapMode: WrapMode;
  /** Layout configuration (padding, baseLineHeight) */
  readonly layoutConfig: LayoutConfig;
  /** Optional block type style overrides */
  readonly blockTypeStyles?: BlockTypeStyleMap;
};

// =============================================================================
// Build Function
// =============================================================================

/**
 * Build a WrapLayoutIndex from a document.
 *
 * Calculates wrap points for each logical line and creates visual lines
 * with precomputed Y positions. This enables efficient coordinate
 * conversion and rendering.
 *
 * @param options - Build options
 * @returns WrapLayoutIndex with visual lines and lookup tables
 *
 * @example
 * ```typescript
 * const wrapIndex = buildWrapLayoutIndex({
 *   document: doc,
 *   containerWidth: 400,
 *   measureText: (text) => text.length * 8,
 *   wrapMode: { softWrap: true, wordWrap: true, wrapColumn: 0 },
 *   layoutConfig: { paddingLeft: 8, paddingTop: 8, baseLineHeight: 21 },
 * });
 * ```
 */
export function buildWrapLayoutIndex(
  options: BuildWrapLayoutIndexOptions
): WrapLayoutIndex {
  const {
    document,
    containerWidth,
    measureText,
    wrapMode,
    layoutConfig,
    blockTypeStyles,
  } = options;

  // Calculate effective wrap width
  const effectiveWidth = getEffectiveWrapWidth(
    containerWidth,
    wrapMode,
    measureText,
    layoutConfig.paddingLeft
  );

  const visualLines: VisualLine[] = [];
  const logicalToVisualStart: number[] = [];
  const visualLinesPerLogical: number[] = [];

  const state = { y: 0, visualIndex: 0 };

  for (let blockIndex = 0; blockIndex < document.blocks.length; blockIndex++) {
    const block = document.blocks[blockIndex];
    const blockStyle = getBlockTypeStyle(block.type, blockTypeStyles);
    const fontSizeMultiplier = blockStyle?.fontSizeMultiplier ?? 1;
    const lineHeight = layoutConfig.baseLineHeight * fontSizeMultiplier;

    // Record start of this logical line
    logicalToVisualStart.push(state.visualIndex);

    // Calculate wrap points for this block's content
    const wrapPoints = wrapMode.softWrap
      ? calculateLineWrapPoints(block.content, measureText, {
          maxWidth: effectiveWidth,
          wordWrap: wrapMode.wordWrap,
        })
      : [];

    // Get line segments
    const segments = getLineSegments(block.content.length, wrapPoints);
    const visualLineCount = segments.length;
    visualLinesPerLogical.push(visualLineCount);

    // Create visual lines for each segment
    for (let wrapIndex = 0; wrapIndex < segments.length; wrapIndex++) {
      const segment = segments[wrapIndex];

      visualLines.push({
        visualIndex: state.visualIndex,
        logicalLineIndex: blockIndex,
        blockIndex,
        startOffset: segment.start,
        endOffset: segment.end,
        y: state.y,
        height: lineHeight,
        isSoftWrapped: segment.isSoftWrapped,
        wrapIndex,
      });

      state.y += lineHeight;
      state.visualIndex++;
    }
  }

  // Handle empty document
  if (visualLines.length === 0) {
    visualLines.push({
      visualIndex: 0,
      logicalLineIndex: 0,
      blockIndex: 0,
      startOffset: 0,
      endOffset: 0,
      y: 0,
      height: layoutConfig.baseLineHeight,
      isSoftWrapped: false,
      wrapIndex: 0,
    });
    logicalToVisualStart.push(0);
    visualLinesPerLogical.push(1);
    state.y = layoutConfig.baseLineHeight;
  }

  return {
    visualLines,
    totalHeight: state.y,
    containerWidth,
    wrapMode,
    logicalToVisualStart,
    visualLinesPerLogical,
  };
}

/**
 * Calculate effective wrap width based on wrap mode and container.
 */
function getEffectiveWrapWidth(
  containerWidth: number,
  wrapMode: WrapMode,
  measureText: MeasureTextFn,
  paddingLeft: number
): number {
  if (wrapMode.wrapColumn > 0) {
    // Fixed column width - measure representative characters
    const columnWidth = measureText("M".repeat(wrapMode.wrapColumn));
    return columnWidth;
  }

  // Container width minus padding
  return Math.max(containerWidth - paddingLeft * 2, 0);
}

// =============================================================================
// Query Functions
// =============================================================================

/**
 * Find visual line index at a Y coordinate using binary search.
 *
 * @param index - The wrap layout index
 * @param y - Y coordinate (relative to document top, excludes padding)
 * @returns Visual line index (0-based), clamped to valid range
 *
 * Time complexity: O(log n)
 */
export function findVisualLineAtY(index: WrapLayoutIndex, y: number): number {
  const { visualLines } = index;

  if (visualLines.length === 0) {
    return 0;
  }

  if (y <= 0) {
    return 0;
  }

  if (y >= index.totalHeight) {
    return visualLines.length - 1;
  }

  // Binary search
  let lo = 0;
  let hi = visualLines.length - 1;

  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (visualLines[mid].y <= y) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  return lo;
}

/**
 * Get visual line at a specific index.
 */
export function getVisualLine(
  index: WrapLayoutIndex,
  visualLineIndex: number
): VisualLine | undefined {
  if (visualLineIndex < 0 || visualLineIndex >= index.visualLines.length) {
    return undefined;
  }
  return index.visualLines[visualLineIndex];
}

/**
 * Get the first visual line index for a logical line.
 */
export function getFirstVisualLineForLogical(
  index: WrapLayoutIndex,
  logicalLineIndex: number
): number {
  if (logicalLineIndex < 0 || logicalLineIndex >= index.logicalToVisualStart.length) {
    return 0;
  }
  return index.logicalToVisualStart[logicalLineIndex];
}

/**
 * Get number of visual lines for a logical line.
 */
export function getVisualLineCountForLogical(
  index: WrapLayoutIndex,
  logicalLineIndex: number
): number {
  if (logicalLineIndex < 0 || logicalLineIndex >= index.visualLinesPerLogical.length) {
    return 1;
  }
  return index.visualLinesPerLogical[logicalLineIndex];
}

// =============================================================================
// Coordinate Conversion
// =============================================================================

/**
 * Convert logical position to visual position.
 *
 * @param index - The wrap layout index
 * @param logical - Position in logical coordinates
 * @returns Position in visual coordinates
 */
export function logicalToVisual(
  index: WrapLayoutIndex,
  logical: LogicalPosition
): VisualPosition {
  const { logicalToVisualStart, visualLines } = index;

  // Clamp logical line
  const logicalLine = Math.max(
    0,
    Math.min(logical.line, logicalToVisualStart.length - 1)
  );

  const firstVisualLine = logicalToVisualStart[logicalLine];
  const visualLineCount = index.visualLinesPerLogical[logicalLine];

  // Find which visual line contains the column
  for (let i = 0; i < visualLineCount; i++) {
    const visualLine = visualLines[firstVisualLine + i];
    if (
      logical.column >= visualLine.startOffset &&
      logical.column <= visualLine.endOffset
    ) {
      return {
        line: firstVisualLine + i,
        column: logical.column - visualLine.startOffset,
      };
    }
  }

  // Column is beyond end - return last visual line
  const lastVisualLineIdx = firstVisualLine + visualLineCount - 1;
  const lastVisualLine = visualLines[lastVisualLineIdx];
  return {
    line: lastVisualLineIdx,
    column: lastVisualLine.endOffset - lastVisualLine.startOffset,
  };
}

/**
 * Convert visual position to logical position.
 *
 * @param index - The wrap layout index
 * @param visual - Position in visual coordinates
 * @returns Position in logical coordinates
 */
export function visualToLogical(
  index: WrapLayoutIndex,
  visual: VisualPosition
): LogicalPosition {
  const visualLine = getVisualLine(index, visual.line);

  if (!visualLine) {
    return { line: 0, column: 0 };
  }

  return {
    line: visualLine.logicalLineIndex,
    column: visualLine.startOffset + visual.column,
  };
}

/**
 * Convert a global character offset to visual position.
 *
 * @param index - The wrap layout index
 * @param document - The block document
 * @param globalOffset - Global character offset in document
 * @returns Visual position
 */
export function globalOffsetToVisual(
  index: WrapLayoutIndex,
  document: BlockDocument,
  globalOffset: number
): VisualPosition {
  // Find logical line and column from global offset
  let offset = 0;
  for (let blockIdx = 0; blockIdx < document.blocks.length; blockIdx++) {
    const block = document.blocks[blockIdx];
    const blockEnd = offset + block.content.length;

    if (globalOffset <= blockEnd) {
      const column = globalOffset - offset;
      return logicalToVisual(index, { line: blockIdx, column });
    }

    // Account for newline between blocks
    offset = blockEnd + 1;
  }

  // Beyond end - return last position
  if (document.blocks.length > 0) {
    const lastBlockIdx = document.blocks.length - 1;
    const lastBlock = document.blocks[lastBlockIdx];
    return logicalToVisual(index, { line: lastBlockIdx, column: lastBlock.content.length });
  }

  return { line: 0, column: 0 };
}

/**
 * Convert visual position to global character offset.
 *
 * @param index - The wrap layout index
 * @param document - The block document
 * @param visual - Visual position
 * @returns Global character offset
 */
export function visualToGlobalOffset(
  index: WrapLayoutIndex,
  document: BlockDocument,
  visual: VisualPosition
): number {
  const logical = visualToLogical(index, visual);

  // Calculate global offset from logical position
  let offset = 0;
  for (let i = 0; i < logical.line && i < document.blocks.length; i++) {
    offset += document.blocks[i].content.length + 1; // +1 for newline
  }

  return offset + logical.column;
}

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create a disabled (no-wrap) layout index.
 *
 * When wrapping is disabled, each logical line maps 1:1 to a visual line.
 * This is a lightweight alternative to buildWrapLayoutIndex for no-wrap mode.
 *
 * @param document - The block document
 * @param layoutConfig - Layout configuration
 * @param blockTypeStyles - Optional block type style overrides
 * @returns WrapLayoutIndex with 1:1 logical-to-visual mapping
 */
export function buildNoWrapLayoutIndex(
  document: BlockDocument,
  layoutConfig: LayoutConfig,
  blockTypeStyles?: BlockTypeStyleMap
): WrapLayoutIndex {
  const visualLines: VisualLine[] = [];
  const logicalToVisualStart: number[] = [];
  const visualLinesPerLogical: number[] = [];

  const state = { y: 0 };

  for (let blockIndex = 0; blockIndex < document.blocks.length; blockIndex++) {
    const block = document.blocks[blockIndex];
    const blockStyle = getBlockTypeStyle(block.type, blockTypeStyles);
    const fontSizeMultiplier = blockStyle?.fontSizeMultiplier ?? 1;
    const lineHeight = layoutConfig.baseLineHeight * fontSizeMultiplier;

    logicalToVisualStart.push(blockIndex);
    visualLinesPerLogical.push(1);

    visualLines.push({
      visualIndex: blockIndex,
      logicalLineIndex: blockIndex,
      blockIndex,
      startOffset: 0,
      endOffset: block.content.length,
      y: state.y,
      height: lineHeight,
      isSoftWrapped: false,
      wrapIndex: 0,
    });

    state.y += lineHeight;
  }

  // Handle empty document
  if (visualLines.length === 0) {
    visualLines.push({
      visualIndex: 0,
      logicalLineIndex: 0,
      blockIndex: 0,
      startOffset: 0,
      endOffset: 0,
      y: 0,
      height: layoutConfig.baseLineHeight,
      isSoftWrapped: false,
      wrapIndex: 0,
    });
    logicalToVisualStart.push(0);
    visualLinesPerLogical.push(1);
  }

  return {
    visualLines,
    totalHeight: state.y || layoutConfig.baseLineHeight,
    containerWidth: 0,
    wrapMode: DEFAULT_WRAP_MODE,
    logicalToVisualStart,
    visualLinesPerLogical,
  };
}
