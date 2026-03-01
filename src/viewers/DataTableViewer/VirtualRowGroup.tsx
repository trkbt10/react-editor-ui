/**
 * @file Virtual row group component for segment-tree based rendering
 *
 * Groups multiple rows into a single memoized unit to reduce
 * re-renders during scroll. Each group renders N rows (GROUP_SIZE).
 */

import type { CSSProperties, ReactNode } from "react";
import { memo, useMemo } from "react";
import { TableRow, TableCell } from "../../components/Table/Table";
import type { TableColumnDef } from "../../components/Table/types";

// Group size - number of rows per group
// Larger = fewer components but larger updates
// Smaller = more components but finer updates
export const ROW_GROUP_SIZE = 16;

export type RowGroupData<TData> = {
  /** Group identifier (startRow / GROUP_SIZE) */
  readonly groupId: number;
  /** First row index in group */
  readonly startRow: number;
  /** Last row index in group (exclusive) */
  readonly endRow: number;
  /** Y position of group start */
  readonly y: number;
  /** Total height of all rows in group */
  readonly height: number;
  /** Row heights within group */
  readonly rowHeights: readonly number[];
  /** Row Y offsets within group (relative to group start) */
  readonly rowOffsets: readonly number[];
};

export type VirtualRowGroupProps<TData> = {
  /** Group data */
  group: RowGroupData<TData>;
  /** All rows data */
  rows: readonly TData[];
  /** Column definitions */
  columns: readonly TableColumnDef<TData>[];
  /** Column widths */
  columnWidths: readonly number[];
  /** Total width */
  totalWidth: number;
  /** Container width */
  containerWidth: number;
  /** Selected row index */
  selectedRowIndex?: number | null;
  /** Row click handler */
  onRowClick?: (rowIndex: number) => void;
  /** Cell content renderer */
  renderCell: (rowIndex: number, colIndex: number) => ReactNode;
};

// Static styles
const GROUP_STYLE: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
};

/**
 * Compare function for memo - only re-render if group content changes
 */
function arePropsEqual<TData>(
  prev: VirtualRowGroupProps<TData>,
  next: VirtualRowGroupProps<TData>
): boolean {
  // Group identity
  if (prev.group.groupId !== next.group.groupId) {
    return false;
  }
  if (prev.group.startRow !== next.group.startRow) {
    return false;
  }
  if (prev.group.endRow !== next.group.endRow) {
    return false;
  }
  if (prev.group.y !== next.group.y) {
    return false;
  }
  if (prev.group.height !== next.group.height) {
    return false;
  }

  // Layout
  if (prev.totalWidth !== next.totalWidth) {
    return false;
  }
  if (prev.containerWidth !== next.containerWidth) {
    return false;
  }

  // Column widths (shallow compare array)
  if (prev.columnWidths !== next.columnWidths) {
    if (prev.columnWidths.length !== next.columnWidths.length) {
      return false;
    }
    for (let i = 0; i < prev.columnWidths.length; i++) {
      if (prev.columnWidths[i] !== next.columnWidths[i]) {
        return false;
      }
    }
  }

  // Selection state - only check rows in this group
  const prevSelected =
    prev.selectedRowIndex !== null &&
    prev.selectedRowIndex !== undefined &&
    prev.selectedRowIndex >= prev.group.startRow &&
    prev.selectedRowIndex < prev.group.endRow;
  const nextSelected =
    next.selectedRowIndex !== null &&
    next.selectedRowIndex !== undefined &&
    next.selectedRowIndex >= next.group.startRow &&
    next.selectedRowIndex < next.group.endRow;

  if (prevSelected !== nextSelected) return false;
  if (prevSelected && prev.selectedRowIndex !== next.selectedRowIndex) {
    return false;
  }

  // Handlers (stable references expected)
  if (prev.onRowClick !== next.onRowClick) return false;
  if (prev.renderCell !== next.renderCell) return false;

  // Columns reference (should be stable)
  if (prev.columns !== next.columns) return false;

  // Rows data - check if rows in this group changed
  // Note: We compare by reference for performance
  // Caller should ensure rows array is stable when data doesn't change
  if (prev.rows !== next.rows) {
    // Deep check for rows in this group only
    for (let i = prev.group.startRow; i < prev.group.endRow; i++) {
      if (prev.rows[i] !== next.rows[i]) return false;
    }
  }

  return true;
}

/**
 * Renders a group of rows as a single memoized unit
 */
export const VirtualRowGroup = memo(function VirtualRowGroup<TData>({
  group,
  rows,
  columns,
  columnWidths,
  totalWidth,
  containerWidth,
  selectedRowIndex,
  onRowClick,
  renderCell,
}: VirtualRowGroupProps<TData>) {
  const groupStyle = useMemo<CSSProperties>(
    () => ({
      ...GROUP_STYLE,
      transform: `translateY(${group.y}px)`,
      width: Math.max(totalWidth, containerWidth),
      height: group.height,
    }),
    [group.y, group.height, totalWidth, containerWidth]
  );

  return (
    <div style={groupStyle}>
      {Array.from({ length: group.endRow - group.startRow }, (_, i) => {
        const rowIndex = group.startRow + i;
        const row = rows[rowIndex];
        if (!row) return null;

        const rowY = group.rowOffsets[i];
        const rowHeight = group.rowHeights[i];

        return (
          <div
            key={rowIndex}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              transform: `translateY(${rowY}px)`,
              width: "100%",
              height: rowHeight,
            }}
          >
            <TableRow
              rowIndex={rowIndex}
              selected={selectedRowIndex === rowIndex}
              onClick={onRowClick}
            >
              {columns.map((column, colIndex) => (
                <TableCell
                  key={column.key}
                  width={columnWidths[colIndex]}
                  minWidth={column.minWidth}
                  align={column.align}
                >
                  {renderCell(rowIndex, colIndex)}
                </TableCell>
              ))}
            </TableRow>
          </div>
        );
      })}
    </div>
  );
}, arePropsEqual) as <TData>(props: VirtualRowGroupProps<TData>) => React.ReactElement;

/**
 * Calculate row groups from virtual range
 */
export function calculateRowGroups<TData>(
  startRow: number,
  endRow: number,
  getRowPosition: (index: number) => number,
  getRowHeight: (index: number) => number
): RowGroupData<TData>[] {
  if (startRow >= endRow) return [];

  const groups: RowGroupData<TData>[] = [];

  // Calculate group boundaries
  const firstGroupId = Math.floor(startRow / ROW_GROUP_SIZE);
  const lastGroupId = Math.floor((endRow - 1) / ROW_GROUP_SIZE);

  for (let groupId = firstGroupId; groupId <= lastGroupId; groupId++) {
    const groupStartRow = Math.max(groupId * ROW_GROUP_SIZE, startRow);
    const groupEndRow = Math.min((groupId + 1) * ROW_GROUP_SIZE, endRow);

    const rowHeights: number[] = [];
    const rowOffsets: number[] = [];
    let offsetWithinGroup = 0;

    const groupY = getRowPosition(groupStartRow);

    for (let r = groupStartRow; r < groupEndRow; r++) {
      const height = getRowHeight(r);
      rowOffsets.push(offsetWithinGroup);
      rowHeights.push(height);
      offsetWithinGroup += height;
    }

    groups.push({
      groupId,
      startRow: groupStartRow,
      endRow: groupEndRow,
      y: groupY,
      height: offsetWithinGroup,
      rowHeights,
      rowOffsets,
    });
  }

  return groups;
}
