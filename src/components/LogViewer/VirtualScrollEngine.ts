/**
 * @file Pure virtual scroll calculation engine
 *
 * Completely decoupled from React lifecycle.
 * Uses curried functions for configuration and memoized calculations.
 */

import { createSegmentTree, type SegmentTree } from "./SegmentTree";

// ============================================================================
// Types
// ============================================================================

export type VirtualItem = {
  readonly index: number;
  readonly start: number;
  readonly size: number;
  readonly end: number;
};

export type VisibleRange = {
  readonly startIndex: number;
  readonly endIndex: number;
  readonly items: readonly VirtualItem[];
};

export type EngineConfig = {
  readonly estimatedItemHeight: number;
  readonly overscan: number;
};

export type EngineState = {
  readonly scrollOffset: number;
  readonly containerHeight: number;
  readonly itemCount: number;
};

// ============================================================================
// Memoization utilities
// ============================================================================

type MemoKey = string;

function createMemoCache<T>() {
  const cache = new Map<MemoKey, T>();
  const maxSize = 100;

  return {
    get(key: MemoKey): T | undefined {
      return cache.get(key);
    },
    set(key: MemoKey, value: T): void {
      if (cache.size >= maxSize) {
        // Remove oldest entry
        const firstKey = cache.keys().next().value;
        if (firstKey) {
          cache.delete(firstKey);
        }
      }
      cache.set(key, value);
    },
    clear(): void {
      cache.clear();
    },
  };
}

// ============================================================================
// Core calculation functions (pure, no side effects)
// ============================================================================

/**
 * Calculate visible range from scroll state
 * Pure function - same inputs always produce same outputs
 */
function calculateVisibleRange(
  tree: SegmentTree,
  scrollOffset: number,
  containerHeight: number,
  overscan: number,
  itemCount: number,
): { startIndex: number; endIndex: number } {
  if (itemCount === 0) {
    return { startIndex: 0, endIndex: 0 };
  }

  const rawStart = tree.findIndexByOffset(scrollOffset);
  const startIndex = Math.max(0, rawStart - overscan);

  const visibleEnd = scrollOffset + containerHeight;
  const rawEnd = tree.findIndexByOffset(visibleEnd);
  const endIndex = Math.min(rawEnd + overscan, itemCount);

  return { startIndex, endIndex };
}

/**
 * Build virtual items array for a range
 * Pure function
 */
function buildVirtualItems(
  tree: SegmentTree,
  startIndex: number,
  endIndex: number,
): VirtualItem[] {
  const items: VirtualItem[] = [];
  for (const i of Array.from({ length: endIndex - startIndex }, (_, idx) => startIndex + idx)) {
    const start = tree.prefixSum(i);
    const size = tree.get(i);
    items.push({
      index: i,
      start,
      size,
      end: start + size,
    });
  }
  return items;
}

/**
 * Calculate scroll target for scrollToIndex
 * Pure function
 */
function calculateScrollTarget(
  tree: SegmentTree,
  index: number,
  containerHeight: number,
  align: "start" | "center" | "end",
): number {
  const position = tree.prefixSum(index);
  const itemHeight = tree.get(index);

  switch (align) {
    case "center":
      return Math.max(0, position - containerHeight / 2 + itemHeight / 2);
    case "end":
      return Math.max(0, position - containerHeight + itemHeight);
    case "start":
    default:
      return position;
  }
}

// ============================================================================
// Calculator type (defined first to avoid circular reference)
// ============================================================================

export type VirtualScrollCalculator = {
  getVisibleRange(scrollOffset: number, containerHeight: number): VisibleRange;
  updateHeight(index: number, height: number): boolean;
  updateHeights(updates: ReadonlyArray<{ index: number; height: number }>): number;
  getScrollPosition(index: number): number;
  getScrollTarget(index: number, containerHeight: number, align?: "start" | "center" | "end"): number;
  getHeight(index: number): number;
  readonly totalHeight: number;
  readonly itemCount: number;
  consumeDirtyRange(): { start: number; end: number } | null;
  isDirtyInRange(start: number, end: number): boolean;
  readonly version: number;
  clearCache(): void;
  resize(newItemCount: number): VirtualScrollCalculator;
};

// ============================================================================
// Engine factory (curried configuration)
// ============================================================================

/**
 * Create a virtual scroll engine with curried configuration.
 *
 * Usage:
 * ```ts
 * const engine = createVirtualScrollEngine({ estimatedItemHeight: 36, overscan: 3 });
 * const calculator = engine(1000); // 1000 items
 *
 * const result = calculator.getVisibleRange(0, 400); // scroll=0, height=400
 * calculator.updateHeight(5, 50); // item 5 is 50px tall
 * ```
 */
export function createVirtualScrollEngine(config: EngineConfig): (itemCount: number) => VirtualScrollCalculator {
  const { estimatedItemHeight, overscan } = config;

  /**
   * Create calculator for specific item count (second curry level)
   */
  return function createCalculator(itemCount: number): VirtualScrollCalculator {
    // Internal mutable state (scoped to this calculator instance)
    const tree = createSegmentTree(new Array(itemCount).fill(estimatedItemHeight) as number[]);
    const rangeCache = createMemoCache<VisibleRange>();
    // eslint-disable-next-line no-restricted-syntax -- version counter for cache invalidation
    let treeVersion = 0;
    // eslint-disable-next-line no-restricted-syntax -- tracking dirty state
    let dirtyStart = -1;
    // eslint-disable-next-line no-restricted-syntax -- tracking dirty state
    let dirtyEnd = -1;

    function markDirty(index: number): void {
      if (dirtyStart === -1) {
        dirtyStart = index;
        dirtyEnd = index + 1;
      } else {
        dirtyStart = Math.min(dirtyStart, index);
        dirtyEnd = Math.max(dirtyEnd, index + 1);
      }
    }

    function clearDirty(): { start: number; end: number } | null {
      if (dirtyStart === -1) {
        return null;
      }
      const result = { start: dirtyStart, end: dirtyEnd };
      dirtyStart = -1;
      dirtyEnd = -1;
      return result;
    }

    function getCacheKey(scrollOffset: number, containerHeight: number): MemoKey {
      return `${treeVersion}:${Math.round(scrollOffset)}:${Math.round(containerHeight)}`;
    }

    return {
      /**
       * Get visible range for current scroll state (memoized)
       */
      getVisibleRange(scrollOffset: number, containerHeight: number): VisibleRange {
        const cacheKey = getCacheKey(scrollOffset, containerHeight);
        const cached = rangeCache.get(cacheKey);
        if (cached) {
          return cached;
        }

        const { startIndex, endIndex } = calculateVisibleRange(
          tree,
          scrollOffset,
          containerHeight,
          overscan,
          itemCount,
        );

        const items = buildVirtualItems(tree, startIndex, endIndex);
        const result: VisibleRange = Object.freeze({ startIndex, endIndex, items });
        rangeCache.set(cacheKey, result);
        return result;
      },

      /**
       * Update height for single item
       */
      updateHeight(index: number, height: number): boolean {
        const current = tree.get(index);
        if (Math.abs(current - height) <= 0.5) {
          return false;
        }
        tree.update(index, height);
        treeVersion++;
        markDirty(index);
        return true;
      },

      /**
       * Batch update multiple heights
       */
      updateHeights(updates: ReadonlyArray<{ index: number; height: number }>): number {
        // eslint-disable-next-line no-restricted-syntax -- count changes
        let changed = 0;
        for (const { index, height } of updates) {
          const current = tree.get(index);
          if (Math.abs(current - height) > 0.5) {
            tree.update(index, height);
            markDirty(index);
            changed++;
          }
        }
        if (changed > 0) {
          treeVersion++;
        }
        return changed;
      },

      /**
       * Get scroll position for index
       */
      getScrollPosition(index: number): number {
        return tree.prefixSum(index);
      },

      /**
       * Calculate scroll target for scrollToIndex
       */
      getScrollTarget(
        index: number,
        containerHeight: number,
        align: "start" | "center" | "end" = "start",
      ): number {
        return calculateScrollTarget(tree, index, containerHeight, align);
      },

      /**
       * Get height at index
       */
      getHeight(index: number): number {
        return tree.get(index);
      },

      /**
       * Get total height of all items
       */
      get totalHeight(): number {
        return tree.total;
      },

      /**
       * Get current item count
       */
      get itemCount(): number {
        return itemCount;
      },

      /**
       * Get and clear dirty range
       */
      consumeDirtyRange(): { start: number; end: number } | null {
        return clearDirty();
      },

      /**
       * Check if range overlaps with dirty range
       */
      isDirtyInRange(start: number, end: number): boolean {
        if (dirtyStart === -1) {
          return false;
        }
        return dirtyStart < end && dirtyEnd > start;
      },

      /**
       * Get current version (for cache invalidation)
       */
      get version(): number {
        return treeVersion;
      },

      /**
       * Clear all caches
       */
      clearCache(): void {
        rangeCache.clear();
      },

      /**
       * Resize the calculator for new item count
       * Returns new calculator instance
       */
      resize(newItemCount: number): VirtualScrollCalculator {
        const newCalc = createCalculator(newItemCount);
        // Copy existing heights
        const copyCount = Math.min(itemCount, newItemCount);
        for (const i of Array.from({ length: copyCount }, (_, idx) => idx)) {
          const height = tree.get(i);
          if (height !== estimatedItemHeight) {
            newCalc.updateHeight(i, height);
          }
        }
        return newCalc;
      },
    };
  };
}
