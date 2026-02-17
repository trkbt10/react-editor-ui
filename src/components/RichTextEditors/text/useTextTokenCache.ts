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
  // Using content-based keys means we don't need to clear the entire cache on text changes
  const cacheRef = useRef<Map<string, readonly Token[]>>(new Map());
  const prevVersionRef = useRef(styleVersion);
  const tokenizerRef = useRef(tokenizer);
  const lineIndexRef = useRef(lineIndex);

  // Update refs
  tokenizerRef.current = tokenizer;
  lineIndexRef.current = lineIndex;

  // Clear cache when styles change (style version change means all tokens need re-tokenization)
  if (prevVersionRef.current !== styleVersion) {
    cacheRef.current.clear();
    prevVersionRef.current = styleVersion;
  }

  // Note: We no longer clear cache on text changes because the cache key includes
  // both lineIndex and lineContent ("lineIdx:lineContent"), so:
  // - Changed lines: will have new keys and get re-tokenized
  // - Unchanged lines: will hit the cache (content hasn't changed, just position might have)
  // - LRU eviction: limit cache size to prevent memory growth
  const MAX_CACHE_SIZE = 1000;
  if (cacheRef.current.size > MAX_CACHE_SIZE) {
    // Simple eviction: clear half the cache when it gets too large
    const keys = Array.from(cacheRef.current.keys());
    const toDelete = keys.slice(0, Math.floor(MAX_CACHE_SIZE / 2));
    for (const key of toDelete) {
      cacheRef.current.delete(key);
    }
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
