/**
 * @file useVirtualScroll hook tests
 */

import { renderHook, act } from "@testing-library/react";
import { useVirtualScroll } from "./useVirtualScroll";

describe("useVirtualScroll", () => {
  const defaultOptions = {
    itemCount: 100,
    estimatedItemHeight: 36,
    overscan: 3,
    containerHeight: 400,
  };

  describe("initialization", () => {
    it("returns initial virtual items", () => {
      const { result } = renderHook(() => useVirtualScroll(defaultOptions));

      expect(result.current.virtualItems.length).toBeGreaterThan(0);
      expect(result.current.totalHeight).toBe(100 * 36); // 100 items * 36px
      expect(result.current.scrollOffset).toBe(0);
    });

    it("calculates visible items based on container height", () => {
      const { result } = renderHook(() => useVirtualScroll(defaultOptions));

      // With 400px container and 36px items, approximately 11-12 items visible
      // Plus overscan of 3 on each side
      const visibleItems = result.current.virtualItems;
      expect(visibleItems.length).toBeGreaterThanOrEqual(10);
      expect(visibleItems.length).toBeLessThanOrEqual(20);
    });
  });

  describe("scrolling", () => {
    it("updates virtual items when scrolled", () => {
      const { result } = renderHook(() => useVirtualScroll(defaultOptions));

      const initialFirstIndex = result.current.virtualItems[0].index;

      act(() => {
        result.current.onScroll(500); // Scroll down 500px
      });

      expect(result.current.scrollOffset).toBe(500);
      expect(result.current.virtualItems[0].index).toBeGreaterThan(initialFirstIndex);
    });

    it("ignores small scroll changes", () => {
      const { result } = renderHook(() => useVirtualScroll(defaultOptions));

      act(() => {
        result.current.onScroll(0.3); // Very small change
      });

      expect(result.current.scrollOffset).toBe(0);
    });
  });

  describe("scrollToIndex", () => {
    it("scrolls to specified index", () => {
      const { result } = renderHook(() => useVirtualScroll(defaultOptions));

      act(() => {
        result.current.scrollToIndex(50, "start");
      });

      // scrollOffset should be updated to position of item 50
      expect(result.current.scrollOffset).toBe(50 * 36); // 1800px
    });

    it("scrolls to center of specified index", () => {
      const { result } = renderHook(() => useVirtualScroll(defaultOptions));

      act(() => {
        result.current.scrollToIndex(50, "center");
      });

      // scrollOffset should center item 50
      const expectedOffset = 50 * 36 - defaultOptions.containerHeight / 2 + 36 / 2;
      expect(result.current.scrollOffset).toBe(expectedOffset);
    });
  });

  describe("measurement", () => {
    it("updates height for measured item", async () => {
      const { result } = renderHook(() => useVirtualScroll(defaultOptions));

      const initialTotalHeight = result.current.totalHeight;

      act(() => {
        result.current.measureItem(0, 72); // Double height
      });

      // Wait for microtask to complete (measureItem uses queueMicrotask)
      await act(async () => {
        await new Promise<void>((resolve) => queueMicrotask(resolve));
      });

      expect(result.current.totalHeight).toBe(initialTotalHeight + 36); // +36 from the doubled item
    });

    it("batch updates multiple heights", () => {
      const { result } = renderHook(() => useVirtualScroll(defaultOptions));

      const initialTotalHeight = result.current.totalHeight;

      act(() => {
        result.current.measureItems([
          { index: 0, height: 72 },
          { index: 1, height: 72 },
          { index: 2, height: 72 },
        ]);
      });

      expect(result.current.totalHeight).toBe(initialTotalHeight + 36 * 3);
    });
  });

  describe("selection + scroll interaction", () => {
    it("scrollToIndex followed by onScroll should work correctly", () => {
      const { result } = renderHook(() => useVirtualScroll(defaultOptions));

      // Simulate selecting an item (which calls scrollToIndex)
      act(() => {
        result.current.scrollToIndex(50, "center");
      });

      const afterScrollToIndexItems = result.current.virtualItems.length;
      expect(afterScrollToIndexItems).toBeGreaterThan(0);

      // Now simulate user scrolling (which happens in the real browser)
      act(() => {
        result.current.onScroll(100);
      });

      // Should still have virtual items
      expect(result.current.virtualItems.length).toBeGreaterThan(0);
      expect(result.current.scrollOffset).toBe(100);
    });

    it("multiple scrollToIndex followed by onScroll should not break rendering", () => {
      const { result } = renderHook(() => useVirtualScroll(defaultOptions));

      // Multiple selections
      act(() => {
        result.current.scrollToIndex(10, "center");
      });
      act(() => {
        result.current.scrollToIndex(50, "center");
      });
      act(() => {
        result.current.scrollToIndex(30, "center");
      });

      // Then user scrolls
      act(() => {
        result.current.onScroll(200);
      });

      // Should still have virtual items
      expect(result.current.virtualItems.length).toBeGreaterThan(0);
      expect(result.current.scrollOffset).toBe(200);

      // Scroll to different positions
      [400, 800, 1200, 1600, 2000].forEach((scrollTop) => {
        act(() => {
          result.current.onScroll(scrollTop);
        });
        expect(result.current.virtualItems.length).toBeGreaterThan(0);
      });
    });
  });

  describe("resizing", () => {
    it("handles item count changes", () => {
      const { result, rerender } = renderHook(
        (options) => useVirtualScroll(options),
        { initialProps: defaultOptions }
      );

      const initialItemCount = result.current.virtualItems.length;
      expect(initialItemCount).toBeGreaterThan(0);

      // Resize to 50 items
      rerender({ ...defaultOptions, itemCount: 50 });

      expect(result.current.totalHeight).toBe(50 * 36);
    });
  });

  describe("getScrollPosition", () => {
    it("returns correct scroll position for index", () => {
      const { result } = renderHook(() => useVirtualScroll(defaultOptions));

      expect(result.current.getScrollPosition(0)).toBe(0);
      expect(result.current.getScrollPosition(10)).toBe(10 * 36);
      expect(result.current.getScrollPosition(50)).toBe(50 * 36);
    });
  });
});
