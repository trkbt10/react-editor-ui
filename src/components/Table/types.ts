/**
 * @file Table component type definitions
 */

import type { CSSProperties, DragEvent, ReactNode } from "react";

// ============================================================================
// Common types
// ============================================================================

/** Sort direction for columns */
export type SortDirection = "asc" | "desc" | null;

/** Alignment for cell content */
export type CellAlign = "left" | "center" | "right";

// ============================================================================
// Column definition
// ============================================================================

/** Column definition for Table */
export type TableColumnDef<TData = unknown> = {
  /** Unique column key */
  key: string;
  /** Column header label */
  label: string;
  /** Column width in pixels (optional, defaults to flex) */
  width?: number;
  /** Minimum column width in pixels */
  minWidth?: number;
  /** Enable sort UI for this column */
  sortable?: boolean;
  /** Enable drag reorder UI for this column */
  draggable?: boolean;
  /** Cell content alignment */
  align?: CellAlign;
  /** Custom cell renderer */
  render?: (value: unknown, row: TData, rowIndex: number) => ReactNode;
};

// ============================================================================
// TableHeader types
// ============================================================================

export type TableHeaderProps<TData = unknown> = {
  /** Column definitions */
  columns: readonly TableColumnDef<TData>[];
  /** Actual column widths (overrides column.width) */
  columnWidths?: readonly number[];
  /** Currently sorted column key */
  sortKey?: string | null;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Sort click handler (external logic) */
  onSort?: (key: string) => void;
  /** Column drag start handler */
  onColumnDragStart?: (key: string, e: DragEvent<HTMLElement>) => void;
  /** Column drag over handler */
  onColumnDragOver?: (key: string, e: DragEvent<HTMLElement>) => void;
  /** Column drop handler */
  onColumnDrop?: (key: string, e: DragEvent<HTMLElement>) => void;
  /** Column drag end handler */
  onColumnDragEnd?: () => void;
  /** Currently dragging column key */
  draggingColumnKey?: string | null;
  /** Column being dragged over */
  dragOverColumnKey?: string | null;
  /** Enable column resize */
  resizable?: boolean;
  /** Column resize handler */
  onColumnResize?: (key: string, newWidth: number) => void;
  /** Use sticky positioning */
  sticky?: boolean;
  /** Sticky top offset */
  stickyTop?: number;
  /** Additional style */
  style?: CSSProperties;
  /** Additional class name */
  className?: string;
};

// ============================================================================
// TableHeaderCell types
// ============================================================================

export type TableHeaderCellProps = {
  /** Column definition */
  column: TableColumnDef;
  /** Actual column width (overrides column.width) */
  actualWidth?: number;
  /** This column is sorted */
  isSorted: boolean;
  /** Current sort direction */
  sortDirection: SortDirection;
  /** This column is being dragged */
  isDragging: boolean;
  /** This column is a drag target */
  isDragOver: boolean;
  /** Enable column resize */
  resizable?: boolean;
  /** Sort click handler (receives column key) */
  onSort?: (key: string) => void;
  /** Drag start handler (receives column key) */
  onDragStart?: (key: string, e: DragEvent<HTMLElement>) => void;
  /** Drag over handler (receives column key) */
  onDragOver?: (key: string, e: DragEvent<HTMLElement>) => void;
  /** Drop handler (receives column key) */
  onDrop?: (key: string, e: DragEvent<HTMLElement>) => void;
  /** Drag end handler */
  onDragEnd?: () => void;
  /** Resize handler (receives column key) */
  onResize?: (key: string, newWidth: number) => void;
  /** Additional style */
  style?: CSSProperties;
};

// ============================================================================
// TableBody types
// ============================================================================

export type TableBodyProps = {
  /** Child elements (TableRows) */
  children: ReactNode;
  /** Additional style */
  style?: CSSProperties;
  /** Additional class name */
  className?: string;
};

// ============================================================================
// TableRow types
// ============================================================================

export type TableRowProps = {
  /** Row index */
  rowIndex: number;
  /** Row is selected */
  selected?: boolean;
  /** Row click handler */
  onClick?: (rowIndex: number) => void;
  /** Child elements (TableCells) */
  children: ReactNode;
  /** Additional style */
  style?: CSSProperties;
  /** Additional class name */
  className?: string;
  /** Data attribute for row index */
  "data-index"?: number;
};

// ============================================================================
// TableCell types
// ============================================================================

export type TableCellProps = {
  /** Cell content alignment */
  align?: CellAlign;
  /** Column width in pixels */
  width?: number;
  /** Column minimum width in pixels */
  minWidth?: number;
  /** Cell content */
  children?: ReactNode;
  /** Additional style */
  style?: CSSProperties;
  /** Additional class name */
  className?: string;
};
