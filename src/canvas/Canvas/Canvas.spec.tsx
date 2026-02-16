/**
 * @file Tests for Canvas component
 */
import { render, screen } from "@testing-library/react";
import { Canvas } from "./Canvas";
import { useCanvasContext } from "../core/CanvasContext";
import type { ViewportState } from "../core/types";

describe("Canvas", () => {
  const defaultViewport: ViewportState = { x: 0, y: 0, scale: 1 };
  const noop = () => {};

  it("renders with correct role and aria-label", () => {
    render(
      <Canvas
        viewport={defaultViewport}
        onViewportChange={noop}
        width={800}
        height={600}
        aria-label="Test Canvas"
      />,
    );

    expect(screen.getByRole("application", { name: "Test Canvas" })).toBeInTheDocument();
  });

  it("renders with default aria-label when not provided", () => {
    render(
      <Canvas viewport={defaultViewport} onViewportChange={noop} width={800} height={600} />,
    );

    expect(screen.getByRole("application", { name: "Canvas" })).toBeInTheDocument();
  });

  it("renders SVG with correct viewBox based on viewport", () => {
    const viewport: ViewportState = { x: 100, y: 50, scale: 2 };

    render(
      <Canvas viewport={viewport} onViewportChange={noop} width={800} height={600} />,
    );

    const svg = screen.getByTestId("canvas-svg");
    // viewBox = "x y width/scale height/scale" = "100 50 400 300"
    expect(svg).toHaveAttribute("viewBox", "100 50 400 300");
  });

  it("renders SVG with viewBox at origin for default viewport", () => {
    render(
      <Canvas viewport={defaultViewport} onViewportChange={noop} width={400} height={300} />,
    );

    const svg = screen.getByTestId("canvas-svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 400 300");
  });

  it("applies touch-action style attribute for gesture handling", () => {
    render(
      <Canvas viewport={defaultViewport} onViewportChange={noop} width={800} height={600} />,
    );

    const container = screen.getByRole("application");
    // Check inline style attribute since JSDOM doesn't compute touchAction correctly
    expect(container.style.touchAction).toBe("none");
  });

  it("applies custom background color", () => {
    render(
      <Canvas
        viewport={defaultViewport}
        onViewportChange={noop}
        width={800}
        height={600}
        background="#ff0000"
      />,
    );

    const container = screen.getByRole("application");
    expect(container).toHaveStyle({ background: "#ff0000" });
  });

  it("applies custom className", () => {
    render(
      <Canvas
        viewport={defaultViewport}
        onViewportChange={noop}
        width={800}
        height={600}
        className="custom-canvas"
      />,
    );

    const container = screen.getByRole("application");
    expect(container).toHaveClass("custom-canvas");
  });

  it("renders children", () => {
    render(
      <Canvas viewport={defaultViewport} onViewportChange={noop} width={800} height={600}>
        <div data-testid="child-element">Child Content</div>
      </Canvas>,
    );

    expect(screen.getByTestId("child-element")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("renders grid when showGrid is true", () => {
    render(
      <Canvas
        viewport={defaultViewport}
        onViewportChange={noop}
        width={800}
        height={600}
        showGrid
        gridSize={100}
      />,
    );

    const svg = screen.getByTestId("canvas-svg");
    const lines = svg.querySelectorAll("line");
    expect(lines.length).toBeGreaterThan(0);
  });

  it("does not render grid when showGrid is false", () => {
    render(
      <Canvas
        viewport={defaultViewport}
        onViewportChange={noop}
        width={800}
        height={600}
        showGrid={false}
      />,
    );

    const svg = screen.getByTestId("canvas-svg");
    const lines = svg.querySelectorAll("line");
    expect(lines.length).toBe(0);
  });
});

describe("Canvas Context", () => {
  const defaultViewport: ViewportState = { x: 0, y: 0, scale: 1 };
  const noop = () => {};

  it("provides viewport to children via context", () => {
    const viewport: ViewportState = { x: 100, y: 200, scale: 2 };

    function TestChild() {
      const ctx = useCanvasContext();
      return (
        <div>
          <span data-testid="scale">{ctx.viewport.scale}</span>
          <span data-testid="x">{ctx.viewport.x}</span>
          <span data-testid="y">{ctx.viewport.y}</span>
        </div>
      );
    }

    render(
      <Canvas viewport={viewport} onViewportChange={noop} width={800} height={600}>
        <TestChild />
      </Canvas>,
    );

    expect(screen.getByTestId("scale")).toHaveTextContent("2");
    expect(screen.getByTestId("x")).toHaveTextContent("100");
    expect(screen.getByTestId("y")).toHaveTextContent("200");
  });

  it("provides canvas dimensions via context", () => {
    function TestChild() {
      const ctx = useCanvasContext();
      return (
        <div>
          <span data-testid="width">{ctx.canvasWidth}</span>
          <span data-testid="height">{ctx.canvasHeight}</span>
        </div>
      );
    }

    render(
      <Canvas viewport={defaultViewport} onViewportChange={noop} width={1024} height={768}>
        <TestChild />
      </Canvas>,
    );

    expect(screen.getByTestId("width")).toHaveTextContent("1024");
    expect(screen.getByTestId("height")).toHaveTextContent("768");
  });

  it("throws error when useCanvasContext is used outside Canvas", () => {
    function InvalidChild() {
      useCanvasContext();
      return null;
    }

    // Save original console.error and replace with no-op
    const originalError = console.error;
    console.error = () => {};

    try {
      expect(() => render(<InvalidChild />)).toThrow(
        "useCanvasContext must be used within a Canvas component",
      );
    } finally {
      console.error = originalError;
    }
  });
});
