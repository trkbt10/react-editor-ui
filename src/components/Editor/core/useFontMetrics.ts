/**
 * @file Font metrics hook
 *
 * Measures character widths for accurate cursor/selection positioning.
 * Supports both half-width (ASCII) and full-width (CJK) characters.
 */

import { useState, useEffect, useCallback, useRef, type RefObject } from "react";
import type { FontMetrics } from "./types";
import { DEFAULT_CHAR_WIDTH, DEFAULT_LINE_HEIGHT } from "./useCoordinates";
import { assertMeasureElement } from "./invariant";

// =============================================================================
// Types
// =============================================================================

/**
 * Character width category.
 */
type CharWidthCategory = "half" | "full";

// =============================================================================
// Unicode Width Detection
// =============================================================================

/**
 * Check if a character is full-width (CJK, etc.).
 *
 * Based on Unicode East Asian Width property.
 * Full-width characters include:
 * - CJK Unified Ideographs
 * - Hiragana, Katakana
 * - Hangul
 * - Full-width ASCII variants
 * - Various CJK punctuation
 */
function isFullWidthChar(char: string): boolean {
  const code = char.charCodeAt(0);

  // Common full-width ranges
  return (
    // CJK Unified Ideographs and extensions
    (code >= 0x4e00 && code <= 0x9fff) ||
    // CJK Unified Ideographs Extension A
    (code >= 0x3400 && code <= 0x4dbf) ||
    // Hiragana
    (code >= 0x3040 && code <= 0x309f) ||
    // Katakana
    (code >= 0x30a0 && code <= 0x30ff) ||
    // Hangul Syllables
    (code >= 0xac00 && code <= 0xd7af) ||
    // Hangul Jamo
    (code >= 0x1100 && code <= 0x11ff) ||
    // CJK Symbols and Punctuation
    (code >= 0x3000 && code <= 0x303f) ||
    // Full-width ASCII variants
    (code >= 0xff00 && code <= 0xffef) ||
    // CJK Compatibility
    (code >= 0xf900 && code <= 0xfaff) ||
    // Thai (typically displayed as full-width in monospace)
    (code >= 0x0e00 && code <= 0x0e7f) ||
    // Emoji (basic)
    (code >= 0x1f300 && code <= 0x1f9ff)
  );
}

/**
 * Get width category for a character.
 */
function getCharWidthCategory(char: string): CharWidthCategory {
  if (char.length === 0) {
    return "half";
  }

  // Check for surrogate pairs (emoji, etc.)
  if (char.length > 1 || char.charCodeAt(0) > 0xffff) {
    return "full";
  }

  return isFullWidthChar(char) ? "full" : "half";
}

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
    charWidth: DEFAULT_CHAR_WIDTH,
    fullWidthCharWidth: DEFAULT_CHAR_WIDTH * 2,
    lineHeight: DEFAULT_LINE_HEIGHT,
    isReady: false,
  });

  const measureElRef = useRef<HTMLSpanElement | null>(null);
  const charCacheRef = useRef<Map<string, number>>(new Map());

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
    const lineHeight = parseFloat(computedStyle.lineHeight) || DEFAULT_LINE_HEIGHT;

    // eslint-disable-next-line custom/no-use-state-in-use-effect -- One-time measurement on mount
    setMetrics({ charWidth, fullWidthCharWidth, lineHeight, isReady: true });

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
      // eslint-disable-next-line no-restricted-syntax -- Accumulator pattern
      let total = 0;
      for (const char of text) {
        total += measureChar(char);
      }
      return total;
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
