/**
 * @file DataTableViewer type definitions
 */

import type { ReactNode, RefObject } from "react";
import type {
  TableColumnDef,
  SortDirection,
} from "../../components/Table/types";

// ============================================================================
// Filter types
// ============================================================================

/** Filter definition for DataTableViewer toolbar */
export type DataTableFilter = {
  /** Unique filter key */
  key: string;
  /** Filter label */
  label: string;
  /** Current filter value */
  value: string;
  /** Available options for select-style filter */
  options?: Array<{ value: string; label: string }>;
};

// ============================================================================
// DataTableViewer props
// ============================================================================

export type DataTableViewerProps<TData = Record<string, unknown>> = {
  /** Row data array */
  rows: readonly TData[];
  /** Column definitions */
  columns: readonly TableColumnDef<TData>[];

  // Virtualization
  /** Container height (required for virtualization) */
  height: number | string;
  /** Estimated row height in pixels */
  estimatedRowHeight?: number;
  /** Estimated column width in pixels */
  estimatedColumnWidth?: number;
  /** Number of extra rows to render above/below visible area */
  overscanRows?: number;
  /** Number of extra columns to render left/right of visible area */
  overscanColumns?: number;

  // Sort (UI only, logic is external)
  /** Currently sorted column key */
  sortKey?: string | null;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Sort handler - receives column key, new direction */
  onSort?: (key: string, direction: SortDirection) => void;

  // Column reorder (UI only, logic is external)
  /** Column reorder handler - receives new column key order */
  onColumnsReorder?: (newColumnKeys: string[]) => void;

  // Row selection
  /** Currently selected row index */
  selectedRowIndex?: number | null;
  /** Row click handler */
  onRowClick?: (rowIndex: number, row: TData) => void;

  // Search (UI only, logic is external)
  /** Current search query */
  searchQuery?: string;
  /** Search change handler */
  onSearchChange?: (query: string) => void;
  /** Search input placeholder */
  searchPlaceholder?: string;

  // Filter (UI only, logic is external)
  /** Filter definitions */
  filters?: readonly DataTableFilter[];
  /** Filter change handler */
  onFilterChange?: (key: string, value: string) => void;

  // Custom query slot
  /** Custom query UI (e.g., SQL input) */
  querySlot?: ReactNode;

  // Display options
  /** Show toolbar with search and filters */
  showToolbar?: boolean;
  /** Show row count in toolbar */
  showRowCount?: boolean;
  /** Total row count before filtering (for display) */
  totalRowCount?: number;
  /** Fill container width by distributing extra space to columns */
  fillWidth?: boolean;
  /** Additional class name */
  className?: string;

  // Ref for imperative handle
  /** Ref for imperative API access */
  ref?: RefObject<DataTableViewerHandle | null>;
};

// ============================================================================
// Imperative handle
// ============================================================================

export type DataTableViewerHandle = {
  /** Scroll to a specific row */
  scrollToRow: (rowIndex: number, align?: "start" | "center" | "end") => void;
  /** Scroll to a specific column */
  scrollToColumn: (colIndex: number, align?: "start" | "center" | "end") => void;
  /** Scroll to a specific cell */
  scrollToCell: (rowIndex: number, colIndex: number) => void;
  /** Get currently visible row/column range */
  getVisibleRange: () => {
    rows: { start: number; end: number };
    columns: { start: number; end: number };
  };
};

// ============================================================================
// Toolbar props
// ============================================================================

export type DataTableToolbarProps = {
  /** Current search query */
  searchQuery: string;
  /** Search change handler */
  onSearchChange: (query: string) => void;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Filter definitions */
  filters?: readonly DataTableFilter[];
  /** Filter change handler */
  onFilterChange?: (key: string, value: string) => void;
  /** Custom query UI slot */
  querySlot?: ReactNode;
  /** Current row count (after filtering) */
  rowCount: number;
  /** Total row count (before filtering) */
  totalRowCount?: number;
  /** Show row count */
  showRowCount?: boolean;
};
