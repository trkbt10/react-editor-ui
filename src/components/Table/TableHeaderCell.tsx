/**
 * @file Table header cell component
 */

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { memo, useMemo, useState, useCallback, useRef } from "react";
import type { TableHeaderCellProps } from "./types";
import {
  TABLE_HEADER_CELL_STYLE,
  TABLE_HEADER_CELL_SORTABLE_STYLE,
  TABLE_HEADER_CELL_DRAGGING_STYLE,
  TABLE_HEADER_CELL_DRAG_OVER_STYLE,
  SORT_ICON_STYLE,
  SORT_ICON_ACTIVE_STYLE,
} from "./styles";
import { ChevronUpIcon, ChevronDownIcon } from "../../icons";
import { COLOR_PRIMARY, COLOR_BORDER } from "../../themes/styles";

const DEFAULT_MIN_WIDTH = 60;
// Minimum drag distance to consider as actual resize (prevents accidental resize on click)
const MIN_RESIZE_DELTA = 2;

// Resize handle styles - positioned at right edge of cell
// Wide hit area (16px) prevents cursor flickering between sort/resize cursors
// right: -1px aligns with the outer border edge (box-sizing: border-box puts border inside)
const RESIZE_HANDLE_STYLE: CSSProperties = {
  position: "absolute",
  right: -1,
  top: 0,
  bottom: 0,
  width: 16,
  cursor: "col-resize",
  background: "transparent",
  zIndex: 10,
};

// Visual indicator: 2px line at the border position
// Only shown on hover/active, positioned at the right edge of the hit area
const RESIZE_HANDLE_ACTIVE_STYLE: CSSProperties = {
  background: `linear-gradient(to left, ${COLOR_PRIMARY} 2px, transparent 2px)`,
};

const RESIZE_HANDLE_HOVER_STYLE: CSSProperties = {
  background: `linear-gradient(to left, ${COLOR_BORDER} 2px, transparent 2px)`,
};

function getAlignJustify(align?: "left" | "center" | "right"): string {
  if (align === "center") {
    return "center";
  }
  if (align === "right") {
    return "flex-end";
  }
  return "flex-start";
}

function getAriaSort(
  isSorted: boolean,
  sortDirection: "asc" | "desc" | null
): "ascending" | "descending" | undefined {
  if (!isSorted) {
    return undefined;
  }
  if (sortDirection === "asc") {
    return "ascending";
  }
  if (sortDirection === "desc") {
    return "descending";
  }
  return undefined;
}

const INACTIVE_ICON_STYLE: CSSProperties = { opacity: 0.3 };

// Static style for label span - extracted to avoid inline object creation
const LABEL_STYLE: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  flex: 1,
  minWidth: 0,
};

// Static handlers for resize handle - extracted to avoid inline function creation
const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();
const preventDragStart = (e: React.DragEvent) => e.preventDefault();

// Custom props comparison for memo - compare column by key instead of reference
function arePropsEqual(
  prev: TableHeaderCellProps,
  next: TableHeaderCellProps
): boolean {
  // Compare column by key (reference may differ but key is stable)
  if (prev.column.key !== next.column.key) {
    return false;
  }

  // Compare primitive props
  if (prev.actualWidth !== next.actualWidth) {
    return false;
  }
  if (prev.isSorted !== next.isSorted) {
    return false;
  }
  if (prev.sortDirection !== next.sortDirection) {
    return false;
  }
  if (prev.isDragging !== next.isDragging) {
    return false;
  }
  if (prev.isDragOver !== next.isDragOver) {
    return false;
  }
  if (prev.resizable !== next.resizable) {
    return false;
  }

  // Compare function props by reference
  if (prev.onSort !== next.onSort) {
    return false;
  }
  if (prev.onDragStart !== next.onDragStart) {
    return false;
  }
  if (prev.onDragOver !== next.onDragOver) {
    return false;
  }
  if (prev.onDrop !== next.onDrop) {
    return false;
  }
  if (prev.onDragEnd !== next.onDragEnd) {
    return false;
  }
  if (prev.onResize !== next.onResize) {
    return false;
  }

  // Compare style by reference (should be stable if memoized)
  if (prev.style !== next.style) {
    return false;
  }

  // Compare column properties that affect rendering
  if (prev.column.label !== next.column.label) {
    return false;
  }
  if (prev.column.sortable !== next.column.sortable) {
    return false;
  }
  if (prev.column.draggable !== next.column.draggable) {
    return false;
  }
  if (prev.column.align !== next.column.align) {
    return false;
  }
  if (prev.column.minWidth !== next.column.minWidth) {
    return false;
  }
  if (prev.column.width !== next.column.width) {
    return false;
  }

  return true;
}

function renderSortIcon(sortDirection: "asc" | "desc" | null) {
  if (sortDirection === "asc") {
    return <ChevronUpIcon size={12} />;
  }
  if (sortDirection === "desc") {
    return <ChevronDownIcon size={12} />;
  }
  return <ChevronUpIcon size={12} style={INACTIVE_ICON_STYLE} />;
}

/**
 * Table header cell with sort, drag, and resize UI
 */
export const TableHeaderCell = memo(
  function TableHeaderCell({
    column,
    actualWidth,
    isSorted,
    sortDirection,
    isDragging,
    isDragOver,
    resizable = false,
    onSort,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onResize,
    style,
  }: TableHeaderCellProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [isResizeHovered, setIsResizeHovered] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  // Track if resize just completed to prevent sort click
  const justResizedRef = useRef(false);

  const width = actualWidth ?? column.width;

  const cellStyle = useMemo<CSSProperties>(() => {
    const baseStyle: CSSProperties = {
      ...TABLE_HEADER_CELL_STYLE,
      position: "relative",
      width,
      minWidth: column.minWidth ?? DEFAULT_MIN_WIDTH,
      flexShrink: 0,
      flexGrow: 0,
      justifyContent: getAlignJustify(column.align),
    };

    if (column.sortable && onSort) {
      Object.assign(baseStyle, TABLE_HEADER_CELL_SORTABLE_STYLE);
    }

    if (isDragging) {
      Object.assign(baseStyle, TABLE_HEADER_CELL_DRAGGING_STYLE);
    }

    if (isDragOver) {
      Object.assign(baseStyle, TABLE_HEADER_CELL_DRAG_OVER_STYLE);
    }

    if (style) {
      Object.assign(baseStyle, style);
    }

    return baseStyle;
  }, [
    width,
    column.minWidth,
    column.align,
    column.sortable,
    onSort,
    isDragging,
    isDragOver,
    style,
  ]);

  const sortIconStyle = useMemo<CSSProperties>(() => {
    return {
      ...SORT_ICON_STYLE,
      ...(isSorted ? SORT_ICON_ACTIVE_STYLE : {}),
    };
  }, [isSorted]);

  const resizeHandleStyle = useMemo<CSSProperties>(() => {
    if (isResizing) {
      return { ...RESIZE_HANDLE_STYLE, ...RESIZE_HANDLE_ACTIVE_STYLE };
    }
    if (isResizeHovered) {
      return { ...RESIZE_HANDLE_STYLE, ...RESIZE_HANDLE_HOVER_STYLE };
    }
    return RESIZE_HANDLE_STYLE;
  }, [isResizing, isResizeHovered]);

  const handleClick = useCallback(() => {
    // Skip sort if resize just completed (click event fires after pointer up)
    if (justResizedRef.current) {
      justResizedRef.current = false;
      return;
    }
    if (column.sortable && onSort && !isResizing && !isResizeHovered) {
      onSort(column.key);
    }
  }, [column.sortable, column.key, onSort, isResizing, isResizeHovered]);

  // Resize handlers
  const handleResizePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!onResize) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width ?? DEFAULT_MIN_WIDTH;

      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);
    },
    [onResize, width]
  );

  const handleResizePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isResizing || !onResize) {
        return;
      }

      const delta = e.clientX - startXRef.current;
      const newWidth = Math.max(
        column.minWidth ?? DEFAULT_MIN_WIDTH,
        startWidthRef.current + delta
      );
      onResize(column.key, newWidth);
    },
    [isResizing, onResize, column.minWidth, column.key]
  );

  const handleResizePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isResizing) {
        return;
      }

      setIsResizing(false);
      // Only set justResizedRef if actual resize happened (pointer moved beyond threshold)
      const delta = Math.abs(e.clientX - startXRef.current);
      if (delta >= MIN_RESIZE_DELTA) {
        justResizedRef.current = true;
      }
      const target = e.currentTarget;
      target.releasePointerCapture(e.pointerId);
    },
    [isResizing]
  );

  const handleResizePointerEnter = useCallback(() => {
    setIsResizeHovered(true);
  }, []);

  const handleResizePointerLeave = useCallback(() => {
    if (!isResizing) {
      setIsResizeHovered(false);
    }
  }, [isResizing]);

  // Disable dragging when resize handle is hovered or active
  const canDrag = column.draggable && !isResizing && !isResizeHovered;

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      if (onDragStart) {
        onDragStart(column.key, e);
      }
    },
    [onDragStart, column.key]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      if (onDragOver) {
        onDragOver(column.key, e);
      }
    },
    [onDragOver, column.key]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      if (onDrop) {
        onDrop(column.key, e);
      }
    },
    [onDrop, column.key]
  );

  return (
    <div
      style={cellStyle}
      onClick={handleClick}
      draggable={canDrag}
      onDragStart={canDrag ? handleDragStart : undefined}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={onDragEnd}
      role="columnheader"
      aria-sort={getAriaSort(isSorted, sortDirection)}
    >
      <span style={LABEL_STYLE}>{column.label}</span>
      {column.sortable && (
        <span style={sortIconStyle}>{renderSortIcon(sortDirection)}</span>
      )}
      {resizable && (
        <div
          style={resizeHandleStyle}
          draggable={false}
          onClick={stopPropagation}
          onDragStart={preventDragStart}
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
          onPointerEnter={handleResizePointerEnter}
          onPointerLeave={handleResizePointerLeave}
        />
      )}
    </div>
  );
  },
  arePropsEqual
);
