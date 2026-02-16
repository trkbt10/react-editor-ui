/**
 * @file useVirtualScroll hook tests (Editor)
 *
 * Tests for virtual scroll state management in the Editor component.
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useVirtualScroll } from "./useVirtualScroll";

// =============================================================================
// Test Setup
// =============================================================================

type MockResizeObserverCallback = (entries: ResizeObserverEntry[]) => void;

class MockResizeObserver implements ResizeObserver {
  private callback: MockResizeObserverCallback;
  private static instances: MockResizeObserver[] = [];

  constructor(callback: MockResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  observe(): void {
    // Mock implementation
  }

  unobserve(): void {
    // Mock implementation
  }

  disconnect(): void {
    // Mock implementation
  }

  /**
   * Trigger a resize event on all instances.
   */
  static triggerResize(height: number): void {
    const entry = {
      contentRect: { height } as DOMRectReadOnly,
    } as ResizeObserverEntry;

    for (const instance of MockResizeObserver.instances) {
      instance.callback([entry]);
    }
  }

  static reset(): void {
    MockResizeObserver.instances = [];
  }
}

beforeEach(() => {
  MockResizeObserver.reset();
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// =============================================================================
// Initialization Tests
// =============================================================================

describe("useVirtualScroll initialization", () => {
  it("returns initial state with default values", () => {
    const { result } = renderHook(() => useVirtualScroll(100));

    expect(result.current.state.scrollTop).toBe(0);
    expect(result.current.state.viewportHeight).toBe(0);
    expect(result.current.state.visibleRange.start).toBe(0);
    expect(result.current.state.visibleRange.end).toBeGreaterThan(0);
  });

  it("calculates total height based on line count", () => {
    const { result } = renderHook(() => useVirtualScroll(100, { lineHeight: 21 }));

    expect(result.current.state.totalHeight).toBe(100 * 21);
  });

  it("applies custom line height", () => {
    const { result } = renderHook(() => useVirtualScroll(50, { lineHeight: 30 }));

    expect(result.current.state.totalHeight).toBe(50 * 30);
  });

  it("applies custom overscan", () => {
    // With 0 overscan, visible range should be smaller
    const { result } = renderHook(() => useVirtualScroll(100, { overscan: 0 }));

    // Initial state with no viewport height
    expect(result.current.state.visibleRange.start).toBe(0);
  });
});

// =============================================================================
// Container Ref Tests
// =============================================================================

describe("useVirtualScroll containerRef", () => {
  it("updates viewport height when container is set", () => {
    const { result } = renderHook(() => useVirtualScroll(100));

    const container = document.createElement("div");
    Object.defineProperty(container, "clientHeight", { value: 500, configurable: true });

    act(() => {
      result.current.containerRef(container);
    });

    expect(result.current.state.viewportHeight).toBe(500);
  });

  it("handles null container", () => {
    const { result } = renderHook(() => useVirtualScroll(100));

    // Set container first
    const container = document.createElement("div");
    Object.defineProperty(container, "clientHeight", { value: 500, configurable: true });

    act(() => {
      result.current.containerRef(container);
    });

    // Then set to null
    act(() => {
      result.current.containerRef(null);
    });

    // Should not crash, viewportHeight remains unchanged
    expect(result.current.state.viewportHeight).toBe(500);
  });
});

// =============================================================================
// Scroll Position Tests
// =============================================================================

describe("useVirtualScroll scrollTop", () => {
  it("updates scroll position", () => {
    const { result } = renderHook(() => useVirtualScroll(100));

    act(() => {
      result.current.setScrollTop(200);
    });

    expect(result.current.state.scrollTop).toBe(200);
  });

  it("calculates visible range based on scroll position", () => {
    const { result } = renderHook(() => useVirtualScroll(100, { lineHeight: 20, overscan: 2 }));

    // Set up viewport
    const container = document.createElement("div");
    Object.defineProperty(container, "clientHeight", { value: 100, configurable: true });

    act(() => {
      result.current.containerRef(container);
    });

    // Scroll down
    act(() => {
      result.current.setScrollTop(200);
    });

    // With scrollTop=200, lineHeight=20: startLine = floor(200/20) - 2 = 8
    expect(result.current.state.visibleRange.start).toBe(8);
  });

  it("clamps visible range to valid indices", () => {
    const { result } = renderHook(() => useVirtualScroll(10, { lineHeight: 20, overscan: 5 }));

    // Scroll to beginning - should clamp start to 0
    act(() => {
      result.current.setScrollTop(0);
    });

    expect(result.current.state.visibleRange.start).toBe(0);

    // Scroll past end
    const container = document.createElement("div");
    Object.defineProperty(container, "clientHeight", { value: 100, configurable: true });

    act(() => {
      result.current.containerRef(container);
    });

    act(() => {
      result.current.setScrollTop(1000);
    });

    // Should clamp end to lineCount (10)
    expect(result.current.state.visibleRange.end).toBeLessThanOrEqual(10);
  });
});

// =============================================================================
// Spacer Calculation Tests
// =============================================================================

describe("useVirtualScroll spacers", () => {
  it("calculates top spacer height", () => {
    const { result } = renderHook(() => useVirtualScroll(100, { lineHeight: 20, overscan: 0 }));

    const container = document.createElement("div");
    Object.defineProperty(container, "clientHeight", { value: 100, configurable: true });

    act(() => {
      result.current.containerRef(container);
    });

    act(() => {
      result.current.setScrollTop(200);
    });

    // Start line = floor(200/20) = 10
    // Top spacer = 10 * 20 = 200
    expect(result.current.state.topSpacerHeight).toBe(200);
  });

  it("calculates bottom spacer height", () => {
    const { result } = renderHook(() => useVirtualScroll(100, { lineHeight: 20, overscan: 0 }));

    const container = document.createElement("div");
    Object.defineProperty(container, "clientHeight", { value: 100, configurable: true });

    act(() => {
      result.current.containerRef(container);
    });

    // Don't scroll - show first few lines
    act(() => {
      result.current.setScrollTop(0);
    });

    // End line = ceil((0+100)/20) = 5
    // Bottom spacer = (100-5) * 20 = 1900
    expect(result.current.state.bottomSpacerHeight).toBe((100 - 5) * 20);
  });
});

// =============================================================================
// ResizeObserver Tests
// =============================================================================

describe("useVirtualScroll ResizeObserver", () => {
  it("updates viewport height on resize", async () => {
    const { result } = renderHook(() => useVirtualScroll(100));

    // Set up container
    const container = document.createElement("div");
    Object.defineProperty(container, "clientHeight", { value: 400, configurable: true });

    act(() => {
      result.current.containerRef(container);
    });

    expect(result.current.state.viewportHeight).toBe(400);

    // Simulate resize via ResizeObserver
    act(() => {
      MockResizeObserver.triggerResize(600);
    });

    await waitFor(() => {
      expect(result.current.state.viewportHeight).toBe(600);
    });
  });

  it("disconnects observer on unmount", () => {
    const disconnectSpy = vi.spyOn(MockResizeObserver.prototype, "disconnect");

    const { unmount, result } = renderHook(() => useVirtualScroll(100));

    // Set up container to trigger observer creation
    const container = document.createElement("div");
    Object.defineProperty(container, "clientHeight", { value: 400, configurable: true });

    act(() => {
      result.current.containerRef(container);
    });

    unmount();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});

// =============================================================================
// Line Count Changes Tests
// =============================================================================

describe("useVirtualScroll line count changes", () => {
  it("updates total height when line count changes", () => {
    const { result, rerender } = renderHook(
      ({ lineCount }) => useVirtualScroll(lineCount, { lineHeight: 20 }),
      { initialProps: { lineCount: 100 } }
    );

    expect(result.current.state.totalHeight).toBe(2000);

    rerender({ lineCount: 50 });

    expect(result.current.state.totalHeight).toBe(1000);
  });

  it("adjusts visible range when line count decreases", () => {
    const { result, rerender } = renderHook(
      ({ lineCount }) => useVirtualScroll(lineCount, { lineHeight: 20, overscan: 0 }),
      { initialProps: { lineCount: 100 } }
    );

    const container = document.createElement("div");
    Object.defineProperty(container, "clientHeight", { value: 100, configurable: true });

    act(() => {
      result.current.containerRef(container);
    });

    // Scroll to end
    act(() => {
      result.current.setScrollTop(1800);
    });

    // Reduce line count - visible range should adjust
    rerender({ lineCount: 50 });

    expect(result.current.state.visibleRange.end).toBeLessThanOrEqual(50);
  });
});
