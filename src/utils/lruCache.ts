/**
 * @file LRU Cache Implementation
 *
 * Generic Least Recently Used cache using Map's insertion order.
 * Map maintains insertion order, so we can evict the oldest entries.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * LRU cache instance type.
 */
export type LRUCache<K, V> = {
  readonly get: (key: K) => V | undefined;
  readonly set: (key: K, value: V) => void;
  readonly clear: () => void;
};

// =============================================================================
// Factory
// =============================================================================

/**
 * Create an LRU cache using Map's insertion order.
 *
 * @param maxSize - Maximum number of entries to cache
 * @returns LRU cache instance with get, set, and clear methods
 *
 * @example
 * ```ts
 * const cache = createLRUCache<string, number>(100);
 * cache.set("key", 42);
 * const value = cache.get("key"); // 42
 * ```
 */
export function createLRUCache<K, V>(maxSize: number): LRUCache<K, V> {
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
