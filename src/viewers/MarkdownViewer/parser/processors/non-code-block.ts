/**
 * @file Non-code block processor and accumulation
 */
import type { MarkdownParseEvent } from "../types";
import type { ParserState } from "../parser-state";
import { detectBlock, detectLink, detectDoubleNewline, detectQuoteContinuation, mightBeBlock, mightBeLink } from "../block-detectors";
import { findAllInlineEmphasis } from "../emphasis-detector";
import { handleDetectedBlock, handleDoubleNewline } from "./handlers";

/**
 * Process text when no code block is active, detecting new blocks or links
 */
export async function* processNonCodeBlock(state: ParserState): AsyncGenerator<MarkdownParseEvent, void, unknown> {
  const remaining = state.buffer.slice(state.processedIndex);

  // Handle skipping leading whitespace after quote continuation marker
  // This ensures consistent behavior with full-text parsing where ^>\s* is greedy
  if (state.skipQuoteLeadingWhitespace) {
    if (remaining.length > 0) {
      const char = remaining[0];
      if (char === " " || char === "\t") {
        // Skip this whitespace character
        state.processedIndex++;
        return;
      }
      // Hit non-whitespace or newline, stop skipping
      state.skipQuoteLeadingWhitespace = false;
    }
  }

  const isLineStart = state.processedIndex === 0 || state.buffer[state.processedIndex - 1] === "\n";
  const hasActive = state.activeBlocks.length > 0;

  const detected = isLineStart ? detectBlock(remaining) : undefined;

  // Wait if at line start and this might become a block once more content arrives
  // Skip when active blocks exist — they can accumulate the content directly
  if (isLineStart && !detected && !hasActive && mightBeBlock(remaining)) {
    return;
  }

  if (detected) {
    const shouldSkipQuoteMarker = detected.type === "quote" ? state.activeBlocks.some((b) => b.type === "quote") : false;
    const shouldSkipListMarker = detected.type === "list" ? state.activeBlocks.some((b) => b.type === "list") : false;
    if (shouldSkipQuoteMarker || shouldSkipListMarker) {
      // For quote/list continuation markers, wait if we might get a trailing space
      // The marker pattern is `> ` or `- ` etc., and we need to skip the space too
      if (detected.type === "quote" && remaining === ">") {
        // Just `>` with nothing after - wait for more content to see if there's a space
        return;
      }
      if (detected.type === "list" && /^(\s*[-*+]|\s*\d+\.)$/.test(remaining)) {
        // Just the list marker with nothing after - wait for more content
        return;
      }

      // Skip the quote/list marker
      state.processedIndex += detected.matchLength;

      // For quote continuations, set flag to skip additional whitespace on subsequent iterations
      // This ensures consistent behavior with full-text parsing where ^>\s* is greedy
      if (detected.type === "quote") {
        state.skipQuoteLeadingWhitespace = true;
      }

      return;
    }

    if (hasActive) {
      const textBlocks = state.activeBlocks.filter((b) => b.type === "text");
      for (const block of textBlocks) {
        yield { type: "end", elementId: block.id, finalContent: state.processBlockContent(block) };
      }
      state.activeBlocks = state.activeBlocks.filter((b) => b.type !== "text");
    }

    yield* handleDetectedBlock(state, detected as never, remaining);
    return;
  }

  const linkMatch = detectLink(remaining);
  if (linkMatch) {
    yield {
      type: "annotation",
      elementId: "text",
      annotation: {
        type: "url_citation",
        title: linkMatch.title,
        url: linkMatch.url,
        start_index: state.processedIndex + linkMatch.startIndex,
        end_index: state.processedIndex + linkMatch.endIndex,
      },
    };
    state.processedIndex += linkMatch.fullMatch.length;
    return;
  }

  // Wait if this might be a partial link pattern
  if (mightBeLink(remaining)) {
    return;
  }

  if (detectDoubleNewline(remaining)) {
    yield* handleDoubleNewline(state);
    return;
  }

  // Handle split double newline: when remaining starts with \n and previous char was also \n
  // We're already at the second newline, so only advance by 1 (not 2 like normal handleDoubleNewline)
  if (remaining[0] === "\n" && state.processedIndex > 0 && state.buffer[state.processedIndex - 1] === "\n") {
    const blocksToClose = state.activeBlocks.filter((b) => b.endMarker === undefined);
    for (const block of blocksToClose) {
      yield { type: "end", elementId: block.id, finalContent: state.processBlockContent(block) };
    }
    state.activeBlocks = state.activeBlocks.filter((b) => b.endMarker !== undefined);
    state.processedIndex += 1; // Only advance by 1 since we're already at the second newline
    return;
  }

  if (!hasActive && remaining.length > 0 && remaining[0] !== "\n") {
    // Low-level processor: advance only. Paragraph opening is orchestrated by streaming parser.
    state.processedIndex++;
    return;
  }

  if (state.activeBlocks.length > 0) {
    yield* accumulateBlockContent(state, remaining);
    return;
  }

  if (remaining.length > 0) {
    state.processedIndex++;
  }
}

/**
 * Accumulates content for active markdown blocks.
 */
export async function* accumulateBlockContent(
  state: ParserState,
  remaining: string,
): AsyncGenerator<MarkdownParseEvent, void, unknown> {
  // If the remaining input is exactly a single newline, emit a single newline delta
  if (remaining.length === 1 && remaining[0] === "\n") {
    for (const block of state.activeBlocks) {
      block.content += "\n";
      if (block.type === "code") {
        continue;
      }
      // For plain text paragraphs, avoid emitting a standalone trailing newline; defer to flush step
      if (block.type === "text") {
        continue;
      }
      const transformedNow = state.transformBlockContent(block);
      const already = block.lastEmittedLength ?? 0;
      const piece = transformedNow.slice(already);
      if (piece.length > 0) {
        yield { type: "delta", elementId: block.id, content: piece };
        block.lastEmittedLength = already + piece.length;
      }
    }
    state.processedIndex += 1;
    return;
  }
  const quoteBlocks = state.activeBlocks.filter((b) => b.type === "quote");
  if (quoteBlocks.length > 0 && remaining[0] === "\n") {
    const canDecide = remaining.length >= 2;
    if (canDecide && !detectQuoteContinuation(remaining)) {
      for (const block of quoteBlocks) {
        if (!block.content.endsWith("\n")) {
          block.content += "\n";
        }
        const transformed = state.transformBlockContent(block);
        const already = block.lastEmittedLength ?? 0;
        const remainder = transformed.slice(already);
        if (remainder.length > 0) {
          yield { type: "delta", elementId: block.id, content: remainder };
          block.lastEmittedLength = transformed.length;
        }
        yield { type: "end", elementId: block.id, finalContent: state.processBlockContent(block) };
      }
      state.activeBlocks = state.activeBlocks.filter((b) => b.type !== "quote");
    }
  }

  // For table blocks, if next line does not look like a table row, flush and close them
  const tableBlocks = state.activeBlocks.filter((b) => b.type === "table");
  if (tableBlocks.length > 0 && remaining[0] === "\n") {
    const nextLine = remaining.slice(1);
    const continues = /^\s*\|/.test(nextLine);
    if (!continues) {
      for (const block of tableBlocks) {
        const transformed = state.transformBlockContent(block);
        const already = block.lastEmittedLength ?? 0;
        const remainder = transformed.slice(already);
        if (remainder.length > 0) {
          yield { type: "delta", elementId: block.id, content: remainder };
          block.lastEmittedLength = transformed.length;
        }
        yield { type: "end", elementId: block.id, finalContent: state.processBlockContent(block) };
      }
      state.activeBlocks = state.activeBlocks.filter((b) => b.type !== "table");
    }
  }

  // Accumulate one character
  const char = remaining[0];
  for (const block of state.activeBlocks) {
    block.content += char;
  }

  // Emit deltas for incremental content using word/space-aware chunking (non-code blocks)
  for (const block of state.activeBlocks) {
    if (block.type === "code") {
      continue;
    }
    const transformed = state.transformBlockContent(block);
    const already = block.lastEmittedLength ?? 0;
    // eslint-disable-next-line no-restricted-syntax -- Controlled local mutation for newline trimming and chunking
    let piece = transformed.slice(already);
    // If only a newline was added since last emission, emit a single newline delta
    if (piece === "\n") {
      yield { type: "delta", elementId: block.id, content: "\n" };
      block.lastEmittedLength = already + 1;
      continue;
    }
    // Fast-path: if the just-accumulated char is a newline AND there is no other new text pending, emit it
    if (remaining[0] === "\n" && piece.length === 1) {
      yield { type: "delta", elementId: block.id, content: "\n" };
      block.lastEmittedLength = transformed.length;
      continue;
    }
    // Let the regular segmentation handle newlines to avoid missing tail text
    if (block.type === "text") {
      if (piece.endsWith("\n")) {
        if (state.processedIndex + 1 >= state.buffer.length) {
          piece = piece.slice(0, -1);
        }
      }
    }
    if (piece.length === 0) {
      continue;
    }

    // Special handling for list blocks: emit per line to avoid off-by-one due to marker stripping
    if (block.type === "list") {
      const newlineIdx = piece.indexOf("\n");
      if (newlineIdx >= 0) {
        const line = piece.slice(0, newlineIdx + 1);
        yield { type: "delta", elementId: block.id, content: line };
        block.lastEmittedLength = already + newlineIdx + 1;
        continue;
      }
      continue;
    }

    type Seg =
      | { kind: "plain"; text: string }
      | { kind: "emph"; style: "strong" | "emphasis" | "strikethrough" | "code"; text: string };
    const matches = findAllInlineEmphasis(piece, 0);

    const createSegments = (text: string, emphasisMatches: typeof matches): Seg[] => {
      const segments: Seg[] = [];
      // eslint-disable-next-line no-restricted-syntax -- Index while scanning emphasis boundaries
      let pos = 0;
      for (const m of emphasisMatches) {
        if (m.startIndex > pos) {
          segments.push({ kind: "plain", text: text.slice(pos, m.startIndex) });
        }
        const content = text.slice(m.startIndex + m.marker.length, m.endIndex - m.marker.length);
        segments.push({ kind: "emph", style: m.type, text: content });
        pos = m.endIndex;
      }
      if (pos < text.length) {
        segments.push({ kind: "plain", text: text.slice(pos) });
      }
      return segments;
    };

    const segments = createSegments(piece, matches);
    const maxSize = Math.max(1, state.config.maxDeltaChunkSize ?? 1);

    const processSegments = (
      segs: Seg[],
      blockId: string,
      startConsumed: number,
    ): { chunks: MarkdownParseEvent[]; totalConsumed: number } => {
      const chunks: MarkdownParseEvent[] = [];
      // eslint-disable-next-line no-restricted-syntax -- Accumulator for emitted characters across segments
      let consumed = startConsumed;
      for (const seg of segs) {
        if (seg.kind === "plain") {
          const processTextSegment = (text: string): { chunks: string[]; flushed: number } => {
            const textChunks: string[] = [];
            // eslint-disable-next-line no-restricted-syntax -- Local pointer for incremental emission
            let flushed = 0;
            while (flushed < text.length) {
              const rest = text.slice(flushed);
              // eslint-disable-next-line no-restricted-syntax -- Local buffer for the next emitted chunk
              let out = "";
              if (rest[0] === "\n") {
                const m = rest.match(/^\n+/);
                out = m ? m[0] : "\n";
              } else if (rest[0] === " ") {
                const m = rest.match(/^ +/);
                out = m ? m[0] : " ";
              } else {
                const nextDelim = rest.search(/[ \n]/);
                if (nextDelim === -1) {
                  if (rest.length < maxSize) {
                    break;
                  }
                  out = rest.slice(0, maxSize);
                } else {
                  const candidate = rest.slice(0, nextDelim);
                  out = candidate.length >= maxSize ? candidate.slice(0, maxSize) : candidate;
                }
              }
              if (!out) {
                break;
              }
              textChunks.push(out);
              flushed += out.length;
            }
            return { chunks: textChunks, flushed };
          };
          const result = processTextSegment(seg.text);
          for (const chunk of result.chunks) {
            chunks.push({ type: "delta", elementId: blockId, content: chunk });
          }
          consumed += result.flushed;
        } else {
          const id = state.generateId();
          const getElementType = (style: string) => {
            if (style === "strong") {
              return "strong" as const;
            }
            if (style === "emphasis") {
              return "emphasis" as const;
            }
            if (style === "strikethrough") {
              return "strikethrough" as const;
            }
            return "code" as const;
          };
          const elementType = getElementType(seg.style);
          chunks.push({ type: "begin", elementType, elementId: id });
          if (seg.text.length > 0) {
            chunks.push({ type: "delta", elementId: id, content: seg.text });
          }
          chunks.push({ type: "end", elementId: id, finalContent: seg.text });
          consumed += seg.text.length;
        }
      }
      return { chunks, totalConsumed: consumed };
    };

    const result = processSegments(segments, block.id, already);
    for (const chunk of result.chunks) {
      yield chunk;
    }
    block.lastEmittedLength = result.totalConsumed;
  }

  state.processedIndex++;
}
