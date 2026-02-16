/**
 * @file Text Token Cache Hook
 *
 * Token cache specialized for TextEditor that considers line offsets.
 * Unlike the code editor's cache which keys by line content only,
 * this cache includes line offset information for correct style application.
 */

import { useCallback, useRef, useMemo } from "react";
import type { Token, TokenCache } from "../code/types";
import type { LineIndex } from "../core/types";

// =============================================================================
// Types
// =============================================================================

/**
 * Extended tokenizer that accepts line offset for style resolution.
 */
export type TextTokenizer = {
  readonly tokenize: (line: string, lineOffset?: number) => readonly Token[];
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook that provides a token cache for TextEditor.
 *
 * This cache is aware of line offsets, so it can correctly apply
 * styles based on character position in the document.
 *
 * @param tokenizer - Tokenizer that accepts line offset
 * @param lineIndex - Line index for offset calculation
 * @param styleVersion - Version number to invalidate cache on style changes
 * @returns Cache accessor compatible with renderer's TokenCache interface
 */
export function useTextTokenCache(
  tokenizer: TextTokenizer,
  lineIndex: LineIndex,
  styleVersion: number
): TokenCache {
  // Cache keyed by "lineIndex:lineContent" to properly invalidate on content changes
  const cacheRef = useRef<Map<string, readonly Token[]>>(new Map());
  const prevVersionRef = useRef(styleVersion);
  const prevLinesRef = useRef<readonly string[]>(lineIndex.lines);
  const tokenizerRef = useRef(tokenizer);
  const lineIndexRef = useRef(lineIndex);

  // Update refs
  tokenizerRef.current = tokenizer;
  lineIndexRef.current = lineIndex;

  // Clear cache when styles change
  if (prevVersionRef.current !== styleVersion) {
    cacheRef.current.clear();
    prevVersionRef.current = styleVersion;
  }

  // Clear cache when lines array reference changes (text content changed)
  if (prevLinesRef.current !== lineIndex.lines) {
    cacheRef.current.clear();
    prevLinesRef.current = lineIndex.lines;
  }

  // Create a getTokens function that uses line offset
  const getTokens = useCallback((line: string, lineIdx?: number): readonly Token[] => {
    const lineOffsets = lineIndexRef.current.lineOffsets;

    // If lineIdx is not provided, fall back to finding by content (legacy behavior)
    const actualLineIdx = lineIdx ?? lineIndexRef.current.lines.indexOf(line);

    if (actualLineIdx === -1) {
      // Line not found, tokenize without cache
      return tokenizerRef.current.tokenize(line, 0);
    }

    // Create cache key combining line index and content for proper invalidation
    const cacheKey = `${actualLineIdx}:${line}`;

    // Check cache
    const cached = cacheRef.current.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // Calculate offset and tokenize
    const offset = lineOffsets[actualLineIdx] ?? 0;
    const tokens = tokenizerRef.current.tokenize(line, offset);

    // Cache result
    cacheRef.current.set(cacheKey, tokens);

    return tokens;
  }, []);

  const clear = useCallback((): void => {
    cacheRef.current.clear();
  }, []);

  return useMemo(() => ({ getTokens, clear }), [getTokens, clear]);
}
