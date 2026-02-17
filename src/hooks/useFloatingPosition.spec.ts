/**
 * @file useFloatingPosition hook tests
 */

import { renderHook } from "@testing-library/react";
import {
  calculateFloatingPosition,
  useFloatingPosition,
  rectToAnchor,
  type FloatingAnchor,
} from "./useFloatingPosition";

// Mock window dimensions
const mockViewport = (width: number, height: number) => {
  vi.stubGlobal("innerWidth", width);
  vi.stubGlobal("innerHeight", height);
  vi.stubGlobal("scrollX", 0);
  vi.stubGlobal("scrollY", 0);
};

describe("calculateFloatingPosition", () => {
  beforeEach(() => {
    mockViewport(1024, 768);
  });

  describe("basic placement", () => {
    const anchor: FloatingAnchor = { x: 100, y: 100, width: 100, height: 40 };
    const floatingWidth = 200;
    const floatingHeight = 100;

    it("positions bottom placement correctly", () => {
      const result = calculateFloatingPosition({
        anchor,
        floatingWidth,
        floatingHeight,
        placement: "bottom",
      });

      // Should be centered below the anchor
      expect(result.x).toBe(50); // anchor.x + anchor.width/2 - floatingWidth/2 = 100 + 50 - 100 = 50
      expect(result.y).toBe(144); // anchor.y + anchor.height + offset = 100 + 40 + 4 = 144
      expect(result.actualPlacement).toBe("bottom");
    });

    it("positions top placement correctly", () => {
      const result = calculateFloatingPosition({
        anchor: { x: 100, y: 200, width: 100, height: 40 },
        floatingWidth,
        floatingHeight,
        placement: "top",
      });

      // Should be centered above the anchor
      expect(result.x).toBe(50); // anchor.x + anchor.width/2 - floatingWidth/2
      expect(result.y).toBe(96); // anchor.y - floatingHeight - offset = 200 - 100 - 4 = 96
      expect(result.actualPlacement).toBe("top");
    });

    it("positions left placement correctly", () => {
      const result = calculateFloatingPosition({
        anchor: { x: 300, y: 100, width: 100, height: 40 },
        floatingWidth,
        floatingHeight,
        placement: "left",
      });

      // Should be centered to the left of the anchor
      expect(result.x).toBe(96); // anchor.x - floatingWidth - offset = 300 - 200 - 4 = 96
      expect(result.y).toBe(70); // anchor.y + anchor.height/2 - floatingHeight/2 = 100 + 20 - 50 = 70
      expect(result.actualPlacement).toBe("left");
    });

    it("positions right placement correctly", () => {
      const result = calculateFloatingPosition({
        anchor,
        floatingWidth,
        floatingHeight,
        placement: "right",
      });

      // Should be centered to the right of the anchor
      expect(result.x).toBe(204); // anchor.x + anchor.width + offset = 100 + 100 + 4 = 204
      expect(result.y).toBe(70); // anchor.y + anchor.height/2 - floatingHeight/2 = 100 + 20 - 50 = 70
      expect(result.actualPlacement).toBe("right");
    });
  });

  describe("automatic flip", () => {
    it("flips from bottom to top when not enough space below", () => {
      mockViewport(1024, 300);
      // Anchor near the bottom of viewport with enough space above
      const anchor: FloatingAnchor = { x: 100, y: 200, width: 100, height: 40 };

      const result = calculateFloatingPosition({
        anchor,
        floatingWidth: 200,
        floatingHeight: 100,
        placement: "bottom",
      });

      // Should flip to top because not enough space below (240 + 100 > 300 - 8)
      // but enough space above (200 - 100 - 4 = 96 > 8)
      expect(result.actualPlacement).toBe("top");
    });

    it("flips from top to bottom when not enough space above", () => {
      const anchor: FloatingAnchor = { x: 100, y: 20, width: 100, height: 40 };

      const result = calculateFloatingPosition({
        anchor,
        floatingWidth: 200,
        floatingHeight: 100,
        placement: "top",
      });

      // Should flip to bottom because not enough space above
      expect(result.actualPlacement).toBe("bottom");
    });

    it("flips from left to right when not enough space on left", () => {
      const anchor: FloatingAnchor = { x: 50, y: 100, width: 100, height: 40 };

      const result = calculateFloatingPosition({
        anchor,
        floatingWidth: 200,
        floatingHeight: 100,
        placement: "left",
      });

      // Should flip to right because not enough space on left
      expect(result.actualPlacement).toBe("right");
    });

    it("flips from right to left when not enough space on right", () => {
      const anchor: FloatingAnchor = { x: 800, y: 100, width: 100, height: 40 };

      const result = calculateFloatingPosition({
        anchor,
        floatingWidth: 200,
        floatingHeight: 100,
        placement: "right",
      });

      // Should flip to left because not enough space on right
      expect(result.actualPlacement).toBe("left");
    });

    it("respects allowFlip=false option", () => {
      mockViewport(1024, 200);
      const anchor: FloatingAnchor = { x: 100, y: 100, width: 100, height: 40 };

      const result = calculateFloatingPosition({
        anchor,
        floatingWidth: 200,
        floatingHeight: 100,
        placement: "bottom",
        allowFlip: false,
      });

      // Should not flip even when there's not enough space
      expect(result.actualPlacement).toBe("bottom");
    });
  });

  describe("viewport clamping", () => {
    it("clamps X position to left edge", () => {
      const anchor: FloatingAnchor = { x: 0, y: 100, width: 50, height: 40 };

      const result = calculateFloatingPosition({
        anchor,
        floatingWidth: 200,
        floatingHeight: 100,
        placement: "bottom",
      });

      // Should be clamped to viewport padding
      expect(result.x).toBe(8); // VIEWPORT_PADDING
    });

    it("clamps X position to right edge", () => {
      const anchor: FloatingAnchor = { x: 950, y: 100, width: 50, height: 40 };

      const result = calculateFloatingPosition({
        anchor,
        floatingWidth: 200,
        floatingHeight: 100,
        placement: "bottom",
      });

      // Should be clamped to viewport - width - padding
      expect(result.x).toBe(1024 - 200 - 8); // viewport - width - padding
    });

    it("clamps Y position to top edge", () => {
      const anchor: FloatingAnchor = { x: 100, y: 50, width: 100, height: 40 };

      const result = calculateFloatingPosition({
        anchor,
        floatingWidth: 200,
        floatingHeight: 100,
        placement: "top",
        allowFlip: false,
      });

      // Should be clamped to viewport padding
      expect(result.y).toBe(8); // VIEWPORT_PADDING
    });
  });

  describe("scroll offset", () => {
    it("includes scroll offset when includeScrollOffset is true", () => {
      vi.stubGlobal("scrollX", 100);
      vi.stubGlobal("scrollY", 200);

      const anchor: FloatingAnchor = { x: 100, y: 100, width: 100, height: 40 };

      const result = calculateFloatingPosition({
        anchor,
        floatingWidth: 200,
        floatingHeight: 100,
        placement: "bottom",
        includeScrollOffset: true,
      });

      expect(result.x).toBe(50 + 100); // position + scrollX
      expect(result.y).toBe(144 + 200); // position + scrollY
    });

    it("excludes scroll offset when includeScrollOffset is false", () => {
      vi.stubGlobal("scrollX", 100);
      vi.stubGlobal("scrollY", 200);

      const anchor: FloatingAnchor = { x: 100, y: 100, width: 100, height: 40 };

      const result = calculateFloatingPosition({
        anchor,
        floatingWidth: 200,
        floatingHeight: 100,
        placement: "bottom",
        includeScrollOffset: false,
      });

      expect(result.x).toBe(50); // position without scroll
      expect(result.y).toBe(144); // position without scroll
    });
  });

  describe("null anchor", () => {
    it("returns default position when anchor is null", () => {
      const result = calculateFloatingPosition({
        anchor: null,
        floatingWidth: 200,
        floatingHeight: 100,
        placement: "bottom",
      });

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.actualPlacement).toBe("bottom");
    });
  });

  describe("custom offset", () => {
    it("respects custom offset", () => {
      const anchor: FloatingAnchor = { x: 100, y: 100, width: 100, height: 40 };

      const result = calculateFloatingPosition({
        anchor,
        floatingWidth: 200,
        floatingHeight: 100,
        placement: "bottom",
        offset: 10,
      });

      expect(result.y).toBe(150); // anchor.y + anchor.height + offset = 100 + 40 + 10 = 150
    });
  });
});

describe("useFloatingPosition", () => {
  beforeEach(() => {
    mockViewport(1024, 768);
  });

  it("returns position based on anchor", () => {
    const anchor: FloatingAnchor = { x: 100, y: 100, width: 100, height: 40 };

    const { result } = renderHook(() =>
      useFloatingPosition({
        anchor,
        floatingWidth: 200,
        floatingHeight: 100,
        placement: "bottom",
      }),
    );

    expect(result.current.x).toBe(50);
    expect(result.current.y).toBe(144);
    expect(result.current.actualPlacement).toBe("bottom");
  });

  it("memoizes result when inputs are unchanged", () => {
    const anchor: FloatingAnchor = { x: 100, y: 100, width: 100, height: 40 };

    const { result, rerender } = renderHook(() =>
      useFloatingPosition({
        anchor,
        floatingWidth: 200,
        floatingHeight: 100,
        placement: "bottom",
      }),
    );

    const firstResult = result.current;
    rerender();

    expect(result.current).toBe(firstResult);
  });
});

describe("rectToAnchor", () => {
  it("converts DOMRect to FloatingAnchor", () => {
    const rect = {
      left: 100,
      top: 200,
      width: 50,
      height: 30,
    } as DOMRect;

    const anchor = rectToAnchor(rect);

    expect(anchor).toEqual({
      x: 100,
      y: 200,
      width: 50,
      height: 30,
    });
  });

  it("returns null for null input", () => {
    expect(rectToAnchor(null)).toBeNull();
  });
});
