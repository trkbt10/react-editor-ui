/**
 * @file Virtual Scroll Hook
 *
 * Manages virtual scroll state for rendering only visible lines.
 * Supports both fixed and variable line heights via BlockLayoutIndex.
 */

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import type { VirtualScrollState } from "../core/types";
import { DEFAULT_EDITOR_CONFIG } from "../core/types";
import type { BlockLayoutIndex } from "../layout/types";
import { findLineAtY, getCumulativeHeight } from "../layout/BlockLayoutIndex";
import type { WrapLayoutIndex } from "../wrap/types";
import { findVisualLineAtY as findWrapLineAtY } from "../wrap/WrapLayoutIndex";

// =============================================================================
// Types
// =============================================================================

export type VirtualScrollConfig = {
  /** Height of each line in pixels (used when layoutIndex is not provided) */
  readonly lineHeight: number;
  /** Number of extra lines to render above/below viewport */
  readonly overscan: number;
  /** Optional BlockLayoutIndex for variable line heights */
  readonly layoutIndex?: BlockLayoutIndex;
  /** Optional WrapLayoutIndex for text wrapping support */
  readonly wrapLayoutIndex?: WrapLayoutIndex;
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
  const layoutIndex = config?.layoutIndex;
  const wrapLayoutIndex = config?.wrapLayoutIndex;

  const containerRef = useRef<HTMLElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Calculate using wrapLayoutIndex first (for wrapped text), then layoutIndex, then fixed height
  const useWrapLayoutIndex = wrapLayoutIndex && wrapLayoutIndex.visualLines.length > 0;
  const useLayoutIndex = !useWrapLayoutIndex && layoutIndex && layoutIndex.lines.length > 0;

  // Effective line count (visual lines when wrapping is enabled)
  const effectiveLineCount = useWrapLayoutIndex
    ? wrapLayoutIndex.visualLines.length
    : lineCount;

  // Calculate total content height
  const totalHeight = useWrapLayoutIndex
    ? wrapLayoutIndex.totalHeight
    : useLayoutIndex
      ? layoutIndex.totalHeight
      : lineCount * lineHeight;

  // Calculate visible range
  let startLine: number;
  let endLine: number;
  let topSpacerHeight: number;
  let bottomSpacerHeight: number;

  if (useWrapLayoutIndex) {
    // Wrap-aware calculation using wrapLayoutIndex
    startLine = Math.max(0, findWrapLineAtY(wrapLayoutIndex, scrollTop) - overscan);
    endLine = Math.min(
      effectiveLineCount,
      findWrapLineAtY(wrapLayoutIndex, scrollTop + viewportHeight) + 1 + overscan
    );
    // Calculate spacer heights from visual line Y positions
    const startY = startLine > 0 ? wrapLayoutIndex.visualLines[startLine].y : 0;
    const endY = endLine < effectiveLineCount
      ? wrapLayoutIndex.visualLines[endLine].y
      : wrapLayoutIndex.totalHeight;
    topSpacerHeight = startY;
    bottomSpacerHeight = wrapLayoutIndex.totalHeight - endY;
  } else if (useLayoutIndex) {
    // Variable height calculation using layoutIndex
    startLine = Math.max(0, findLineAtY(layoutIndex, scrollTop) - overscan);
    endLine = Math.min(
      lineCount,
      findLineAtY(layoutIndex, scrollTop + viewportHeight) + 1 + overscan
    );
    topSpacerHeight = getCumulativeHeight(layoutIndex, startLine);
    bottomSpacerHeight = layoutIndex.totalHeight - getCumulativeHeight(layoutIndex, endLine);
  } else {
    // Fixed height calculation
    startLine = Math.max(0, Math.floor(scrollTop / lineHeight) - overscan);
    endLine = Math.min(
      lineCount,
      Math.ceil((scrollTop + viewportHeight) / lineHeight) + overscan
    );
    topSpacerHeight = startLine * lineHeight;
    bottomSpacerHeight = (lineCount - endLine) * lineHeight;
  }

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
