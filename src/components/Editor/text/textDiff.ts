/**
 * @file Text Diff Utilities
 *
 * Pure functions for computing minimal text differences.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Result of a text diff computation.
 */
export type TextDiffResult = {
  /** Start offset of the change in both texts */
  readonly start: number;
  /** End offset of the change in the old text */
  readonly oldEnd: number;
  /** End offset of the change in the new text */
  readonly newEnd: number;
};

// =============================================================================
// Pure Functions
// =============================================================================

/**
 * Find length of common prefix between two strings.
 *
 * @param a - First string
 * @param b - Second string
 * @returns Length of common prefix
 */
export function findCommonPrefixLength(a: string, b: string): number {
  const minLength = Math.min(a.length, b.length);
  const firstDiff = [...Array(minLength)].findIndex((_, i) => a[i] !== b[i]);
  return firstDiff === -1 ? minLength : firstDiff;
}

/**
 * Find end indices after removing common suffix.
 *
 * @param oldText - Original text
 * @param newText - New text
 * @param start - Start offset (where texts diverge)
 * @returns End indices for both texts
 */
export function findSuffixBoundaries(
  oldText: string,
  newText: string,
  start: number
): { oldEnd: number; newEnd: number } {
  const oldRest = oldText.slice(start);
  const newRest = newText.slice(start);
  const suffixLen = findCommonPrefixLength(
    [...oldRest].reverse().join(""),
    [...newRest].reverse().join("")
  );
  return { oldEnd: oldText.length - suffixLen, newEnd: newText.length - suffixLen };
}

/**
 * Compute text diff and return the change range.
 *
 * @param oldText - Original text
 * @param newText - New text
 * @returns Diff result with start and end offsets
 */
export function computeTextDiff(oldText: string, newText: string): TextDiffResult {
  const start = findCommonPrefixLength(oldText, newText);
  const { oldEnd, newEnd } = findSuffixBoundaries(oldText, newText, start);
  return { start, oldEnd, newEnd };
}
