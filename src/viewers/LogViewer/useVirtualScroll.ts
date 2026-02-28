/**
 * @file React hook wrapper for VirtualScrollEngine
 *
 * This hook is a thin wrapper that bridges the pure calculation engine
 * with React's rendering lifecycle. The heavy lifting is done by
 * VirtualScrollEngine which is completely decoupled from React.
 */

import { useCallback, useRef, useSyncExternalStore } from "react";
import {
  createVirtualScrollEngine,
  type VirtualScrollCalculator,
  type VirtualItem,
  type VisibleRange,
} from "./VirtualScrollEngine";

export type { VirtualItem };

export type VirtualScrollOptions = {
  /** Total number of items */
  itemCount: number;
  /** Estimated height for each item (used for initial layout) */
  estimatedItemHeight: number;
  /** Number of extra items to render above/below visible area */
  overscan?: number;
  /** Container height */
  containerHeight: number;
};

export type VirtualScrollResult = {
  /** Items to render (indices) */
  virtualItems: readonly VirtualItem[];
  /** Total height of all items */
  totalHeight: number;
  /** Scroll offset from top */
  scrollOffset: number;
  /** Handle scroll events */
  onScroll: (scrollTop: number) => void;
  /** Update measured height for an item (batched) */
  measureItem: (index: number, height: number) => void;
  /** Batch update multiple heights at once */
  measureItems: (updates: ReadonlyArray<{ index: number; height: number }>) => void;
  /** Scroll to a specific item */
  scrollToIndex: (index: number, align?: "start" | "center" | "end") => void;
  /** Get the calculated scroll position for an index */
  getScrollPosition: (index: number) => number;
  /** Get and clear dirty range */
  consumeDirtyRange: () => { start: number; end: number } | null;
  /** Check if range overlaps with dirty range */
  isDirtyInRange: (start: number, end: number) => boolean;
  /** Clear calculation caches */
  clearCache: () => void;
};

type Store = {
  scrollOffset: number;
  engineVersion: number;
};

/**
 * Hook for virtual scrolling with efficient height calculations.
 * Delegates all calculations to VirtualScrollEngine.
 */
export function useVirtualScroll(options: VirtualScrollOptions): VirtualScrollResult {
  const { itemCount, estimatedItemHeight, overscan = 3, containerHeight } = options;

  // Stable refs
  const engineRef = useRef<VirtualScrollCalculator | null>(null);
  const storeRef = useRef<Store>({ scrollOffset: 0, engineVersion: 0 });
  const snapshotRef = useRef<Store | null>(null);
  const subscribersRef = useRef(new Set<() => void>());
  const prevItemCountRef = useRef(itemCount);

  // Initialize engine lazily
  if (!engineRef.current) {
    const createEngine = createVirtualScrollEngine({ estimatedItemHeight, overscan });
    engineRef.current = createEngine(itemCount);
  }

  // Resize engine when item count changes
  if (prevItemCountRef.current !== itemCount && engineRef.current) {
    engineRef.current = engineRef.current.resize(itemCount);
    prevItemCountRef.current = itemCount;
    storeRef.current = {
      ...storeRef.current,
      engineVersion: storeRef.current.engineVersion + 1,
    };
    snapshotRef.current = null;
  }

  const engine = engineRef.current;

  // Notify subscribers
  const notify = useCallback(() => {
    snapshotRef.current = null;
    subscribersRef.current.forEach((cb) => cb());
  }, []);

  // Subscribe function for useSyncExternalStore
  const subscribe = useCallback((callback: () => void) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  // Get snapshot (memoized to prevent infinite loops)
  const getSnapshot = useCallback((): Store => {
    const current = storeRef.current;
    if (
      snapshotRef.current &&
      snapshotRef.current.scrollOffset === current.scrollOffset &&
      snapshotRef.current.engineVersion === current.engineVersion
    ) {
      return snapshotRef.current;
    }
    snapshotRef.current = { ...current };
    return snapshotRef.current;
  }, []);

  // Use sync external store for efficient React updates
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Get visible range from engine (memoized internally)
  const visibleRange: VisibleRange = engine.getVisibleRange(store.scrollOffset, containerHeight);

  // Scroll handler
  const onScroll = useCallback((scrollTop: number) => {
    if (Math.abs(storeRef.current.scrollOffset - scrollTop) < 0.5) {
      return;
    }
    storeRef.current = {
      ...storeRef.current,
      scrollOffset: scrollTop,
    };
    notify();
  }, [notify]);

  // Single item measurement
  const measureItem = useCallback((index: number, height: number) => {
    if (engine.updateHeight(index, height)) {
      storeRef.current = {
        ...storeRef.current,
        engineVersion: engine.version,
      };
      // Use microtask for batching multiple measurements
      queueMicrotask(notify);
    }
  }, [engine, notify]);

  // Batch measurement
  const measureItems = useCallback((updates: ReadonlyArray<{ index: number; height: number }>) => {
    const changed = engine.updateHeights(updates);
    if (changed > 0) {
      storeRef.current = {
        ...storeRef.current,
        engineVersion: engine.version,
      };
      notify();
    }
  }, [engine, notify]);

  // Get scroll position
  const getScrollPosition = useCallback((index: number): number => {
    return engine.getScrollPosition(index);
  }, [engine]);

  // Scroll to index
  const scrollToIndex = useCallback(
    (index: number, align: "start" | "center" | "end" = "start") => {
      const target = engine.getScrollTarget(index, containerHeight, align);
      storeRef.current = {
        ...storeRef.current,
        scrollOffset: target,
      };
      notify();
    },
    [engine, containerHeight, notify],
  );

  // Dirty range APIs
  const consumeDirtyRange = useCallback(() => {
    return engine.consumeDirtyRange();
  }, [engine]);

  const isDirtyInRange = useCallback((start: number, end: number) => {
    return engine.isDirtyInRange(start, end);
  }, [engine]);

  // Clear cache
  const clearCache = useCallback(() => {
    engine.clearCache();
    notify();
  }, [engine, notify]);

  return {
    virtualItems: visibleRange.items,
    totalHeight: engine.totalHeight,
    scrollOffset: store.scrollOffset,
    onScroll,
    measureItem,
    measureItems,
    scrollToIndex,
    getScrollPosition,
    consumeDirtyRange,
    isDirtyInRange,
    clearCache,
  };
}
