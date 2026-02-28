/**
 * @file LogViewer component - High-performance log display with virtual scrolling
 *
 * @description
 * A virtualized log viewer for efficiently displaying large amounts of log data.
 * Supports filtering, search highlighting, pagination, and imperative scroll control.
 * Only renders visible items for optimal performance with thousands of entries.
 *
 * @example
 * ```tsx
 * import { LogViewer } from "react-editor-ui/LogViewer";
 *
 * const logs = [
 *   { level: "info", message: "Application started", timestamp: new Date() },
 *   { level: "error", message: "Failed to load config", timestamp: new Date() },
 * ];
 *
 * <LogViewer
 *   items={logs}
 *   height={400}
 *   filter={(item) => item.level !== "debug"}
 * />
 * ```
 */

import type { CSSProperties, ReactNode, RefObject, PointerEvent } from "react";
import { useRef, useCallback, useLayoutEffect, useState, useMemo, useImperativeHandle, memo } from "react";
import { useVirtualScroll, type VirtualItem } from "./useVirtualScroll";
import { LogEntry, type LogEntryProps } from "../../components/LogEntry/LogEntry";
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
} from "../../themes/styles";

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

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      height,
      overflow: "auto",
      backgroundColor: COLOR_SURFACE,
      borderRadius: RADIUS_MD,
      border: `1px solid ${COLOR_BORDER}`,
      position: "relative",
    }),
    [height],
  );

  const innerStyle = useMemo<CSSProperties>(
    () => ({
      height: totalHeight,
      width: "100%",
      position: "relative",
    }),
    [totalHeight],
  );

  const wrapperStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      gap: SPACE_SM,
    }),
    [],
  );

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
    <div className={className} style={wrapperStyle}>
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
const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: SIZE_FONT_XS,
  color: COLOR_TEXT_MUTED,
  padding: `0 ${SPACE_SM}`,
};

const searchHighlightStyle: CSSProperties = {
  color: COLOR_TEXT,
};

const LogViewerHeader = memo(function LogViewerHeader({
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
  const isFiltered = filteredCount !== totalCount;

  return (
    <div style={headerStyle}>
      <span>
        {visibleStart}-{visibleEnd} of {filteredCount.toLocaleString()}
        {isFiltered && ` (filtered from ${totalCount.toLocaleString()})`}
      </span>
      {searchQuery && (
        <span>
          Search: <strong style={searchHighlightStyle}>{searchQuery}</strong>
        </span>
      )}
    </div>
  );
});

// Pagination styles
const paginationContainerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: SPACE_SM,
  padding: SPACE_SM,
};

const paginationButtonStyle: CSSProperties = {
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

const paginationButtonDisabledStyle: CSSProperties = {
  ...paginationButtonStyle,
  opacity: 0.5,
  cursor: "not-allowed",
};

const pageInfoStyle: CSSProperties = {
  fontSize: SIZE_FONT_SM,
  color: COLOR_TEXT_MUTED,
  minWidth: "100px",
  textAlign: "center",
};

type PaginationButtonProps = {
  label: string;
  disabled: boolean;
  onClick: () => void;
};

const PaginationButton = memo(function PaginationButton({
  label,
  disabled,
  onClick,
}: PaginationButtonProps) {
  const handlePointerEnter = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (!disabled) {
        e.currentTarget.style.backgroundColor = COLOR_HOVER;
      }
    },
    [disabled],
  );

  const handlePointerLeave = useCallback((e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = COLOR_SURFACE;
  }, []);

  return (
    <button
      type="button"
      style={disabled ? paginationButtonDisabledStyle : paginationButtonStyle}
      onClick={onClick}
      disabled={disabled}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {label}
    </button>
  );
});

// Pagination component
const LogViewerPagination = memo(function LogViewerPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}) {
  const handlePrev = useCallback(() => {
    if (currentPage > 0) {
      onPageChange?.(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      onPageChange?.(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handleFirst = useCallback(() => {
    onPageChange?.(0);
  }, [onPageChange]);

  const handleLast = useCallback(() => {
    onPageChange?.(totalPages - 1);
  }, [totalPages, onPageChange]);

  const isAtStart = currentPage === 0;
  const isAtEnd = currentPage >= totalPages - 1;

  return (
    <div style={paginationContainerStyle}>
      <PaginationButton label="First" disabled={isAtStart} onClick={handleFirst} />
      <PaginationButton label="Prev" disabled={isAtStart} onClick={handlePrev} />
      <span style={pageInfoStyle}>
        {currentPage + 1} / {totalPages}
      </span>
      <PaginationButton label="Next" disabled={isAtEnd} onClick={handleNext} />
      <PaginationButton label="Last" disabled={isAtEnd} onClick={handleLast} />
    </div>
  );
});

// =============================================================================
// Re-exports for module entry point
// =============================================================================

export { useVirtualScroll } from "./useVirtualScroll";
export type { VirtualScrollOptions, VirtualScrollResult, VirtualItem } from "./useVirtualScroll";
export { createSegmentTree, SegmentTree } from "./SegmentTree";
export type { SegmentTree as SegmentTreeType } from "./SegmentTree";
export { createVirtualScrollEngine } from "./VirtualScrollEngine";
export type { VirtualScrollCalculator, VisibleRange, EngineConfig } from "./VirtualScrollEngine";
