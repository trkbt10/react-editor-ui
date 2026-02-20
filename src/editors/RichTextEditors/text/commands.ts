/**
 * @file TextEditor Commands
 *
 * Command definitions for text styling operations.
 * Commands can toggle tags on/off for the selected range.
 *
 * Supports both StyledDocument (legacy) and BlockDocument (current).
 */

import type { StyledDocument } from "./styledDocument";
import { wrapWithTag, unwrapTag, getTagsAtOffset } from "./styledDocument";
import type { BlockDocument, LocalStyleSegment, BlockType, Block } from "../block/blockDocument";
import { getTagsAtBlockOffset, createBlockId } from "../block/blockDocument";

// =============================================================================
// Types
// =============================================================================

/**
 * A text editor command that can be executed on a selection.
 */
export type TextEditorCommand = {
  /** Unique identifier for the command */
  readonly id: string;
  /** Tag to apply/remove */
  readonly tag: string;
  /**
   * Execute the command on a document range.
   * @param doc - The styled document
   * @param start - Start offset (0-based)
   * @param end - End offset (0-based, exclusive)
   * @returns The modified document
   */
  readonly execute: (doc: StyledDocument, start: number, end: number) => StyledDocument;
};

/**
 * Parameters for commands that require additional data.
 * Used for color commands and other parameterized operations.
 */
export type CommandParams = {
  /** Text color to apply */
  readonly color?: string;
  /** Background color to apply */
  readonly backgroundColor?: string;
};

// =============================================================================
// Command Helpers
// =============================================================================

/**
 * Check if a tag is active at the given offset.
 */
function isTagActive(doc: StyledDocument, offset: number, tag: string): boolean {
  const tags = getTagsAtOffset(doc, offset);
  return tags.includes(tag);
}

/**
 * Create a toggle command that wraps/unwraps a tag.
 */
function createToggleCommand(id: string, tag: string): TextEditorCommand {
  return {
    id,
    tag,
    execute: (doc, start, end) => {
      // Check if tag is already applied at start
      const isActive = isTagActive(doc, start, tag);

      if (isActive) {
        return unwrapTag(doc, start, end, tag);
      }
      return wrapWithTag(doc, start, end, tag);
    },
  };
}

// =============================================================================
// Default Commands
// =============================================================================

/**
 * Built-in commands for common text formatting operations.
 */
export const defaultCommands: readonly TextEditorCommand[] = [
  createToggleCommand("bold", "bold"),
  createToggleCommand("italic", "italic"),
  createToggleCommand("underline", "underline"),
  createToggleCommand("strikethrough", "strikethrough"),
  createToggleCommand("code", "code"),
];

/**
 * Map of command ID to command for quick lookup.
 */
export const defaultCommandsMap: ReadonlyMap<string, TextEditorCommand> = new Map(
  defaultCommands.map((cmd) => [cmd.id, cmd]),
);

/**
 * Get a command by ID.
 */
export function getCommand(id: string): TextEditorCommand | undefined {
  return defaultCommandsMap.get(id);
}

/**
 * Execute a command by ID on a document.
 * Returns the original document if the command is not found.
 */
export function executeCommand(
  doc: StyledDocument,
  commandId: string,
  start: number,
  end: number,
): StyledDocument {
  const command = getCommand(commandId);
  if (!command) {
    return doc;
  }
  return command.execute(doc, start, end);
}

/**
 * Get tags that are active at a given range.
 * A tag is considered active if it's applied at the start of the range.
 */
export function getActiveTagsAtRange(
  doc: StyledDocument,
  start: number,
): readonly string[] {
  return getTagsAtOffset(doc, start);
}

// =============================================================================
// BlockDocument Commands
// =============================================================================

/**
 * Check if a tag is active at the given offset in a BlockDocument.
 */
function isBlockTagActive(doc: BlockDocument, offset: number, tag: string): boolean {
  const tags = getTagsAtBlockOffset(doc, offset);
  return tags.includes(tag);
}

/**
 * Apply a style to a range in a BlockDocument using global offsets.
 *
 * The style is applied by looking up the tag in styleDefinitions.
 */
function applyTagToBlockRange(
  doc: BlockDocument,
  startOffset: number,
  endOffset: number,
  tag: string
): BlockDocument {
  if (startOffset >= endOffset) {
    return doc;
  }

  const style = doc.styleDefinitions[tag];
  if (!style) {
    return doc;
  }

  // Find blocks that overlap with the range
  const newBlocks = [...doc.blocks];
  // eslint-disable-next-line no-restricted-syntax -- accumulator in loop
  let globalOffset = 0;

  for (let i = 0; i < doc.blocks.length; i++) {
    const block = doc.blocks[i];
    const blockStart = globalOffset;
    const blockEnd = globalOffset + block.content.length;

    // Skip blocks that don't overlap with the range
    if (blockEnd < startOffset || blockStart > endOffset) {
      globalOffset = blockEnd + 1;
      continue;
    }

    // Calculate local offsets within this block
    const localStart = Math.max(0, startOffset - blockStart);
    const localEnd = Math.min(block.content.length, endOffset - blockStart);

    if (localStart < localEnd) {
      // Add new style segment to this block
      const newStyles: LocalStyleSegment[] = [
        ...block.styles,
        { start: localStart, end: localEnd, style },
      ];

      // Merge overlapping/adjacent styles with same properties
      const mergedStyles = mergeStyles(newStyles);

      newBlocks[i] = {
        ...block,
        styles: mergedStyles,
      };
    }

    globalOffset = blockEnd + 1;
  }

  return {
    ...doc,
    blocks: newBlocks,
    version: doc.version + 1,
  };
}

/**
 * Remove a tag from a range in a BlockDocument using global offsets.
 *
 * Removes style segments that match the tag's style.
 */
function removeTagFromBlockRange(
  doc: BlockDocument,
  startOffset: number,
  endOffset: number,
  tag: string
): BlockDocument {
  if (startOffset >= endOffset) {
    return doc;
  }

  const tagStyle = doc.styleDefinitions[tag];
  if (!tagStyle) {
    return doc;
  }

  const newBlocks = [...doc.blocks];
  // eslint-disable-next-line no-restricted-syntax -- accumulator in loop
  let globalOffset = 0;

  for (let i = 0; i < doc.blocks.length; i++) {
    const block = doc.blocks[i];
    const blockStart = globalOffset;
    const blockEnd = globalOffset + block.content.length;

    // Skip blocks that don't overlap with the range
    if (blockEnd < startOffset || blockStart > endOffset) {
      globalOffset = blockEnd + 1;
      continue;
    }

    // Calculate local offsets within this block
    const localStart = Math.max(0, startOffset - blockStart);
    const localEnd = Math.min(block.content.length, endOffset - blockStart);

    // Filter out styles that overlap with the removal range and match the tag
    const newStyles: LocalStyleSegment[] = [];

    for (const style of block.styles) {
      // Check if this style matches the tag
      const isTagStyle = isStyleMatch(style.style, tagStyle);

      if (!isTagStyle) {
        // Keep non-matching styles
        newStyles.push(style);
        continue;
      }

      // Check if this style overlaps with the removal range
      if (style.end <= localStart || style.start >= localEnd) {
        // No overlap - keep the style
        newStyles.push(style);
        continue;
      }

      // Style overlaps with removal range - split or remove
      if (style.start < localStart) {
        // Keep part before removal
        newStyles.push({ ...style, end: localStart });
      }
      if (style.end > localEnd) {
        // Keep part after removal
        newStyles.push({ ...style, start: localEnd });
      }
      // Middle part (inside removal range) is removed
    }

    newBlocks[i] = {
      ...block,
      styles: newStyles,
    };

    globalOffset = blockEnd + 1;
  }

  return {
    ...doc,
    blocks: newBlocks,
    version: doc.version + 1,
  };
}

/**
 * Check if two styles match (shallow comparison).
 */
function isStyleMatch(
  a: LocalStyleSegment["style"],
  b: LocalStyleSegment["style"]
): boolean {
  const aKeys = Object.keys(a) as (keyof typeof a)[];
  const bKeys = Object.keys(b) as (keyof typeof b)[];

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

/**
 * Merge overlapping or adjacent style segments with the same style properties.
 * This prevents style duplication when the same style is applied to overlapping ranges.
 */
function mergeStyles(styles: LocalStyleSegment[]): LocalStyleSegment[] {
  if (styles.length <= 1) {
    return styles;
  }

  // Sort by start position
  const sorted = [...styles].sort((a, b) => a.start - b.start);
  const result: LocalStyleSegment[] = [];

  for (const current of sorted) {
    if (result.length === 0) {
      result.push({ ...current });
      continue;
    }

    // Check if current can be merged with any existing segment
    let merged = false;

    for (let i = 0; i < result.length; i++) {
      const existing = result[i];

      // Check if styles match
      if (!isStyleMatch(existing.style, current.style)) {
        continue;
      }

      // Check if they overlap or are adjacent
      // existing: [start, end), current: [start, end)
      // Overlap: existing.start <= current.end && current.start <= existing.end
      // Adjacent: existing.end === current.start || current.end === existing.start
      if (existing.end >= current.start && current.end >= existing.start) {
        // Merge by extending the range
        result[i] = {
          ...existing,
          start: Math.min(existing.start, current.start),
          end: Math.max(existing.end, current.end),
        };
        merged = true;
        break;
      }
    }

    if (!merged) {
      result.push({ ...current });
    }
  }

  // Sort result by start position
  result.sort((a, b) => a.start - b.start);

  return result;
}

/**
 * Apply a color style directly to a range in a BlockDocument.
 * Does not use styleDefinitions - applies the color directly.
 */
function applyColorToBlockRange(
  doc: BlockDocument,
  startOffset: number,
  endOffset: number,
  color: string
): BlockDocument {
  if (startOffset >= endOffset) {
    return doc;
  }

  const newBlocks = [...doc.blocks];
  // eslint-disable-next-line no-restricted-syntax -- accumulator in loop
  let globalOffset = 0;

  for (let i = 0; i < doc.blocks.length; i++) {
    const block = doc.blocks[i];
    const blockStart = globalOffset;
    const blockEnd = globalOffset + block.content.length;

    // Skip blocks that don't overlap with the range
    if (blockEnd < startOffset || blockStart > endOffset) {
      globalOffset = blockEnd + 1;
      continue;
    }

    // Calculate local offsets within this block
    const localStart = Math.max(0, startOffset - blockStart);
    const localEnd = Math.min(block.content.length, endOffset - blockStart);

    if (localStart < localEnd) {
      // Add new style segment with color
      const newStyles: LocalStyleSegment[] = [
        ...block.styles,
        { start: localStart, end: localEnd, style: { color } },
      ];

      // Merge overlapping/adjacent styles with same properties
      const mergedStyles = mergeStyles(newStyles);

      newBlocks[i] = {
        ...block,
        styles: mergedStyles,
      };
    }

    globalOffset = blockEnd + 1;
  }

  return {
    ...doc,
    blocks: newBlocks,
    version: doc.version + 1,
  };
}

/**
 * Remove color from a range in a BlockDocument.
 * Removes or splits style segments that have a color property.
 */
function removeColorFromBlockRange(
  doc: BlockDocument,
  startOffset: number,
  endOffset: number
): BlockDocument {
  if (startOffset >= endOffset) {
    return doc;
  }

  const newBlocks = [...doc.blocks];
  // eslint-disable-next-line no-restricted-syntax -- accumulator in loop
  let globalOffset = 0;

  for (let i = 0; i < doc.blocks.length; i++) {
    const block = doc.blocks[i];
    const blockStart = globalOffset;
    const blockEnd = globalOffset + block.content.length;

    // Skip blocks that don't overlap with the range
    if (blockEnd < startOffset || blockStart > endOffset) {
      globalOffset = blockEnd + 1;
      continue;
    }

    // Calculate local offsets within this block
    const localStart = Math.max(0, startOffset - blockStart);
    const localEnd = Math.min(block.content.length, endOffset - blockStart);

    // Process styles - remove color property from overlapping segments
    const newStyles: LocalStyleSegment[] = [];

    for (const segment of block.styles) {
      // Check if this style has a color property
      if (!segment.style.color) {
        // No color - keep as is
        newStyles.push(segment);
        continue;
      }

      // Check if this style overlaps with the removal range
      if (segment.end <= localStart || segment.start >= localEnd) {
        // No overlap - keep the style
        newStyles.push(segment);
        continue;
      }

      // Style overlaps with removal range - split or modify
      if (segment.start < localStart) {
        // Keep part before removal
        newStyles.push({ ...segment, end: localStart });
      }
      if (segment.end > localEnd) {
        // Keep part after removal
        newStyles.push({ ...segment, start: localEnd });
      }
      // Middle part (inside removal range) has color removed
    }

    newBlocks[i] = {
      ...block,
      styles: newStyles,
    };

    globalOffset = blockEnd + 1;
  }

  return {
    ...doc,
    blocks: newBlocks,
    version: doc.version + 1,
  };
}

/** Block-level command IDs */
const BLOCK_LEVEL_COMMANDS = new Set([
  "heading-1",
  "heading-2",
  "heading-3",
  "bullet-list",
  "numbered-list",
  "blockquote",
]);

/**
 * Execute a command by ID on a BlockDocument.
 * Returns the original document if the command is not found.
 *
 * Supports:
 * - "textColor" with params.color applies/removes text color
 * - Tag-based commands (bold, italic, etc.) toggle inline styles
 * - Block-level commands (heading, list, quote) modify block type
 */
export function executeBlockCommand(
  doc: BlockDocument,
  commandId: string,
  start: number,
  end: number,
  params?: CommandParams
): BlockDocument {
  // Handle color command with params
  if (commandId === "textColor" && params?.color) {
    return applyColorToBlockRange(doc, start, end, params.color);
  }

  // Handle remove color command
  if (commandId === "removeColor") {
    return removeColorFromBlockRange(doc, start, end);
  }

  // Handle block-level commands (Markdown-style)
  if (BLOCK_LEVEL_COMMANDS.has(commandId)) {
    return executeBlockLevelCommand(doc, commandId, start, end);
  }

  // Handle tag-based (inline) commands
  const command = getCommand(commandId);
  if (!command) {
    return doc;
  }

  // Check if tag is already active at start
  const isActive = isBlockTagActive(doc, start, command.tag);

  if (isActive) {
    return removeTagFromBlockRange(doc, start, end, command.tag);
  }
  return applyTagToBlockRange(doc, start, end, command.tag);
}

// =============================================================================
// Block-Level Commands (Markdown-style)
// =============================================================================

/**
 * Find the block index that contains a given global offset.
 */
function findBlockAtOffset(doc: BlockDocument, offset: number): number {
  // eslint-disable-next-line no-restricted-syntax -- accumulator in loop
  let globalOffset = 0;

  for (let i = 0; i < doc.blocks.length; i++) {
    const block = doc.blocks[i];
    const blockEnd = globalOffset + block.content.length;

    if (offset >= globalOffset && offset <= blockEnd) {
      return i;
    }

    // +1 for newline between blocks
    globalOffset = blockEnd + 1;
  }

  return -1;
}

/**
 * Change the type of blocks that overlap with the given range.
 * Used for block-level formatting like headings, lists, quotes.
 */
export function setBlockType(
  doc: BlockDocument,
  startOffset: number,
  endOffset: number,
  newType: BlockType
): BlockDocument {
  const startBlockIdx = findBlockAtOffset(doc, startOffset);
  const endBlockIdx = findBlockAtOffset(doc, endOffset);

  if (startBlockIdx === -1) {
    return doc;
  }

  const actualEndIdx = endBlockIdx === -1 ? startBlockIdx : endBlockIdx;
  const newBlocks = [...doc.blocks];

  for (let i = startBlockIdx; i <= actualEndIdx; i++) {
    const block = doc.blocks[i];
    // Toggle: if already this type, convert back to paragraph
    const targetType = block.type === newType ? "paragraph" : newType;

    newBlocks[i] = {
      ...block,
      type: targetType,
    };
  }

  return {
    ...doc,
    blocks: newBlocks,
    version: doc.version + 1,
  };
}

/**
 * Convert blocks to bullet list format.
 * Adds "• " prefix to block content.
 */
export function toggleBulletList(
  doc: BlockDocument,
  startOffset: number,
  endOffset: number
): BlockDocument {
  const startBlockIdx = findBlockAtOffset(doc, startOffset);
  const endBlockIdx = findBlockAtOffset(doc, endOffset);

  if (startBlockIdx === -1) {
    return doc;
  }

  const actualEndIdx = endBlockIdx === -1 ? startBlockIdx : endBlockIdx;
  const newBlocks = [...doc.blocks];

  for (let i = startBlockIdx; i <= actualEndIdx; i++) {
    const block = doc.blocks[i];

    if (block.type === "bullet-list") {
      // Remove bullet list: change type and remove prefix
      const content = block.content.startsWith("• ")
        ? block.content.slice(2)
        : block.content;
      newBlocks[i] = {
        ...block,
        type: "paragraph" as const,
        content,
        // Adjust style offsets
        styles: block.styles.map((s) => ({
          ...s,
          start: Math.max(0, s.start - 2),
          end: Math.max(0, s.end - 2),
        })),
      };
    } else {
      // Add bullet list: change type and add prefix
      newBlocks[i] = {
        ...block,
        type: "bullet-list" as const,
        content: `• ${block.content}`,
        // Adjust style offsets
        styles: block.styles.map((s) => ({
          ...s,
          start: s.start + 2,
          end: s.end + 2,
        })),
      };
    }
  }

  return {
    ...doc,
    blocks: newBlocks,
    version: doc.version + 1,
  };
}

/**
 * Convert blocks to numbered list format.
 * Adds "1. ", "2. ", etc. prefix to block content.
 */
export function toggleNumberedList(
  doc: BlockDocument,
  startOffset: number,
  endOffset: number
): BlockDocument {
  const startBlockIdx = findBlockAtOffset(doc, startOffset);
  const endBlockIdx = findBlockAtOffset(doc, endOffset);

  if (startBlockIdx === -1) {
    return doc;
  }

  const actualEndIdx = endBlockIdx === -1 ? startBlockIdx : endBlockIdx;
  const newBlocks = [...doc.blocks];

  // eslint-disable-next-line no-restricted-syntax -- counter for list numbers
  let listNumber = 1;

  for (let i = startBlockIdx; i <= actualEndIdx; i++) {
    const block = doc.blocks[i];

    if (block.type === "numbered-list") {
      // Remove numbered list: change type and remove prefix
      const match = block.content.match(/^\d+\.\s/);
      const prefixLen = match ? match[0].length : 0;
      const content = prefixLen > 0 ? block.content.slice(prefixLen) : block.content;

      newBlocks[i] = {
        ...block,
        type: "paragraph" as const,
        content,
        styles: block.styles.map((s) => ({
          ...s,
          start: Math.max(0, s.start - prefixLen),
          end: Math.max(0, s.end - prefixLen),
        })),
      };
    } else {
      // Add numbered list: change type and add prefix
      const prefix = `${listNumber}. `;
      newBlocks[i] = {
        ...block,
        type: "numbered-list" as const,
        content: `${prefix}${block.content}`,
        styles: block.styles.map((s) => ({
          ...s,
          start: s.start + prefix.length,
          end: s.end + prefix.length,
        })),
      };
      listNumber++;
    }
  }

  return {
    ...doc,
    blocks: newBlocks,
    version: doc.version + 1,
  };
}

/**
 * Convert blocks to blockquote format.
 * Adds "> " prefix to block content.
 */
export function toggleBlockquote(
  doc: BlockDocument,
  startOffset: number,
  endOffset: number
): BlockDocument {
  const startBlockIdx = findBlockAtOffset(doc, startOffset);
  const endBlockIdx = findBlockAtOffset(doc, endOffset);

  if (startBlockIdx === -1) {
    return doc;
  }

  const actualEndIdx = endBlockIdx === -1 ? startBlockIdx : endBlockIdx;
  const newBlocks = [...doc.blocks];

  for (let i = startBlockIdx; i <= actualEndIdx; i++) {
    const block = doc.blocks[i];

    if (block.type === "blockquote") {
      // Remove blockquote: change type and remove prefix
      const content = block.content.startsWith("> ")
        ? block.content.slice(2)
        : block.content;
      newBlocks[i] = {
        ...block,
        type: "paragraph" as const,
        content,
        styles: block.styles.map((s) => ({
          ...s,
          start: Math.max(0, s.start - 2),
          end: Math.max(0, s.end - 2),
        })),
      };
    } else {
      // Add blockquote: change type and add prefix
      newBlocks[i] = {
        ...block,
        type: "blockquote" as const,
        content: `> ${block.content}`,
        styles: block.styles.map((s) => ({
          ...s,
          start: s.start + 2,
          end: s.end + 2,
        })),
      };
    }
  }

  return {
    ...doc,
    blocks: newBlocks,
    version: doc.version + 1,
  };
}

/**
 * Convert blocks to heading format.
 * Adds "# ", "## ", or "### " prefix based on level.
 */
export function toggleHeading(
  doc: BlockDocument,
  startOffset: number,
  endOffset: number,
  level: 1 | 2 | 3
): BlockDocument {
  const startBlockIdx = findBlockAtOffset(doc, startOffset);
  const endBlockIdx = findBlockAtOffset(doc, endOffset);

  if (startBlockIdx === -1) {
    return doc;
  }

  const actualEndIdx = endBlockIdx === -1 ? startBlockIdx : endBlockIdx;
  const newBlocks = [...doc.blocks];
  const headingType = `heading-${level}` as BlockType;
  const prefix = "#".repeat(level) + " ";

  for (let i = startBlockIdx; i <= actualEndIdx; i++) {
    const block = doc.blocks[i];

    if (block.type === headingType) {
      // Remove heading: change type and remove prefix
      const content = block.content.startsWith(prefix)
        ? block.content.slice(prefix.length)
        : block.content;
      newBlocks[i] = {
        ...block,
        type: "paragraph" as const,
        content,
        styles: block.styles.map((s) => ({
          ...s,
          start: Math.max(0, s.start - prefix.length),
          end: Math.max(0, s.end - prefix.length),
        })),
      };
    } else {
      // Remove any existing heading prefix first
      let content = block.content;
      let styleAdjust = 0;
      const headingMatch = content.match(/^#{1,3}\s/);
      if (headingMatch) {
        content = content.slice(headingMatch[0].length);
        styleAdjust = -headingMatch[0].length;
      }

      // Add new heading prefix
      newBlocks[i] = {
        ...block,
        type: headingType,
        content: `${prefix}${content}`,
        styles: block.styles.map((s) => ({
          ...s,
          start: Math.max(0, s.start + styleAdjust + prefix.length),
          end: Math.max(0, s.end + styleAdjust + prefix.length),
        })),
      };
    }
  }

  return {
    ...doc,
    blocks: newBlocks,
    version: doc.version + 1,
  };
}

/**
 * Map of command ID to block type.
 * Used for visual-only block type changes (no prefix modification).
 */
const COMMAND_TO_BLOCK_TYPE: Record<string, BlockType> = {
  "heading-1": "heading-1",
  "heading-2": "heading-2",
  "heading-3": "heading-3",
  "bullet-list": "bullet-list",
  "numbered-list": "numbered-list",
  "blockquote": "blockquote",
};

/**
 * Execute a block-level command by ID.
 * Used for visual block type changes - only changes block.type, not content.
 * Content remains unchanged; visual styling is determined by block type.
 */
export function executeBlockLevelCommand(
  doc: BlockDocument,
  commandId: string,
  start: number,
  end: number
): BlockDocument {
  const blockType = COMMAND_TO_BLOCK_TYPE[commandId];
  if (!blockType) {
    return doc;
  }
  return setBlockType(doc, start, end, blockType);
}
