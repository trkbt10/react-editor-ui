/**
 * @file DataTableViewer - Virtualized data table viewer
 *
 * @description
 * A high-performance data table viewer with 2D virtualization for handling
 * large datasets. Features include sticky headers, sortable columns, column
 * reordering via drag-and-drop, search, and filtering. All data manipulation
 * logic (sorting, filtering) is external - this component provides UI only.
 *
 * @example
 * ```tsx
 * import { DataTableViewer } from "react-editor-ui/viewers/DataTableViewer";
 *
 * const columns = [
 *   { key: "id", label: "ID", width: 80, sortable: true },
 *   { key: "name", label: "Name", sortable: true },
 *   { key: "status", label: "Status" },
 * ];
 *
 * <DataTableViewer
 *   rows={data}
 *   columns={columns}
 *   height={400}
 *   sortKey={sortKey}
 *   sortDirection={sortDirection}
 *   onSort={(key, dir) => handleSort(key, dir)}
 *   searchQuery={query}
 *   onSearchChange={setQuery}
 * />
 * ```
 */

import type {
  CSSProperties,
  DragEvent,
  UIEvent,
  ReactNode,
} from "react";
import React, {
  memo,
  useMemo,
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
} from "react";
import type { DataTableViewerProps } from "./types";
import type { SortDirection } from "../../components/Table/types";
import { useVirtualGrid } from "../../hooks/useVirtualGrid";
import { DataTableToolbar } from "./DataTableToolbar";
import {
  TableHeader,
  type TableColumnDef,
} from "../../components/Table/Table";
import { COLOR_SURFACE, COLOR_BORDER } from "../../themes/styles";
import { VirtualRowGroup, calculateRowGroups } from "./VirtualRowGroup";

// ============================================================================
// Static styles
// ============================================================================

const WRAPPER_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  backgroundColor: COLOR_SURFACE,
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: 4,
  overflow: "hidden",
};

const SCROLL_CONTAINER_STYLE: CSSProperties = {
  flex: 1,
  overflow: "auto",
  position: "relative",
};

const VIRTUAL_CONTENT_STYLE: CSSProperties = {
  position: "relative",
};

// ============================================================================
// Defaults
// ============================================================================

const DEFAULT_ROW_HEIGHT = 28;
const DEFAULT_COLUMN_WIDTH = 120;
const DEFAULT_OVERSCAN_ROWS = 3;
const DEFAULT_OVERSCAN_COLUMNS = 2;

function getNextSortDirection(current: SortDirection): SortDirection {
  if (current === "asc") {
    return "desc";
  }
  if (current === "desc") {
    return null;
  }
  return "asc";
}

// ============================================================================
// Component
// ============================================================================

/**
 * Virtualized data table viewer with search, sort, and filter UI
 */
export const DataTableViewer = memo(function DataTableViewer<
  TData = Record<string, unknown>,
>({
  rows,
  columns,
  height,
  estimatedRowHeight = DEFAULT_ROW_HEIGHT,
  estimatedColumnWidth = DEFAULT_COLUMN_WIDTH,
  overscanRows = DEFAULT_OVERSCAN_ROWS,
  overscanColumns = DEFAULT_OVERSCAN_COLUMNS,
  sortKey,
  sortDirection,
  onSort,
  onColumnsReorder,
  selectedRowIndex,
  onRowClick,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder,
  filters,
  onFilterChange,
  querySlot,
  showToolbar = true,
  showRowCount = true,
  totalRowCount,
  fillWidth = false,
  className,
  ref,
}: DataTableViewerProps<TData>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Column widths state (initialized from definitions, can be resized)
  const [columnWidths, setColumnWidths] = useState<number[]>(() =>
    columns.map((c) => c.width ?? estimatedColumnWidth)
  );

  // Reset column widths when columns change
  useLayoutEffect(() => {
    setColumnWidths(columns.map((c) => c.width ?? estimatedColumnWidth));
  }, [columns, estimatedColumnWidth]);

  // Drag state
  const [draggingColKey, setDraggingColKey] = useState<string | null>(null);
  const [dragOverColKey, setDragOverColKey] = useState<string | null>(null);

  // Track which columns have been manually resized (fixed width, not justified)
  const [fixedColumns, setFixedColumns] = useState<Set<string>>(new Set());

  // Measure container size
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Virtual grid
  const {
    virtualRange,
    totalHeight,
    totalWidth,
    onScroll,
    scrollToRow,
    scrollToColumn,
    scrollToCell,
    measureColumn,
    getRowPosition,
    getRowHeight,
  } = useVirtualGrid({
    rowCount: rows.length,
    columnCount: columns.length,
    estimatedRowHeight,
    estimatedColumnWidth,
    overscanRows,
    overscanColumns,
    containerHeight: containerSize.height,
    containerWidth: containerSize.width,
  });

  // Update column widths when columns change
  useLayoutEffect(() => {
    columnWidths.forEach((width, index) => {
      measureColumn(index, width);
    });
  }, [columnWidths, measureColumn]);

  // Calculate if horizontal scroll is needed
  const needsHorizontalScroll = totalWidth > containerSize.width;

  // Calculate adjusted column widths (justify: fixed columns keep width, others fill remaining space)
  const adjustedColumnWidths = useMemo(() => {
    if (!fillWidth || needsHorizontalScroll || containerSize.width === 0) {
      return columnWidths;
    }

    // Calculate fixed and flexible column totals
    let fixedTotal = 0;
    let flexibleTotal = 0;

    columns.forEach((col, i) => {
      if (fixedColumns.has(col.key)) {
        fixedTotal += columnWidths[i];
      } else {
        flexibleTotal += columnWidths[i];
      }
    });

    const remainingSpace = containerSize.width - fixedTotal;

    // If no space left for flexible columns, return as-is
    if (remainingSpace <= 0 || flexibleTotal === 0) {
      return columnWidths;
    }

    // Distribute remaining space proportionally among flexible columns
    return columnWidths.map((w, i) => {
      const col = columns[i];
      if (fixedColumns.has(col.key)) {
        return w; // Fixed columns keep exact width
      }
      // Flexible columns get proportional share of remaining space
      return (w / flexibleTotal) * remainingSpace;
    });
  }, [fillWidth, needsHorizontalScroll, containerSize.width, columnWidths, columns, fixedColumns]);

  // Adjusted total width for layout
  const adjustedTotalWidth = useMemo(() => {
    if (!fillWidth || needsHorizontalScroll) {
      return totalWidth;
    }
    return Math.max(totalWidth, containerSize.width);
  }, [fillWidth, needsHorizontalScroll, totalWidth, containerSize.width]);

  // Scroll container style (hide horizontal scrollbar when not needed)
  const scrollContainerStyle = useMemo<CSSProperties>(
    () => ({
      ...SCROLL_CONTAINER_STYLE,
      overflowX: needsHorizontalScroll ? "auto" : "hidden",
    }),
    [needsHorizontalScroll]
  );

  // Scroll handler
  const handleScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      onScroll(target.scrollTop, target.scrollLeft);
    },
    [onScroll]
  );

  // Sort handler - use ref to avoid recreating callback when sort state changes
  const sortStateRef = useRef({ key: sortKey, direction: sortDirection });
  sortStateRef.current = { key: sortKey, direction: sortDirection };

  const handleSort = useCallback(
    (key: string) => {
      if (!onSort) {
        return;
      }
      const { key: currentKey, direction: currentDir } = sortStateRef.current;
      if (currentKey === key) {
        onSort(key, getNextSortDirection(currentDir ?? null));
      } else {
        onSort(key, "asc");
      }
    },
    [onSort]
  );

  // Drag handlers - use refs to avoid recreating when columns/onColumnsReorder reference changes
  const onColumnsReorderRef = useRef(onColumnsReorder);
  onColumnsReorderRef.current = onColumnsReorder;

  const dragHandlers = useMemo(
    () => ({
      onColumnDragStart: (key: string, e: DragEvent<HTMLElement>) => {
        setDraggingColKey(key);
        e.dataTransfer.setData("text/plain", key);
        e.dataTransfer.effectAllowed = "move";
      },
      onColumnDragOver: (key: string) => {
        setDragOverColKey(key);
      },
      onColumnDrop: (key: string, e: DragEvent<HTMLElement>) => {
        const sourceKey = e.dataTransfer.getData("text/plain");
        const reorder = onColumnsReorderRef.current;
        if (sourceKey && sourceKey !== key && reorder) {
          const currentKeys = columnsRef.current.map((c) => c.key);
          const sourceIndex = currentKeys.indexOf(sourceKey);
          const targetIndex = currentKeys.indexOf(key);
          if (sourceIndex !== -1 && targetIndex !== -1) {
            const newKeys = [...currentKeys];
            newKeys.splice(sourceIndex, 1);
            newKeys.splice(targetIndex, 0, sourceKey);
            reorder(newKeys);
          }
        }
        setDraggingColKey(null);
        setDragOverColKey(null);
      },
      onColumnDragEnd: () => {
        setDraggingColKey(null);
        setDragOverColKey(null);
      },
    }),
    []
  );

  // Column resize handler - use ref to avoid recreating when columns reference changes
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const handleColumnResize = useCallback(
    (key: string, newWidth: number) => {
      const colIndex = columnsRef.current.findIndex((c) => c.key === key);
      if (colIndex === -1) {
        return;
      }

      // Mark this column as fixed (won't be auto-justified)
      setFixedColumns((prev) => {
        if (prev.has(key)) {
          return prev;
        }
        const next = new Set(prev);
        next.add(key);
        return next;
      });

      // Update column width
      setColumnWidths((prev) => {
        const next = [...prev];
        next[colIndex] = newWidth;
        return next;
      });

      // Update virtualization engine
      measureColumn(colIndex, newWidth);
    },
    [measureColumn]
  );

  // Row click handler
  const handleRowClick = useCallback(
    (rowIndex: number) => {
      if (onRowClick && rows[rowIndex]) {
        onRowClick(rowIndex, rows[rowIndex]);
      }
    },
    [rows, onRowClick]
  );

  // Imperative handle
  useImperativeHandle(ref, () => ({
    scrollToRow,
    scrollToColumn,
    scrollToCell,
    getVisibleRange: () => ({
      rows: { start: virtualRange.startRow, end: virtualRange.endRow },
      columns: { start: virtualRange.startCol, end: virtualRange.endCol },
    }),
  }));

  // Render cell content
  const renderCellContent = useCallback(
    (rowIndex: number, colIndex: number): ReactNode => {
      const row = rows[rowIndex];
      const column = columns[colIndex];
      if (!row || !column) {
        return null;
      }

      const value = (row as Record<string, unknown>)[column.key];

      if (column.render) {
        return column.render(value, row, rowIndex);
      }

      return String(value ?? "");
    },
    [rows, columns]
  );

  // Wrapper style with height
  const wrapperStyle = useMemo<CSSProperties>(
    () => ({
      ...WRAPPER_STYLE,
      height,
    }),
    [height]
  );

  // Virtual content style with total dimensions
  const virtualContentStyle = useMemo<CSSProperties>(
    () => ({
      ...VIRTUAL_CONTENT_STYLE,
      height: totalHeight,
      width: Math.max(adjustedTotalWidth, containerSize.width),
    }),
    [totalHeight, adjustedTotalWidth, containerSize.width]
  );

  // Calculate row groups for efficient rendering
  const rowGroups = useMemo(() => {
    return calculateRowGroups<TData>(
      virtualRange.startRow,
      virtualRange.endRow,
      getRowPosition,
      getRowHeight
    );
  }, [virtualRange.startRow, virtualRange.endRow, getRowPosition, getRowHeight]);

  return (
    <div style={wrapperStyle} className={className}>
      {showToolbar && onSearchChange && (
        <DataTableToolbar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          onFilterChange={onFilterChange}
          querySlot={querySlot}
          rowCount={rows.length}
          totalRowCount={totalRowCount}
          showRowCount={showRowCount}
        />
      )}

      <div
        ref={containerRef}
        style={scrollContainerStyle}
        onScroll={handleScroll}
      >
        {/* Sticky header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            width: Math.max(adjustedTotalWidth, containerSize.width),
          }}
        >
          <TableHeader
            columns={columns as readonly TableColumnDef[]}
            columnWidths={adjustedColumnWidths}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
            draggingColumnKey={draggingColKey}
            dragOverColumnKey={dragOverColKey}
            resizable
            onColumnResize={handleColumnResize}
            {...dragHandlers}
            sticky={false}
          />
        </div>

        {/* Virtual content area */}
        <div style={virtualContentStyle}>
          {rowGroups.map((group) => (
            <VirtualRowGroup
              key={group.groupId}
              group={group}
              rows={rows}
              columns={columns}
              columnWidths={adjustedColumnWidths}
              totalWidth={adjustedTotalWidth}
              containerWidth={containerSize.width}
              selectedRowIndex={selectedRowIndex}
              onRowClick={onRowClick ? handleRowClick : undefined}
              renderCell={renderCellContent}
            />
          ))}
        </div>
      </div>
    </div>
  );
}) as <TData = Record<string, unknown>>(
  props: DataTableViewerProps<TData>
) => React.ReactElement;

// Re-export types
export type { DataTableViewerProps, DataTableViewerHandle } from "./types";
