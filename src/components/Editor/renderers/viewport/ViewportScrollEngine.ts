/**
 * @file Viewport Scroll Engine
 *
 * Pure calculation layer for viewport-based scrolling.
 * Handles coordinate transformation and visible line calculation.
 * Inspired by LogViewer/VirtualScrollEngine.ts.
 */

import { createLineHeightTree } from "./LineHeightTree";
import type {
  ViewportState,
  VisibleLineItem,
  VisibleLineRange,
  LineVisibility,
  DocumentDimensions,
} from "./types";

// =============================================================================
// Types
// =============================================================================

/**
 * Configuration for viewport scroll engine.
 */
export type ViewportEngineConfig = {
  /** Estimated line height in pixels */
  readonly estimatedLineHeight: number;
  /** Number of extra lines to render above/below viewport */
  readonly overscan: number;
};

/**
 * Viewport scroll calculator instance.
 */
export type ViewportScrollCalculator = {
  /** Get visible lines for current viewport state */
  readonly getVisibleLines: (viewport: ViewportState) => VisibleLineRange;
  /** Update line height */
  readonly updateLineHeight: (lineIndex: number, height: number) => boolean;
  /** Update line width */
  readonly updateLineWidth: (lineIndex: number, width: number) => boolean;
  /** Get document position for a viewport position */
  readonly viewportToDocument: (
    vx: number,
    vy: number,
    viewport: ViewportState
  ) => { x: number; y: number };
  /** Get viewport position for a document position */
  readonly documentToViewport: (
    dx: number,
    dy: number,
    viewport: ViewportState
  ) => { x: number; y: number };
  /** Get scroll target Y to show a specific line */
  readonly getScrollTargetY: (
    lineIndex: number,
    align: "start" | "center" | "end"
  ) => number;
  /** Get document dimensions */
  readonly getDocumentDimensions: () => DocumentDimensions;
  /** Resize for new line count */
  readonly resize: (newLineCount: number) => void;
  /** Version number for cache invalidation */
  readonly version: number;
};

/**
 * Memoization cache entry.
 */
type CacheEntry = {
  readonly key: string;
  readonly value: VisibleLineRange;
};

// =============================================================================
// Constants
// =============================================================================

const MAX_CACHE_SIZE = 100;

// =============================================================================
// Factory
// =============================================================================

/**
 * Create viewport scroll engine factory.
 *
 * @param config - Engine configuration
 * @returns Factory function that creates calculator for specific line count
 *
 * @example
 * ```typescript
 * const createEngine = createViewportScrollEngine({
 *   estimatedLineHeight: 21,
 *   overscan: 5,
 * });
 * const calculator = createEngine(1000);
 *
 * const visibleLines = calculator.getVisibleLines(viewport);
 * ```
 */
export const createViewportScrollEngine = (
  config: ViewportEngineConfig
): ((lineCount: number) => ViewportScrollCalculator) => {
  const { estimatedLineHeight, overscan } = config;

  return (lineCount: number): ViewportScrollCalculator => {
    // Height tree for vertical positioning
    const heightTree = createLineHeightTree(lineCount, estimatedLineHeight);

    // Width storage for horizontal positioning (simple array for now)
    const lineWidths: number[] = Array.from({ length: lineCount }, () => 0);
    const widthState = { maxWidth: 0, version: 0 };

    // Memoization cache
    const cache: CacheEntry[] = [];

    const getCacheKey = (viewport: ViewportState): string =>
      `${heightTree.version}:${widthState.version}:${Math.round(viewport.offset.x)}:${Math.round(viewport.offset.y)}:${Math.round(viewport.size.width)}:${Math.round(viewport.size.height)}`;

    const getCached = (key: string): VisibleLineRange | undefined => {
      const entry = cache.find((e) => e.key === key);
      return entry?.value;
    };

    const setCache = (key: string, value: VisibleLineRange): void => {
      // LRU cleanup
      if (cache.length >= MAX_CACHE_SIZE) {
        cache.shift();
      }
      cache.push({ key, value });
    };

    const determineVisibility = (
      lineY: number,
      lineHeight: number,
      viewportY: number,
      viewportHeight: number
    ): LineVisibility => {
      const lineEnd = lineY + lineHeight;
      const viewportEnd = viewportY + viewportHeight;

      const clippedTop = lineY < viewportY;
      const clippedBottom = lineEnd > viewportEnd;

      if (clippedTop && clippedBottom) {
        return "partial-both";
      }
      if (clippedTop) {
        return "partial-top";
      }
      if (clippedBottom) {
        return "partial-bottom";
      }
      return "full";
    };

    const getVisibleLines = (viewport: ViewportState): VisibleLineRange => {
      const cacheKey = getCacheKey(viewport);
      const cached = getCached(cacheKey);
      if (cached) {
        return cached;
      }

      const { offset, size } = viewport;
      const viewportY = offset.y;
      const viewportX = offset.x;
      const viewportHeight = size.height;

      // Find first visible line
      const rawStartIndex = heightTree.findLineByOffset(viewportY);
      const startIndex = Math.max(0, rawStartIndex - overscan);

      // Find last visible line
      const viewportBottom = viewportY + viewportHeight;
      const rawEndIndex = heightTree.findLineByOffset(viewportBottom);
      const endIndex = Math.min(heightTree.lineCount, rawEndIndex + 1 + overscan);

      // Build visible line items
      const items: VisibleLineItem[] = [];

      for (let i = startIndex; i < endIndex; i++) {
        const documentY = heightTree.prefixSum(i);
        const height = heightTree.get(i);
        const width = lineWidths[i] || 0;

        // Horizontal culling: skip lines completely outside horizontal viewport
        // For now, we include all lines since text typically starts at x=0
        // In the future, we could add horizontal culling for very long lines

        const viewportLineY = documentY - viewportY;
        const viewportLineX = 0 - viewportX; // All lines start at document x=0

        const visibility = determineVisibility(
          documentY,
          height,
          viewportY,
          viewportHeight
        );

        items.push({
          index: i,
          documentX: 0,
          documentY,
          viewportX: viewportLineX,
          viewportY: viewportLineY,
          width,
          height,
          visibility,
        });
      }

      const result: VisibleLineRange = {
        startIndex,
        endIndex,
        items,
        documentHeight: heightTree.totalHeight,
        documentWidth: widthState.maxWidth,
      };

      setCache(cacheKey, result);
      return result;
    };

    const updateLineHeight = (lineIndex: number, height: number): boolean => {
      const oldHeight = heightTree.get(lineIndex);
      heightTree.update(lineIndex, height);
      return heightTree.get(lineIndex) !== oldHeight;
    };

    const updateLineWidth = (lineIndex: number, width: number): boolean => {
      if (lineIndex < 0 || lineIndex >= lineWidths.length) {
        return false;
      }
      const oldWidth = lineWidths[lineIndex];
      if (Math.abs(width - oldWidth) < 0.5) {
        return false;
      }
      lineWidths[lineIndex] = width;
      if (width > widthState.maxWidth) {
        widthState.maxWidth = width;
      }
      widthState.version++;
      return true;
    };

    const viewportToDocument = (
      vx: number,
      vy: number,
      viewport: ViewportState
    ): { x: number; y: number } => ({
      x: vx + viewport.offset.x,
      y: vy + viewport.offset.y,
    });

    const documentToViewport = (
      dx: number,
      dy: number,
      viewport: ViewportState
    ): { x: number; y: number } => ({
      x: dx - viewport.offset.x,
      y: dy - viewport.offset.y,
    });

    const getScrollTargetY = (
      lineIndex: number,
      align: "start" | "center" | "end"
    ): number => {
      const lineY = heightTree.prefixSum(lineIndex);
      const lineHeight = heightTree.get(lineIndex);

      switch (align) {
        case "start":
          return lineY;
        case "center":
          // This would need viewport height, so return line center position
          return lineY + lineHeight / 2;
        case "end":
          return lineY + lineHeight;
      }
    };

    const getDocumentDimensions = (): DocumentDimensions => ({
      width: widthState.maxWidth,
      height: heightTree.totalHeight,
      lineCount: heightTree.lineCount,
    });

    const resize = (newLineCount: number): void => {
      heightTree.resize(newLineCount, estimatedLineHeight);
      // Resize width array
      if (newLineCount > lineWidths.length) {
        const extension = Array.from(
          { length: newLineCount - lineWidths.length },
          () => 0
        );
        lineWidths.push(...extension);
      } else {
        lineWidths.length = newLineCount;
      }
      // Recalculate max width
      widthState.maxWidth = lineWidths.reduce((max, w) => Math.max(max, w), 0);
      widthState.version++;
    };

    return {
      getVisibleLines,
      updateLineHeight,
      updateLineWidth,
      viewportToDocument,
      documentToViewport,
      getScrollTargetY,
      getDocumentDimensions,
      resize,
      get version() {
        return heightTree.version + widthState.version;
      },
    };
  };
};

/**
 * Default viewport scroll engine configuration.
 */
export const DEFAULT_VIEWPORT_ENGINE_CONFIG: ViewportEngineConfig = {
  estimatedLineHeight: 21,
  overscan: 5,
};
