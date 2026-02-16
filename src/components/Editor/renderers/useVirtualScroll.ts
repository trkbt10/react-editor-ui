/**
 * @file Virtual Scroll Hook
 *
 * Manages virtual scroll state for rendering only visible lines.
 */

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import type { VirtualScrollState } from "../core/types";
import { DEFAULT_EDITOR_CONFIG } from "../core/types";

// =============================================================================
// Types
// =============================================================================

export type VirtualScrollConfig = {
  /** Height of each line in pixels */
  readonly lineHeight: number;
  /** Number of extra lines to render above/below viewport */
  readonly overscan: number;
};

export type UseVirtualScrollResult = {
  /** Current virtual scroll state */
  readonly state: VirtualScrollState;
  /** Update scroll position */
  readonly setScrollTop: (value: number) => void;
  /** Ref callback to attach to container element */
  readonly containerRef: (node: HTMLElement | null) => void;
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for managing virtual scroll state for code lines.
 *
 * @param lineCount - Total number of lines
 * @param config - Configuration for line height and overscan
 * @returns Virtual scroll state and control functions
 *
 * @example
 * ```tsx
 * const { state, setScrollTop, containerRef } = useVirtualScroll(
 *   lines.length,
 *   { lineHeight: 21, overscan: 5 }
 * );
 *
 * // In render:
 * <div ref={containerRef} onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
 *   <div style={{ height: state.topSpacerHeight }} />
 *   {lines.slice(state.visibleRange.start, state.visibleRange.end).map(...)}
 *   <div style={{ height: state.bottomSpacerHeight }} />
 * </div>
 * ```
 */
export function useVirtualScroll(
  lineCount: number,
  config?: Partial<VirtualScrollConfig>
): UseVirtualScrollResult {
  const lineHeight = config?.lineHeight ?? DEFAULT_EDITOR_CONFIG.lineHeight;
  const overscan = config?.overscan ?? DEFAULT_EDITOR_CONFIG.overscan;

  const containerRef = useRef<HTMLElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Calculate total content height
  const totalHeight = lineCount * lineHeight;

  // Calculate visible range
  const startLine = Math.max(0, Math.floor(scrollTop / lineHeight) - overscan);
  const endLine = Math.min(
    lineCount,
    Math.ceil((scrollTop + viewportHeight) / lineHeight) + overscan
  );

  // Calculate spacer heights
  const topSpacerHeight = startLine * lineHeight;
  const bottomSpacerHeight = (lineCount - endLine) * lineHeight;

  // Handle viewport height changes from ResizeObserver
  const onViewportResize = useEffectEvent((height: number) => {
    setViewportHeight(height);
  });

  // Handle container ref
  const setContainer = useCallback((node: HTMLElement | null) => {
    containerRef.current = node;
    if (node) {
      setViewportHeight(node.clientHeight);
    }
  }, []);

  // Observe container resize
  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        onViewportResize(entry.contentRect.height);
      }
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  const state: VirtualScrollState = {
    scrollTop,
    viewportHeight,
    visibleRange: { start: startLine, end: endLine },
    topSpacerHeight,
    bottomSpacerHeight,
    totalHeight,
  };

  return {
    state,
    setScrollTop,
    containerRef: setContainer,
  };
}
