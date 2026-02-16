/**
 * @file Line Index Hook
 *
 * React hook that provides an efficient line index for text.
 * Caches the split result and line offsets, recalculating only when text changes.
 */

import { useMemo } from "react";
import type { CursorPosition, LineIndex } from "../core/types";
import {
  buildLineOffsets,
  offsetToLineColumnFromIndex,
  lineColumnToOffsetFromIndex,
} from "./lineIndex";

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook that provides an efficient line index for text.
 *
 * Caches the split result and line offsets, recalculating only when text changes.
 * Provides O(log n) offset-to-line-column conversion via binary search.
 *
 * @param text - The source text
 * @returns Line index with lines array and conversion functions
 *
 * @example
 * ```tsx
 * const lineIndex = useLineIndex(sourceCode);
 *
 * // Access cached lines (avoids split on every render)
 * const lines = lineIndex.lines;
 *
 * // Convert offset to line/column (O(log n) instead of O(n))
 * const { line, column } = lineIndex.getLineAtOffset(cursorOffset);
 * ```
 */
export function useLineIndex(text: string): LineIndex {
  return useMemo(() => {
    const lines = text.split("\n");
    const lineOffsets = buildLineOffsets(lines);

    const getLineAtOffset = (offset: number): CursorPosition => {
      return offsetToLineColumnFromIndex(lines, lineOffsets, offset);
    };

    const getOffsetAtLineColumn = (line: number, column: number): number => {
      return lineColumnToOffsetFromIndex({ lines, lineOffsets, line, column });
    };

    return {
      lines,
      lineOffsets,
      getLineAtOffset,
      getOffsetAtLineColumn,
    };
  }, [text]);
}
