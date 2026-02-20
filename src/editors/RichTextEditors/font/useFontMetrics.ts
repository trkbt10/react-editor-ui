/**
 * @file Font metrics hook
 *
 * Measures character widths for accurate cursor/selection positioning.
 * Supports both half-width (ASCII) and full-width (CJK) characters.
 */

import { useState, useEffect, useEffectEvent, useCallback, useRef, type RefObject } from "react";
import type { FontMetrics } from "../core/types";
import { EDITOR_DEFAULTS } from "../styles/tokens";
import { assertMeasureElement } from "../core/invariant";


// =============================================================================
// Measurement Element
// =============================================================================

/**
 * Create a hidden element for measuring text.
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
 * Hook to measure font metrics from a container element.
 *
 * Provides:
 * - Half-width character width (for ASCII)
 * - Full-width character width (for CJK)
 * - Line height
 * - Text measurement function
 * - Column X position calculator
 */
export function useFontMetrics(
  containerRef: RefObject<HTMLElement | null>
): FontMetrics {
  const [metrics, setMetrics] = useState<{
    charWidth: number;
    fullWidthCharWidth: number;
    lineHeight: number;
    isReady: boolean;
  }>({
    charWidth: EDITOR_DEFAULTS.CHAR_WIDTH_PX,
    fullWidthCharWidth: EDITOR_DEFAULTS.CHAR_WIDTH_PX * 2,
    lineHeight: EDITOR_DEFAULTS.LINE_HEIGHT_PX,
    isReady: false,
  });

  const measureElRef = useRef<HTMLSpanElement | null>(null);
  const charCacheRef = useRef<Map<string, number>>(new Map());

  // Handle metrics update from measurement
  const onMetricsReady = useEffectEvent((measured: {
    charWidth: number;
    fullWidthCharWidth: number;
    lineHeight: number;
  }) => {
    setMetrics({ ...measured, isReady: true });
  });

  // Measure base metrics on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Create measurement element
    const measureEl = createMeasureElement(container);
    measureElRef.current = measureEl;

    // Measure half-width (using 'M' as representative)
    measureEl.textContent = "MMMMMMMMMM";
    const halfWidthTotal = measureEl.getBoundingClientRect().width;
    const charWidth = halfWidthTotal / 10;

    // Measure full-width (using CJK character)
    measureEl.textContent = "漢漢漢漢漢漢漢漢漢漢";
    const fullWidthTotal = measureEl.getBoundingClientRect().width;
    const fullWidthCharWidth = fullWidthTotal / 10;

    // Get line height
    const computedStyle = window.getComputedStyle(container);
    const lineHeight = parseFloat(computedStyle.lineHeight) || EDITOR_DEFAULTS.LINE_HEIGHT_PX;

    onMetricsReady({ charWidth, fullWidthCharWidth, lineHeight });

    return () => {
      if (measureEl.parentNode) {
        measureEl.parentNode.removeChild(measureEl);
      }
      measureElRef.current = null;
      charCacheRef.current.clear();
    };
  }, [containerRef]);

  /**
   * Measure the width of a specific character.
   * @throws Error if measurement element is not available
   */
  const measureChar = useCallback(
    (char: string): number => {
      // Check cache
      const cached = charCacheRef.current.get(char);
      if (cached !== undefined) {
        return cached;
      }

      // Require measurement element - no fallback
      const measureEl = assertMeasureElement(measureElRef.current, "measureChar");

      // Measure actual width
      measureEl.textContent = char;
      const width = measureEl.getBoundingClientRect().width;

      // Cache the result
      charCacheRef.current.set(char, width);

      return width;
    },
    []
  );

  /**
   * Measure the total width of a string.
   * @throws Error if measurement element is not available
   */
  const measureText = useCallback(
    (text: string): number => {
      if (text.length === 0) {
        return 0;
      }

      // Require measurement element - no fallback
      const measureEl = assertMeasureElement(measureElRef.current, "measureText");

      // For short strings, measure directly (more accurate)
      if (text.length <= 100) {
        measureEl.textContent = text;
        return measureEl.getBoundingClientRect().width;
      }

      // For longer strings, sum character widths (uses cache)
      const acc = { total: 0 };
      for (const char of text) {
        acc.total += measureChar(char);
      }
      return acc.total;
    },
    [measureChar]
  );

  /**
   * Get X position for a given column in a line.
   * Column is 1-based.
   */
  const getColumnX = useCallback(
    (line: string, column: number): number => {
      const textBeforeCursor = line.slice(0, column - 1);
      return measureText(textBeforeCursor);
    },
    [measureText]
  );

  return {
    isReady: metrics.isReady,
    charWidth: metrics.charWidth,
    fullWidthCharWidth: metrics.fullWidthCharWidth,
    lineHeight: metrics.lineHeight,
    measureText,
    getColumnX,
  };
}
