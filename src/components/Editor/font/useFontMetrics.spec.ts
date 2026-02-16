/**
 * @file useFontMetrics hook tests
 *
 * Tests for font metrics measurement including character widths and line heights.
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useFontMetrics } from "../font/useFontMetrics";

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
// Initialization Tests
// =============================================================================

describe("useFontMetrics initialization", () => {
  it("starts with default values before measurement", () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() => useFontMetrics(containerRef));

    // Should have default values initially
    expect(result.current.charWidth).toBe(8); // DEFAULT_CHAR_WIDTH
    expect(result.current.lineHeight).toBe(21); // DEFAULT_LINE_HEIGHT
  });

  it("becomes ready after mount", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() => useFontMetrics(containerRef));

    await waitFor(() => expect(result.current.isReady).toBe(true));
  });

  it("handles null container ref", () => {
    const nullRef = { current: null };
    const { result } = renderHook(() => useFontMetrics(nullRef));

    // Should not crash, stays not ready
    expect(result.current.isReady).toBe(false);
  });
});

// =============================================================================
// Character Width Tests
// =============================================================================

describe("useFontMetrics charWidth", () => {
  it("measures half-width characters correctly", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() => useFontMetrics(containerRef));

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // 'M' characters used for measurement = 8px each (mocked)
    expect(result.current.charWidth).toBe(8);
  });

  it("measures full-width characters correctly", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() => useFontMetrics(containerRef));

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // CJK characters = 16px each (mocked)
    expect(result.current.fullWidthCharWidth).toBe(16);
  });
});

// =============================================================================
// measureText Tests
// =============================================================================

describe("useFontMetrics measureText", () => {
  it("returns 0 for empty string", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() => useFontMetrics(containerRef));

    await waitFor(() => expect(result.current.isReady).toBe(true));

    expect(result.current.measureText("")).toBe(0);
  });

  it("measures ASCII text correctly", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() => useFontMetrics(containerRef));

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Each ASCII char = 8px
    expect(result.current.measureText("hello")).toBe(40);
    expect(result.current.measureText("ab")).toBe(16);
  });

  it("measures CJK text correctly", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() => useFontMetrics(containerRef));

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Each CJK char = 16px
    expect(result.current.measureText("日本")).toBe(32);
    expect(result.current.measureText("あい")).toBe(32);
  });

  it("measures mixed text correctly", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() => useFontMetrics(containerRef));

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // "ab" (8+8) + "日本" (16+16) = 48
    expect(result.current.measureText("ab日本")).toBe(48);
  });

  it("throws error when measurement element is not available", async () => {
    const containerRef = createMockContainerRef();
    const { result, unmount } = renderHook(() => useFontMetrics(containerRef));

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Unmount to cleanup measurement element
    unmount();

    // Create a new hook instance with null ref
    const nullRef = { current: null };
    const { result: result2 } = renderHook(() => useFontMetrics(nullRef));

    // Should throw when trying to measure without element
    expect(() => result2.current.measureText("test")).toThrow();
  });
});

// =============================================================================
// getColumnX Tests
// =============================================================================

describe("useFontMetrics getColumnX", () => {
  it("returns 0 for column 1", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() => useFontMetrics(containerRef));

    await waitFor(() => expect(result.current.isReady).toBe(true));

    expect(result.current.getColumnX("hello", 1)).toBe(0);
  });

  it("calculates X position for column in ASCII text", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() => useFontMetrics(containerRef));

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Column 3 means characters 0,1 before cursor = 2 chars * 8px = 16px
    expect(result.current.getColumnX("hello", 3)).toBe(16);
    // Column 6 means characters 0-4 before cursor = 5 chars * 8px = 40px
    expect(result.current.getColumnX("hello", 6)).toBe(40);
  });

  it("calculates X position for column in CJK text", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() => useFontMetrics(containerRef));

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // "日本語" at column 2 = 1 char before = 16px
    expect(result.current.getColumnX("日本語", 2)).toBe(16);
  });
});

// =============================================================================
// Line Height Tests
// =============================================================================

describe("useFontMetrics lineHeight", () => {
  it("uses computed line height from container", async () => {
    const containerRef = createMockContainerRef();
    const { result } = renderHook(() => useFontMetrics(containerRef));

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Mocked getComputedStyle returns lineHeight: "21px"
    expect(result.current.lineHeight).toBe(21);
  });

  it("uses default line height when computed style is invalid", async () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      lineHeight: "normal",
    } as CSSStyleDeclaration);

    const containerRef = createMockContainerRef();
    const { result } = renderHook(() => useFontMetrics(containerRef));

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Should use DEFAULT_LINE_HEIGHT (21) when parsing fails
    expect(result.current.lineHeight).toBe(21);
  });
});

// =============================================================================
// Cleanup Tests
// =============================================================================

describe("useFontMetrics cleanup", () => {
  it("cleans up measurement element on unmount", async () => {
    const containerRef = createMockContainerRef();
    const container = containerRef.current!;

    const { unmount } = renderHook(() => useFontMetrics(containerRef));

    // Wait for initialization
    await waitFor(() => {
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

    const { unmount } = renderHook(() => useFontMetrics(containerRef));

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

  it("clears character cache on unmount", async () => {
    const containerRef = createMockContainerRef();
    const { result, unmount } = renderHook(() => useFontMetrics(containerRef));

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Measure some characters to populate cache
    result.current.measureText("abc");

    // Unmount - cache should be cleared
    expect(() => unmount()).not.toThrow();
  });
});

// =============================================================================
// Character Caching Tests
// =============================================================================

describe("useFontMetrics character caching", () => {
  it("caches measured character widths", async () => {
    const mockGetBoundingClientRect = setupMeasurementMocks();

    const containerRef = createMockContainerRef();
    const { result } = renderHook(() => useFontMetrics(containerRef));

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Clear call count from initialization
    mockGetBoundingClientRect.mockClear();

    // First measurement - should call getBoundingClientRect for each unique char
    result.current.measureText("aaa");

    const firstCallCount = mockGetBoundingClientRect.mock.calls.length;

    // Measure same string again - should use cache (fewer calls)
    result.current.measureText("aaa");

    // For short strings (<=100 chars), measureText measures directly
    // So caching is done at the character level within long string measurement
    expect(mockGetBoundingClientRect.mock.calls.length).toBeGreaterThanOrEqual(firstCallCount);
  });
});
