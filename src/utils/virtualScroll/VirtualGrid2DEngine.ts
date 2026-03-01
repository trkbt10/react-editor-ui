/**
 * @file 2D Virtual Grid calculation engine
 *
 * Extends VirtualScrollEngine pattern to 2D (rows + columns).
 * Uses two SegmentTrees for O(log n) cumulative offset calculations.
 */

import { createSegmentTree, type SegmentTree } from "./SegmentTree";

// ============================================================================
// Types
// ============================================================================

export type VirtualGridItem = {
  readonly rowIndex: number;
  readonly colIndex: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type VirtualGridRange = {
  readonly startRow: number;
  readonly endRow: number;
  readonly startCol: number;
  readonly endCol: number;
  readonly items: readonly VirtualGridItem[];
  readonly totalWidth: number;
  readonly totalHeight: number;
};

export type Grid2DConfig = {
  readonly estimatedRowHeight: number;
  readonly estimatedColumnWidth: number;
  readonly overscanRows: number;
  readonly overscanColumns: number;
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
// Core calculation functions (pure)
// ============================================================================

function calculateVisibleRange(
  tree: SegmentTree,
  scrollOffset: number,
  containerSize: number,
  overscan: number,
  itemCount: number
): { startIndex: number; endIndex: number } {
  if (itemCount === 0) {
    return { startIndex: 0, endIndex: 0 };
  }

  const rawStart = tree.findIndexByOffset(scrollOffset);
  const startIndex = Math.max(0, rawStart - overscan);

  const visibleEnd = scrollOffset + containerSize;
  const rawEnd = tree.findIndexByOffset(visibleEnd);
  const endIndex = Math.min(rawEnd + overscan, itemCount);

  return { startIndex, endIndex };
}

function buildVirtualGridItems(
  rowTree: SegmentTree,
  colTree: SegmentTree,
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number
): VirtualGridItem[] {
  const items: VirtualGridItem[] = [];

  for (let r = startRow; r < endRow; r++) {
    const y = rowTree.prefixSum(r);
    const height = rowTree.get(r);

    for (let c = startCol; c < endCol; c++) {
      const x = colTree.prefixSum(c);
      const width = colTree.get(c);

      items.push({
        rowIndex: r,
        colIndex: c,
        x,
        y,
        width,
        height,
      });
    }
  }

  return items;
}

function calculateScrollTarget(
  tree: SegmentTree,
  index: number,
  containerSize: number,
  align: "start" | "center" | "end"
): number {
  const position = tree.prefixSum(index);
  const itemSize = tree.get(index);

  switch (align) {
    case "center":
      return Math.max(0, position - containerSize / 2 + itemSize / 2);
    case "end":
      return Math.max(0, position - containerSize + itemSize);
    case "start":
    default:
      return position;
  }
}

// ============================================================================
// Calculator type
// ============================================================================

export type VirtualGrid2DCalculator = {
  getVisibleRange(
    scrollY: number,
    scrollX: number,
    containerHeight: number,
    containerWidth: number
  ): VirtualGridRange;

  updateRowHeight(rowIndex: number, height: number): boolean;
  updateColumnWidth(colIndex: number, width: number): boolean;

  updateRowHeights(
    updates: ReadonlyArray<{ index: number; height: number }>
  ): number;
  updateColumnWidths(
    updates: ReadonlyArray<{ index: number; width: number }>
  ): number;

  getRowPosition(rowIndex: number): number;
  getColumnPosition(colIndex: number): number;

  getRowHeight(rowIndex: number): number;
  getColumnWidth(colIndex: number): number;

  getScrollTargetForRow(
    rowIndex: number,
    containerHeight: number,
    align?: "start" | "center" | "end"
  ): number;
  getScrollTargetForColumn(
    colIndex: number,
    containerWidth: number,
    align?: "start" | "center" | "end"
  ): number;

  readonly totalHeight: number;
  readonly totalWidth: number;
  readonly rowCount: number;
  readonly columnCount: number;
  readonly version: number;

  clearCache(): void;
  resize(newRowCount: number, newColumnCount: number): VirtualGrid2DCalculator;
};

// ============================================================================
// Engine factory
// ============================================================================

/**
 * Create a 2D virtual grid engine with curried configuration.
 *
 * @example
 * ```ts
 * const engine = createVirtualGrid2DEngine({
 *   estimatedRowHeight: 28,
 *   estimatedColumnWidth: 120,
 *   overscanRows: 3,
 *   overscanColumns: 2,
 * });
 * const calculator = engine(1000, 20); // 1000 rows, 20 columns
 *
 * const result = calculator.getVisibleRange(0, 0, 400, 800);
 * calculator.updateRowHeight(5, 50);
 * calculator.updateColumnWidth(2, 200);
 * ```
 */
export function createVirtualGrid2DEngine(
  config: Grid2DConfig
): (rowCount: number, columnCount: number) => VirtualGrid2DCalculator {
  const {
    estimatedRowHeight,
    estimatedColumnWidth,
    overscanRows,
    overscanColumns,
  } = config;

  return function createCalculator(
    rowCount: number,
    columnCount: number
  ): VirtualGrid2DCalculator {
    const rowTree = createSegmentTree(
      new Array(rowCount).fill(estimatedRowHeight) as number[]
    );
    const colTree = createSegmentTree(
      new Array(columnCount).fill(estimatedColumnWidth) as number[]
    );
    const rangeCache = createMemoCache<VirtualGridRange>();

    const mutableState = {
      treeVersion: 0,
    };

    function getCacheKey(
      scrollY: number,
      scrollX: number,
      containerHeight: number,
      containerWidth: number
    ): MemoKey {
      return `${mutableState.treeVersion}:${Math.round(scrollY)}:${Math.round(scrollX)}:${Math.round(containerHeight)}:${Math.round(containerWidth)}`;
    }

    return {
      getVisibleRange(
        scrollY: number,
        scrollX: number,
        containerHeight: number,
        containerWidth: number
      ): VirtualGridRange {
        const cacheKey = getCacheKey(
          scrollY,
          scrollX,
          containerHeight,
          containerWidth
        );
        const cached = rangeCache.get(cacheKey);
        if (cached) {
          return cached;
        }

        const { startIndex: startRow, endIndex: endRow } = calculateVisibleRange(
          rowTree,
          scrollY,
          containerHeight,
          overscanRows,
          rowCount
        );

        const { startIndex: startCol, endIndex: endCol } = calculateVisibleRange(
          colTree,
          scrollX,
          containerWidth,
          overscanColumns,
          columnCount
        );

        const items = buildVirtualGridItems(
          rowTree,
          colTree,
          startRow,
          endRow,
          startCol,
          endCol
        );

        const result: VirtualGridRange = Object.freeze({
          startRow,
          endRow,
          startCol,
          endCol,
          items,
          totalWidth: colTree.total,
          totalHeight: rowTree.total,
        });

        rangeCache.set(cacheKey, result);
        return result;
      },

      updateRowHeight(rowIndex: number, height: number): boolean {
        const current = rowTree.get(rowIndex);
        if (Math.abs(current - height) <= 0.5) {
          return false;
        }
        rowTree.update(rowIndex, height);
        mutableState.treeVersion++;
        return true;
      },

      updateColumnWidth(colIndex: number, width: number): boolean {
        const current = colTree.get(colIndex);
        if (Math.abs(current - width) <= 0.5) {
          return false;
        }
        colTree.update(colIndex, width);
        mutableState.treeVersion++;
        return true;
      },

      updateRowHeights(
        updates: ReadonlyArray<{ index: number; height: number }>
      ): number {
        const counter = { changed: 0 };
        for (const { index, height } of updates) {
          const current = rowTree.get(index);
          if (Math.abs(current - height) > 0.5) {
            rowTree.update(index, height);
            counter.changed++;
          }
        }
        if (counter.changed > 0) {
          mutableState.treeVersion++;
        }
        return counter.changed;
      },

      updateColumnWidths(
        updates: ReadonlyArray<{ index: number; width: number }>
      ): number {
        const counter = { changed: 0 };
        for (const { index, width } of updates) {
          const current = colTree.get(index);
          if (Math.abs(current - width) > 0.5) {
            colTree.update(index, width);
            counter.changed++;
          }
        }
        if (counter.changed > 0) {
          mutableState.treeVersion++;
        }
        return counter.changed;
      },

      getRowPosition(rowIndex: number): number {
        return rowTree.prefixSum(rowIndex);
      },

      getColumnPosition(colIndex: number): number {
        return colTree.prefixSum(colIndex);
      },

      getRowHeight(rowIndex: number): number {
        return rowTree.get(rowIndex);
      },

      getColumnWidth(colIndex: number): number {
        return colTree.get(colIndex);
      },

      getScrollTargetForRow(
        rowIndex: number,
        containerHeight: number,
        align: "start" | "center" | "end" = "start"
      ): number {
        return calculateScrollTarget(rowTree, rowIndex, containerHeight, align);
      },

      getScrollTargetForColumn(
        colIndex: number,
        containerWidth: number,
        align: "start" | "center" | "end" = "start"
      ): number {
        return calculateScrollTarget(colTree, colIndex, containerWidth, align);
      },

      get totalHeight(): number {
        return rowTree.total;
      },

      get totalWidth(): number {
        return colTree.total;
      },

      get rowCount(): number {
        return rowCount;
      },

      get columnCount(): number {
        return columnCount;
      },

      get version(): number {
        return mutableState.treeVersion;
      },

      clearCache(): void {
        rangeCache.clear();
      },

      resize(
        newRowCount: number,
        newColumnCount: number
      ): VirtualGrid2DCalculator {
        const newCalc = createCalculator(newRowCount, newColumnCount);

        // Copy existing row heights
        const copyRowCount = Math.min(rowCount, newRowCount);
        for (let i = 0; i < copyRowCount; i++) {
          const height = rowTree.get(i);
          if (height !== estimatedRowHeight) {
            newCalc.updateRowHeight(i, height);
          }
        }

        // Copy existing column widths
        const copyColCount = Math.min(columnCount, newColumnCount);
        for (let i = 0; i < copyColCount; i++) {
          const width = colTree.get(i);
          if (width !== estimatedColumnWidth) {
            newCalc.updateColumnWidth(i, width);
          }
        }

        return newCalc;
      },
    };
  };
}
