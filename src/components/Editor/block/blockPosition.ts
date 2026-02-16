/**
 * @file Block Position Types and Utilities
 *
 * Position representation in block-based documents.
 * BlockPosition uses block ID + local offset instead of global offset.
 *
 * Key benefits:
 * - Stable across edits in other blocks
 * - No global offset recalculation needed
 * - Natural mapping to IME composition (within single block)
 *
 * @example
 * ```typescript
 * // Position at character 5 within block "b1"
 * const pos: BlockPosition = {
 *   blockId: "b1" as BlockId,
 *   offset: 5,
 * };
 *
 * // Selection spanning two blocks
 * const selection: BlockSelection = {
 *   anchor: { blockId: "b1" as BlockId, offset: 10 },
 *   focus: { blockId: "b2" as BlockId, offset: 3 },
 * };
 * ```
 */

import type { BlockId, BlockDocument, Block } from "../block/blockDocument";
import {
  getBlockAtGlobalOffset,
  getBlockIndexById,
  getBlockById,
} from "../block/blockDocument";
import type { CursorPosition } from "../core/types";

// =============================================================================
// Position Types
// =============================================================================

/**
 * Position within a block-based document.
 *
 * Unlike global offsets, BlockPosition is stable when editing
 * other blocks - only local offset within the same block changes.
 */
export type BlockPosition = {
  /** Block containing this position */
  readonly blockId: BlockId;
  /** Character offset within the block (0-based) */
  readonly offset: number;
};

/**
 * Selection in a block-based document.
 *
 * Uses anchor/focus model to preserve selection direction.
 * Anchor is where selection started, focus is current cursor position.
 */
export type BlockSelection = {
  /** Where selection started */
  readonly anchor: BlockPosition;
  /** Current cursor position (may be before or after anchor) */
  readonly focus: BlockPosition;
};

/**
 * Collapsed selection (cursor with no selection).
 */
export type BlockCursor = {
  readonly anchor: BlockPosition;
  readonly focus: BlockPosition;
  readonly isCollapsed: true;
};

// =============================================================================
// Position Factory
// =============================================================================

/**
 * Create a BlockPosition.
 */
export function createBlockPosition(
  blockId: BlockId,
  offset: number
): BlockPosition {
  return { blockId, offset };
}

/**
 * Create a collapsed selection (cursor).
 */
export function createBlockCursor(position: BlockPosition): BlockSelection {
  return {
    anchor: position,
    focus: position,
  };
}

/**
 * Create a selection from two positions.
 */
export function createBlockSelection(
  anchor: BlockPosition,
  focus: BlockPosition
): BlockSelection {
  return { anchor, focus };
}

// =============================================================================
// Selection Utilities
// =============================================================================

/**
 * Check if selection is collapsed (no text selected).
 */
export function isSelectionCollapsed(selection: BlockSelection): boolean {
  return (
    selection.anchor.blockId === selection.focus.blockId &&
    selection.anchor.offset === selection.focus.offset
  );
}

/**
 * Get the start and end of a selection in document order.
 *
 * Returns positions sorted so start comes before end.
 */
export function getSelectionBounds(
  doc: BlockDocument,
  selection: BlockSelection
): { start: BlockPosition; end: BlockPosition } {
  const anchorBlockIndex = getBlockIndexById(doc, selection.anchor.blockId);
  const focusBlockIndex = getBlockIndexById(doc, selection.focus.blockId);

  // Compare block positions first
  if (anchorBlockIndex < focusBlockIndex) {
    return { start: selection.anchor, end: selection.focus };
  }

  if (anchorBlockIndex > focusBlockIndex) {
    return { start: selection.focus, end: selection.anchor };
  }

  // Same block - compare offsets
  if (selection.anchor.offset <= selection.focus.offset) {
    return { start: selection.anchor, end: selection.focus };
  }

  return { start: selection.focus, end: selection.anchor };
}

/**
 * Check if a position is within a selection.
 */
export function isPositionInSelection(
  doc: BlockDocument,
  position: BlockPosition,
  selection: BlockSelection
): boolean {
  const { start, end } = getSelectionBounds(doc, selection);

  const posBlockIndex = getBlockIndexById(doc, position.blockId);
  const startBlockIndex = getBlockIndexById(doc, start.blockId);
  const endBlockIndex = getBlockIndexById(doc, end.blockId);

  // Position is before start block
  if (posBlockIndex < startBlockIndex) {
    return false;
  }

  // Position is after end block
  if (posBlockIndex > endBlockIndex) {
    return false;
  }

  // Position is in start block
  if (posBlockIndex === startBlockIndex) {
    if (position.offset < start.offset) {
      return false;
    }
    // If start and end are same block, also check end
    if (startBlockIndex === endBlockIndex && position.offset > end.offset) {
      return false;
    }
    return true;
  }

  // Position is in end block
  if (posBlockIndex === endBlockIndex) {
    return position.offset <= end.offset;
  }

  // Position is in a middle block
  return true;
}

// =============================================================================
// Global Offset Conversion
// =============================================================================

/**
 * Convert a global offset to a BlockPosition.
 *
 * Used for migration from legacy offset-based code.
 */
export function globalOffsetToBlockPosition(
  doc: BlockDocument,
  globalOffset: number
): BlockPosition | undefined {
  const location = getBlockAtGlobalOffset(doc, globalOffset);
  if (!location) {
    return undefined;
  }

  return {
    blockId: location.block.id,
    offset: location.localOffset,
  };
}

/**
 * Convert a BlockPosition to a global offset.
 *
 * Used for migration from legacy offset-based code.
 * Returns undefined if the block is not found (consistent with globalOffsetToBlockPosition).
 */
export function blockPositionToGlobalOffset(
  doc: BlockDocument,
  position: BlockPosition
): number | undefined {
  // eslint-disable-next-line no-restricted-syntax -- accumulator in loop
  let globalOffset = 0;

  for (const block of doc.blocks) {
    if (block.id === position.blockId) {
      return globalOffset + position.offset;
    }
    // Add block content length + 1 for newline
    globalOffset += block.content.length + 1;
  }

  // Block not found - return undefined (consistent with globalOffsetToBlockPosition)
  return undefined;
}

/**
 * Convert a BlockSelection to global offsets (start, end).
 * Returns undefined if either position's block is not found.
 */
export function blockSelectionToGlobalOffsets(
  doc: BlockDocument,
  selection: BlockSelection
): { start: number; end: number } | undefined {
  const { start, end } = getSelectionBounds(doc, selection);

  const startOffset = blockPositionToGlobalOffset(doc, start);
  const endOffset = blockPositionToGlobalOffset(doc, end);

  if (startOffset === undefined || endOffset === undefined) {
    return undefined;
  }

  return { start: startOffset, end: endOffset };
}

// =============================================================================
// Line/Column Conversion
// =============================================================================

/**
 * Get line and column within a block for a given offset.
 *
 * Line numbers are 1-based, column numbers are 1-based.
 */
export function getLineColumnInBlock(
  block: Block,
  offset: number
): CursorPosition {
  const text = block.content.slice(0, offset);
  const lines = text.split("\n");

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

/**
 * Get offset within a block for a given line and column.
 *
 * Line numbers are 1-based, column numbers are 1-based.
 */
export function getOffsetInBlockFromLineColumn(
  block: Block,
  line: number,
  column: number
): number {
  const lines = block.content.split("\n");

  // Clamp line number
  const targetLine = Math.max(1, Math.min(line, lines.length));

  // Calculate offset to start of target line
  // eslint-disable-next-line no-restricted-syntax -- accumulator in loop
  let offset = 0;
  for (let i = 0; i < targetLine - 1; i++) {
    offset += lines[i].length + 1; // +1 for newline
  }

  // Add column offset (clamped to line length)
  const lineContent = lines[targetLine - 1];
  const targetColumn = Math.max(1, Math.min(column, lineContent.length + 1));
  offset += targetColumn - 1;

  return offset;
}

/**
 * Get document-wide line and column for a position.
 *
 * Accounts for newlines between blocks.
 */
export function getGlobalLineColumn(
  doc: BlockDocument,
  position: BlockPosition
): CursorPosition {
  // eslint-disable-next-line no-restricted-syntax -- accumulator in loop
  let globalLine = 1;

  for (const block of doc.blocks) {
    if (block.id === position.blockId) {
      // Found the block - get local line/column and add global line offset
      const local = getLineColumnInBlock(block, position.offset);
      return {
        line: globalLine + local.line - 1,
        column: local.column,
      };
    }

    // Count lines in this block (each block ends with implicit newline)
    const linesInBlock = block.content.split("\n").length;
    globalLine += linesInBlock;
  }

  // Block not found
  return { line: globalLine, column: 1 };
}

/**
 * Convert document-wide line/column to BlockPosition.
 */
export function globalLineColumnToBlockPosition(
  doc: BlockDocument,
  line: number,
  column: number
): BlockPosition | undefined {
  // eslint-disable-next-line no-restricted-syntax -- accumulator in loop
  let currentLine = 1;

  for (const block of doc.blocks) {
    const blockLines = block.content.split("\n");
    const linesInBlock = blockLines.length;
    const blockEndLine = currentLine + linesInBlock - 1;

    if (line <= blockEndLine) {
      // Target line is in this block
      const localLine = line - currentLine + 1;
      const offset = getOffsetInBlockFromLineColumn(block, localLine, column);
      return { blockId: block.id, offset };
    }

    // Move past this block (implicit newline after each block)
    currentLine = blockEndLine + 1;
  }

  // Line not found - return end of last block
  if (doc.blocks.length > 0) {
    const lastBlock = doc.blocks[doc.blocks.length - 1];
    return {
      blockId: lastBlock.id,
      offset: lastBlock.content.length,
    };
  }

  return undefined;
}

// =============================================================================
// Position Navigation
// =============================================================================

/**
 * Move position forward by one character.
 *
 * Returns undefined if at end of document.
 */
export function movePositionForward(
  doc: BlockDocument,
  position: BlockPosition
): BlockPosition | undefined {
  const block = getBlockById(doc, position.blockId);
  if (!block) {
    return undefined;
  }

  // Can move within current block
  if (position.offset < block.content.length) {
    return { blockId: position.blockId, offset: position.offset + 1 };
  }

  // At end of block - try to move to next block
  const blockIndex = getBlockIndexById(doc, position.blockId);
  if (blockIndex < doc.blocks.length - 1) {
    const nextBlock = doc.blocks[blockIndex + 1];
    return { blockId: nextBlock.id, offset: 0 };
  }

  // At end of document
  return undefined;
}

/**
 * Move position backward by one character.
 *
 * Returns undefined if at start of document.
 */
export function movePositionBackward(
  doc: BlockDocument,
  position: BlockPosition
): BlockPosition | undefined {
  // Can move within current block
  if (position.offset > 0) {
    return { blockId: position.blockId, offset: position.offset - 1 };
  }

  // At start of block - try to move to previous block
  const blockIndex = getBlockIndexById(doc, position.blockId);
  if (blockIndex > 0) {
    const prevBlock = doc.blocks[blockIndex - 1];
    return { blockId: prevBlock.id, offset: prevBlock.content.length };
  }

  // At start of document
  return undefined;
}

/**
 * Get position at start of block.
 */
export function getBlockStart(blockId: BlockId): BlockPosition {
  return { blockId, offset: 0 };
}

/**
 * Get position at end of block.
 */
export function getBlockEnd(
  doc: BlockDocument,
  blockId: BlockId
): BlockPosition | undefined {
  const block = getBlockById(doc, blockId);
  if (!block) {
    return undefined;
  }

  return { blockId, offset: block.content.length };
}

/**
 * Get position at start of document.
 */
export function getDocumentStart(doc: BlockDocument): BlockPosition | undefined {
  if (doc.blocks.length === 0) {
    return undefined;
  }

  return { blockId: doc.blocks[0].id, offset: 0 };
}

/**
 * Get position at end of document.
 */
export function getDocumentEnd(doc: BlockDocument): BlockPosition | undefined {
  if (doc.blocks.length === 0) {
    return undefined;
  }

  const lastBlock = doc.blocks[doc.blocks.length - 1];
  return { blockId: lastBlock.id, offset: lastBlock.content.length };
}

// =============================================================================
// Position Comparison
// =============================================================================

/**
 * Compare two positions.
 *
 * Returns:
 * - negative if a comes before b
 * - 0 if a equals b
 * - positive if a comes after b
 */
export function comparePositions(
  doc: BlockDocument,
  a: BlockPosition,
  b: BlockPosition
): number {
  const aBlockIndex = getBlockIndexById(doc, a.blockId);
  const bBlockIndex = getBlockIndexById(doc, b.blockId);

  // Different blocks
  if (aBlockIndex !== bBlockIndex) {
    return aBlockIndex - bBlockIndex;
  }

  // Same block - compare offsets
  return a.offset - b.offset;
}

/**
 * Check if two positions are equal.
 */
export function positionsEqual(a: BlockPosition, b: BlockPosition): boolean {
  return a.blockId === b.blockId && a.offset === b.offset;
}
