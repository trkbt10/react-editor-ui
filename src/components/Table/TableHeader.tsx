/**
 * @file Table header component
 */

import type { CSSProperties } from "react";
import { memo, useMemo } from "react";
import type { TableHeaderProps, TableColumnDef } from "./types";
import { TABLE_HEADER_STYLE, TABLE_HEADER_STICKY_STYLE } from "./styles";
import { TableHeaderCell } from "./TableHeaderCell";

/**
 * Table header row with sortable and draggable columns
 */
export const TableHeader = memo(function TableHeader<TData = unknown>({
  columns,
  columnWidths,
  sortKey,
  sortDirection,
  onSort,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDrop,
  onColumnDragEnd,
  draggingColumnKey,
  dragOverColumnKey,
  resizable = false,
  onColumnResize,
  sticky = true,
  stickyTop = 0,
  style,
  className,
}: TableHeaderProps<TData>) {
  const headerStyle = useMemo<CSSProperties>(() => {
    const baseStyle: CSSProperties = {
      ...TABLE_HEADER_STYLE,
    };

    if (sticky) {
      Object.assign(baseStyle, TABLE_HEADER_STICKY_STYLE, { top: stickyTop });
    }

    if (style) {
      Object.assign(baseStyle, style);
    }

    return baseStyle;
  }, [sticky, stickyTop, style]);

  return (
    <div style={headerStyle} className={className} role="rowgroup">
      {columns.map((column, index) => {
        const isSorted = sortKey === column.key;
        const isDragging = draggingColumnKey === column.key;
        const isDragOver = dragOverColumnKey === column.key;
        const actualWidth = columnWidths?.[index];

        return (
          <TableHeaderCell
            key={column.key}
            column={column as TableColumnDef}
            actualWidth={actualWidth}
            isSorted={isSorted}
            sortDirection={isSorted ? sortDirection ?? null : null}
            isDragging={isDragging}
            isDragOver={isDragOver && !isDragging}
            resizable={resizable}
            onSort={onSort}
            onDragStart={onColumnDragStart}
            onDragOver={onColumnDragOver}
            onDrop={onColumnDrop}
            onDragEnd={onColumnDragEnd}
            onResize={onColumnResize}
          />
        );
      })}
    </div>
  );
});
