/**
 * @file Markdown Parser
 *
 * Parses Markdown text into BlockDocument format.
 * Supports common block-level elements: headings, lists, blockquotes, code blocks.
 */

import type { Block, BlockDocument, BlockType, LocalStyleSegment } from "./blockDocument";
import { createBlockId, DEFAULT_BLOCK_TYPE_STYLES } from "./blockDocument";

// =============================================================================
// Safety Constants
// =============================================================================

/** Maximum iterations for regex matching to prevent infinite loops */
const MAX_REGEX_ITERATIONS = 10000;

/** Maximum recursion depth for nested style parsing */
const MAX_RECURSION_DEPTH = 10;

// =============================================================================
// Types
// =============================================================================

type ParsedBlock = {
  readonly type: BlockType;
  readonly content: string;
  readonly styles: readonly LocalStyleSegment[];
};

// =============================================================================
// Block Type Detection
// =============================================================================

/**
 * Detect block type from a line of text.
 * Returns the block type and the content without the prefix.
 */
export function detectBlockType(line: string): { type: BlockType; content: string; prefix: string } {
  // Heading 1: # text
  if (line.startsWith("# ")) {
    return { type: "heading-1", content: line.slice(2), prefix: "# " };
  }

  // Heading 2: ## text
  if (line.startsWith("## ")) {
    return { type: "heading-2", content: line.slice(3), prefix: "## " };
  }

  // Heading 3: ### text
  if (line.startsWith("### ")) {
    return { type: "heading-3", content: line.slice(4), prefix: "### " };
  }

  // Bullet list: - text, * text, + text
  if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("+ ")) {
    return { type: "bullet-list", content: line.slice(2), prefix: line.slice(0, 2) };
  }

  // Numbered list: 1. text, 2. text, etc.
  const numberedMatch = line.match(/^(\d+)\.\s/);
  if (numberedMatch) {
    const prefix = numberedMatch[0];
    return { type: "numbered-list", content: line.slice(prefix.length), prefix };
  }

  // Blockquote: > text
  if (line.startsWith("> ")) {
    return { type: "blockquote", content: line.slice(2), prefix: "> " };
  }

  // Code block fence: ```
  if (line.startsWith("```")) {
    return { type: "code-block", content: line.slice(3), prefix: "```" };
  }

  // Default: paragraph
  return { type: "paragraph", content: line, prefix: "" };
}

// =============================================================================
// Inline Markdown Parsing
// =============================================================================

// Escape placeholder (Unicode private use area)
const ESCAPE_PLACEHOLDER = "\uE000";

/**
 * Pre-process text to handle escape sequences.
 * Replaces \* \_ \` \~ with placeholders.
 */
function preprocessEscapes(text: string): { processed: string; escapeMap: Map<number, string> } {
  const escapeMap = new Map<number, string>();
  let processed = "";
  let outputIndex = 0;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\\" && i + 1 < text.length) {
      const nextChar = text[i + 1];
      if (nextChar === "*" || nextChar === "_" || nextChar === "`" || nextChar === "~") {
        // Replace escape sequence with placeholder
        escapeMap.set(outputIndex, nextChar);
        processed += ESCAPE_PLACEHOLDER;
        outputIndex++;
        i++; // Skip the escaped character
        continue;
      }
    }
    processed += text[i];
    outputIndex++;
  }

  return { processed, escapeMap };
}

/**
 * Post-process content to restore escaped characters.
 */
function restoreEscapes(content: string, escapeMap: Map<number, string>): string {
  if (escapeMap.size === 0) {
    return content;
  }

  let result = "";
  for (let i = 0; i < content.length; i++) {
    if (content[i] === ESCAPE_PLACEHOLDER && escapeMap.has(i)) {
      result += escapeMap.get(i);
    } else {
      result += content[i];
    }
  }
  return result;
}

/**
 * Inline style match with delimiter information.
 */
type InlineMatch = {
  /** Start position in original text (including delimiter) */
  readonly originalStart: number;
  /** End position in original text (including delimiter) */
  readonly originalEnd: number;
  /** The inner content (without delimiters) */
  readonly innerContent: string;
  /** Length of opening delimiter */
  readonly openDelimiterLength: number;
  /** Length of closing delimiter */
  readonly closeDelimiterLength: number;
  /** Style to apply */
  readonly style: LocalStyleSegment["style"];
};

/**
 * Find all inline markdown matches in text.
 * Handles nested styles by allowing delimiters inside content.
 * Returns matches sorted by position, prioritizing longer delimiters.
 */
function findInlineMatches(text: string): InlineMatch[] {
  const matches: InlineMatch[] = [];
  let match: RegExpExecArray | null;
  let iterations = 0;

  /**
   * Safe regex exec with iteration limit to prevent infinite loops.
   */
  const safeExec = (regex: RegExp): RegExpExecArray | null => {
    if (iterations++ > MAX_REGEX_ITERATIONS) {
      console.warn(`[markdownParser] MAX_REGEX_ITERATIONS (${MAX_REGEX_ITERATIONS}) exceeded`);
      return null;
    }
    return regex.exec(text);
  };

  // Code: `text` (highest priority - prevents other parsing inside)
  // Code cannot contain backticks
  const codeRegex = /`([^`]+)`/g;
  while ((match = safeExec(codeRegex)) !== null) {
    matches.push({
      originalStart: match.index,
      originalEnd: match.index + match[0].length,
      innerContent: match[1],
      openDelimiterLength: 1,
      closeDelimiterLength: 1,
      style: { fontFamily: "monospace" },
    });
  }

  // Strikethrough: ~~text~~
  const strikeRegex = /~~([^~]+)~~/g;
  while ((match = safeExec(strikeRegex)) !== null) {
    matches.push({
      originalStart: match.index,
      originalEnd: match.index + match[0].length,
      innerContent: match[1],
      openDelimiterLength: 2,
      closeDelimiterLength: 2,
      style: { textDecoration: "line-through" },
    });
  }

  // Bold+Italic: ***text*** (must be before bold and italic)
  // Allow any content except *** sequence
  const boldItalicRegex = /\*\*\*((?:(?!\*\*\*).)+)\*\*\*/g;
  while ((match = safeExec(boldItalicRegex)) !== null) {
    // Add both bold and italic for the same range
    matches.push({
      originalStart: match.index,
      originalEnd: match.index + match[0].length,
      innerContent: match[1],
      openDelimiterLength: 3,
      closeDelimiterLength: 3,
      style: { fontWeight: "bold" },
    });
    matches.push({
      originalStart: match.index,
      originalEnd: match.index + match[0].length,
      innerContent: match[1],
      openDelimiterLength: 3,
      closeDelimiterLength: 3,
      style: { fontStyle: "italic" },
    });
  }

  // Bold: **text** - Allow content with single * (for nested italic)
  // Match ** followed by content that doesn't start with * and ends with **
  // Allow ** to be followed by * for adjacent styles (e.g., **bold***italic*)
  const boldRegex = /\*\*(?!\*)((?:(?!\*\*).)+?)\*\*/g;
  while ((match = safeExec(boldRegex)) !== null) {
    matches.push({
      originalStart: match.index,
      originalEnd: match.index + match[0].length,
      innerContent: match[1],
      openDelimiterLength: 2,
      closeDelimiterLength: 2,
      style: { fontWeight: "bold" },
    });
  }

  // Bold: __text__
  const boldUnderscoreRegex = /__(?!_)((?:(?!__).)+?)__(?!_)/g;
  while ((match = safeExec(boldUnderscoreRegex)) !== null) {
    matches.push({
      originalStart: match.index,
      originalEnd: match.index + match[0].length,
      innerContent: match[1],
      openDelimiterLength: 2,
      closeDelimiterLength: 2,
      style: { fontWeight: "bold" },
    });
  }

  // Italic: *text* (single * not part of ** or ***)
  // The lookahead (?!\*) ensures we don't start matching from ** or ***
  // Removed lookbehind to allow adjacent styles (e.g., **bold***italic*)
  const italicRegex = /(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)/g;
  while ((match = safeExec(italicRegex)) !== null) {
    matches.push({
      originalStart: match.index,
      originalEnd: match.index + match[0].length,
      innerContent: match[1],
      openDelimiterLength: 1,
      closeDelimiterLength: 1,
      style: { fontStyle: "italic" },
    });
  }

  // Handle adjacent styles: ***-separated (e.g., **bold***italic*)
  // After bold ends with **, if followed by *text*, match the italic
  const adjacentItalicRegex = /\*\*\*([^*]+?)\*/g;
  while ((match = safeExec(adjacentItalicRegex)) !== null) {
    // Capture match values to avoid null reference in callback
    const matchIndex = match.index;
    const matchLength = match[0].length;
    const matchContent = match[1];

    // This matches ***content* where *** is end of bold + start of italic
    // Only add if not already covered by bold+italic regex
    const isAlreadyCovered = matches.some(
      (m) => m.originalStart <= matchIndex && m.originalEnd >= matchIndex + matchLength
    );
    if (!isAlreadyCovered) {
      matches.push({
        originalStart: matchIndex + 2, // Start after the ** (at the single *)
        originalEnd: matchIndex + matchLength,
        innerContent: matchContent,
        openDelimiterLength: 1,
        closeDelimiterLength: 1,
        style: { fontStyle: "italic" },
      });
    }
  }

  // Italic: _text_
  const italicUnderscoreRegex = /(?<!_)_(?!_)((?:(?<!_)_(?!_)|[^_])+?)_(?!_)/g;
  while ((match = italicUnderscoreRegex.exec(text)) !== null) {
    matches.push({
      originalStart: match.index,
      originalEnd: match.index + match[0].length,
      innerContent: match[1],
      openDelimiterLength: 1,
      closeDelimiterLength: 1,
      style: { fontStyle: "italic" },
    });
  }

  // Sort by start position, then by delimiter length (longer first for priority)
  return matches.sort((a, b) => {
    if (a.originalStart !== b.originalStart) {
      return a.originalStart - b.originalStart;
    }
    // Longer delimiters take precedence
    return b.openDelimiterLength - a.openDelimiterLength;
  });
}

/**
 * Remove overlapping matches, keeping the first one found at each position.
 * Code blocks take precedence as they prevent parsing inside.
 */
function removeOverlappingMatches(matches: InlineMatch[]): InlineMatch[] {
  const result: InlineMatch[] = [];
  const coveredRanges: Array<{ start: number; end: number }> = [];

  for (const m of matches) {
    // Check if this match overlaps with any covered range
    const overlaps = coveredRanges.some(
      (r) => m.originalStart < r.end && m.originalEnd > r.start
    );

    if (!overlaps) {
      result.push(m);
      coveredRanges.push({ start: m.originalStart, end: m.originalEnd });
    } else {
      // Check if it's the same range (for bold+italic combo)
      const sameRange = result.some(
        (r) => r.originalStart === m.originalStart && r.originalEnd === m.originalEnd
      );
      if (sameRange) {
        result.push(m); // Allow multiple styles on same range
      }
    }
  }

  return result;
}

/**
 * Parse inline Markdown formatting (bold, italic, code, strikethrough).
 * Strips delimiters from content and returns style segments with correct offsets.
 *
 * Supports:
 * - **bold** or __bold__
 * - *italic* or _italic_
 * - ***bold italic***
 * - `code`
 * - ~~strikethrough~~
 * - Nested styles: **bold *and italic* text**
 * - Escaped characters: \*not italic\*
 * - Adjacent styles: **bold***italic*
 *
 * @example
 * ```typescript
 * const { content, styles } = parseInlineMarkdown("**bold** text");
 * // content = "bold text"
 * // styles = [{ start: 0, end: 4, style: { fontWeight: "bold" } }]
 * ```
 */
export function parseInlineMarkdown(text: string): {
  content: string;
  styles: LocalStyleSegment[];
} {
  if (text.length === 0) {
    return { content: "", styles: [] };
  }

  // Pre-process escape sequences
  const { processed, escapeMap } = preprocessEscapes(text);

  // Parse the processed text
  const result = parseInlineMarkdownInternal(processed);

  // Restore escaped characters in the final content
  const finalContent = restoreEscapes(result.content, adjustEscapeMap(escapeMap, processed, result.content));

  return {
    content: finalContent,
    styles: result.styles,
  };
}

/**
 * Adjust escape map positions after content transformation.
 */
function adjustEscapeMap(
  originalMap: Map<number, string>,
  processed: string,
  stripped: string
): Map<number, string> {
  if (originalMap.size === 0) {
    return originalMap;
  }

  // Build a mapping from processed positions to stripped positions
  const newMap = new Map<number, string>();

  // Simple approach: find each placeholder in the stripped content
  let strippedIdx = 0;
  for (let processedIdx = 0; processedIdx < processed.length && strippedIdx < stripped.length; processedIdx++) {
    if (processed[processedIdx] === stripped[strippedIdx]) {
      if (processed[processedIdx] === ESCAPE_PLACEHOLDER && originalMap.has(processedIdx)) {
        newMap.set(strippedIdx, originalMap.get(processedIdx)!);
      }
      strippedIdx++;
    }
  }

  return newMap;
}

/**
 * Internal parsing function (works on pre-processed text).
 * @param text - Text to parse
 * @param depth - Current recursion depth (for safety limit)
 */
function parseInlineMarkdownInternal(
  text: string,
  depth: number = 0
): {
  content: string;
  styles: LocalStyleSegment[];
} {
  // Safety: prevent infinite recursion
  if (depth > MAX_RECURSION_DEPTH) {
    console.warn(`[markdownParser] MAX_RECURSION_DEPTH (${MAX_RECURSION_DEPTH}) exceeded`);
    return { content: text, styles: [] };
  }

  const allMatches = findInlineMatches(text);
  const matches = removeOverlappingMatches(allMatches);

  if (matches.length === 0) {
    return { content: text, styles: [] };
  }

  // Build stripped content and calculate new offsets
  const contentParts: string[] = [];
  const styles: LocalStyleSegment[] = [];
  let currentPos = 0;

  // Group matches by exact position (for bold+italic on same range)
  const matchGroups = new Map<string, InlineMatch[]>();
  for (const m of matches) {
    const key = `${m.originalStart}-${m.originalEnd}`;
    if (!matchGroups.has(key)) {
      matchGroups.set(key, []);
    }
    matchGroups.get(key)!.push(m);
  }

  // Get unique positions sorted
  const uniqueMatches = Array.from(matchGroups.values()).map((group) => group[0]);
  uniqueMatches.sort((a, b) => a.originalStart - b.originalStart);

  for (const m of uniqueMatches) {
    const group = matchGroups.get(`${m.originalStart}-${m.originalEnd}`)!;

    // Add text before this match
    if (m.originalStart > currentPos) {
      contentParts.push(text.slice(currentPos, m.originalStart));
    }

    // Recursively parse inner content for nested styles
    const innerParsed = parseInlineMarkdownInternal(m.innerContent, depth + 1);

    // Calculate stripped position for this match
    const strippedStart = contentParts.join("").length;
    const strippedEnd = strippedStart + innerParsed.content.length;

    // Add inner content (already stripped of nested delimiters)
    contentParts.push(innerParsed.content);

    // Add styles for this match
    for (const groupMatch of group) {
      styles.push({
        start: strippedStart,
        end: strippedEnd,
        style: groupMatch.style,
      });
    }

    // Add nested styles with adjusted offsets
    for (const nestedStyle of innerParsed.styles) {
      styles.push({
        start: strippedStart + nestedStyle.start,
        end: strippedStart + nestedStyle.end,
        style: nestedStyle.style,
      });
    }

    currentPos = m.originalEnd;
  }

  // Add remaining text after last match
  if (currentPos < text.length) {
    contentParts.push(text.slice(currentPos));
  }

  return {
    content: contentParts.join(""),
    styles,
  };
}

// =============================================================================
// Main Parser
// =============================================================================

/**
 * Parse Markdown text into a BlockDocument.
 *
 * @example
 * ```typescript
 * const markdown = `# Hello World
 *
 * This is a paragraph.
 *
 * - Item 1
 * - Item 2
 *
 * > A quote`;
 *
 * const doc = parseMarkdownToBlockDocument(markdown);
 * ```
 */
export function parseMarkdownToBlockDocument(markdown: string): BlockDocument {
  const lines = markdown.split("\n");
  const blocks: Block[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code block toggle
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        blocks.push({
          id: createBlockId(),
          type: "code-block",
          content: codeBlockContent.join("\n"),
          styles: [],
        });
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
      }
      continue;
    }

    // Inside code block - accumulate content
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Detect block type and create block
    // Strip the prefix - visual style is determined by block type
    const { type, content: rawContent } = detectBlockType(line);
    // Parse inline markdown and strip delimiters
    const { content: strippedContent, styles } = parseInlineMarkdown(rawContent);

    blocks.push({
      id: createBlockId(),
      type,
      content: strippedContent, // Content without Markdown delimiters
      styles,
    });
  }

  // Handle unclosed code block
  if (inCodeBlock && codeBlockContent.length > 0) {
    blocks.push({
      id: createBlockId(),
      type: "code-block",
      content: codeBlockContent.join("\n"),
      styles: [],
    });
  }

  // If no blocks were created, add an empty paragraph
  if (blocks.length === 0) {
    blocks.push({
      id: createBlockId(),
      type: "paragraph",
      content: "",
      styles: [],
    });
  }

  return {
    blocks,
    styleDefinitions: {
      bold: { fontWeight: "bold" },
      italic: { fontStyle: "italic" },
      code: { fontFamily: "monospace" },
      underline: { textDecoration: "underline" },
      strikethrough: { textDecoration: "line-through" },
    },
    // Include default block type styles for visual rendering
    blockTypeStyles: DEFAULT_BLOCK_TYPE_STYLES,
    version: 1,
  };
}

// =============================================================================
// Inline Style to Markdown Conversion
// =============================================================================

/**
 * Style marker with position and type.
 */
type StyleMarker = {
  readonly position: number;
  readonly type: "open" | "close";
  readonly style: "bold" | "italic" | "code" | "strikethrough" | "underline";
  /** Priority for sorting (higher = closer to text) */
  readonly priority: number;
};

/**
 * Get Markdown delimiters for a style type.
 */
function getMarkdownDelimiters(style: StyleMarker["style"]): { open: string; close: string } {
  switch (style) {
    case "bold":
      return { open: "**", close: "**" };
    case "italic":
      return { open: "*", close: "*" };
    case "code":
      return { open: "`", close: "`" };
    case "strikethrough":
      return { open: "~~", close: "~~" };
    case "underline":
      // No standard Markdown - use HTML
      return { open: "<u>", close: "</u>" };
  }
}

/**
 * Detect style type from TextStyle properties.
 */
function detectStyleType(style: LocalStyleSegment["style"]): StyleMarker["style"] | null {
  if (style.fontWeight === "bold") {
    return "bold";
  }
  if (style.fontStyle === "italic") {
    return "italic";
  }
  if (style.fontFamily === "monospace") {
    return "code";
  }
  if (style.textDecoration === "line-through") {
    return "strikethrough";
  }
  if (style.textDecoration === "underline") {
    return "underline";
  }
  // color and fontSize have no Markdown equivalent
  return null;
}

/**
 * Convert block content with inline styles to Markdown.
 *
 * Supports:
 * - bold → **text**
 * - italic → *text*
 * - code → `text`
 * - strikethrough → ~~text~~
 * - underline → <u>text</u>
 *
 * Note: color and fontSize styles are lost in Markdown conversion.
 */
function contentWithInlineMarkdown(
  content: string,
  styles: readonly LocalStyleSegment[]
): string {
  if (styles.length === 0 || content.length === 0) {
    return content;
  }

  // Create markers for style boundaries
  const markers: StyleMarker[] = [];
  const stylePriority: Record<StyleMarker["style"], number> = {
    bold: 1,
    italic: 2,
    strikethrough: 3,
    underline: 4,
    code: 5, // code is innermost
  };

  for (const segment of styles) {
    const styleType = detectStyleType(segment.style);
    if (styleType === null) {
      continue;
    }

    markers.push({
      position: segment.start,
      type: "open",
      style: styleType,
      priority: stylePriority[styleType],
    });
    markers.push({
      position: segment.end,
      type: "close",
      style: styleType,
      priority: stylePriority[styleType],
    });
  }

  if (markers.length === 0) {
    return content;
  }

  // Sort markers:
  // 1. By position ascending
  // 2. At same position: close before open (to properly nest)
  // 3. At same position/type: by priority (higher priority = closer to text)
  markers.sort((a, b) => {
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    // Close markers come before open markers at same position
    if (a.type !== b.type) {
      return a.type === "close" ? -1 : 1;
    }
    // For open markers: lower priority first (outer delimiters)
    // For close markers: higher priority first (inner delimiters close first)
    if (a.type === "open") {
      return a.priority - b.priority;
    }
    return b.priority - a.priority;
  });

  // Build output by inserting delimiters at marker positions
  const result: string[] = [];
  let lastPos = 0;

  for (const marker of markers) {
    // Add content before this marker
    if (marker.position > lastPos) {
      result.push(content.slice(lastPos, marker.position));
      lastPos = marker.position;
    }

    // Add delimiter
    const delimiters = getMarkdownDelimiters(marker.style);
    result.push(marker.type === "open" ? delimiters.open : delimiters.close);
  }

  // Add remaining content
  if (lastPos < content.length) {
    result.push(content.slice(lastPos));
  }

  return result.join("");
}

// =============================================================================
// Main Export Functions
// =============================================================================

/**
 * Convert a BlockDocument to Markdown text.
 *
 * Supports:
 * - Block types: headings, lists, blockquotes, code blocks
 * - Inline styles: bold, italic, code, strikethrough, underline
 *
 * Note: color and fontSize styles are lost in Markdown conversion.
 *
 * @example
 * ```typescript
 * const markdown = blockDocumentToMarkdown(doc);
 * // # Hello **World**
 * // This is *italic* text.
 * ```
 */
export function blockDocumentToMarkdown(doc: BlockDocument): string {
  return doc.blocks
    .map((block) => {
      // Convert inline styles to Markdown
      const styledContent = contentWithInlineMarkdown(block.content, block.styles);

      // Add Markdown prefix based on block type
      // Content is stored without prefix for visual editing
      switch (block.type) {
        case "heading-1":
          return `# ${styledContent}`;
        case "heading-2":
          return `## ${styledContent}`;
        case "heading-3":
          return `### ${styledContent}`;
        case "bullet-list":
          return `- ${styledContent}`;
        case "numbered-list":
          return `1. ${styledContent}`;
        case "blockquote":
          return `> ${styledContent}`;
        case "code-block":
          // Code blocks don't have inline styling
          return `\`\`\`\n${block.content}\n\`\`\``;
        default:
          return styledContent;
      }
    })
    .join("\n");
}
