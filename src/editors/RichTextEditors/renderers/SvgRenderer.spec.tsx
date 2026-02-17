/**
 * @file SvgRenderer Tests
 *
 * Tests for SVG renderer, specifically CJK character measurement.
 */

import { render } from "@testing-library/react";
import { beforeAll, afterAll } from "vitest";
import { SvgRenderer } from "./SvgRenderer";
import type { TokenCache, Token } from "./types";

// =============================================================================
// Canvas Mock for JSDOM
// =============================================================================

/**
 * Mock Canvas 2D context for JSDOM environment.
 * SvgRenderer uses Canvas 2D for style-aware text measurement.
 */
function createMockCanvas2DContext(measureText: (text: string) => number): CanvasRenderingContext2D {
  return {
    font: "",
    measureText: (text: string) => ({
      width: measureText(text),
      actualBoundingBoxAscent: 0,
      actualBoundingBoxDescent: 0,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: 0,
      fontBoundingBoxAscent: 0,
      fontBoundingBoxDescent: 0,
      alphabeticBaseline: 0,
      emHeightAscent: 0,
      emHeightDescent: 0,
      hangingBaseline: 0,
      ideographicBaseline: 0,
    }),
  } as unknown as CanvasRenderingContext2D;
}

// Store original getContext
const originalGetContext = HTMLCanvasElement.prototype.getContext;

// Global measureText function for mocking
let globalMockMeasureText: ((text: string) => number) | null = null;

/**
 * Set the mock measureText function for Canvas context.
 */
function setMockMeasureText(fn: (text: string) => number): void {
  globalMockMeasureText = fn;
}

// Mock HTMLCanvasElement.getContext
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = function (contextId: string) {
    if (contextId === "2d" && globalMockMeasureText) {
      return createMockCanvas2DContext(globalMockMeasureText);
    }
    return originalGetContext.call(this, contextId);
  } as typeof HTMLCanvasElement.prototype.getContext;
});

afterAll(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext;
});

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Create a mock measureText function that simulates actual character widths.
 * - ASCII characters: ~8px each
 * - CJK characters: ~16px each (full-width)
 */
function createMockMeasureText(): (text: string) => number {
  return (text: string) => {
    const width = { value: 0 };
    for (const char of text) {
      const code = char.charCodeAt(0);
      // CJK ranges: Hiragana, Katakana, CJK Unified Ideographs
      if (
        (code >= 0x3040 && code <= 0x30ff) || // Hiragana + Katakana
        (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
        (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
        (code >= 0xff00 && code <= 0xffef)    // Fullwidth forms
      ) {
        width.value += 16; // Full-width character
      } else {
        width.value += 8; // Half-width character
      }
    }
    return width.value;
  };
}

/**
 * Create a simple token cache that returns a single "plain" token per line.
 */
function createSimpleTokenCache(): TokenCache {
  return {
    getTokens: (line: string): readonly Token[] => {
      if (line.length === 0) {
        return [];
      }
      return [
        {
          type: "plain",
          text: line,
          start: 0,
          end: line.length,
        },
      ];
    },
    clear: () => {},
  };
}

// =============================================================================
// Tests
// =============================================================================

describe("SvgRenderer", () => {
  describe("CJK character measurement", () => {
    it("renders cursor at correct position for CJK text", () => {
      const measureText = createMockMeasureText();
      setMockMeasureText(measureText);
      const tokenCache = createSimpleTokenCache();
      const lines = ["日本語"];

      const { container } = render(
        <SvgRenderer
          lines={lines}
          visibleRange={{ start: 0, end: 1 }}
          topSpacerHeight={0}
          bottomSpacerHeight={0}
          tokenCache={tokenCache}
          lineHeight={21}
          padding={8}
          measureText={measureText}
          cursor={{
            line: 1,
            column: 3, // After "日本"
            visible: true,
            blinking: false,
          }}
        />
      );

      // Find cursor element (rect with width=2)
      const cursor = container.querySelector('rect[width="2"]');
      expect(cursor).not.toBeNull();

      // Expected X position:
      // padding(8) + measureText("日本")(16*2=32) = 40
      const cursorX = cursor?.getAttribute("x");
      expect(Number(cursorX)).toBe(40);
    });

    it("renders cursor at correct position for mixed ASCII and CJK text", () => {
      const measureText = createMockMeasureText();
      setMockMeasureText(measureText);
      const tokenCache = createSimpleTokenCache();
      const lines = ["ABC日本語DEF"];

      const { container } = render(
        <SvgRenderer
          lines={lines}
          visibleRange={{ start: 0, end: 1 }}
          topSpacerHeight={0}
          bottomSpacerHeight={0}
          tokenCache={tokenCache}
          lineHeight={21}
          padding={8}
          measureText={measureText}
          cursor={{
            line: 1,
            column: 7, // After "ABC日本語" (cursor is 1-based)
            visible: true,
            blinking: false,
          }}
        />
      );

      const cursor = container.querySelector('rect[width="2"]');
      expect(cursor).not.toBeNull();

      // Expected X position:
      // padding(8) + measureText("ABC日本語")(8*3 + 16*3 = 24+48 = 72) = 80
      const cursorX = cursor?.getAttribute("x");
      expect(Number(cursorX)).toBe(80);
    });

    it("renders cursor at start of line correctly", () => {
      const measureText = createMockMeasureText();
      setMockMeasureText(measureText);
      const tokenCache = createSimpleTokenCache();
      const lines = ["日本語"];

      const { container } = render(
        <SvgRenderer
          lines={lines}
          visibleRange={{ start: 0, end: 1 }}
          topSpacerHeight={0}
          bottomSpacerHeight={0}
          tokenCache={tokenCache}
          lineHeight={21}
          padding={8}
          measureText={measureText}
          cursor={{
            line: 1,
            column: 1, // Start of line
            visible: true,
            blinking: false,
          }}
        />
      );

      const cursor = container.querySelector('rect[width="2"]');
      expect(cursor).not.toBeNull();

      // Expected X position: padding(8) + measureText("")(0) = 8
      const cursorX = cursor?.getAttribute("x");
      expect(Number(cursorX)).toBe(8);
    });

    it("renders cursor at end of CJK line correctly", () => {
      const measureText = createMockMeasureText();
      setMockMeasureText(measureText);
      const tokenCache = createSimpleTokenCache();
      const lines = ["日本語"];

      const { container } = render(
        <SvgRenderer
          lines={lines}
          visibleRange={{ start: 0, end: 1 }}
          topSpacerHeight={0}
          bottomSpacerHeight={0}
          tokenCache={tokenCache}
          lineHeight={21}
          padding={8}
          measureText={measureText}
          cursor={{
            line: 1,
            column: 4, // After all 3 CJK characters
            visible: true,
            blinking: false,
          }}
        />
      );

      const cursor = container.querySelector('rect[width="2"]');
      expect(cursor).not.toBeNull();

      // Expected X position:
      // padding(8) + measureText("日本語")(16*3=48) = 56
      const cursorX = cursor?.getAttribute("x");
      expect(Number(cursorX)).toBe(56);
    });

    it("renders selection highlight with correct width for CJK text", () => {
      const measureText = createMockMeasureText();
      setMockMeasureText(measureText);
      const tokenCache = createSimpleTokenCache();
      const lines = ["日本語"];

      const { container } = render(
        <SvgRenderer
          lines={lines}
          visibleRange={{ start: 0, end: 1 }}
          topSpacerHeight={0}
          bottomSpacerHeight={0}
          tokenCache={tokenCache}
          lineHeight={21}
          padding={8}
          measureText={measureText}
          highlights={[
            {
              startLine: 1,
              startColumn: 1,
              endLine: 1,
              endColumn: 3, // Select "日本"
              type: "selection",
            },
          ]}
        />
      );

      // Find highlight rect (non-cursor rect)
      const rects = container.querySelectorAll("rect");
      const highlightRect = Array.from(rects).find(
        (rect) => rect.getAttribute("width") !== "2"
      );
      expect(highlightRect).not.toBeNull();

      // Expected width: measureText("日本")(16*2=32) = 32
      const width = highlightRect?.getAttribute("width");
      expect(Number(width)).toBe(32);
    });
  });
});
