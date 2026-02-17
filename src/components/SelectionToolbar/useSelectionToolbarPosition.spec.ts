/**
 * @file useSelectionToolbarPosition tests
 */

import { renderHook } from "@testing-library/react";
import {
  calculateSelectionToolbarPosition,
  useSelectionToolbarPosition,
} from "./useSelectionToolbarPosition";
import type { SelectionToolbarAnchor } from "./types";

// =============================================================================
// Test Setup
// =============================================================================

const TOOLBAR_WIDTH = 200;
const TOOLBAR_HEIGHT = 36;
const VIEWPORT_WIDTH = 1024;
const VIEWPORT_HEIGHT = 768;

const createAnchor = (x: number, y: number, width = 100, height = 20): SelectionToolbarAnchor => ({
  x,
  y,
  width,
  height,
});

// Store original values
const originalInnerWidth = globalThis.innerWidth;
const originalInnerHeight = globalThis.innerHeight;

beforeEach(() => {
  // Mock window dimensions
  Object.defineProperty(globalThis, "innerWidth", { value: VIEWPORT_WIDTH, writable: true });
  Object.defineProperty(globalThis, "innerHeight", { value: VIEWPORT_HEIGHT, writable: true });
});

afterEach(() => {
  // Restore original values
  Object.defineProperty(globalThis, "innerWidth", { value: originalInnerWidth, writable: true });
  Object.defineProperty(globalThis, "innerHeight", { value: originalInnerHeight, writable: true });
});

// =============================================================================
// calculateSelectionToolbarPosition Tests
// =============================================================================

describe("calculateSelectionToolbarPosition", () => {
  describe("basic positioning", () => {
    it("should position toolbar above anchor when placement is top", () => {
      const anchor = createAnchor(400, 200);
      const result = calculateSelectionToolbarPosition({
        anchor,
        placement: "top",
        toolbarWidth: TOOLBAR_WIDTH,
        toolbarHeight: TOOLBAR_HEIGHT,
      });

      // Toolbar should be above anchor
      expect(result.y).toBeLessThan(anchor.y);
      expect(result.actualPlacement).toBe("top");
    });

    it("should position toolbar below anchor when placement is bottom", () => {
      const anchor = createAnchor(400, 200);
      const result = calculateSelectionToolbarPosition({
        anchor,
        placement: "bottom",
        toolbarWidth: TOOLBAR_WIDTH,
        toolbarHeight: TOOLBAR_HEIGHT,
      });

      // Toolbar should be below anchor
      expect(result.y).toBeGreaterThan(anchor.y);
      expect(result.actualPlacement).toBe("bottom");
    });

    it("should center toolbar horizontally relative to anchor", () => {
      const anchor = createAnchor(400, 200, 100);
      const result = calculateSelectionToolbarPosition({
        anchor,
        placement: "top",
        toolbarWidth: TOOLBAR_WIDTH,
        toolbarHeight: TOOLBAR_HEIGHT,
      });

      // Toolbar center should align with anchor center
      const toolbarCenter = result.x + TOOLBAR_WIDTH / 2;
      const anchorCenter = anchor.x + anchor.width / 2;
      expect(toolbarCenter).toBe(anchorCenter);
    });
  });

  describe("viewport clamping", () => {
    it("should clamp toolbar to left viewport edge", () => {
      // Anchor near left edge
      const anchor = createAnchor(10, 200, 20);
      const result = calculateSelectionToolbarPosition({
        anchor,
        placement: "top",
        toolbarWidth: TOOLBAR_WIDTH,
        toolbarHeight: TOOLBAR_HEIGHT,
      });

      // X should be clamped to viewport padding (8)
      expect(result.x).toBe(8);
    });

    it("should clamp toolbar to right viewport edge", () => {
      // Anchor near right edge
      const anchor = createAnchor(VIEWPORT_WIDTH - 30, 200, 20);
      const result = calculateSelectionToolbarPosition({
        anchor,
        placement: "top",
        toolbarWidth: TOOLBAR_WIDTH,
        toolbarHeight: TOOLBAR_HEIGHT,
      });

      // X should be clamped so toolbar doesn't overflow right
      expect(result.x + TOOLBAR_WIDTH).toBeLessThanOrEqual(VIEWPORT_WIDTH - 8);
    });
  });

  describe("placement flipping", () => {
    it("should flip to bottom when top placement would overflow", () => {
      // Anchor near top edge
      const anchor = createAnchor(400, 30, 100);
      const result = calculateSelectionToolbarPosition({
        anchor,
        placement: "top",
        toolbarWidth: TOOLBAR_WIDTH,
        toolbarHeight: TOOLBAR_HEIGHT,
      });

      // Should flip to bottom
      expect(result.actualPlacement).toBe("bottom");
      expect(result.y).toBeGreaterThan(anchor.y);
    });

    it("should flip to top when bottom placement would overflow", () => {
      // Anchor near bottom edge
      const anchor = createAnchor(400, VIEWPORT_HEIGHT - 50, 100);
      const result = calculateSelectionToolbarPosition({
        anchor,
        placement: "bottom",
        toolbarWidth: TOOLBAR_WIDTH,
        toolbarHeight: TOOLBAR_HEIGHT,
      });

      // Should flip to top
      expect(result.actualPlacement).toBe("top");
      expect(result.y).toBeLessThan(anchor.y);
    });

    it("should keep original placement if both would overflow", () => {
      // Anchor in a very constrained viewport
      Object.defineProperty(globalThis, "innerHeight", { value: 80, writable: true });
      const anchor = createAnchor(400, 40, 100, 10);

      const result = calculateSelectionToolbarPosition({
        anchor,
        placement: "top",
        toolbarWidth: TOOLBAR_WIDTH,
        toolbarHeight: TOOLBAR_HEIGHT,
      });

      // Should keep top placement if bottom also overflows
      // (behavior: prefer original placement when both overflow)
      expect(result.actualPlacement).toBe("top");
    });
  });

  describe("offset", () => {
    it("should include offset between toolbar and anchor", () => {
      const anchor = createAnchor(400, 200);
      const result = calculateSelectionToolbarPosition({
        anchor,
        placement: "top",
        toolbarWidth: TOOLBAR_WIDTH,
        toolbarHeight: TOOLBAR_HEIGHT,
      });

      // Gap between toolbar bottom and anchor top should be 8px (TOOLBAR_OFFSET)
      const gap = anchor.y - (result.y + TOOLBAR_HEIGHT);
      expect(gap).toBe(8);
    });
  });
});

// =============================================================================
// useSelectionToolbarPosition Hook Tests
// =============================================================================

describe("useSelectionToolbarPosition", () => {
  it("should return position using the hook", () => {
    const anchor = createAnchor(400, 200);

    const { result } = renderHook(() =>
      useSelectionToolbarPosition({
        anchor,
        placement: "top",
        toolbarWidth: TOOLBAR_WIDTH,
        toolbarHeight: TOOLBAR_HEIGHT,
      }),
    );

    expect(result.current.x).toBeDefined();
    expect(result.current.y).toBeDefined();
    expect(result.current.actualPlacement).toBe("top");
  });

  it("should memoize position when inputs are unchanged", () => {
    const anchor = createAnchor(400, 200);

    const { result, rerender } = renderHook(
      (props) => useSelectionToolbarPosition(props),
      {
        initialProps: {
          anchor,
          placement: "top" as const,
          toolbarWidth: TOOLBAR_WIDTH,
          toolbarHeight: TOOLBAR_HEIGHT,
        },
      },
    );

    const firstResult = result.current;

    // Rerender with same props
    rerender({
      anchor,
      placement: "top" as const,
      toolbarWidth: TOOLBAR_WIDTH,
      toolbarHeight: TOOLBAR_HEIGHT,
    });

    // Should be same object reference (memoized)
    expect(result.current).toBe(firstResult);
  });

  it("should recalculate when anchor changes", () => {
    const { result, rerender } = renderHook(
      (props) => useSelectionToolbarPosition(props),
      {
        initialProps: {
          anchor: createAnchor(400, 200),
          placement: "top" as const,
          toolbarWidth: TOOLBAR_WIDTH,
          toolbarHeight: TOOLBAR_HEIGHT,
        },
      },
    );

    const firstX = result.current.x;

    // Rerender with different anchor
    rerender({
      anchor: createAnchor(500, 200),
      placement: "top" as const,
      toolbarWidth: TOOLBAR_WIDTH,
      toolbarHeight: TOOLBAR_HEIGHT,
    });

    expect(result.current.x).not.toBe(firstX);
  });
});
