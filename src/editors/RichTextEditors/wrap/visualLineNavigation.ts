/**
 * @file Visual Line Navigation
 *
 * Functions for navigating by visual lines in wrapped text.
 * Used for keyboard navigation (arrow up/down, home/end).
 */

import type { WrapLayoutIndex, VisualPosition, LogicalPosition } from "./types";
import { getVisualLine, logicalToVisual, visualToLogical } from "./WrapLayoutIndex";

// =============================================================================
// Navigation Types
// =============================================================================

/**
 * Result of a visual line navigation operation.
 */
export type NavigationResult = {
  /** New logical position */
  readonly logical: LogicalPosition;
  /** New visual position */
  readonly visual: VisualPosition;
  /** Whether the navigation was successful (false if at boundary) */
  readonly moved: boolean;
};

// =============================================================================
// Vertical Navigation
// =============================================================================

/**
 * Move cursor up by one visual line, preserving the preferred column.
 *
 * @param index - Wrap layout index
 * @param currentLogical - Current logical position
 * @param preferredColumn - Preferred visual column (X position) to maintain
 * @param lineContents - Array of logical line contents
 * @returns Navigation result with new position
 */
export function moveUpVisualLine(
  index: WrapLayoutIndex,
  currentLogical: LogicalPosition,
  preferredColumn: number,
  lineContents: readonly string[]
): NavigationResult {
  // Convert to visual position
  const currentVisual = logicalToVisual(index, currentLogical);
  const currentVisualLine = currentVisual.line;

  // At top - can't move up
  if (currentVisualLine <= 0) {
    return {
      logical: currentLogical,
      visual: currentVisual,
      moved: false,
    };
  }

  // Move to previous visual line
  const targetVisualLine = currentVisualLine - 1;
  const targetVisualLineInfo = getVisualLine(index, targetVisualLine);

  if (!targetVisualLineInfo) {
    return {
      logical: currentLogical,
      visual: currentVisual,
      moved: false,
    };
  }

  // Calculate column in target line, clamped to line length
  const targetLineContent = lineContents[targetVisualLineInfo.logicalLineIndex] ?? "";
  const segmentLength = targetVisualLineInfo.endOffset - targetVisualLineInfo.startOffset;
  const targetColumn = Math.min(preferredColumn, segmentLength);

  const newVisual: VisualPosition = {
    line: targetVisualLine,
    column: targetColumn,
  };

  const newLogical = visualToLogical(index, newVisual);

  return {
    logical: newLogical,
    visual: newVisual,
    moved: true,
  };
}

/**
 * Move cursor down by one visual line, preserving the preferred column.
 *
 * @param index - Wrap layout index
 * @param currentLogical - Current logical position
 * @param preferredColumn - Preferred visual column (X position) to maintain
 * @param lineContents - Array of logical line contents
 * @returns Navigation result with new position
 */
export function moveDownVisualLine(
  index: WrapLayoutIndex,
  currentLogical: LogicalPosition,
  preferredColumn: number,
  lineContents: readonly string[]
): NavigationResult {
  // Convert to visual position
  const currentVisual = logicalToVisual(index, currentLogical);
  const currentVisualLine = currentVisual.line;

  // At bottom - can't move down
  if (currentVisualLine >= index.visualLines.length - 1) {
    return {
      logical: currentLogical,
      visual: currentVisual,
      moved: false,
    };
  }

  // Move to next visual line
  const targetVisualLine = currentVisualLine + 1;
  const targetVisualLineInfo = getVisualLine(index, targetVisualLine);

  if (!targetVisualLineInfo) {
    return {
      logical: currentLogical,
      visual: currentVisual,
      moved: false,
    };
  }

  // Calculate column in target line, clamped to line length
  const segmentLength = targetVisualLineInfo.endOffset - targetVisualLineInfo.startOffset;
  const targetColumn = Math.min(preferredColumn, segmentLength);

  const newVisual: VisualPosition = {
    line: targetVisualLine,
    column: targetColumn,
  };

  const newLogical = visualToLogical(index, newVisual);

  return {
    logical: newLogical,
    visual: newVisual,
    moved: true,
  };
}

// =============================================================================
// Horizontal Navigation (Home/End)
// =============================================================================

/**
 * Move cursor to start of current visual line.
 *
 * @param index - Wrap layout index
 * @param currentLogical - Current logical position
 * @returns Navigation result with new position at start of visual line
 */
export function moveToVisualLineStart(
  index: WrapLayoutIndex,
  currentLogical: LogicalPosition
): NavigationResult {
  const currentVisual = logicalToVisual(index, currentLogical);
  const visualLineInfo = getVisualLine(index, currentVisual.line);

  if (!visualLineInfo) {
    return {
      logical: currentLogical,
      visual: currentVisual,
      moved: false,
    };
  }

  const newVisual: VisualPosition = {
    line: currentVisual.line,
    column: 0,
  };

  const newLogical = visualToLogical(index, newVisual);

  return {
    logical: newLogical,
    visual: newVisual,
    moved: currentVisual.column !== 0,
  };
}

/**
 * Move cursor to end of current visual line.
 *
 * @param index - Wrap layout index
 * @param currentLogical - Current logical position
 * @returns Navigation result with new position at end of visual line
 */
export function moveToVisualLineEnd(
  index: WrapLayoutIndex,
  currentLogical: LogicalPosition
): NavigationResult {
  const currentVisual = logicalToVisual(index, currentLogical);
  const visualLineInfo = getVisualLine(index, currentVisual.line);

  if (!visualLineInfo) {
    return {
      logical: currentLogical,
      visual: currentVisual,
      moved: false,
    };
  }

  const segmentLength = visualLineInfo.endOffset - visualLineInfo.startOffset;
  const newVisual: VisualPosition = {
    line: currentVisual.line,
    column: segmentLength,
  };

  const newLogical = visualToLogical(index, newVisual);

  return {
    logical: newLogical,
    visual: newVisual,
    moved: currentVisual.column !== segmentLength,
  };
}

/**
 * Move cursor to start of logical line (Cmd+Home behavior).
 *
 * @param index - Wrap layout index
 * @param currentLogical - Current logical position
 * @returns Navigation result with new position at start of logical line
 */
export function moveToLogicalLineStart(
  index: WrapLayoutIndex,
  currentLogical: LogicalPosition
): NavigationResult {
  const newLogical: LogicalPosition = {
    line: currentLogical.line,
    column: 0,
  };

  const newVisual = logicalToVisual(index, newLogical);

  return {
    logical: newLogical,
    visual: newVisual,
    moved: currentLogical.column !== 0,
  };
}

/**
 * Move cursor to end of logical line (Cmd+End behavior).
 *
 * @param index - Wrap layout index
 * @param currentLogical - Current logical position
 * @param lineContents - Array of logical line contents
 * @returns Navigation result with new position at end of logical line
 */
export function moveToLogicalLineEnd(
  index: WrapLayoutIndex,
  currentLogical: LogicalPosition,
  lineContents: readonly string[]
): NavigationResult {
  const lineContent = lineContents[currentLogical.line] ?? "";
  const lineLength = lineContent.length;

  const newLogical: LogicalPosition = {
    line: currentLogical.line,
    column: lineLength,
  };

  const newVisual = logicalToVisual(index, newLogical);

  return {
    logical: newLogical,
    visual: newVisual,
    moved: currentLogical.column !== lineLength,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get the visual column for a logical position.
 * Used to calculate and maintain preferred column during vertical navigation.
 *
 * @param index - Wrap layout index
 * @param logical - Logical position
 * @returns Visual column within the visual line
 */
export function getVisualColumn(
  index: WrapLayoutIndex,
  logical: LogicalPosition
): number {
  const visual = logicalToVisual(index, logical);
  return visual.column;
}

/**
 * Convert logical line/column to global character offset.
 *
 * @param lineContents - Array of logical line contents
 * @param logical - Logical position
 * @returns Global character offset
 */
export function logicalToOffset(
  lineContents: readonly string[],
  logical: LogicalPosition
): number {
  let offset = 0;
  for (let i = 0; i < logical.line && i < lineContents.length; i++) {
    offset += lineContents[i].length + 1; // +1 for newline
  }
  return offset + logical.column;
}

/**
 * Convert global character offset to logical position.
 *
 * @param lineContents - Array of logical line contents
 * @param offset - Global character offset
 * @returns Logical position
 */
export function offsetToLogical(
  lineContents: readonly string[],
  offset: number
): LogicalPosition {
  let currentOffset = 0;
  for (let i = 0; i < lineContents.length; i++) {
    const lineLength = lineContents[i].length;
    const lineEnd = currentOffset + lineLength;

    if (offset <= lineEnd) {
      return {
        line: i,
        column: offset - currentOffset,
      };
    }

    // +1 for newline between lines
    currentOffset = lineEnd + 1;
  }

  // Beyond end - return last position
  if (lineContents.length > 0) {
    const lastLine = lineContents.length - 1;
    return {
      line: lastLine,
      column: lineContents[lastLine].length,
    };
  }

  return { line: 0, column: 0 };
}
