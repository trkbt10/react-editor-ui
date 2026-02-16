/**
 * @file Word and Line Boundary Utilities
 *
 * Pure functions for detecting word and line boundaries in text.
 * Used for double-click word selection and triple-click line selection.
 */

/**
 * Word boundary characters (whitespace and common punctuation)
 */
const WORD_SEPARATORS = /[\s.,;:!?'"()[\]{}/<>@#$%^&*+=\\|`~-]/;

/**
 * Find word boundaries around a given offset.
 *
 * @param text - Full text content
 * @param offset - Character offset within text
 * @returns Start and end offsets of the word (end is exclusive)
 */
export function findWordBoundaries(
  text: string,
  offset: number
): { start: number; end: number } {
  // Clamp offset to valid range
  const clampedOffset = Math.max(0, Math.min(offset, text.length));

  // Find word start (scan backwards)
  let start = clampedOffset;
  while (start > 0) {
    const prevChar = text[start - 1];
    if (WORD_SEPARATORS.test(prevChar)) {
      break;
    }
    start--;
  }

  // Find word end (scan forwards)
  let end = clampedOffset;
  while (end < text.length) {
    const currChar = text[end];
    if (WORD_SEPARATORS.test(currChar)) {
      break;
    }
    end++;
  }

  // If start === end (cursor at separator), select just the separator
  if (start === end && end < text.length) {
    end = start + 1;
  }

  return { start, end };
}

/**
 * Find line boundaries around a given offset.
 *
 * @param text - Full text content
 * @param offset - Character offset within text
 * @returns Start and end offsets of the line (end includes the newline if present)
 */
export function findLineBoundaries(
  text: string,
  offset: number
): { start: number; end: number } {
  // Clamp offset to valid range
  const clampedOffset = Math.max(0, Math.min(offset, text.length));

  // Find line start (scan backwards for newline)
  let start = clampedOffset;
  while (start > 0 && text[start - 1] !== "\n") {
    start--;
  }

  // Find line end (scan forwards for newline)
  let end = clampedOffset;
  while (end < text.length && text[end] !== "\n") {
    end++;
  }

  // Include the newline character if present (for full line selection)
  if (end < text.length && text[end] === "\n") {
    end++;
  }

  return { start, end };
}
