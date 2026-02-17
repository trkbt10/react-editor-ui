/**
 * @file React hook wrapper for ViewportScrollEngine
 *
 * This hook bridges the pure calculation engine with React's rendering lifecycle.
 * Supports horizontal and vertical scrolling with ResizeObserver integration.
 */

import {
  useCallback,
  useRef,
  useSyncExternalStore,
  useEffect,
  useEffectEvent,
  type RefObject,
} from "react";
import {
  createViewportScrollEngine,
  DEFAULT_VIEWPORT_ENGINE_CONFIG,
  type ViewportScrollCalculator,
  type ViewportEngineConfig,
} from "./ViewportScrollEngine";
import type {
  ViewportState,
  VisibleLineItem,
  VisibleLineRange,
  DocumentDimensions,
} from "./types";

// =============================================================================
// Types
// =============================================================================

/**
 * Options for useViewportScroll hook.
 */
export type UseViewportScrollOptions = {
  /** Total number of lines */
  readonly lineCount: number;
  /** Estimated line height in pixels */
  readonly estimatedLineHeight?: number;
  /** Number of extra lines to render above/below viewport */
  readonly overscan?: number;
  /** Container element ref for size observation */
  readonly containerRef: RefObject<HTMLElement | null>;
};

/**
 * Result of useViewportScroll hook.
 */
export type UseViewportScrollResult = {
  /** Current viewport state */
  readonly viewport: ViewportState;
  /** Visible lines to render */
  readonly visibleLines: readonly VisibleLineItem[];
  /** Document dimensions */
  readonly documentDimensions: DocumentDimensions;
  /** Handle scroll events */
  readonly onScroll: (scrollX: number, scrollY: number) => void;
  /** Update measured line height */
  readonly measureLineHeight: (lineIndex: number, height: number) => void;
  /** Update measured line width */
  readonly measureLineWidth: (lineIndex: number, width: number) => void;
  /** Scroll to specific line */
  readonly scrollToLine: (
    lineIndex: number,
    align?: "start" | "center" | "end"
  ) => void;
  /** Transform document coords to viewport coords */
  readonly toViewport: (docX: number, docY: number) => { x: number; y: number };
  /** Transform viewport coords to document coords */
  readonly toDocument: (vpX: number, vpY: number) => { x: number; y: number };
};

type Store = {
  scrollX: number;
  scrollY: number;
  containerWidth: number;
  containerHeight: number;
  engineVersion: number;
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for viewport-based scrolling with efficient calculations.
 *
 * @param options - Hook options
 * @returns Viewport scroll state and control functions
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const {
 *   viewport,
 *   visibleLines,
 *   onScroll,
 * } = useViewportScroll({
 *   lineCount: lines.length,
 *   containerRef,
 * });
 *
 * return (
 *   <div
 *     ref={containerRef}
 *     onScroll={e => onScroll(e.currentTarget.scrollLeft, e.currentTarget.scrollTop)}
 *   >
 *     <Canvas viewport={viewport} visibleLines={visibleLines} />
 *   </div>
 * );
 * ```
 */
export function useViewportScroll(
  options: UseViewportScrollOptions
): UseViewportScrollResult {
  const {
    lineCount,
    estimatedLineHeight = DEFAULT_VIEWPORT_ENGINE_CONFIG.estimatedLineHeight,
    overscan = DEFAULT_VIEWPORT_ENGINE_CONFIG.overscan,
    containerRef,
  } = options;

  // Stable refs
  const engineRef = useRef<ViewportScrollCalculator | null>(null);
  const storeRef = useRef<Store>({
    scrollX: 0,
    scrollY: 0,
    containerWidth: 0,
    containerHeight: 0,
    engineVersion: 0,
  });
  const snapshotRef = useRef<Store | null>(null);
  const subscribersRef = useRef(new Set<() => void>());
  const prevLineCountRef = useRef(lineCount);

  // Initialize engine lazily
  if (!engineRef.current) {
    const config: ViewportEngineConfig = { estimatedLineHeight, overscan };
    const createEngine = createViewportScrollEngine(config);
    engineRef.current = createEngine(lineCount);
  }

  // Resize engine when line count changes
  if (prevLineCountRef.current !== lineCount && engineRef.current) {
    engineRef.current.resize(lineCount);
    prevLineCountRef.current = lineCount;
    storeRef.current = {
      ...storeRef.current,
      engineVersion: storeRef.current.engineVersion + 1,
    };
    snapshotRef.current = null;
  }

  const engine = engineRef.current;

  // Notify subscribers
  const notify = useCallback(() => {
    snapshotRef.current = null;
    subscribersRef.current.forEach((cb) => cb());
  }, []);

  // Subscribe function for useSyncExternalStore
  const subscribe = useCallback((callback: () => void) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  // Get snapshot (memoized to prevent infinite loops)
  const getSnapshot = useCallback((): Store => {
    const current = storeRef.current;
    if (
      snapshotRef.current &&
      snapshotRef.current.scrollX === current.scrollX &&
      snapshotRef.current.scrollY === current.scrollY &&
      snapshotRef.current.containerWidth === current.containerWidth &&
      snapshotRef.current.containerHeight === current.containerHeight &&
      snapshotRef.current.engineVersion === current.engineVersion
    ) {
      return snapshotRef.current;
    }
    snapshotRef.current = { ...current };
    return snapshotRef.current;
  }, []);

  // Use sync external store for efficient React updates
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Handle container resize
  const onContainerResize = useEffectEvent((width: number, height: number) => {
    if (
      Math.abs(storeRef.current.containerWidth - width) < 0.5 &&
      Math.abs(storeRef.current.containerHeight - height) < 0.5
    ) {
      return;
    }
    storeRef.current = {
      ...storeRef.current,
      containerWidth: width,
      containerHeight: height,
    };
    notify();
  });

  // Observe container resize
  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    // Initialize with current size
    const rect = element.getBoundingClientRect();
    onContainerResize(rect.width, rect.height);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        onContainerResize(width, height);
      }
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  // Build current viewport state
  const viewport: ViewportState = {
    offset: { x: store.scrollX, y: store.scrollY },
    size: { width: store.containerWidth, height: store.containerHeight },
  };

  // Get visible lines from engine
  const visibleRange: VisibleLineRange = engine.getVisibleLines(viewport);

  // Scroll handler
  const onScroll = useCallback(
    (scrollX: number, scrollY: number) => {
      if (
        Math.abs(storeRef.current.scrollX - scrollX) < 0.5 &&
        Math.abs(storeRef.current.scrollY - scrollY) < 0.5
      ) {
        return;
      }
      storeRef.current = {
        ...storeRef.current,
        scrollX,
        scrollY,
      };
      notify();
    },
    [notify]
  );

  // Measure line height
  const measureLineHeight = useCallback(
    (lineIndex: number, height: number) => {
      if (engine.updateLineHeight(lineIndex, height)) {
        storeRef.current = {
          ...storeRef.current,
          engineVersion: engine.version,
        };
        queueMicrotask(notify);
      }
    },
    [engine, notify]
  );

  // Measure line width
  const measureLineWidth = useCallback(
    (lineIndex: number, width: number) => {
      if (engine.updateLineWidth(lineIndex, width)) {
        storeRef.current = {
          ...storeRef.current,
          engineVersion: engine.version,
        };
        queueMicrotask(notify);
      }
    },
    [engine, notify]
  );

  // Calculate adjusted Y based on alignment
  const getAlignedScrollY = useCallback(
    (targetY: number, align: "start" | "center" | "end"): number => {
      if (align === "center") {
        return targetY - storeRef.current.containerHeight / 2;
      }
      if (align === "end") {
        return targetY - storeRef.current.containerHeight;
      }
      return targetY;
    },
    []
  );

  // Scroll to line
  const scrollToLine = useCallback(
    (lineIndex: number, align: "start" | "center" | "end" = "start") => {
      const targetY = engine.getScrollTargetY(lineIndex, align);
      const adjustedY = getAlignedScrollY(targetY, align);

      storeRef.current = {
        ...storeRef.current,
        scrollY: Math.max(0, adjustedY),
      };
      notify();
    },
    [engine, notify]
  );

  // Coordinate transformations
  const toViewport = useCallback(
    (docX: number, docY: number) => {
      return engine.documentToViewport(docX, docY, viewport);
    },
    [engine, viewport]
  );

  const toDocument = useCallback(
    (vpX: number, vpY: number) => {
      return engine.viewportToDocument(vpX, vpY, viewport);
    },
    [engine, viewport]
  );

  return {
    viewport,
    visibleLines: visibleRange.items,
    documentDimensions: engine.getDocumentDimensions(),
    onScroll,
    measureLineHeight,
    measureLineWidth,
    scrollToLine,
    toViewport,
    toDocument,
  };
}
