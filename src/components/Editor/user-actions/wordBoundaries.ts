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

  const bounds = { start: clampedOffset, end: clampedOffset };

  // Find word start (scan backwards)
  while (bounds.start > 0) {
    const prevChar = text[bounds.start - 1];
    if (WORD_SEPARATORS.test(prevChar)) {
      break;
    }
    bounds.start--;
  }

  // Find word end (scan forwards)
  while (bounds.end < text.length) {
    const currChar = text[bounds.end];
    if (WORD_SEPARATORS.test(currChar)) {
      break;
    }
    bounds.end++;
  }

  // If start === end (cursor at separator), select just the separator
  if (bounds.start === bounds.end && bounds.end < text.length) {
    bounds.end = bounds.start + 1;
  }

  return bounds;
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

  const bounds = { start: clampedOffset, end: clampedOffset };

  // Find line start (scan backwards for newline)
  while (bounds.start > 0 && text[bounds.start - 1] !== "\n") {
    bounds.start--;
  }

  // Find line end (scan forwards for newline)
  while (bounds.end < text.length && text[bounds.end] !== "\n") {
    bounds.end++;
  }

  // Include the newline character if present (for full line selection)
  if (bounds.end < text.length && text[bounds.end] === "\n") {
    bounds.end++;
  }

  return bounds;
}
