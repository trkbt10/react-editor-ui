/**
 * @file CanvasRuler unit tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  CanvasHorizontalRuler,
  CanvasVerticalRuler,
  CanvasRulerCorner,
} from "./CanvasRuler";
import type { ViewportState } from "../core/types";

const defaultViewport: ViewportState = { x: 0, y: 0, scale: 1 };

describe("CanvasHorizontalRuler", () => {
  it("renders with correct dimensions", () => {
    render(<CanvasHorizontalRuler viewport={defaultViewport} width={500} />);
    const ruler = screen.getByTestId("canvas-ruler-horizontal");
    expect(ruler).toBeInTheDocument();
    const svg = ruler.querySelector("svg");
    expect(svg).toHaveAttribute("width", "500");
    expect(svg).toHaveAttribute("height", "20");
  });

  it("renders with custom size", () => {
    render(
      <CanvasHorizontalRuler viewport={defaultViewport} width={500} size={30} />,
    );
    const ruler = screen.getByTestId("canvas-ruler-horizontal");
    const svg = ruler.querySelector("svg");
    expect(svg).toHaveAttribute("height", "30");
  });

  it("renders with rulerOffset", () => {
    render(
      <CanvasHorizontalRuler
        viewport={defaultViewport}
        width={500}
        rulerOffset={20}
      />,
    );
    const ruler = screen.getByTestId("canvas-ruler-horizontal");
    const svg = ruler.querySelector("svg");
    expect(svg).toHaveAttribute("width", "520");
  });

  it("calls onAddGuide on double-click", () => {
    const onAddGuide = vi.fn();
    render(
      <CanvasHorizontalRuler
        viewport={defaultViewport}
        width={500}
        onAddGuide={onAddGuide}
      />,
    );
    const ruler = screen.getByTestId("canvas-ruler-horizontal");

    fireEvent.doubleClick(ruler, { clientX: 100, clientY: 10 });

    expect(onAddGuide).toHaveBeenCalledTimes(1);
    const guide = onAddGuide.mock.calls[0][0];
    expect(guide.orientation).toBe("vertical");
    expect(guide.locked).toBe(false);
    expect(typeof guide.id).toBe("string");
    expect(typeof guide.position).toBe("number");
  });

  it("converts screen to canvas coordinates with scale", () => {
    const onAddGuide = vi.fn();
    const viewport: ViewportState = { x: 100, y: 0, scale: 2 };
    render(
      <CanvasHorizontalRuler
        viewport={viewport}
        width={500}
        onAddGuide={onAddGuide}
      />,
    );
    const ruler = screen.getByTestId("canvas-ruler-horizontal");

    // Mock getBoundingClientRect
    vi.spyOn(ruler, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      right: 500,
      bottom: 20,
      width: 500,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.doubleClick(ruler, { clientX: 200, clientY: 10 });

    const guide = onAddGuide.mock.calls[0][0];
    // screenX = 200, rulerOffset = 0
    // canvasX = 200 / 2 + 100 = 200
    expect(guide.position).toBe(200);
  });

  it("shows crosshair cursor when onAddGuide is provided", () => {
    const { rerender } = render(
      <CanvasHorizontalRuler viewport={defaultViewport} width={500} />,
    );
    let ruler = screen.getByTestId("canvas-ruler-horizontal");
    expect(ruler.style.cursor).toBe("");

    rerender(
      <CanvasHorizontalRuler
        viewport={defaultViewport}
        width={500}
        onAddGuide={() => {}}
      />,
    );
    ruler = screen.getByTestId("canvas-ruler-horizontal");
    expect(ruler.style.cursor).toBe("crosshair");
  });
});

describe("CanvasVerticalRuler", () => {
  it("renders with correct dimensions", () => {
    render(<CanvasVerticalRuler viewport={defaultViewport} height={350} />);
    const ruler = screen.getByTestId("canvas-ruler-vertical");
    expect(ruler).toBeInTheDocument();
    const svg = ruler.querySelector("svg");
    expect(svg).toHaveAttribute("width", "20");
    expect(svg).toHaveAttribute("height", "350");
  });

  it("renders with custom size", () => {
    render(
      <CanvasVerticalRuler viewport={defaultViewport} height={350} size={30} />,
    );
    const ruler = screen.getByTestId("canvas-ruler-vertical");
    const svg = ruler.querySelector("svg");
    expect(svg).toHaveAttribute("width", "30");
  });

  it("calls onAddGuide on double-click", () => {
    const onAddGuide = vi.fn();
    render(
      <CanvasVerticalRuler
        viewport={defaultViewport}
        height={350}
        onAddGuide={onAddGuide}
      />,
    );
    const ruler = screen.getByTestId("canvas-ruler-vertical");

    fireEvent.doubleClick(ruler, { clientX: 10, clientY: 100 });

    expect(onAddGuide).toHaveBeenCalledTimes(1);
    const guide = onAddGuide.mock.calls[0][0];
    expect(guide.orientation).toBe("horizontal");
    expect(guide.locked).toBe(false);
  });

  it("converts screen to canvas coordinates with scale", () => {
    const onAddGuide = vi.fn();
    const viewport: ViewportState = { x: 0, y: 50, scale: 2 };
    render(
      <CanvasVerticalRuler
        viewport={viewport}
        height={350}
        onAddGuide={onAddGuide}
      />,
    );
    const ruler = screen.getByTestId("canvas-ruler-vertical");

    vi.spyOn(ruler, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      right: 20,
      bottom: 350,
      width: 20,
      height: 350,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.doubleClick(ruler, { clientX: 10, clientY: 100 });

    const guide = onAddGuide.mock.calls[0][0];
    // screenY = 100
    // canvasY = 100 / 2 + 50 = 100
    expect(guide.position).toBe(100);
  });

  it("shows crosshair cursor when onAddGuide is provided", () => {
    const { rerender } = render(
      <CanvasVerticalRuler viewport={defaultViewport} height={350} />,
    );
    let ruler = screen.getByTestId("canvas-ruler-vertical");
    expect(ruler.style.cursor).toBe("");

    rerender(
      <CanvasVerticalRuler
        viewport={defaultViewport}
        height={350}
        onAddGuide={() => {}}
      />,
    );
    ruler = screen.getByTestId("canvas-ruler-vertical");
    expect(ruler.style.cursor).toBe("crosshair");
  });
});

describe("CanvasRulerCorner", () => {
  it("renders with default size", () => {
    render(<CanvasRulerCorner />);
    const corner = screen.getByTestId("canvas-ruler-corner");
    expect(corner).toBeInTheDocument();
    expect(corner.style.width).toBe("20px");
    expect(corner.style.height).toBe("20px");
  });

  it("renders with custom size", () => {
    render(<CanvasRulerCorner size={30} />);
    const corner = screen.getByTestId("canvas-ruler-corner");
    expect(corner.style.width).toBe("30px");
    expect(corner.style.height).toBe("30px");
  });
});
