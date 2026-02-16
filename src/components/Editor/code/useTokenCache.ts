/**
 * @file Token Cache Hook
 *
 * LRU cache for tokenized lines to avoid re-tokenizing unchanged lines.
 */

import { useCallback, useRef } from "react";
import type { Token, TokenCache, Tokenizer } from "./types";

// =============================================================================
// LRU Cache Implementation
// =============================================================================

/**
 * LRU cache instance type.
 */
type LRUCacheInstance<K, V> = {
  readonly get: (key: K) => V | undefined;
  readonly set: (key: K, value: V) => void;
  readonly clear: () => void;
};

/**
 * Create an LRU cache using Map's insertion order.
 * Map maintains insertion order, so we can evict the oldest entries.
 */
function createLRUCache<K, V>(maxSize: number): LRUCacheInstance<K, V> {
  const cache = new Map<K, V>();

  const get = (key: K): V | undefined => {
    const value = cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      cache.delete(key);
      cache.set(key, value);
    }
    return value;
  };

  const set = (key: K, value: V): void => {
    // Delete first to update insertion order if exists
    cache.delete(key);
    cache.set(key, value);

    // Evict oldest entries if over capacity
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
  };

  const clear = (): void => {
    cache.clear();
  };

  return { get, set, clear };
}

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
  const cacheRef = useRef<LRUCacheInstance<string, readonly Token[]> | null>(null);
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
