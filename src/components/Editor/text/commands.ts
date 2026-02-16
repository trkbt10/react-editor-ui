/**
 * @file TextEditor Commands
 *
 * Command definitions for text styling operations.
 * Commands can toggle tags on/off for the selected range.
 */

import type { StyledDocument } from "../core/styledDocument";
import { wrapWithTag, unwrapTag, getTagsAtOffset } from "../core/styledDocument";

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
