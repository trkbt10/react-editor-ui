/**
 * @file React hook wrapper for VirtualGrid2DEngine
 *
 * This hook bridges the pure 2D grid calculation engine
 * with React's rendering lifecycle. Handles both X and Y scroll.
 */

import {
  useCallback,
  useDeferredValue,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  createVirtualGrid2DEngine,
  type VirtualGrid2DCalculator,
  type VirtualGridItem,
  type VirtualGridRange,
} from "./VirtualGrid2DEngine";

export type { VirtualGridItem, VirtualGridRange };

export type VirtualGridOptions = {
  /** Total number of rows */
  rowCount: number;
  /** Total number of columns */
  columnCount: number;
  /** Estimated height for each row */
  estimatedRowHeight: number;
  /** Estimated width for each column */
  estimatedColumnWidth: number;
  /** Number of extra rows to render above/below visible area */
  overscanRows?: number;
  /** Number of extra columns to render left/right of visible area */
  overscanColumns?: number;
  /** Container height */
  containerHeight: number;
  /** Container width */
  containerWidth: number;
};

export type VirtualGridResult = {
  /** Grid range with items to render */
  virtualRange: VirtualGridRange;
  /** Total height of all rows */
  totalHeight: number;
  /** Total width of all columns */
  totalWidth: number;
  /** Current scroll Y offset */
  scrollY: number;
  /** Current scroll X offset */
  scrollX: number;
  /** Handle scroll events (both X and Y) */
  onScroll: (scrollTop: number, scrollLeft: number) => void;
  /** Update measured height for a row */
  measureRow: (rowIndex: number, height: number) => void;
  /** Update measured width for a column */
  measureColumn: (colIndex: number, width: number) => void;
  /** Batch update row heights */
  measureRows: (
    updates: ReadonlyArray<{ index: number; height: number }>
  ) => void;
  /** Batch update column widths */
  measureColumns: (
    updates: ReadonlyArray<{ index: number; width: number }>
  ) => void;
  /** Scroll to a specific row */
  scrollToRow: (rowIndex: number, align?: "start" | "center" | "end") => void;
  /** Scroll to a specific column */
  scrollToColumn: (
    colIndex: number,
    align?: "start" | "center" | "end"
  ) => void;
  /** Scroll to a specific cell */
  scrollToCell: (
    rowIndex: number,
    colIndex: number,
    alignRow?: "start" | "center" | "end",
    alignCol?: "start" | "center" | "end"
  ) => void;
  /** Get row position in pixels */
  getRowPosition: (rowIndex: number) => number;
  /** Get row height in pixels */
  getRowHeight: (rowIndex: number) => number;
  /** Get column position in pixels */
  getColumnPosition: (colIndex: number) => number;
  /** Clear calculation caches */
  clearCache: () => void;
};

type Store = {
  scrollY: number;
  scrollX: number;
  engineVersion: number;
};

/**
 * Hook for 2D virtual scrolling with efficient grid calculations.
 */
export function useVirtualGrid(options: VirtualGridOptions): VirtualGridResult {
  const {
    rowCount,
    columnCount,
    estimatedRowHeight,
    estimatedColumnWidth,
    overscanRows = 3,
    overscanColumns = 2,
    containerHeight,
    containerWidth,
  } = options;

  // Stable refs
  const engineRef = useRef<VirtualGrid2DCalculator | null>(null);
  const storeRef = useRef<Store>({
    scrollY: 0,
    scrollX: 0,
    engineVersion: 0,
  });
  const snapshotRef = useRef<Store | null>(null);
  const subscribersRef = useRef(new Set<() => void>());
  const prevDimsRef = useRef({ rowCount, columnCount });

  // Initialize engine lazily
  if (!engineRef.current) {
    const createEngine = createVirtualGrid2DEngine({
      estimatedRowHeight,
      estimatedColumnWidth,
      overscanRows,
      overscanColumns,
    });
    engineRef.current = createEngine(rowCount, columnCount);
  }

  // Resize engine when dimensions change
  if (
    (prevDimsRef.current.rowCount !== rowCount ||
      prevDimsRef.current.columnCount !== columnCount) &&
    engineRef.current
  ) {
    engineRef.current = engineRef.current.resize(rowCount, columnCount);
    prevDimsRef.current = { rowCount, columnCount };
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
      snapshotRef.current.scrollY === current.scrollY &&
      snapshotRef.current.scrollX === current.scrollX &&
      snapshotRef.current.engineVersion === current.engineVersion
    ) {
      return snapshotRef.current;
    }
    snapshotRef.current = { ...current };
    return snapshotRef.current;
  }, []);

  // Use sync external store for efficient React updates
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Defer scroll positions during rapid scrolling to reduce render pressure
  const deferredScrollY = useDeferredValue(store.scrollY);
  const deferredScrollX = useDeferredValue(store.scrollX);

  // Get visible range from engine using deferred scroll positions
  // This allows React to skip intermediate renders during fast scrolling
  const virtualRange: VirtualGridRange = engine.getVisibleRange(
    deferredScrollY,
    deferredScrollX,
    containerHeight,
    containerWidth
  );

  // Scroll handler (both X and Y)
  const onScroll = useCallback(
    (scrollTop: number, scrollLeft: number) => {
      const yChanged = Math.abs(storeRef.current.scrollY - scrollTop) >= 0.5;
      const xChanged = Math.abs(storeRef.current.scrollX - scrollLeft) >= 0.5;

      if (!yChanged && !xChanged) {
        return;
      }

      storeRef.current = {
        ...storeRef.current,
        scrollY: yChanged ? scrollTop : storeRef.current.scrollY,
        scrollX: xChanged ? scrollLeft : storeRef.current.scrollX,
      };
      notify();
    },
    [notify]
  );

  // Single row measurement
  const measureRow = useCallback(
    (rowIndex: number, height: number) => {
      if (engine.updateRowHeight(rowIndex, height)) {
        storeRef.current = {
          ...storeRef.current,
          engineVersion: engine.version,
        };
        queueMicrotask(notify);
      }
    },
    [engine, notify]
  );

  // Single column measurement
  const measureColumn = useCallback(
    (colIndex: number, width: number) => {
      if (engine.updateColumnWidth(colIndex, width)) {
        storeRef.current = {
          ...storeRef.current,
          engineVersion: engine.version,
        };
        queueMicrotask(notify);
      }
    },
    [engine, notify]
  );

  // Batch row measurement
  const measureRows = useCallback(
    (updates: ReadonlyArray<{ index: number; height: number }>) => {
      const changed = engine.updateRowHeights(updates);
      if (changed > 0) {
        storeRef.current = {
          ...storeRef.current,
          engineVersion: engine.version,
        };
        notify();
      }
    },
    [engine, notify]
  );

  // Batch column measurement
  const measureColumns = useCallback(
    (updates: ReadonlyArray<{ index: number; width: number }>) => {
      const changed = engine.updateColumnWidths(updates);
      if (changed > 0) {
        storeRef.current = {
          ...storeRef.current,
          engineVersion: engine.version,
        };
        notify();
      }
    },
    [engine, notify]
  );

  // Scroll to row
  const scrollToRow = useCallback(
    (rowIndex: number, align: "start" | "center" | "end" = "start") => {
      const target = engine.getScrollTargetForRow(
        rowIndex,
        containerHeight,
        align
      );
      storeRef.current = {
        ...storeRef.current,
        scrollY: target,
      };
      notify();
    },
    [engine, containerHeight, notify]
  );

  // Scroll to column
  const scrollToColumn = useCallback(
    (colIndex: number, align: "start" | "center" | "end" = "start") => {
      const target = engine.getScrollTargetForColumn(
        colIndex,
        containerWidth,
        align
      );
      storeRef.current = {
        ...storeRef.current,
        scrollX: target,
      };
      notify();
    },
    [engine, containerWidth, notify]
  );

  // Scroll to cell
  const scrollToCell = useCallback(
    (
      rowIndex: number,
      colIndex: number,
      alignRow: "start" | "center" | "end" = "start",
      alignCol: "start" | "center" | "end" = "start"
    ) => {
      const targetY = engine.getScrollTargetForRow(
        rowIndex,
        containerHeight,
        alignRow
      );
      const targetX = engine.getScrollTargetForColumn(
        colIndex,
        containerWidth,
        alignCol
      );
      storeRef.current = {
        ...storeRef.current,
        scrollY: targetY,
        scrollX: targetX,
      };
      notify();
    },
    [engine, containerHeight, containerWidth, notify]
  );

  // Get row position
  const getRowPosition = useCallback(
    (rowIndex: number): number => {
      return engine.getRowPosition(rowIndex);
    },
    [engine]
  );

  // Get row height
  const getRowHeight = useCallback(
    (rowIndex: number): number => {
      return engine.getRowHeight(rowIndex);
    },
    [engine]
  );

  // Get column position
  const getColumnPosition = useCallback(
    (colIndex: number): number => {
      return engine.getColumnPosition(colIndex);
    },
    [engine]
  );

  // Clear cache
  const clearCache = useCallback(() => {
    engine.clearCache();
    notify();
  }, [engine, notify]);

  return {
    virtualRange,
    totalHeight: engine.totalHeight,
    totalWidth: engine.totalWidth,
    scrollY: store.scrollY,
    scrollX: store.scrollX,
    onScroll,
    measureRow,
    measureColumn,
    measureRows,
    measureColumns,
    scrollToRow,
    scrollToColumn,
    scrollToCell,
    getRowPosition,
    getRowHeight,
    getColumnPosition,
    clearCache,
  };
}
