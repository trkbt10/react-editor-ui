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
import type { BlockDocument, LocalStyleSegment } from "../block/blockDocument";
import { getTagsAtBlockOffset } from "../block/blockDocument";

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

      // Sort by start position
      newStyles.sort((a, b) => a.start - b.start);

      newBlocks[i] = {
        ...block,
        styles: newStyles,
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
 * Execute a command by ID on a BlockDocument.
 * Returns the original document if the command is not found.
 */
export function executeBlockCommand(
  doc: BlockDocument,
  commandId: string,
  start: number,
  end: number
): BlockDocument {
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
