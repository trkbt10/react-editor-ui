/**
 * @file Code block processor
 */
import type { MarkdownParseEvent } from "../types";
import type { ParserState, BlockState } from "../parser-state";

/**
 * Check if the text at line start might be a closing fence once more content arrives.
 * Returns true if we should wait for more input before deciding.
 */
function mightBeClosingFence(text: string, endMarker: string): boolean {
  if (!text) {
    return false;
  }

  const fenceChar = endMarker[0];
  const fenceLen = endMarker.length;

  // Check if text starts with fence characters but we don't have enough to decide
  if (text[0] !== fenceChar) {
    return false;
  }

  // Count consecutive fence chars
  const firstNonFence = Array.from(text).findIndex((ch) => ch !== fenceChar);
  const fenceCount = firstNonFence === -1 ? text.length : firstNonFence;

  // If we have exactly the fence length, let the endRegex handle it
  // The regex with $ anchor will correctly match "```" at end of string or "```\n"
  if (fenceCount === fenceLen) {
    // Only wait if we have trailing whitespace without a newline (e.g., "```  ")
    // because the next chunk might complete the line
    const rest = text.slice(fenceCount);
    if (rest.length > 0 && /^\s+$/.test(rest) && !rest.includes("\n")) {
      return true; // "```  " - wait for newline
    }
    return false; // Let endRegex decide
  }

  // If we have fewer chars than fence length, only wait if we might get more backticks
  if (fenceCount < fenceLen) {
    // If we have no more content after the backticks, wait
    if (fenceCount === text.length) {
      return true;
    }
    // If the next char is also a fence char, wait for more
    if (text[fenceCount] === fenceChar) {
      return true;
    }
    // Otherwise, the fence count is finalized and doesn't match - don't wait
    return false;
  }

  return false;
}

/**
 * Process active code block, looking for end marker or accumulating content
 */
export async function* processCodeBlock(
  state: ParserState,
  activeCodeBlock: BlockState,
): AsyncGenerator<MarkdownParseEvent, void, unknown> {
  const remaining = state.buffer.slice(state.processedIndex);
  const endMarker = activeCodeBlock.endMarker ?? "```";

  // Check if we're at line start and might be seeing a closing fence
  const isLineStart = state.processedIndex === 0 || state.buffer[state.processedIndex - 1] === "\n";
  if (isLineStart && mightBeClosingFence(remaining, endMarker)) {
    // Wait for more content to decide if this is a closing fence
    return;
  }

  // Exact-length closing fence on its own line (allow trailing spaces)
  const endRegex = new RegExp(`^${endMarker.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\s*$`, "m");
  const endMatch = remaining.match(endRegex);

  if (endMatch && endMatch.index !== undefined) {
    // If there's content before the closing fence, stream it character by character first
    const content = remaining.slice(0, endMatch.index);
    if (content.length > 0) {
      // Stream one character at a time for consistent behavior
      const char = content[0];
      activeCodeBlock.content += char;
      state.processedIndex += 1;
      yield { type: "delta", elementId: activeCodeBlock.id, content: char };
      return; // Process remaining content in next iteration
    }

    // No more content before fence, now close the block
    yield { type: "end", elementId: activeCodeBlock.id, finalContent: activeCodeBlock.content.trim() };
    state.activeBlocks = state.activeBlocks.filter((b) => b.id !== activeCodeBlock.id);
    state.processedIndex += endMatch[0].length;
    // Skip single newline after closing fence
    if (state.buffer[state.processedIndex] === "\n") {
      state.processedIndex++;
    }
    return;
  }

  // Streaming: emit content character by character for real-time display
  // This matches how text blocks stream, providing immediate feedback during typing
  if (remaining.length > 0) {
    const char = remaining[0];
    activeCodeBlock.content += char;
    state.processedIndex += 1;
    yield { type: "delta", elementId: activeCodeBlock.id, content: char };
  }
}
