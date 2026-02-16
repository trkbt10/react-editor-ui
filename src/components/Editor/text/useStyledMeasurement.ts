/**
 * @file Style-aware text measurement hook
 *
 * React hook for text measurement that considers individual character/segment styles.
 * Essential for accurate cursor positioning and scroll synchronization in TextEditor
 * where text can have variable font sizes and families.
 */

import { useState, useCallback, useRef, useEffect, useMemo, type RefObject } from "react";
import type { TextStyleSegment } from "../core/types";
import { DEFAULT_CHAR_WIDTH, DEFAULT_LINE_HEIGHT } from "../core/coordinates";
import { assertMeasureElement } from "../core/invariant";
import { parseFontSize, findStyleAtOffset } from "./styledMeasurement";

// =============================================================================
// Types
// =============================================================================

/**
 * Style-aware measurement result.
 */
export type StyledMeasurement = {
  /** Whether measurement is ready (element is mounted) */
  readonly isReady: boolean;
  /** Measure text width considering styles */
  readonly measureStyledText: (text: string, textOffset: number) => number;
  /** Get X position for a column in styled text */
  readonly getStyledColumnX: (line: string, column: number, lineOffset: number) => number;
  /** Find column at X position in styled text */
  readonly findColumnAtStyledX: (line: string, x: number, lineOffset: number) => number;
  /** Character width for default font */
  readonly charWidth: number;
  /** Line height */
  readonly lineHeight: number;
};

/**
 * Options for styled measurement hook.
 */
export type UseStyledMeasurementOptions = {
  /** Style segments for the text */
  readonly styles: readonly TextStyleSegment[];
  /** Base font size (pixels) */
  readonly fontSize: number;
  /** Base font family */
  readonly fontFamily: string;
};

// =============================================================================
// Helpers
// =============================================================================

/**
 * Create a hidden measurement element.
 */
function createMeasureElement(container: HTMLElement): HTMLSpanElement {
  const el = document.createElement("span");
  el.style.cssText = `
    position: absolute;
    visibility: hidden;
    white-space: pre;
    font: inherit;
    line-height: inherit;
    pointer-events: none;
    top: 0;
    left: 0;
  `;
  container.appendChild(el);
  return el;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for style-aware text measurement.
 *
 * Unlike useFontMetrics, this considers individual character styles when measuring.
 * Essential for TextEditor with variable font sizes.
 *
 * @param containerRef - Reference to the container element
 * @param options - Measurement options including styles
 * @returns Style-aware measurement functions
 */
export function useStyledMeasurement(
  containerRef: RefObject<HTMLElement | null>,
  options: UseStyledMeasurementOptions
): StyledMeasurement {
  const { styles, fontSize, fontFamily } = options;

  const measureElRef = useRef<HTMLSpanElement | null>(null);
  const [metrics, setMetrics] = useState<{
    charWidth: number;
    lineHeight: number;
    isReady: boolean;
  }>({
    charWidth: DEFAULT_CHAR_WIDTH,
    lineHeight: DEFAULT_LINE_HEIGHT,
    isReady: false,
  });

  // Initialize measurement element
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const measureEl = createMeasureElement(container);
    measureElRef.current = measureEl;

    // Measure default character width
    measureEl.style.font = `${fontSize}px ${fontFamily}`;
    measureEl.textContent = "MMMMMMMMMM";
    const charWidth = measureEl.getBoundingClientRect().width / 10;

    // Get line height
    const computedStyle = window.getComputedStyle(container);
    const lineHeight = parseFloat(computedStyle.lineHeight) || DEFAULT_LINE_HEIGHT;

    // eslint-disable-next-line custom/no-use-state-in-use-effect -- One-time measurement on mount
    setMetrics({ charWidth, lineHeight, isReady: true });

    return () => {
      if (measureEl.parentNode) {
        measureEl.parentNode.removeChild(measureEl);
      }
      measureElRef.current = null;
    };
  }, [containerRef, fontSize, fontFamily]);

  // Memoize styles for quick lookup
  const sortedStyles = useMemo(
    () => [...styles].sort((a, b) => a.start - b.start),
    [styles]
  );

  /**
   * Measure a single character with its style.
   * @throws Error if measurement element is not available
   */
  const measureStyledChar = useCallback(
    (char: string, charOffset: number): number => {
      // Require measurement element - no fallback
      const measureEl = assertMeasureElement(measureElRef.current, "measureStyledChar");

      const style = findStyleAtOffset(charOffset, sortedStyles);
      const charFontSize = parseFontSize(style?.fontSize, fontSize);
      const charFontFamily = style?.fontFamily ?? fontFamily;
      const charFontWeight = style?.fontWeight ?? "normal";
      const charFontStyle = style?.fontStyle ?? "normal";

      // Build font string
      measureEl.style.font = `${charFontStyle} ${charFontWeight} ${charFontSize}px ${charFontFamily}`;
      measureEl.textContent = char;

      return measureEl.getBoundingClientRect().width;
    },
    [sortedStyles, fontSize, fontFamily]
  );

  /**
   * Measure text width considering styles.
   * @param text - The text to measure
   * @param textOffset - The offset in the full document where this text starts
   */
  const measureStyledText = useCallback(
    (text: string, textOffset: number): number => {
      if (text.length === 0) {
        return 0;
      }

      // Sum width of each character considering its style
      const acc = { total: 0 };
      for (const [i, char] of [...text].entries()) {
        acc.total += measureStyledChar(char, textOffset + i);
      }
      return acc.total;
    },
    [measureStyledChar]
  );

  /**
   * Get X position for a column in styled text.
   * @param line - The line text
   * @param column - Column position (1-based)
   * @param lineOffset - Offset of the line start in the full document
   */
  const getStyledColumnX = useCallback(
    (line: string, column: number, lineOffset: number): number => {
      const textBeforeCursor = line.slice(0, column - 1);
      return measureStyledText(textBeforeCursor, lineOffset);
    },
    [measureStyledText]
  );

  /**
   * Find column at X position using binary search with styled measurement.
   * @param line - The line text
   * @param x - X coordinate to find
   * @param lineOffset - Offset of the line start in the full document
   */
  const findColumnAtStyledX = useCallback(
    (line: string, x: number, lineOffset: number): number => {
      if (x <= 0 || line.length === 0) {
        return 1;
      }

      // Binary search for the column
      const bounds = { lo: 0, hi: line.length };

      while (bounds.lo < bounds.hi) {
        const mid = (bounds.lo + bounds.hi) >> 1;
        const textWidth = measureStyledText(line.slice(0, mid), lineOffset);
        const nextWidth = measureStyledText(line.slice(0, mid + 1), lineOffset);
        const midPoint = (textWidth + nextWidth) / 2;

        if (x <= midPoint) {
          bounds.hi = mid;
        } else {
          bounds.lo = mid + 1;
        }
      }

      return bounds.lo + 1; // Convert to 1-based
    },
    [measureStyledText]
  );

  return {
    isReady: metrics.isReady,
    measureStyledText,
    getStyledColumnX,
    findColumnAtStyledX,
    charWidth: metrics.charWidth,
    lineHeight: metrics.lineHeight,
  };
}

// =============================================================================
// Re-exports for Backwards Compatibility
// =============================================================================

export { styledCoordinatesToPosition } from "./styledMeasurement";
export type { StyledCoordinatesToPositionOptions } from "./styledMeasurement";
