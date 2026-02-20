/**
 * @file useWrapLayoutIndex Hook
 *
 * React hook for managing wrap layout index with memoization and caching.
 * Rebuilds the index when document, container width, or wrap mode changes.
 */

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import type { BlockDocument, BlockTypeStyleMap } from "../block/blockDocument";
import type { LayoutConfig } from "../layout/types";
import type { MeasureTextFn, WrapLayoutIndex, WrapMode } from "./types";
import { DEFAULT_WRAP_MODE } from "./types";
import { buildWrapLayoutIndex, buildNoWrapLayoutIndex } from "./WrapLayoutIndex";

// =============================================================================
// Debounce Utility
// =============================================================================

/**
 * Default debounce delay for width changes (ms).
 */
const WIDTH_DEBOUNCE_MS = 100;

// =============================================================================
// Hook Options
// =============================================================================

/**
 * Options for useWrapLayoutIndex hook.
 */
export type UseWrapLayoutIndexOptions = {
  /** The block document */
  readonly document: BlockDocument;
  /** Container width in pixels */
  readonly containerWidth: number;
  /** Text measurement function */
  readonly measureText: MeasureTextFn | null;
  /** Wrap mode configuration (defaults to no wrap) */
  readonly wrapMode?: WrapMode;
  /** Layout configuration */
  readonly layoutConfig: LayoutConfig;
  /** Optional block type style overrides */
  readonly blockTypeStyles?: BlockTypeStyleMap;
  /** Debounce delay for width changes in ms (default: 100) */
  readonly debounceMs?: number;
  /** Whether the hook is enabled (default: true) */
  readonly enabled?: boolean;
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to manage wrap layout index with caching and debounced width updates.
 *
 * Returns null when:
 * - enabled is false
 * - measureText is not available
 * - wrap mode has softWrap disabled (falls back to no-wrap index)
 *
 * @param options - Hook options
 * @returns WrapLayoutIndex or null
 *
 * @example
 * ```typescript
 * const wrapIndex = useWrapLayoutIndex({
 *   document: doc,
 *   containerWidth: 400,
 *   measureText: fontMetrics.measureText,
 *   wrapMode: { softWrap: true, wordWrap: true, wrapColumn: 0 },
 *   layoutConfig: { paddingLeft: 8, paddingTop: 8, baseLineHeight: 21 },
 * });
 * ```
 */
export function useWrapLayoutIndex(
  options: UseWrapLayoutIndexOptions
): WrapLayoutIndex | null {
  const {
    document,
    containerWidth,
    measureText,
    wrapMode = DEFAULT_WRAP_MODE,
    layoutConfig,
    blockTypeStyles,
    debounceMs = WIDTH_DEBOUNCE_MS,
    enabled = true,
  } = options;

  // Debounced container width
  const [debouncedWidth, setDebouncedWidth] = useState(containerWidth);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce width changes to avoid excessive recalculation during resize
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedWidth(containerWidth);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [containerWidth, debounceMs]);

  // Build the wrap layout index
  const wrapLayoutIndex = useMemo<WrapLayoutIndex | null>(() => {
    // Early return if disabled or measureText not available
    if (!enabled || !measureText) {
      return null;
    }

    // If soft wrap is disabled, use the lightweight no-wrap index
    if (!wrapMode.softWrap) {
      return buildNoWrapLayoutIndex(document, layoutConfig, blockTypeStyles);
    }

    // Build full wrap layout index
    return buildWrapLayoutIndex({
      document,
      containerWidth: debouncedWidth,
      measureText,
      wrapMode,
      layoutConfig,
      blockTypeStyles,
    });
  }, [
    enabled,
    document,
    debouncedWidth,
    measureText,
    wrapMode,
    layoutConfig,
    blockTypeStyles,
  ]);

  return wrapLayoutIndex;
}

// =============================================================================
// Container Width Hook
// =============================================================================

/**
 * Hook to track container width using ResizeObserver.
 *
 * @returns [width, containerRef] - Current width and ref to attach to container
 */
export function useContainerWidth(): [
  number,
  (element: HTMLElement | null) => void
] {
  const [width, setWidth] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const setContainerRef = useCallback((element: HTMLElement | null) => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    elementRef.current = element;

    if (!element) {
      return;
    }

    // Get initial width
    const rect = element.getBoundingClientRect();
    setWidth(rect.width);

    // Set up ResizeObserver
    observerRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === element) {
          const contentRect = entry.contentRect;
          setWidth(contentRect.width);
        }
      }
    });

    observerRef.current.observe(element);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [width, setContainerRef];
}

// =============================================================================
// Combined Hook
// =============================================================================

/**
 * Combined hook that manages both container width tracking and wrap layout index.
 *
 * @param options - Hook options (without containerWidth)
 * @returns Object with wrapLayoutIndex, containerWidth, and containerRef
 */
export function useWrapLayoutWithContainer(
  options: Omit<UseWrapLayoutIndexOptions, "containerWidth">
): {
  wrapLayoutIndex: WrapLayoutIndex | null;
  containerWidth: number;
  setContainerRef: (element: HTMLElement | null) => void;
} {
  const [containerWidth, setContainerRef] = useContainerWidth();

  const wrapLayoutIndex = useWrapLayoutIndex({
    ...options,
    containerWidth,
  });

  return {
    wrapLayoutIndex,
    containerWidth,
    setContainerRef,
  };
}
