/**
 * @file Token Cache Hook
 *
 * LRU cache for tokenized lines to avoid re-tokenizing unchanged lines.
 */

import { useCallback, useRef } from "react";
import type { Token, TokenCache, Tokenizer } from "./types";
import { createLRUCache, type LRUCache } from "../../../utils/lruCache";

// =============================================================================
// Hook
// =============================================================================

const DEFAULT_CACHE_SIZE = 2000;

/**
 * Hook that provides an LRU cache for tokenized lines.
 *
 * @param tokenizer - Tokenizer function to use for tokenization
 * @param maxSize - Maximum number of lines to cache (default: 2000)
 * @returns Cache accessor with getTokens and clear methods
 *
 * @example
 * ```tsx
 * const tokenCache = useTokenCache(myTokenizer);
 *
 * // In render:
 * const tokens = tokenCache.getTokens(line);
 * ```
 */
export function useTokenCache(
  tokenizer: Tokenizer,
  maxSize: number = DEFAULT_CACHE_SIZE
): TokenCache {
  const cacheRef = useRef<LRUCache<string, readonly Token[]> | null>(null);
  const tokenizerRef = useRef(tokenizer);

  // Update tokenizer ref
  tokenizerRef.current = tokenizer;

  // Lazy initialization
  if (cacheRef.current === null) {
    cacheRef.current = createLRUCache(maxSize);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- lineIndex is for TextEditor compatibility
  const getTokens = useCallback((line: string, _lineIndex?: number): readonly Token[] => {
    const cache = cacheRef.current!;
    const cached = cache.get(line);
    if (cached !== undefined) {
      return cached;
    }

    const tokens = tokenizerRef.current.tokenize(line);
    cache.set(line, tokens);
    return tokens;
  }, []);

  const clear = useCallback((): void => {
    cacheRef.current?.clear();
  }, []);

  return { getTokens, clear };
}
