/**
 * @file Block detection functions for markdown parsing
 * Each function returns detected block info or undefined (no-op when not detected)
 */

import type { MarkdownElementType, MarkdownElementMetadata } from "./types";
import { detectTable as detectTableHelper, isTableRow } from "./table-detector";

export type DetectedBlock = {
  type: MarkdownElementType;
  metadata?: MarkdownElementMetadata;
  startMarker: string;
  endMarker?: string; // undefined = ends with \n\n or context-dependent
  matchLength: number;
  content?: string; // For immediate content (like headers)
};

/**
 * Detect fenced code block (``` or ~~~), CommonMark-style
 * - Only at beginning of line
 * - Capture fence char and length (>=3)
 * - Info string (language etc.) is captured as metadata (first token)
 */
export function detectCodeBlock(text: string): DetectedBlock | undefined {
  // Matches line-start fences of backticks or tildes with length >= 3
  // Require newline at end of the opening fence line to avoid half-line starts across chunks
  const match = text.match(/^((`|~)\2{2,})([^\n]*)\n/);
  if (!match || match.index !== 0) {
    return undefined;
  }

  const fence = match[1]; // sequence of ` or ~ of length >= 3
  const info = (match[3] ?? "").trim();
  const language = info ? info.split(/\s+/)[0] : "text";

  return {
    type: "code",
    metadata: { language, fenceChar: fence[0], fenceLen: fence.length },
    startMarker: match[0],
    endMarker: fence, // store opening fence sequence for reference
    matchLength: match[0].length,
  };
}

/**
 * Detect ATX-style headers (# ## ### etc.)
 * Requires newline to avoid premature detection on partial chunks.
 */
export function detectHeader(text: string): DetectedBlock | undefined {
  const match = text.match(/^(#{1,6})\s+(.+?)\n/);
  if (!match || match.index !== 0) {
    return undefined;
  }

  return {
    type: "header",
    metadata: { level: match[1].length },
    startMarker: match[0],
    matchLength: match[0].length,
    content: match[2],
  };
}

/**
 * Detect blockquote (> text)
 */
export function detectQuote(text: string): DetectedBlock | undefined {
  const match = text.match(/^>\s*/);
  if (!match || match.index !== 0) {
    return undefined;
  }

  return {
    type: "quote",
    startMarker: ">",
    endMarker: undefined, // ends with \n\n
    matchLength: match[0].length,
  };
}

/**
 * Detect ordered or unordered list items
 */
export function detectList(text: string): DetectedBlock | undefined {
  // Unordered list
  const unorderedMatch = text.match(/^(\s*)[-*+]\s+/);
  if (unorderedMatch && unorderedMatch.index === 0) {
    const indent = unorderedMatch[1].length;
    const level = Math.floor(indent / 2) + 1;

    return {
      type: "list",
      metadata: { ordered: false, level },
      startMarker: unorderedMatch[0],
      endMarker: undefined,
      matchLength: unorderedMatch[0].length,
    };
  }

  // Ordered list
  const orderedMatch = text.match(/^(\s*)(\d+)\.\s+/);
  if (orderedMatch && orderedMatch.index === 0) {
    const indent = orderedMatch[1].length;
    const level = Math.floor(indent / 2) + 1;

    return {
      type: "list",
      metadata: { ordered: true, level },
      startMarker: orderedMatch[0],
      endMarker: undefined,
      matchLength: orderedMatch[0].length,
    };
  }

  return undefined;
}

/**
 * Detect horizontal rule (--- or ___ or ***)
 */
export function detectHorizontalRule(text: string): DetectedBlock | undefined {
  const match = text.match(/^(---+|___+|\*\*\*+)\s*(?:\n|$)/);
  if (!match || match.index !== 0) {
    return undefined;
  }

  return {
    type: "horizontal_rule",
    startMarker: match[0],
    matchLength: match[0].length,
    content: match[1],
  };
}

/**
 * Detect LaTeX math blocks ($$ or $)
 */
export function detectMath(text: string): DetectedBlock | undefined {
  // Block math
  const blockMatch = text.match(/^\$\$\n?/);
  if (blockMatch && blockMatch.index === 0) {
    return {
      type: "math",
      metadata: { inline: false },
      startMarker: blockMatch[0],
      endMarker: "$$",
      matchLength: blockMatch[0].length,
    };
  }

  // Inline math
  const inlineMatch = text.match(/^\$/);
  if (inlineMatch && inlineMatch.index === 0) {
    return {
      type: "math",
      metadata: { inline: true },
      startMarker: "$",
      endMarker: "$",
      matchLength: 1,
    };
  }

  return undefined;
}

export type LinkMatch = {
  fullMatch: string;
  title: string;
  url: string;
  startIndex: number;
  endIndex: number;
};

/**
 * Detect markdown link [text](url)
 */
export function detectLink(text: string): LinkMatch | undefined {
  const match = text.match(/^\[([^\]]+)\]\(([^)]+)\)/);
  if (!match || match.index !== 0) {
    return undefined;
  }

  return {
    fullMatch: match[0],
    title: match[1],
    url: match[2],
    startIndex: 0,
    endIndex: match[0].length,
  };
}

/**
 * Check if text might be the start of a markdown link.
 * Returns true if we should wait for more content before deciding.
 */
export function mightBeLink(text: string): boolean {
  if (!text.startsWith("[")) {
    return false;
  }

  // Check if we have an incomplete link pattern
  // Full pattern: [text](url)

  // Just "[" - might be start of link
  if (text === "[") {
    return true;
  }

  // Find the closing bracket
  const closeBracket = text.indexOf("]");

  // "[text" without closing bracket - might be link text
  // But if there's a newline before we find ], it's not a link
  if (closeBracket === -1) {
    // Check if there's a newline in the text - if so, not a link
    if (text.includes("\n")) {
      return false;
    }
    return true;
  }

  // "[text]" without "(" - might be waiting for url part
  if (closeBracket === text.length - 1) {
    return true;
  }

  // Check if next char after ] is (
  if (text[closeBracket + 1] !== "(") {
    // Not a link pattern (e.g., "[text] something")
    return false;
  }

  // "[text](" without closing paren - waiting for url
  // But if there's a newline in the URL part, it's not a link
  const urlPart = text.slice(closeBracket + 2);
  if (urlPart.includes("\n")) {
    return false;
  }
  if (!urlPart.includes(")")) {
    return true;
  }

  return false;
}

/**
 * Detect GitHub-flavored markdown table
 */
export function detectTable(text: string): DetectedBlock | undefined {
  const tableMatch = detectTableHelper(text, 0);
  if (!tableMatch) {
    return undefined;
  }

  // For tables, we need to find the complete table to determine the end marker
  const lines = text.split("\n");
  // eslint-disable-next-line no-restricted-syntax -- loop counter for table line parsing performance
  let tableLines = 2; // header + separator

  // Count body rows
  for (let i = 2; i < lines.length; i++) {
    if (!lines[i].trim() || !lines[i].trim().startsWith("|")) {
      break;
    }
    tableLines++;
  }

  const matchLength = lines.slice(0, tableLines).join("\n").length;

  return {
    type: "table",
    metadata: { alignments: tableMatch.alignments },
    startMarker: tableMatch.headerLine,
    endMarker: undefined, // Tables end with a non-table line
    matchLength,
  };
}

/**
 * Detect paragraph separator (double newline)
 */
export function detectDoubleNewline(text: string): boolean {
  return text.startsWith("\n\n");
}

/**
 * Detect if quote block continues on next line
 */
export function detectQuoteContinuation(text: string): boolean {
  const match = text.match(/^\n(>)?/);
  return match ? !!match[1] : false;
}

/**
 * Aggregate detector for all block types
 * Returns the first matching block type or undefined
 */
export function detectBlock(text: string): DetectedBlock | undefined {
  // Order matters - check more specific patterns first
  const detectors = [
    detectCodeBlock,
    detectTable,
    detectMath,
    detectHeader,
    detectHorizontalRule,
    detectList,
    detectQuote,
  ];

  for (const detector of detectors) {
    const result = detector(text);
    if (result) {
      return result;
    }
  }

  return undefined;
}

/**
 * Check if text might become a block once more content arrives.
 * Used to avoid prematurely starting a text block when streaming.
 */
export function mightBeBlock(text: string): boolean {
  // Header: just # characters (might get space + content later)
  if (/^#{1,6}$/.test(text)) {
    return true;
  }
  // Header: # with space but no newline yet
  if (/^#{1,6}\s/.test(text) && !text.includes("\n")) {
    return true;
  }
  // Code fence: just backticks/tildes (might get more)
  if (/^[`~]+$/.test(text) && text.length < 3) {
    return true;
  }
  // Code fence: starts with ``` or ~~~ but no newline yet
  if (/^(`{3,}|~{3,})/.test(text) && !text.includes("\n")) {
    return true;
  }
  // List: starts with list marker but might need more content
  if (/^(\s*[-*+]\s|\s*\d+\.\s)/.test(text) && !text.includes("\n")) {
    return true;
  }
  // List: just - or * or + (might get space after)
  if (/^[-*+]$/.test(text.trim())) {
    return true;
  }
  // Quote: just > alone (might get space and content)
  // Only wait if text is exactly ">" with nothing after
  if (text === ">") {
    return true;
  }
  // Quote: starts with "> " (with space) - this is a complete quote marker, don't wait
  // Quote: starts with ">" followed by non-space non-newline - not a quote, don't wait
  // Horizontal rule: starts with --- or ___ or *** but incomplete
  if (/^(-{1,2}|_{1,2}|\*{1,2})$/.test(text.trim())) {
    return true;
  }
  // Table: starts with | (potential table row)
  if (text.startsWith("|")) {
    const newlineIdx = text.indexOf("\n");
    if (newlineIdx === -1) {
      // No complete line yet - might be incomplete table row
      return true;
    }
    // Have a complete first line - check if it's a valid table row
    const firstLine = text.slice(0, newlineIdx);
    if (isTableRow(firstLine)) {
      // Valid table row; need at least a second complete line for separator check
      const rest = text.slice(newlineIdx + 1);
      if (!rest.includes("\n")) {
        return true;
      }
    }
  }
  // Math block: just $ (might become $$ block math)
  if (/^\$+$/.test(text) && text.length < 2) {
    return true;
  }
  // Math block: $$ but no newline yet
  if (/^\$\$/.test(text) && !text.includes("\n")) {
    return true;
  }
  return false;
}
