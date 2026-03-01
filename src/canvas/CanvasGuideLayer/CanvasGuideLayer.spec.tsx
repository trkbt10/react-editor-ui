/**
 * @file CanvasGuideLayer unit tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CanvasGuideLayer } from "./CanvasGuideLayer";
import type { CanvasGuide, ViewportState } from "../core/types";

const createGuide = (
  id: string,
  orientation: "horizontal" | "vertical",
  position: number,
  locked = false,
): CanvasGuide => ({
  id,
  orientation,
  position,
  locked,
});

const defaultViewport: ViewportState = { x: 0, y: 0, scale: 1 };

// Wrap CanvasGuideLayer in SVG for proper rendering
function renderGuideLayer(props: React.ComponentProps<typeof CanvasGuideLayer>) {
  return render(
    <svg data-testid="svg-container">
      <CanvasGuideLayer {...props} />
    </svg>,
  );
}

describe("CanvasGuideLayer", () => {
  describe("rendering", () => {
    it("renders empty when no guides", () => {
      renderGuideLayer({ guides: [] });
      const layer = screen.getByTestId("canvas-guide-layer");
      expect(layer).toBeInTheDocument();
      expect(layer.children).toHaveLength(0);
    });

    it("renders guide lines", () => {
      const guides = [
        createGuide("g1", "horizontal", 100),
        createGuide("g2", "vertical", 200),
      ];
      renderGuideLayer({ guides });

      const layer = screen.getByTestId("canvas-guide-layer");
      // Each guide has 2 elements: visible line + hit area
      expect(layer.querySelectorAll("g[data-guide-id]")).toHaveLength(2);
    });

    it("renders horizontal guide as horizontal line", () => {
      const guides = [createGuide("g1", "horizontal", 100)];
      renderGuideLayer({ guides });

      const guideGroup = screen.getByTestId("canvas-guide-layer").querySelector("[data-guide-id='g1']");
      const lines = guideGroup?.querySelectorAll("line");
      expect(lines).toHaveLength(2);

      // Both lines should have same y1 and y2
      const visibleLine = lines?.[0];
      expect(visibleLine?.getAttribute("y1")).toBe("100");
      expect(visibleLine?.getAttribute("y2")).toBe("100");
    });

    it("renders vertical guide as vertical line", () => {
      const guides = [createGuide("g1", "vertical", 150)];
      renderGuideLayer({ guides });

      const guideGroup = screen.getByTestId("canvas-guide-layer").querySelector("[data-guide-id='g1']");
      const lines = guideGroup?.querySelectorAll("line");

      const visibleLine = lines?.[0];
      expect(visibleLine?.getAttribute("x1")).toBe("150");
      expect(visibleLine?.getAttribute("x2")).toBe("150");
    });

    it("renders locked guide with dashed stroke", () => {
      const guides = [createGuide("g1", "horizontal", 100, true)];
      renderGuideLayer({ guides });

      const guideGroup = screen.getByTestId("canvas-guide-layer").querySelector("[data-guide-id='g1']");
      const visibleLine = guideGroup?.querySelector("line");
      expect(visibleLine?.getAttribute("stroke-dasharray")).toBe("4 2");
    });

    it("hit area has pointerEvents: all for interaction", () => {
      const guides = [createGuide("g1", "horizontal", 100)];
      renderGuideLayer({ guides });

      const guideGroup = screen.getByTestId("canvas-guide-layer").querySelector("[data-guide-id='g1']");
      const hitArea = guideGroup?.querySelectorAll("line")[1];
      expect(hitArea?.style.pointerEvents).toBe("all");
    });

    it("adjusts hit area width based on viewport scale", () => {
      const guides = [createGuide("g1", "horizontal", 100)];
      const viewport: ViewportState = { x: 0, y: 0, scale: 2 };
      renderGuideLayer({ guides, viewport });

      const guideGroup = screen.getByTestId("canvas-guide-layer").querySelector("[data-guide-id='g1']");
      const hitArea = guideGroup?.querySelectorAll("line")[1];
      // GUIDE_HIT_AREA_PX (8) / scale (2) = 4
      expect(hitArea?.getAttribute("stroke-width")).toBe("4");
    });
  });

  describe("selection", () => {
    it("calls onSelectGuide when guide is clicked", () => {
      const onSelectGuide = vi.fn();
      const guides = [createGuide("g1", "horizontal", 100)];
      renderGuideLayer({ guides, onSelectGuide });

      const guideGroup = screen.getByTestId("canvas-guide-layer").querySelector("[data-guide-id='g1']");
      const hitArea = guideGroup?.querySelectorAll("line")[1]; // Second line is hit area

      fireEvent.pointerDown(hitArea!);
      expect(onSelectGuide).toHaveBeenCalledWith("g1");
    });
  });

  describe("dragging", () => {
    it("calls onMoveGuide during drag", () => {
      const onMoveGuide = vi.fn();
      const onSelectGuide = vi.fn();
      const guides = [createGuide("g1", "horizontal", 100)];

      renderGuideLayer({
        guides,
        viewport: defaultViewport,
        onSelectGuide,
        onMoveGuide,
      });

      const guideGroup = screen.getByTestId("canvas-guide-layer").querySelector("[data-guide-id='g1']");
      const hitArea = guideGroup?.querySelectorAll("line")[1];

      // Start drag
      fireEvent.pointerDown(hitArea!, { clientX: 10, clientY: 100 });

      // Move
      fireEvent.pointerMove(window, { clientX: 10, clientY: 150 });

      expect(onMoveGuide).toHaveBeenCalledWith("g1", 150);

      // End drag
      fireEvent.pointerUp(window);
    });

    it("does not drag locked guide", () => {
      const onMoveGuide = vi.fn();
      const guides = [createGuide("g1", "horizontal", 100, true)];

      renderGuideLayer({
        guides,
        viewport: defaultViewport,
        onMoveGuide,
      });

      const guideGroup = screen.getByTestId("canvas-guide-layer").querySelector("[data-guide-id='g1']");
      const hitArea = guideGroup?.querySelectorAll("line")[1];

      fireEvent.pointerDown(hitArea!, { clientX: 10, clientY: 100 });
      fireEvent.pointerMove(window, { clientX: 10, clientY: 150 });

      expect(onMoveGuide).not.toHaveBeenCalled();
    });

    it("converts screen delta to canvas coordinates with scale", () => {
      const onMoveGuide = vi.fn();
      const guides = [createGuide("g1", "horizontal", 100)];
      const viewport: ViewportState = { x: 0, y: 0, scale: 2 };

      renderGuideLayer({
        guides,
        viewport,
        onMoveGuide,
      });

      const guideGroup = screen.getByTestId("canvas-guide-layer").querySelector("[data-guide-id='g1']");
      const hitArea = guideGroup?.querySelectorAll("line")[1];

      fireEvent.pointerDown(hitArea!, { clientX: 10, clientY: 100 });
      fireEvent.pointerMove(window, { clientX: 10, clientY: 200 });

      // Screen delta = 100, canvas delta = 100 / 2 = 50
      // New position = 100 + 50 = 150
      expect(onMoveGuide).toHaveBeenCalledWith("g1", 150);

      fireEvent.pointerUp(window);
    });

    it("handles vertical guide drag", () => {
      const onMoveGuide = vi.fn();
      const guides = [createGuide("g1", "vertical", 100)];

      renderGuideLayer({
        guides,
        viewport: defaultViewport,
        onMoveGuide,
      });

      const guideGroup = screen.getByTestId("canvas-guide-layer").querySelector("[data-guide-id='g1']");
      const hitArea = guideGroup?.querySelectorAll("line")[1];

      fireEvent.pointerDown(hitArea!, { clientX: 100, clientY: 10 });
      fireEvent.pointerMove(window, { clientX: 150, clientY: 10 });

      expect(onMoveGuide).toHaveBeenCalledWith("g1", 150);

      fireEvent.pointerUp(window);
    });
  });
});
