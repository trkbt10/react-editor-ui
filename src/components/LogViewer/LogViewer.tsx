/**
 * @file LogViewer - High-performance log display with virtual scrolling
 *
 * Designed for efficiently displaying large amounts of log data.
 * Uses virtual scrolling to render only visible items.
 */

import type { CSSProperties, ReactNode, RefObject } from "react";
import { useRef, useCallback, useLayoutEffect, useState, useMemo, useImperativeHandle, useEffect } from "react";
import { useVirtualScroll, type VirtualItem } from "./useVirtualScroll";
import { LogEntry, type LogEntryProps } from "../LogEntry/LogEntry";
import {
  COLOR_SURFACE,
  COLOR_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_HOVER,
  RADIUS_MD,
  SPACE_SM,
  SPACE_MD,
  SIZE_FONT_SM,
  SIZE_FONT_XS,
  SIZE_HEIGHT_SM,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../constants/styles";

export type LogItem = Omit<LogEntryProps, "selected" | "onClick">;

export type LogViewerProps = {
  /** Array of log items to display */
  items: LogItem[];
  /** Height of the viewer container */
  height?: number | string;
  /** Estimated height for each log entry (for initial layout) */
  estimatedItemHeight?: number;
  /** Number of items to render beyond visible area */
  overscan?: number;
  /** Index of currently selected item */
  selectedIndex?: number;
  /** Callback when an item is clicked */
  onItemClick?: (index: number, item: LogItem) => void;
  /** Enable pagination mode */
  pagination?: boolean;
  /** Items per page (only used when pagination is true) */
  pageSize?: number;
  /** Current page (only used when pagination is true) */
  page?: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Filter function to show/hide items */
  filter?: (item: LogItem) => boolean;
  /** Search query to highlight */
  searchQuery?: string;
  /** Show item count indicator */
  showCount?: boolean;
  /** Custom class name */
  className?: string;
  /** Ref for imperative handle */
  ref?: RefObject<LogViewerHandle | null>;
};

export type LogViewerHandle = {
  scrollToIndex: (index: number, align?: "start" | "center" | "end") => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  getVisibleRange: () => { start: number; end: number };
};

const DEFAULT_HEIGHT = 400;
const DEFAULT_ITEM_HEIGHT = 36;
const DEFAULT_PAGE_SIZE = 100;

/**
 * High-performance log viewer with virtual scrolling.
 * Designed for efficiently displaying large amounts of log data.
 */
export function LogViewer({
  items,
  height = DEFAULT_HEIGHT,
  estimatedItemHeight = DEFAULT_ITEM_HEIGHT,
  overscan = 5,
  selectedIndex,
  onItemClick,
  pagination = false,
  pageSize = DEFAULT_PAGE_SIZE,
  page = 0,
  onPageChange,
  filter,
  searchQuery,
  showCount = true,
  className,
  ref,
}: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [containerHeight, setContainerHeight] = useState(
    typeof height === "number" ? height : DEFAULT_HEIGHT,
  );

  // Filter items if filter function is provided
  const filteredItems = useMemo(() => {
    if (!filter) {
      return items;
    }
    return items.filter(filter);
  }, [items, filter]);

  // Apply pagination
  const paginatedItems = useMemo(() => {
    if (!pagination) {
      return filteredItems;
    }
    const start = page * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, pagination, page, pageSize]);

  const totalPages = pagination ? Math.ceil(filteredItems.length / pageSize) : 1;

  // Virtual scrolling
  const {
    virtualItems,
    totalHeight,
    scrollOffset,
    onScroll,
    measureItem,
    getScrollPosition,
  } = useVirtualScroll({
    itemCount: paginatedItems.length,
    estimatedItemHeight,
    overscan,
    containerHeight,
  });

  // Measure container height
  useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.height > 0 && rect.height !== containerHeight) {
      setContainerHeight(rect.height);
    }
  }, [height, containerHeight]);

  // Measure item heights
  useLayoutEffect(() => {
    virtualItems.forEach((item) => {
      const el = rowRefs.current.get(item.index);
      if (el) {
        const rect = el.getBoundingClientRect();
        measureItem(item.index, rect.height);
      }
    });
  }, [virtualItems, measureItem]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      onScroll(target.scrollTop);
    },
    [onScroll],
  );

  const handleItemClick = useCallback(
    (index: number) => {
      const actualIndex = pagination ? page * pageSize + index : index;
      onItemClick?.(actualIndex, items[actualIndex]);
    },
    [onItemClick, items, pagination, page, pageSize],
  );

  // Helper to calculate scroll target for alignment
  const calculateScrollTarget = useCallback(
    (index: number, align: "start" | "center" | "end" = "start"): number => {
      const pos = getScrollPosition(index);
      const itemHeight = estimatedItemHeight;
      switch (align) {
        case "center":
          return Math.max(0, pos - containerHeight / 2 + itemHeight / 2);
        case "end":
          return Math.max(0, pos - containerHeight + itemHeight);
        case "start":
        default:
          return pos;
      }
    },
    [getScrollPosition, containerHeight, estimatedItemHeight],
  );

  // Imperative handle
  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index: number, align?: "start" | "center" | "end") => {
        if (!containerRef.current) {
          return;
        }
        if (pagination) {
          // Navigate to correct page first
          const targetPage = Math.floor(index / pageSize);
          if (targetPage !== page) {
            onPageChange?.(targetPage);
          }
          const indexInPage = index % pageSize;
          const target = calculateScrollTarget(indexInPage, align);
          containerRef.current.scrollTop = target;
        } else {
          const target = calculateScrollTarget(index, align);
          containerRef.current.scrollTop = target;
        }
      },
      scrollToTop: () => {
        containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      },
      scrollToBottom: () => {
        containerRef.current?.scrollTo({
          top: totalHeight,
          behavior: "smooth",
        });
      },
      getVisibleRange: () => {
        if (virtualItems.length === 0) {
          return { start: 0, end: 0 };
        }
        return {
          start: virtualItems[0].index,
          end: virtualItems[virtualItems.length - 1].index,
        };
      },
    }),
    [calculateScrollTarget, totalHeight, virtualItems, pagination, page, pageSize, onPageChange],
  );

  // Auto-scroll to selected item
  // Use DOM scrollTo instead of virtualScrollToIndex to keep DOM and internal state in sync
  useEffect(() => {
    if (selectedIndex === undefined || !containerRef.current) {
      return;
    }
    const indexInPage = pagination ? selectedIndex % pageSize : selectedIndex;
    const pos = getScrollPosition(indexInPage);
    const isVisible =
      pos >= scrollOffset && pos + estimatedItemHeight <= scrollOffset + containerHeight;
    if (!isVisible) {
      // Calculate center position and scroll DOM directly
      // This triggers onScroll which updates internal state
      const itemHeight = estimatedItemHeight;
      const targetScrollTop = Math.max(0, pos - containerHeight / 2 + itemHeight / 2);
      containerRef.current.scrollTop = targetScrollTop;
    }
  }, [
    selectedIndex,
    pagination,
    pageSize,
    getScrollPosition,
    scrollOffset,
    containerHeight,
    estimatedItemHeight,
  ]);

  const containerStyle: CSSProperties = {
    height,
    overflow: "auto",
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_MD,
    border: `1px solid ${COLOR_BORDER}`,
    position: "relative",
  };

  const innerStyle: CSSProperties = {
    height: totalHeight,
    width: "100%",
    position: "relative",
  };

  const renderItem = (virtualItem: VirtualItem): ReactNode => {
    const item = paginatedItems[virtualItem.index];
    if (!item) {
      return null;
    }

    const actualIndex = pagination ? page * pageSize + virtualItem.index : virtualItem.index;
    const isSelected = selectedIndex === actualIndex;

    const itemStyle: CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      transform: `translateY(${virtualItem.start}px)`,
    };

    return (
      <div
        key={virtualItem.index}
        ref={(el) => {
          if (el) {
            rowRefs.current.set(virtualItem.index, el);
          } else {
            rowRefs.current.delete(virtualItem.index);
          }
        }}
        style={itemStyle}
        data-index={virtualItem.index}
      >
        <LogEntry
          {...item}
          selected={isSelected}
          onClick={onItemClick ? () => handleItemClick(virtualItem.index) : undefined}
        />
      </div>
    );
  };

  const getVisibleStart = (): number => {
    if (virtualItems.length === 0) {
      return 0;
    }
    const pageOffset = pagination ? page * pageSize : 0;
    return pageOffset + virtualItems[0].index + 1;
  };

  const getVisibleEnd = (): number => {
    if (virtualItems.length === 0) {
      return 0;
    }
    const pageOffset = pagination ? page * pageSize : 0;
    return pageOffset + virtualItems[virtualItems.length - 1].index + 1;
  };

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: SPACE_SM }}>
      {showCount && (
        <LogViewerHeader
          totalCount={items.length}
          filteredCount={filteredItems.length}
          visibleStart={getVisibleStart()}
          visibleEnd={getVisibleEnd()}
          searchQuery={searchQuery}
        />
      )}
      <div ref={containerRef} style={containerStyle} onScroll={handleScroll}>
        <div style={innerStyle}>{virtualItems.map(renderItem)}</div>
      </div>
      {pagination && totalPages > 1 && (
        <LogViewerPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

// Header component showing counts
function LogViewerHeader({
  totalCount,
  filteredCount,
  visibleStart,
  visibleEnd,
  searchQuery,
}: {
  totalCount: number;
  filteredCount: number;
  visibleStart: number;
  visibleEnd: number;
  searchQuery?: string;
}) {
  const headerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: SIZE_FONT_XS,
    color: COLOR_TEXT_MUTED,
    padding: `0 ${SPACE_SM}`,
  };

  const isFiltered = filteredCount !== totalCount;

  return (
    <div style={headerStyle}>
      <span>
        {visibleStart}-{visibleEnd} of {filteredCount.toLocaleString()}
        {isFiltered && ` (filtered from ${totalCount.toLocaleString()})`}
      </span>
      {searchQuery && (
        <span>
          Search: <strong style={{ color: COLOR_TEXT }}>{searchQuery}</strong>
        </span>
      )}
    </div>
  );
}

// Pagination component
function LogViewerPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}) {
  const containerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACE_SM,
    padding: SPACE_SM,
  };

  const buttonStyle: CSSProperties = {
    height: SIZE_HEIGHT_SM,
    padding: `0 ${SPACE_MD}`,
    fontSize: SIZE_FONT_SM,
    border: `1px solid ${COLOR_BORDER}`,
    borderRadius: RADIUS_MD,
    backgroundColor: COLOR_SURFACE,
    color: COLOR_TEXT,
    cursor: "pointer",
    transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
  };

  const disabledButtonStyle: CSSProperties = {
    ...buttonStyle,
    opacity: 0.5,
    cursor: "not-allowed",
  };

  const pageInfoStyle: CSSProperties = {
    fontSize: SIZE_FONT_SM,
    color: COLOR_TEXT_MUTED,
    minWidth: "100px",
    textAlign: "center",
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      onPageChange?.(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange?.(currentPage + 1);
    }
  };

  const handleFirst = () => {
    onPageChange?.(0);
  };

  const handleLast = () => {
    onPageChange?.(totalPages - 1);
  };

  return (
    <div style={containerStyle}>
      <button
        type="button"
        style={currentPage === 0 ? disabledButtonStyle : buttonStyle}
        onClick={handleFirst}
        disabled={currentPage === 0}
        onPointerEnter={(e) => {
          if (currentPage !== 0) {
            e.currentTarget.style.backgroundColor = COLOR_HOVER;
          }
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.backgroundColor = COLOR_SURFACE;
        }}
      >
        First
      </button>
      <button
        type="button"
        style={currentPage === 0 ? disabledButtonStyle : buttonStyle}
        onClick={handlePrev}
        disabled={currentPage === 0}
        onPointerEnter={(e) => {
          if (currentPage !== 0) {
            e.currentTarget.style.backgroundColor = COLOR_HOVER;
          }
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.backgroundColor = COLOR_SURFACE;
        }}
      >
        Prev
      </button>
      <span style={pageInfoStyle}>
        {currentPage + 1} / {totalPages}
      </span>
      <button
        type="button"
        style={currentPage >= totalPages - 1 ? disabledButtonStyle : buttonStyle}
        onClick={handleNext}
        disabled={currentPage >= totalPages - 1}
        onPointerEnter={(e) => {
          if (currentPage < totalPages - 1) {
            e.currentTarget.style.backgroundColor = COLOR_HOVER;
          }
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.backgroundColor = COLOR_SURFACE;
        }}
      >
        Next
      </button>
      <button
        type="button"
        style={currentPage >= totalPages - 1 ? disabledButtonStyle : buttonStyle}
        onClick={handleLast}
        disabled={currentPage >= totalPages - 1}
        onPointerEnter={(e) => {
          if (currentPage < totalPages - 1) {
            e.currentTarget.style.backgroundColor = COLOR_HOVER;
          }
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.backgroundColor = COLOR_SURFACE;
        }}
      >
        Last
      </button>
    </div>
  );
}

// =============================================================================
// Re-exports for module entry point
// =============================================================================

export { useVirtualScroll } from "./useVirtualScroll";
export type { VirtualScrollOptions, VirtualScrollResult, VirtualItem } from "./useVirtualScroll";
export { createSegmentTree, SegmentTree } from "./SegmentTree";
export type { SegmentTree as SegmentTreeType } from "./SegmentTree";
export { createVirtualScrollEngine } from "./VirtualScrollEngine";
export type { VirtualScrollCalculator, VisibleRange, EngineConfig } from "./VirtualScrollEngine";
