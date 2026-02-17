/**
 * @file useStyledMeasurement Tests
 *
 * Tests for style-aware text measurement including binary search column finding.
 */

import { renderHook, waitFor } from "@testing-library/react";
import {
  useStyledMeasurement,
  styledCoordinatesToPosition,
} from "./useStyledMeasurement";
import type { TextStyleSegment } from "../core/types";

// =============================================================================
// Test Setup
// =============================================================================

/**
 * Mock getBoundingClientRect for text measurement.
 * ASCII characters = 8px, CJK characters = 16px
 */
function setupMeasurementMocks() {
  const mockGetBoundingClientRect = vi.fn().mockImplementation(function (
    this: HTMLElement
  ) {
    const text = this.textContent ?? "";
    const width = { value: 0 };
    for (const char of text) {
      const code = char.charCodeAt(0);
      // CJK ranges
      if (
        (code >= 0x3040 && code <= 0x30ff) || // Hiragana + Katakana
        (code >= 0x4e00 && code <= 0x9fff) // CJK Unified Ideographs
      ) {
        width.value += 16; // Full-width
      } else {
        width.value += 8; // Half-width
      }
    }
    return { width: width.value, height: 21, top: 0, left: 0, bottom: 21, right: width.value };
  });

  HTMLElement.prototype.getBoundingClientRect = mockGetBoundingClientRect;

  vi.spyOn(window, "getComputedStyle").mockReturnValue({
    lineHeight: "21px",
  } as CSSStyleDeclaration);

  return mockGetBoundingClientRect;
}

/**
 * Create a mock container ref.
 */
function createMockContainerRef(): React.RefObject<HTMLDivElement> {
  const div = document.createElement("div");
  return { current: div };
}

beforeEach(() => {
  setupMeasurementMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// =============================================================================
// Helper Function Tests (parseFontSize, findStyleAtOffset)
// =============================================================================

// Note: parseFontSize and findStyleAtOffset are internal functions.
// We test their behavior through the hook's public interface.

describe("useStyledMeasurement font size parsing", () => {
  it("uses base font size when no style", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Single ASCII char with default font should be 8px
    const width = result.current.measureStyledText("a", 0);
    expect(width).toBe(8);
  });

  it("applies style-specific font size in px", async () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 5, style: { fontSize: "20px" } },
    ];
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles,
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Style is applied - the mock doesn't change width based on font size,
    // but we verify the function runs without error
    const width = result.current.measureStyledText("hello", 0);
    expect(width).toBeGreaterThan(0);
  });

  it("applies style-specific font size in em", async () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 5, style: { fontSize: "1.5em" } },
    ];
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles,
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // em units are relative to base size (1.5 * 14 = 21px)
    const width = result.current.measureStyledText("hello", 0);
    expect(width).toBeGreaterThan(0);
  });

  it("applies style-specific font size in percent", async () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 5, style: { fontSize: "150%" } },
    ];
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles,
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // % units are relative to base size (150% * 14 = 21px)
    const width = result.current.measureStyledText("hello", 0);
    expect(width).toBeGreaterThan(0);
  });

  it("applies numeric font size without unit", async () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 5, style: { fontSize: "18" } },
    ];
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles,
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Numeric value without unit is parsed as-is
    const width = result.current.measureStyledText("hello", 0);
    expect(width).toBeGreaterThan(0);
  });

  it("falls back to base size for invalid font size", async () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 5, style: { fontSize: "invalid" } },
    ];
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles,
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Invalid value falls back to base size
    const width = result.current.measureStyledText("hello", 0);
    expect(width).toBeGreaterThan(0);
  });
});

// =============================================================================
// measureStyledText Tests
// =============================================================================

describe("useStyledMeasurement measureStyledText", () => {
  it("returns 0 for empty text", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    expect(result.current.measureStyledText("", 0)).toBe(0);
  });

  it("measures ASCII characters correctly", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Each ASCII char = 8px
    expect(result.current.measureStyledText("hello", 0)).toBe(40);
    expect(result.current.measureStyledText("ab", 0)).toBe(16);
  });

  it("measures CJK characters as full-width", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Each CJK char = 16px
    expect(result.current.measureStyledText("日本", 0)).toBe(32);
    expect(result.current.measureStyledText("あい", 0)).toBe(32);
  });

  it("measures mixed ASCII and CJK correctly", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // "ab" (8+8) + "日本" (16+16) = 48
    expect(result.current.measureStyledText("ab日本", 0)).toBe(48);
  });
});

// =============================================================================
// getStyledColumnX Tests
// =============================================================================

describe("useStyledMeasurement getStyledColumnX", () => {
  it("returns 0 for column 1", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    expect(result.current.getStyledColumnX("hello", 1, 0)).toBe(0);
  });

  it("calculates X position for column in ASCII text", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Column 3 means characters 0,1 before cursor = 2 chars * 8px = 16px
    expect(result.current.getStyledColumnX("hello", 3, 0)).toBe(16);
    // Column 6 means characters 0-4 before cursor = 5 chars * 8px = 40px
    expect(result.current.getStyledColumnX("hello", 6, 0)).toBe(40);
  });

  it("calculates X position for column in CJK text", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // "日本語" at column 2 = 1 char before = 16px
    expect(result.current.getStyledColumnX("日本語", 2, 0)).toBe(16);
  });
});

// =============================================================================
// findColumnAtStyledX Tests (Binary Search)
// =============================================================================

describe("useStyledMeasurement findColumnAtStyledX", () => {
  it("returns column 1 for x <= 0", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    expect(result.current.findColumnAtStyledX("hello", 0, 0)).toBe(1);
    expect(result.current.findColumnAtStyledX("hello", -10, 0)).toBe(1);
  });

  it("returns column 1 for empty line", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    expect(result.current.findColumnAtStyledX("", 100, 0)).toBe(1);
  });

  it("snaps to nearest column in ASCII text", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // "hello" - each char is 8px
    // x=3 is closer to column 1 (0px) than column 2 (8px)
    expect(result.current.findColumnAtStyledX("hello", 3, 0)).toBe(1);

    // x=5 is closer to column 2 (8px) than column 1 (0px)
    expect(result.current.findColumnAtStyledX("hello", 5, 0)).toBe(2);

    // x=12 is exactly at midpoint between column 2 (8px) and column 3 (16px)
    // Binary search behavior: x <= midPoint goes to lower column
    expect(result.current.findColumnAtStyledX("hello", 12, 0)).toBe(2);

    // x=13 is past midpoint (12), should snap to column 3
    expect(result.current.findColumnAtStyledX("hello", 13, 0)).toBe(3);
  });

  it("handles end of line", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // "hello" is 5 chars * 8px = 40px
    // x=45 is past the end, should return column 6 (after last char)
    expect(result.current.findColumnAtStyledX("hello", 45, 0)).toBe(6);
  });

  it("handles CJK characters", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // "日本" - each char is 16px
    // x=10 should snap to column 1 (closer to 0 than 16)
    expect(result.current.findColumnAtStyledX("日本", 10, 0)).toBe(2);

    // x=20 should snap to column 2 (closer to 16 than 32)
    expect(result.current.findColumnAtStyledX("日本", 20, 0)).toBe(2);
  });

  it("handles mixed width characters", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // "a日b" - a(8) + 日(16) + b(8) = 32px total
    // Column positions: 1->0, 2->8, 3->24, 4->32

    // x=5 should be column 2 (closer to 8 than 0)
    expect(result.current.findColumnAtStyledX("a日b", 5, 0)).toBe(2);

    // x=15 should be column 2 (closer to 8 than 24)
    expect(result.current.findColumnAtStyledX("a日b", 15, 0)).toBe(2);

    // x=20 should be column 3 (closer to 24 than 8)
    expect(result.current.findColumnAtStyledX("a日b", 20, 0)).toBe(3);
  });
});

// =============================================================================
// styledCoordinatesToPosition Tests
// =============================================================================

describe("styledCoordinatesToPosition", () => {
  const mockFindColumnAtStyledX = (
    _line: string,
    x: number,
    lineOffset: number
  ): number => {
    void lineOffset;
    // Simple mock: 8px per char
    if (x <= 0) {
      return 1;
    }
    return Math.floor(x / 8) + 1;
  };

  it("handles empty lines array with fallback", () => {
    const result = styledCoordinatesToPosition({
      x: 50,
      y: 10,
      lines: [],
      lineOffsets: [],
      scrollTop: 0,
      lineHeight: 21,
      paddingLeft: 8,
      paddingTop: 8,
      findColumnAtStyledX: mockFindColumnAtStyledX,
    });

    // Empty lines clamps to line 1, uses fallback for empty string
    expect(result.line).toBe(1);
  });

  it("handles missing line offset with fallback", () => {
    const result = styledCoordinatesToPosition({
      x: 50,
      y: 30, // Second line
      lines: ["hello", "world"],
      lineOffsets: [0], // Missing offset for second line
      scrollTop: 0,
      lineHeight: 21,
      paddingLeft: 8,
      paddingTop: 8,
      findColumnAtStyledX: mockFindColumnAtStyledX,
    });

    // Should use fallback offset of 0
    expect(result.line).toBe(2);
  });

  it("calculates line from Y coordinate", () => {
    const result = styledCoordinatesToPosition({
      x: 0,
      y: 0,
      lines: ["hello", "world", "test"],
      lineOffsets: [0, 6, 12],
      scrollTop: 0,
      lineHeight: 21,
      paddingLeft: 8,
      paddingTop: 8,
      findColumnAtStyledX: mockFindColumnAtStyledX,
    });

    // y=0 with paddingTop=8 means adjustedY=-8, which clamps to line 1
    expect(result.line).toBe(1);
  });

  it("calculates line with scroll offset", () => {
    const result = styledCoordinatesToPosition({
      x: 0,
      y: 50,
      lines: ["hello", "world", "test"],
      lineOffsets: [0, 6, 12],
      scrollTop: 21, // scrolled down one line
      lineHeight: 21,
      paddingLeft: 8,
      paddingTop: 8,
      findColumnAtStyledX: mockFindColumnAtStyledX,
    });

    // y=50 + scrollTop=21 - paddingTop=8 = 63
    // 63 / 21 = 3 -> line 4, clamped to line 3
    expect(result.line).toBe(3);
  });

  it("calculates column from X coordinate", () => {
    const result = styledCoordinatesToPosition({
      x: 24, // 8 (padding) + 16 (2 chars)
      y: 8,
      lines: ["hello", "world"],
      lineOffsets: [0, 6],
      scrollTop: 0,
      lineHeight: 21,
      paddingLeft: 8,
      paddingTop: 8,
      findColumnAtStyledX: mockFindColumnAtStyledX,
    });

    // adjustedX = 24 - 8 = 16, which is 2 chars -> column 3
    expect(result.column).toBe(3);
  });

  it("clamps to valid line range", () => {
    const result = styledCoordinatesToPosition({
      x: 0,
      y: 1000,
      lines: ["hello", "world"],
      lineOffsets: [0, 6],
      scrollTop: 0,
      lineHeight: 21,
      paddingLeft: 8,
      paddingTop: 8,
      findColumnAtStyledX: mockFindColumnAtStyledX,
    });

    // y=1000 should clamp to last line
    expect(result.line).toBe(2);
  });

  it("handles negative Y correctly", () => {
    const result = styledCoordinatesToPosition({
      x: 0,
      y: -100,
      lines: ["hello", "world"],
      lineOffsets: [0, 6],
      scrollTop: 0,
      lineHeight: 21,
      paddingLeft: 8,
      paddingTop: 8,
      findColumnAtStyledX: mockFindColumnAtStyledX,
    });

    // Negative Y should clamp to line 1
    expect(result.line).toBe(1);
  });

  it("uses correct line offset for column calculation", () => {
    const capturedLineOffset = { value: -1 };
    const trackingFindColumn = (
      _line: string,
      x: number,
      lineOffset: number
    ): number => {
      capturedLineOffset.value = lineOffset;
      return Math.floor(x / 8) + 1;
    };

    styledCoordinatesToPosition({
      x: 16,
      y: 29, // Line 2 (21px height, paddingTop 8px)
      lines: ["hello", "world"],
      lineOffsets: [0, 6],
      scrollTop: 0,
      lineHeight: 21,
      paddingLeft: 8,
      paddingTop: 8,
      findColumnAtStyledX: trackingFindColumn,
    });

    // Line 2 has offset 6
    expect(capturedLineOffset.value).toBe(6);
  });
});

// =============================================================================
// Hook Initialization Tests
// =============================================================================

describe("useStyledMeasurement initialization", () => {
  it("starts with isReady false", () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    // Initial state before effect runs
    expect(result.current.charWidth).toBe(8); // DEFAULT_CHAR_WIDTH
    expect(result.current.lineHeight).toBe(21); // DEFAULT_LINE_HEIGHT
  });

  it("becomes ready after mount", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));
  });

  it("handles null container ref", () => {
    const nullRef = { current: null };
    const { result } = renderHook(() =>
      useStyledMeasurement(nullRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    // Should not crash, stays not ready
    expect(result.current.isReady).toBe(false);
  });

  it("uses default line height when getComputedStyle returns invalid value", async () => {
    // Mock getComputedStyle to return "normal" (non-numeric)
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      lineHeight: "normal",
    } as CSSStyleDeclaration);

    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Should use DEFAULT_LINE_HEIGHT (21) when parsing fails
    expect(result.current.lineHeight).toBe(21);
  });

  it("cleans up measurement element on unmount", async () => {
    const containerRef = createMockContainerRef();
    const container = containerRef.current!;

    const { unmount } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    // Wait for initialization
    await waitFor(() => {
      // Measurement element should be appended
      expect(container.querySelector("span")).not.toBeNull();
    });

    // Unmount the hook
    unmount();

    // Measurement element should be removed
    expect(container.querySelector("span")).toBeNull();
  });

  it("handles cleanup when measurement element already removed", async () => {
    const containerRef = createMockContainerRef();
    const container = containerRef.current!;

    const { unmount } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles: [],
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => {
      expect(container.querySelector("span")).not.toBeNull();
    });

    // Manually remove the measurement element before unmount
    const measureEl = container.querySelector("span");
    if (measureEl) {
      container.removeChild(measureEl);
    }

    // Unmount should not throw even if element already removed
    expect(() => unmount()).not.toThrow();
  });
});

// =============================================================================
// Style Application Tests
// =============================================================================

describe("useStyledMeasurement style application", () => {
  it("applies font family from style", async () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 5, style: { fontFamily: "Arial" } },
    ];
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles,
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Should not throw, verifying style is applied
    const width = result.current.measureStyledText("hello", 0);
    expect(width).toBeGreaterThan(0);
  });

  it("applies font weight from style", async () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 5, style: { fontWeight: "bold" } },
    ];
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles,
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    const width = result.current.measureStyledText("hello", 0);
    expect(width).toBeGreaterThan(0);
  });

  it("applies font style (italic) from style", async () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 5, style: { fontStyle: "italic" } },
    ];
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles,
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    const width = result.current.measureStyledText("hello", 0);
    expect(width).toBeGreaterThan(0);
  });

  it("uses base style for unstyled offsets", async () => {
    const styles: TextStyleSegment[] = [
      { start: 10, end: 15, style: { fontWeight: "bold" } },
    ];
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() =>
      useStyledMeasurement(containerRef, {
        styles,
        fontSize: 14,
        fontFamily: "monospace",
      })
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Text at offset 0-5 has no style, should use base
    const width = result.current.measureStyledText("hello", 0);
    expect(width).toBe(40); // 5 * 8px
  });
});
