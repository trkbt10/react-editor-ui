/**
 * @file Block-Based Document Model
 *
 * Block-based architecture for rich text editing.
 * Each block contains its own content and styles with local offsets,
 * enabling efficient editing operations and simplified IME handling.
 *
 * Key benefits:
 * - Block-local offsets eliminate global offset recalculation
 * - IME composition is contained within a single block
 * - Styles are block-scoped, limiting re-render scope
 *
 * @example
 * ```typescript
 * const doc: BlockDocument = {
 *   blocks: [
 *     { id: "b1", type: "paragraph", content: "Hello world", styles: [] },
 *     { id: "b2", type: "code-block", content: "const x = 1;", styles: [] },
 *   ],
 *   styleDefinitions: { bold: { fontWeight: "bold" } },
 *   version: 1,
 * };
 * ```
 */

import type { TextStyle, TextStyleSegment } from "../core/types";
import type { StyledDocument, StyleDefinitions } from "../text/styledDocument";
import { getDocumentText, toFlatSegments, createDocument } from "../text/styledDocument";

// =============================================================================
// Branded Types
// =============================================================================

/**
 * Unique identifier for a block.
 * Branded type ensures type safety when passing IDs around.
 */
export type BlockId = string & { readonly __brand: "BlockId" };

/**
 * Create a new BlockId.
 */
export function createBlockId(): BlockId {
  return crypto.randomUUID() as BlockId;
}

// =============================================================================
// Block Types
// =============================================================================

/**
 * Block type determines rendering and behavior.
 * Extended to support Markdown-style block formats.
 */
export type BlockType =
  | "paragraph"
  | "code-block"
  | "heading"
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "bullet-list"
  | "numbered-list"
  | "blockquote";

// =============================================================================
// Block Type Styling
// =============================================================================

/**
 * Visual styling configuration for a block type.
 * This enables extensible block type rendering without hardcoding in the renderer.
 */
export type BlockTypeStyle = {
  /** Font size multiplier relative to base font size (default: 1) */
  readonly fontSizeMultiplier?: number;
  /** Font weight (e.g., "bold", "normal") */
  readonly fontWeight?: string;
  /** Font family override */
  readonly fontFamily?: string;
  /** Left indentation in pixels */
  readonly indentation?: number;
  /** Text color override */
  readonly color?: string;
  /** Left border decoration */
  readonly leftBorder?: {
    readonly width: number;
    readonly color: string;
  };
  /** Background color */
  readonly backgroundColor?: string;
  /** Extra vertical padding */
  readonly verticalPadding?: number;
};

/**
 * Map of block type to visual style configuration.
 */
export type BlockTypeStyleMap = Partial<Record<BlockType, BlockTypeStyle>>;

/**
 * Default block type styles for Markdown-style rendering.
 * These can be overridden or extended via BlockDocument.blockTypeStyles.
 */
export const DEFAULT_BLOCK_TYPE_STYLES: BlockTypeStyleMap = {
  "heading-1": {
    fontSizeMultiplier: 1.75,
    fontWeight: "bold",
  },
  "heading-2": {
    fontSizeMultiplier: 1.5,
    fontWeight: "bold",
  },
  "heading-3": {
    fontSizeMultiplier: 1.25,
    fontWeight: "bold",
  },
  heading: {
    fontSizeMultiplier: 1.5,
    fontWeight: "bold",
  },
  "bullet-list": {
    indentation: 16,
  },
  "numbered-list": {
    indentation: 16,
  },
  blockquote: {
    indentation: 12,
    leftBorder: {
      width: 3,
      color: "#6b7280",
    },
    backgroundColor: "rgba(107, 114, 128, 0.1)",
  },
  "code-block": {
    fontSizeMultiplier: 0.9,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
};

/**
 * Get effective block type style by merging defaults with document overrides.
 *
 * @param blockType - The block type to get styles for
 * @param documentStyles - Optional document-specific style overrides
 * @returns Merged block type style or undefined if no styles defined
 */
export function getBlockTypeStyle(
  blockType: BlockType,
  documentStyles?: BlockTypeStyleMap
): BlockTypeStyle | undefined {
  const defaultStyle = DEFAULT_BLOCK_TYPE_STYLES[blockType];
  const documentStyle = documentStyles?.[blockType];

  if (!defaultStyle && !documentStyle) {
    return undefined;
  }

  if (!documentStyle) {
    return defaultStyle;
  }

  if (!defaultStyle) {
    return documentStyle;
  }

  // Merge document styles on top of defaults
  return {
    ...defaultStyle,
    ...documentStyle,
    // Deep merge leftBorder if both exist
    leftBorder: documentStyle.leftBorder ?? defaultStyle.leftBorder,
  };
}

/**
 * Style segment with block-local offsets.
 * Unlike global TextStyleSegment, offsets are relative to block content.
 */
export type LocalStyleSegment = {
  /** Start offset within block content (0-based) */
  readonly start: number;
  /** End offset within block content (exclusive) */
  readonly end: number;
  /** Style to apply */
  readonly style: TextStyle;
};

/**
 * A block in the document.
 *
 * Each block is an independent unit with its own content and styles.
 * Block boundaries provide natural break points for operations.
 */
export type Block = {
  /** Unique identifier for this block */
  readonly id: BlockId;
  /** Block type (determines rendering) */
  readonly type: BlockType;
  /** Text content of this block */
  readonly content: string;
  /** Styles with block-local offsets */
  readonly styles: readonly LocalStyleSegment[];
};

/**
 * Complete block-based document.
 */
export type BlockDocument = {
  /** Ordered list of blocks */
  readonly blocks: readonly Block[];
  /** Tag to style mapping for inline styles (shared across blocks) */
  readonly styleDefinitions: StyleDefinitions;
  /** Block type to visual style mapping (optional, uses defaults if not provided) */
  readonly blockTypeStyles?: BlockTypeStyleMap;
  /** Version number for optimistic locking */
  readonly version: number;
};

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create an empty block.
 */
export function createEmptyBlock(type: BlockType = "paragraph"): Block {
  return {
    id: createBlockId(),
    type,
    content: "",
    styles: [],
  };
}

/**
 * Create a block from text content.
 */
export function createBlock(
  content: string,
  type: BlockType = "paragraph",
  styles: readonly LocalStyleSegment[] = []
): Block {
  return {
    id: createBlockId(),
    type,
    content,
    styles,
  };
}

/**
 * Create an empty BlockDocument.
 */
export function createEmptyBlockDocument(): BlockDocument {
  return {
    blocks: [createEmptyBlock()],
    styleDefinitions: {},
    version: 1,
  };
}

/**
 * Default style definitions for common formatting operations.
 * Used by createBlockDocumentWithStyles for toolbar-enabled editors.
 */
export const DEFAULT_STYLE_DEFINITIONS: StyleDefinitions = {
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  underline: { textDecoration: "underline" },
  strikethrough: { textDecoration: "line-through" },
  code: { fontFamily: "monospace" },
};

/**
 * Create a BlockDocument from plain text.
 *
 * Splits text by newlines to create paragraph blocks.
 */
export function createBlockDocument(
  text: string,
  styleDefinitions?: StyleDefinitions
): BlockDocument {
  // Split by newlines, preserving empty lines as empty blocks
  const lines = text.split("\n");
  const blocks: Block[] = lines.map((line) => createBlock(line));

  // Ensure at least one block exists
  if (blocks.length === 0) {
    blocks.push(createEmptyBlock());
  }

  return {
    blocks,
    styleDefinitions: styleDefinitions ?? {},
    version: 1,
  };
}

/**
 * Create a BlockDocument with default style definitions.
 *
 * Use this when the document will be edited with a SelectionToolbar
 * that applies formatting commands like bold, italic, etc.
 */
export function createBlockDocumentWithStyles(
  text: string,
  additionalStyles?: StyleDefinitions
): BlockDocument {
  return createBlockDocument(text, {
    ...DEFAULT_STYLE_DEFINITIONS,
    ...additionalStyles,
  });
}

// =============================================================================
// Text Extraction
// =============================================================================

/**
 * Get plain text from a BlockDocument.
 *
 * Joins block contents with newlines.
 */
export function getBlockDocumentText(doc: BlockDocument): string {
  return doc.blocks.map((block) => block.content).join("\n");
}

/**
 * Get total character count of a BlockDocument.
 *
 * Includes newlines between blocks.
 */
export function getBlockDocumentLength(doc: BlockDocument): number {
  if (doc.blocks.length === 0) {
    return 0;
  }

  // Sum of all block contents + (n-1) newlines between blocks
  return (
    doc.blocks.reduce((sum, block) => sum + block.content.length, 0) +
    (doc.blocks.length - 1)
  );
}

// =============================================================================
// Block Lookup
// =============================================================================

/**
 * Find block by ID.
 */
export function getBlockById(
  doc: BlockDocument,
  blockId: BlockId
): Block | undefined {
  return doc.blocks.find((block) => block.id === blockId);
}

/**
 * Find block index by ID.
 */
export function getBlockIndexById(
  doc: BlockDocument,
  blockId: BlockId
): number {
  return doc.blocks.findIndex((block) => block.id === blockId);
}

/**
 * Find block containing a global offset.
 *
 * Returns the block and the local offset within that block.
 */
export function getBlockAtGlobalOffset(
  doc: BlockDocument,
  globalOffset: number
): { block: Block; blockIndex: number; localOffset: number } | undefined {
  // eslint-disable-next-line no-restricted-syntax -- accumulator in loop
  let currentOffset = 0;

  for (let i = 0; i < doc.blocks.length; i++) {
    const block = doc.blocks[i];
    const blockEnd = currentOffset + block.content.length;

    // Check if offset is within this block
    if (globalOffset <= blockEnd) {
      return {
        block,
        blockIndex: i,
        localOffset: globalOffset - currentOffset,
      };
    }

    // Account for newline between blocks
    currentOffset = blockEnd + 1;
  }

  // Offset beyond document end - return last block
  if (doc.blocks.length > 0) {
    const lastIndex = doc.blocks.length - 1;
    const lastBlock = doc.blocks[lastIndex];
    return {
      block: lastBlock,
      blockIndex: lastIndex,
      localOffset: lastBlock.content.length,
    };
  }

  return undefined;
}

// =============================================================================
// Block Edit Operations
// =============================================================================

/**
 * Update a single block in the document.
 */
export function updateBlock(
  doc: BlockDocument,
  blockId: BlockId,
  updater: (block: Block) => Block
): BlockDocument {
  const index = getBlockIndexById(doc, blockId);
  if (index === -1) {
    return doc;
  }

  const block = doc.blocks[index];
  const updatedBlock = updater(block);

  // No change
  if (updatedBlock === block) {
    return doc;
  }

  const newBlocks = [...doc.blocks];
  newBlocks[index] = updatedBlock;

  return {
    ...doc,
    blocks: newBlocks,
    version: doc.version + 1,
  };
}

/**
 * Insert text into a block at a local offset.
 */
export function insertTextInBlock(
  block: Block,
  offset: number,
  text: string
): Block {
  if (text.length === 0) {
    return block;
  }

  const newContent =
    block.content.slice(0, offset) + text + block.content.slice(offset);

  // Adjust styles after insertion point
  const newStyles = block.styles.map((style) => {
    if (style.end <= offset) {
      // Style is entirely before insertion - no change
      return style;
    }
    if (style.start >= offset) {
      // Style is entirely after insertion - shift both bounds
      return {
        ...style,
        start: style.start + text.length,
        end: style.end + text.length,
      };
    }
    // Style spans insertion point - extend end only
    return {
      ...style,
      end: style.end + text.length,
    };
  });

  return {
    ...block,
    content: newContent,
    styles: newStyles,
  };
}

/**
 * Delete a range from a block.
 */
export function deleteRangeInBlock(
  block: Block,
  start: number,
  end: number
): Block {
  if (start >= end || start < 0 || end > block.content.length) {
    return block;
  }

  const deleteLength = end - start;
  const newContent = block.content.slice(0, start) + block.content.slice(end);

  // Adjust styles for deletion
  const newStyles: LocalStyleSegment[] = [];

  for (const style of block.styles) {
    // Style is entirely before deletion - no change
    if (style.end <= start) {
      newStyles.push(style);
      continue;
    }

    // Style is entirely after deletion - shift both bounds
    if (style.start >= end) {
      newStyles.push({
        ...style,
        start: style.start - deleteLength,
        end: style.end - deleteLength,
      });
      continue;
    }

    // Style is entirely within deletion - remove it
    if (style.start >= start && style.end <= end) {
      continue;
    }

    // Style overlaps with deletion - truncate or split
    if (style.start < start && style.end > end) {
      // Style spans entire deletion - shrink it
      newStyles.push({
        ...style,
        end: style.end - deleteLength,
      });
    } else if (style.start < start) {
      // Style ends within deletion - truncate end
      newStyles.push({
        ...style,
        end: start,
      });
    } else {
      // Style starts within deletion - truncate start
      newStyles.push({
        ...style,
        start: start,
        end: style.end - deleteLength,
      });
    }
  }

  return {
    ...block,
    content: newContent,
    styles: newStyles,
  };
}

/**
 * Replace a range in a block with new text.
 */
export function replaceRangeInBlock(
  block: Block,
  start: number,
  end: number,
  text: string
): Block {
  const deleted = deleteRangeInBlock(block, start, end);
  return insertTextInBlock(deleted, start, text);
}

// =============================================================================
// Document Edit Operations
// =============================================================================

/**
 * Insert text at a global offset in the document.
 *
 * If text contains newlines, may split blocks.
 */
export function insertTextInDocument(
  doc: BlockDocument,
  globalOffset: number,
  text: string
): BlockDocument {
  if (text.length === 0) {
    return doc;
  }

  const location = getBlockAtGlobalOffset(doc, globalOffset);
  if (!location) {
    return doc;
  }

  const { blockIndex, localOffset } = location;

  // Check if text contains newlines
  if (!text.includes("\n")) {
    // Simple case: insert within single block
    const newBlocks = [...doc.blocks];
    newBlocks[blockIndex] = insertTextInBlock(
      doc.blocks[blockIndex],
      localOffset,
      text
    );

    return {
      ...doc,
      blocks: newBlocks,
      version: doc.version + 1,
    };
  }

  // Complex case: text contains newlines - split into multiple blocks
  const lines = text.split("\n");
  const originalBlock = doc.blocks[blockIndex];

  // Split the original block at the cursor position to preserve styles
  const { before: beforeSplit, after: afterSplit } = splitBlock(
    originalBlock,
    localOffset
  );

  // First line: append to content before cursor
  const firstBlockContent = beforeSplit.content + lines[0];
  // Last line: prepend to content after cursor
  const lastBlockContent = lines[lines.length - 1] + afterSplit.content;

  const newBlocks: Block[] = [];

  // Blocks before insertion point
  for (let i = 0; i < blockIndex; i++) {
    newBlocks.push(doc.blocks[i]);
  }

  // First new block: styles from before split (no adjustment needed)
  const firstBlockStyles: LocalStyleSegment[] = beforeSplit.styles.map(
    (style) => ({ ...style })
  );
  newBlocks.push({
    ...originalBlock,
    content: firstBlockContent,
    styles: firstBlockStyles,
  });

  // Middle blocks (new paragraphs - no styles from original)
  for (let i = 1; i < lines.length - 1; i++) {
    newBlocks.push(createBlock(lines[i], originalBlock.type));
  }

  // Last block: styles from after split, adjusted for prepended text
  if (lines.length > 1) {
    const lastLineLength = lines[lines.length - 1].length;
    const lastBlockStyles: LocalStyleSegment[] = afterSplit.styles.map(
      (style) => ({
        ...style,
        start: style.start + lastLineLength,
        end: style.end + lastLineLength,
      })
    );
    newBlocks.push({
      id: afterSplit.id,
      type: originalBlock.type,
      content: lastBlockContent,
      styles: lastBlockStyles,
    });
  }

  // Blocks after insertion point
  for (let i = blockIndex + 1; i < doc.blocks.length; i++) {
    newBlocks.push(doc.blocks[i]);
  }

  return {
    ...doc,
    blocks: newBlocks,
    version: doc.version + 1,
  };
}

/**
 * Delete a range from the document using global offsets.
 */
export function deleteRangeInDocument(
  doc: BlockDocument,
  startOffset: number,
  endOffset: number
): BlockDocument {
  if (startOffset >= endOffset) {
    return doc;
  }

  const startLocation = getBlockAtGlobalOffset(doc, startOffset);
  const endLocation = getBlockAtGlobalOffset(doc, endOffset);

  if (!startLocation || !endLocation) {
    return doc;
  }

  const { blockIndex: startBlockIndex, localOffset: startLocalOffset } =
    startLocation;
  const { blockIndex: endBlockIndex, localOffset: endLocalOffset } =
    endLocation;

  // Same block deletion
  if (startBlockIndex === endBlockIndex) {
    const newBlocks = [...doc.blocks];
    newBlocks[startBlockIndex] = deleteRangeInBlock(
      doc.blocks[startBlockIndex],
      startLocalOffset,
      endLocalOffset
    );

    return {
      ...doc,
      blocks: newBlocks,
      version: doc.version + 1,
    };
  }

  // Cross-block deletion: merge start and end blocks, remove middle blocks
  const startBlock = doc.blocks[startBlockIndex];
  const endBlock = doc.blocks[endBlockIndex];

  const mergedContent =
    startBlock.content.slice(0, startLocalOffset) +
    endBlock.content.slice(endLocalOffset);

  // Preserve styles from start block (before deletion) and end block (after deletion)
  const startStyles: LocalStyleSegment[] = [];
  for (const style of startBlock.styles) {
    if (style.end <= startLocalOffset) {
      // Style entirely before deletion - keep as is
      startStyles.push(style);
    } else if (style.start < startLocalOffset) {
      // Style partially before deletion - truncate
      startStyles.push({ ...style, end: startLocalOffset });
    }
    // Styles starting at or after deletion point are removed
  }

  const endStyles: LocalStyleSegment[] = [];
  for (const style of endBlock.styles) {
    if (style.start >= endLocalOffset) {
      // Style entirely after deletion - shift to new position
      endStyles.push({
        ...style,
        start: startLocalOffset + (style.start - endLocalOffset),
        end: startLocalOffset + (style.end - endLocalOffset),
      });
    } else if (style.end > endLocalOffset) {
      // Style partially after deletion - truncate and shift
      endStyles.push({
        ...style,
        start: startLocalOffset,
        end: startLocalOffset + (style.end - endLocalOffset),
      });
    }
    // Styles ending at or before deletion point are removed
  }

  const mergedBlock: Block = {
    ...startBlock,
    content: mergedContent,
    styles: [...startStyles, ...endStyles],
  };

  const newBlocks: Block[] = [];

  // Blocks before deletion
  for (let i = 0; i < startBlockIndex; i++) {
    newBlocks.push(doc.blocks[i]);
  }

  // Merged block
  newBlocks.push(mergedBlock);

  // Blocks after deletion
  for (let i = endBlockIndex + 1; i < doc.blocks.length; i++) {
    newBlocks.push(doc.blocks[i]);
  }

  // Ensure at least one block exists
  if (newBlocks.length === 0) {
    newBlocks.push(createEmptyBlock());
  }

  return {
    ...doc,
    blocks: newBlocks,
    version: doc.version + 1,
  };
}

/**
 * Replace a range in the document with new text.
 */
export function replaceRangeInDocument(
  doc: BlockDocument,
  startOffset: number,
  endOffset: number,
  text: string
): BlockDocument {
  const deleted = deleteRangeInDocument(doc, startOffset, endOffset);
  return insertTextInDocument(deleted, startOffset, text);
}

// =============================================================================
// Conversion: StyledDocument <-> BlockDocument
// =============================================================================

/**
 * Convert a StyledDocument to a BlockDocument.
 *
 * The text is split by newlines to create paragraph blocks.
 * Styles are converted to block-local offsets.
 */
export function fromStyledDocument(doc: StyledDocument): BlockDocument {
  const text = getDocumentText(doc);
  const segments = toFlatSegments(doc);

  // Split text into lines
  const lines = text.split("\n");

  // Track global offset for each line
  // eslint-disable-next-line no-restricted-syntax -- accumulator in loop
  let globalOffset = 0;
  const blocks: Block[] = [];

  for (const line of lines) {
    const lineStart = globalOffset;
    const lineEnd = globalOffset + line.length;

    // Find segments that overlap with this line
    const localStyles: LocalStyleSegment[] = [];

    for (const segment of segments) {
      // Skip segments that don't overlap with this line
      if (segment.end <= lineStart || segment.start >= lineEnd) {
        continue;
      }

      // Compute local offsets
      const localStart = Math.max(0, segment.start - lineStart);
      const localEnd = Math.min(line.length, segment.end - lineStart);

      if (localStart < localEnd) {
        localStyles.push({
          start: localStart,
          end: localEnd,
          style: segment.style,
        });
      }
    }

    blocks.push({
      id: createBlockId(),
      type: "paragraph",
      content: line,
      styles: localStyles,
    });

    // +1 for the newline character
    globalOffset = lineEnd + 1;
  }

  // Ensure at least one block
  if (blocks.length === 0) {
    blocks.push(createEmptyBlock());
  }

  return {
    blocks,
    styleDefinitions: doc.styles,
    version: 1,
  };
}

/**
 * Convert a BlockDocument to a StyledDocument.
 *
 * Blocks are joined with newlines.
 * Block-local styles are converted to global offsets.
 */
export function toStyledDocument(doc: BlockDocument): StyledDocument {
  const text = getBlockDocumentText(doc);

  // Convert block-local styles to global segments
  const segments: TextStyleSegment[] = [];
  // eslint-disable-next-line no-restricted-syntax -- accumulator in loop
  let globalOffset = 0;

  for (const block of doc.blocks) {
    for (const style of block.styles) {
      segments.push({
        start: globalOffset + style.start,
        end: globalOffset + style.end,
        style: style.style,
      });
    }

    // +1 for newline between blocks
    globalOffset += block.content.length + 1;
  }

  // Create StyledDocument with the text
  // Note: This creates a simple text node; styles are in segments
  const styledDoc = createDocument(text, doc.styleDefinitions);

  // For now, return without embedding segments in the tree
  // The consumer can use the segments directly
  return styledDoc;
}

// =============================================================================
// Block Style Operations
// =============================================================================

/**
 * Apply a style to a range within a block.
 */
export function applyStyleToBlock(
  block: Block,
  start: number,
  end: number,
  style: TextStyle
): Block {
  if (start >= end || start < 0 || end > block.content.length) {
    return block;
  }

  // Add new style segment
  const newStyles: LocalStyleSegment[] = [
    ...block.styles,
    { start, end, style },
  ];

  // Sort by start position
  newStyles.sort((a, b) => a.start - b.start);

  return {
    ...block,
    styles: newStyles,
  };
}

/**
 * Remove all styles from a range within a block.
 */
export function removeStylesFromBlock(
  block: Block,
  start: number,
  end: number
): Block {
  if (start >= end) {
    return block;
  }

  const newStyles: LocalStyleSegment[] = [];

  for (const style of block.styles) {
    // Style is entirely before or after range - keep it
    if (style.end <= start || style.start >= end) {
      newStyles.push(style);
      continue;
    }

    // Style overlaps with range - may need to split
    if (style.start < start && style.end > end) {
      // Style spans entire range - split into two
      newStyles.push({ ...style, end: start });
      newStyles.push({ ...style, start: end });
    } else if (style.start < start) {
      // Style ends within range - truncate end
      newStyles.push({ ...style, end: start });
    } else if (style.end > end) {
      // Style starts within range - truncate start
      newStyles.push({ ...style, start: end });
    }
    // else: Style is entirely within range - remove it
  }

  return {
    ...block,
    styles: newStyles,
  };
}

// =============================================================================
// Block Split and Merge
// =============================================================================

/**
 * Split a block at a given offset.
 *
 * Returns two blocks: content before offset and content after offset.
 */
export function splitBlock(
  block: Block,
  offset: number
): { before: Block; after: Block } {
  const beforeContent = block.content.slice(0, offset);
  const afterContent = block.content.slice(offset);

  // Split styles
  const beforeStyles: LocalStyleSegment[] = [];
  const afterStyles: LocalStyleSegment[] = [];

  for (const style of block.styles) {
    if (style.end <= offset) {
      // Style is entirely in before block
      beforeStyles.push(style);
    } else if (style.start >= offset) {
      // Style is entirely in after block - adjust offset
      afterStyles.push({
        ...style,
        start: style.start - offset,
        end: style.end - offset,
      });
    } else {
      // Style spans the split point - create two segments
      beforeStyles.push({ ...style, end: offset });
      afterStyles.push({
        ...style,
        start: 0,
        end: style.end - offset,
      });
    }
  }

  return {
    before: {
      id: block.id, // Keep original ID for before block
      type: block.type,
      content: beforeContent,
      styles: beforeStyles,
    },
    after: {
      id: createBlockId(), // New ID for after block
      type: block.type,
      content: afterContent,
      styles: afterStyles,
    },
  };
}

/**
 * Merge two adjacent blocks into one.
 *
 * The resulting block uses the type and ID of the first block.
 */
export function mergeBlocks(first: Block, second: Block): Block {
  const firstLength = first.content.length;

  // Adjust second block's style offsets
  const shiftedSecondStyles: LocalStyleSegment[] = second.styles.map(
    (style) => ({
      ...style,
      start: style.start + firstLength,
      end: style.end + firstLength,
    })
  );

  return {
    id: first.id,
    type: first.type,
    content: first.content + second.content,
    styles: [...first.styles, ...shiftedSecondStyles],
  };
}

// =============================================================================
// Style Extraction
// =============================================================================

/**
 * Convert block-local styles to global TextStyleSegments.
 *
 * This is the primary function for extracting styles from a BlockDocument
 * for use with the renderer. Styles are converted from block-local offsets
 * to global document offsets.
 *
 * @example
 * ```typescript
 * const doc: BlockDocument = {
 *   blocks: [
 *     { id: "b1", content: "Hello", styles: [{ start: 0, end: 5, style: { fontWeight: "bold" } }] },
 *     { id: "b2", content: "World", styles: [] },
 *   ],
 *   ...
 * };
 * const segments = toGlobalSegments(doc);
 * // => [{ start: 0, end: 5, style: { fontWeight: "bold" } }]
 * ```
 */
export function toGlobalSegments(doc: BlockDocument): readonly TextStyleSegment[] {
  const segments: TextStyleSegment[] = [];
  // eslint-disable-next-line no-restricted-syntax -- accumulator in loop
  let globalOffset = 0;

  for (const block of doc.blocks) {
    for (const style of block.styles) {
      segments.push({
        start: globalOffset + style.start,
        end: globalOffset + style.end,
        style: style.style,
      });
    }

    // +1 for newline between blocks
    globalOffset += block.content.length + 1;
  }

  return segments;
}

/**
 * Get tags (style names) at a specific offset in the document.
 *
 * Used for determining active formatting at cursor position.
 * Returns tag names based on matched style definitions.
 */
export function getTagsAtBlockOffset(
  doc: BlockDocument,
  globalOffset: number
): readonly string[] {
  const location = getBlockAtGlobalOffset(doc, globalOffset);
  if (!location) {
    return [];
  }

  const { block, localOffset } = location;
  const tags: string[] = [];

  // Find styles that contain this offset
  for (const style of block.styles) {
    if (localOffset >= style.start && localOffset < style.end) {
      // Try to find matching tag in styleDefinitions
      for (const [tagName, tagStyle] of Object.entries(doc.styleDefinitions)) {
        if (isStyleMatch(style.style, tagStyle)) {
          tags.push(tagName);
        }
      }
    }
  }

  return tags;
}

/**
 * Check if two styles match (shallow comparison).
 */
function isStyleMatch(a: TextStyle, b: TextStyle): boolean {
  const aKeys = Object.keys(a) as (keyof TextStyle)[];
  const bKeys = Object.keys(b) as (keyof TextStyle)[];

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (const key of aKeys) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}
