/**
 * @file BoundingBox component tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { BoundingBox } from "./BoundingBox";
import { CanvasContext, type CanvasContextValue } from "../core/CanvasContext";

const defaultContext: CanvasContextValue = {
  viewport: { x: 0, y: 0, scale: 1 },
  canvasWidth: 800,
  canvasHeight: 600,
  screenToCanvas: (x, y) => ({ x, y }),
  canvasToScreen: (x, y) => ({ x, y }),
};

function renderWithContext(
  ui: React.ReactElement,
  context: CanvasContextValue = defaultContext,
) {
  return render(
    <CanvasContext.Provider value={context}>
      <svg>{ui}</svg>
    </CanvasContext.Provider>,
  );
}

describe("BoundingBox", () => {
  it("renders the bounding box border", () => {
    renderWithContext(<BoundingBox x={100} y={100} width={200} height={150} />);

    const border = screen.getByTestId("bounding-box-border");
    expect(border).toBeInTheDocument();
    expect(border).toHaveAttribute("x", "100");
    expect(border).toHaveAttribute("y", "100");
    expect(border).toHaveAttribute("width", "200");
    expect(border).toHaveAttribute("height", "150");
  });

  it("renders all four corner handles", () => {
    renderWithContext(
      <BoundingBox x={100} y={100} width={200} height={150} showEdgeHandles={false} />,
    );

    expect(screen.getByTestId("bounding-box-handle-top-left")).toBeInTheDocument();
    expect(screen.getByTestId("bounding-box-handle-top-right")).toBeInTheDocument();
    expect(screen.getByTestId("bounding-box-handle-bottom-left")).toBeInTheDocument();
    expect(screen.getByTestId("bounding-box-handle-bottom-right")).toBeInTheDocument();
  });

  it("renders edge handles when showEdgeHandles is true", () => {
    renderWithContext(
      <BoundingBox x={100} y={100} width={200} height={150} showEdgeHandles />,
    );

    expect(screen.getByTestId("bounding-box-handle-top")).toBeInTheDocument();
    expect(screen.getByTestId("bounding-box-handle-right")).toBeInTheDocument();
    expect(screen.getByTestId("bounding-box-handle-bottom")).toBeInTheDocument();
    expect(screen.getByTestId("bounding-box-handle-left")).toBeInTheDocument();
  });

  it("renders rotation zones at corners when showRotationHandle is true", () => {
    renderWithContext(
      <BoundingBox x={100} y={100} width={200} height={150} showRotationHandle />,
    );

    expect(screen.getByTestId("bounding-box-rotation-zone-top-left")).toBeInTheDocument();
    expect(screen.getByTestId("bounding-box-rotation-zone-top-right")).toBeInTheDocument();
    expect(screen.getByTestId("bounding-box-rotation-zone-bottom-left")).toBeInTheDocument();
    expect(screen.getByTestId("bounding-box-rotation-zone-bottom-right")).toBeInTheDocument();
  });

  it("hides rotation zones when showRotationHandle is false", () => {
    renderWithContext(
      <BoundingBox x={100} y={100} width={200} height={150} showRotationHandle={false} />,
    );

    expect(screen.queryByTestId("bounding-box-rotation-zone-top-left")).not.toBeInTheDocument();
    expect(screen.queryByTestId("bounding-box-rotation-zone-top-right")).not.toBeInTheDocument();
    expect(screen.queryByTestId("bounding-box-rotation-zone-bottom-left")).not.toBeInTheDocument();
    expect(screen.queryByTestId("bounding-box-rotation-zone-bottom-right")).not.toBeInTheDocument();
  });

  it("renders size label by default", () => {
    renderWithContext(<BoundingBox x={100} y={100} width={200} height={150} />);

    const label = screen.getByTestId("bounding-box-label");
    expect(label).toBeInTheDocument();
    expect(label.querySelector("text")).toHaveTextContent("200 × 150");
  });

  it("hides size label when showLabel is false", () => {
    renderWithContext(
      <BoundingBox x={100} y={100} width={200} height={150} showLabel={false} />,
    );

    expect(screen.queryByTestId("bounding-box-label")).not.toBeInTheDocument();
  });

  it("uses custom label formatter", () => {
    const formatLabel = (w: number, h: number) => `${w}px x ${h}px`;
    renderWithContext(
      <BoundingBox
        x={100}
        y={100}
        width={200}
        height={150}
        formatLabel={formatLabel}
      />,
    );

    const label = screen.getByTestId("bounding-box-label");
    expect(label.querySelector("text")).toHaveTextContent("200px x 150px");
  });

  it("calls onMoveStart when border is pressed", () => {
    const onMoveStart = vi.fn();
    renderWithContext(
      <BoundingBox
        x={100}
        y={100}
        width={200}
        height={150}
        onMoveStart={onMoveStart}
      />,
    );

    const border = screen.getByTestId("bounding-box-border");
    fireEvent.pointerDown(border, { pointerId: 1 });

    expect(onMoveStart).toHaveBeenCalled();
  });

  it("calls onResizeStart when handle is pressed", () => {
    const onResizeStart = vi.fn();
    renderWithContext(
      <BoundingBox
        x={100}
        y={100}
        width={200}
        height={150}
        onResizeStart={onResizeStart}
      />,
    );

    const handle = screen.getByTestId("bounding-box-handle-top-left");
    fireEvent.pointerDown(handle, { pointerId: 1 });

    expect(onResizeStart).toHaveBeenCalledWith("top-left");
  });

  it("calls onRotateStart when rotation zone is pressed", () => {
    const onRotateStart = vi.fn();
    renderWithContext(
      <BoundingBox
        x={100}
        y={100}
        width={200}
        height={150}
        onRotateStart={onRotateStart}
      />,
    );

    const rotationZone = screen.getByTestId("bounding-box-rotation-zone-top-left");
    fireEvent.pointerDown(rotationZone, { pointerId: 1 });

    expect(onRotateStart).toHaveBeenCalled();
  });

  it("does not call callbacks when interactive is false", () => {
    const onMoveStart = vi.fn();
    const onResizeStart = vi.fn();
    const onRotateStart = vi.fn();
    renderWithContext(
      <BoundingBox
        x={100}
        y={100}
        width={200}
        height={150}
        onMoveStart={onMoveStart}
        onResizeStart={onResizeStart}
        onRotateStart={onRotateStart}
        interactive={false}
      />,
    );

    const border = screen.getByTestId("bounding-box-border");
    const resizeHandle = screen.getByTestId("bounding-box-handle-top-left");
    const rotationZone = screen.getByTestId("bounding-box-rotation-zone-top-left");

    fireEvent.pointerDown(border, { pointerId: 1 });
    fireEvent.pointerDown(resizeHandle, { pointerId: 1 });
    fireEvent.pointerDown(rotationZone, { pointerId: 1 });

    expect(onMoveStart).not.toHaveBeenCalled();
    expect(onResizeStart).not.toHaveBeenCalled();
    expect(onRotateStart).not.toHaveBeenCalled();
  });

  it("scales stroke and handle sizes inversely with viewport scale", () => {
    const context: CanvasContextValue = {
      ...defaultContext,
      viewport: { x: 0, y: 0, scale: 2 },
    };

    renderWithContext(
      <BoundingBox
        x={100}
        y={100}
        width={200}
        height={150}
        strokeWidth={2}
        handleSize={10}
        showEdgeHandles={false}
      />,
      context,
    );

    const border = screen.getByTestId("bounding-box-border");
    // stroke-width should be 2 / 2 = 1
    expect(border).toHaveAttribute("stroke-width", "1");

    const handle = screen.getByTestId("bounding-box-handle-top-left");
    // handle size should be 10 / 2 = 5
    expect(handle).toHaveAttribute("width", "5");
    expect(handle).toHaveAttribute("height", "5");
  });

  it("positions corner handles at correct positions", () => {
    renderWithContext(
      <BoundingBox
        x={100}
        y={100}
        width={200}
        height={150}
        handleSize={8}
        showEdgeHandles={false}
      />,
    );

    const halfHandle = 4; // handleSize / 2

    const topLeft = screen.getByTestId("bounding-box-handle-top-left");
    expect(topLeft).toHaveAttribute("x", String(100 - halfHandle));
    expect(topLeft).toHaveAttribute("y", String(100 - halfHandle));

    const topRight = screen.getByTestId("bounding-box-handle-top-right");
    expect(topRight).toHaveAttribute("x", String(100 + 200 - halfHandle));
    expect(topRight).toHaveAttribute("y", String(100 - halfHandle));

    const bottomLeft = screen.getByTestId("bounding-box-handle-bottom-left");
    expect(bottomLeft).toHaveAttribute("x", String(100 - halfHandle));
    expect(bottomLeft).toHaveAttribute("y", String(100 + 150 - halfHandle));

    const bottomRight = screen.getByTestId("bounding-box-handle-bottom-right");
    expect(bottomRight).toHaveAttribute("x", String(100 + 200 - halfHandle));
    expect(bottomRight).toHaveAttribute("y", String(100 + 150 - halfHandle));
  });

  it("applies custom colors", () => {
    renderWithContext(
      <BoundingBox
        x={100}
        y={100}
        width={200}
        height={150}
        strokeColor="#ff0000"
        handleFill="#00ff00"
        handleStroke="#0000ff"
        showEdgeHandles={false}
      />,
    );

    const border = screen.getByTestId("bounding-box-border");
    expect(border).toHaveAttribute("stroke", "#ff0000");

    const handle = screen.getByTestId("bounding-box-handle-top-left");
    expect(handle).toHaveAttribute("fill", "#00ff00");
    expect(handle).toHaveAttribute("stroke", "#0000ff");
  });

  it("rounds label dimensions", () => {
    renderWithContext(
      <BoundingBox x={100} y={100} width={200.7} height={150.3} />,
    );

    const label = screen.getByTestId("bounding-box-label");
    expect(label.querySelector("text")).toHaveTextContent("201 × 150");
  });

  it("applies rotation transform to the group", () => {
    renderWithContext(
      <BoundingBox x={100} y={100} width={200} height={150} rotation={45} />,
    );

    const group = screen.getByTestId("bounding-box");
    // Center is at (200, 175)
    expect(group).toHaveAttribute("transform", "rotate(45 200 175)");
  });

  it("does not apply transform when rotation is 0", () => {
    renderWithContext(
      <BoundingBox x={100} y={100} width={200} height={150} rotation={0} />,
    );

    const group = screen.getByTestId("bounding-box");
    expect(group).not.toHaveAttribute("transform");
  });

  it("rotation zones have rotation cursor", () => {
    renderWithContext(
      <BoundingBox x={100} y={100} width={200} height={150} showRotationHandle />,
    );

    const rotationZone = screen.getByTestId("bounding-box-rotation-zone-top-left");
    const style = rotationZone.getAttribute("style");
    // Should have custom cursor with crosshair fallback, not grab
    expect(style).toContain("cursor:");
    expect(style).toContain("crosshair");
    expect(style).not.toContain("grab");
  });

  it("rotation is delta-based and continues from current rotation", () => {
    // Start with rotation at 45 degrees
    const initialRotation = 45;
    const onRotate = vi.fn();

    // Box centered at (200, 175) with size 200x150
    const centerX = 200;
    const centerY = 175;

    renderWithContext(
      <BoundingBox
        x={100}
        y={100}
        width={200}
        height={150}
        rotation={initialRotation}
        onRotate={onRotate}
      />,
    );

    const rotationZone = screen.getByTestId("bounding-box-rotation-zone-top-left");

    // Start rotation at a point that's 45 degrees from center (northeast)
    // This simulates clicking at a point northeast of center
    const startX = centerX + 100;
    const startY = centerY - 100;

    fireEvent.pointerDown(rotationZone, {
      pointerId: 1,
      clientX: startX,
      clientY: startY,
    });

    // Move to a point that's 90 degrees from center (east)
    // This is a 45 degree clockwise rotation from start point
    const moveX = centerX + 100;
    const moveY = centerY;

    fireEvent.pointerMove(rotationZone, {
      pointerId: 1,
      clientX: moveX,
      clientY: moveY,
    });

    // The rotation should be initialRotation + delta, not absolute angle
    // Since we started at 45 degrees and the pointer moved ~45 degrees clockwise,
    // the new rotation should be around 45 + 45 = 90 degrees
    expect(onRotate).toHaveBeenCalled();
    const calledAngle = onRotate.mock.calls[0][0];
    // Allow some tolerance due to coordinate calculations
    expect(calledAngle).toBeGreaterThan(initialRotation);
  });

  it("rotation does not jump to absolute angle on pointer down", () => {
    const initialRotation = 90;
    const onRotate = vi.fn();

    renderWithContext(
      <BoundingBox
        x={100}
        y={100}
        width={200}
        height={150}
        rotation={initialRotation}
        onRotate={onRotate}
      />,
    );

    const rotationZone = screen.getByTestId("bounding-box-rotation-zone-top-left");

    // Pointer down should NOT trigger onRotate (no jump)
    fireEvent.pointerDown(rotationZone, {
      pointerId: 1,
      clientX: 150,
      clientY: 150,
    });

    // onRotate should not be called on pointer down
    expect(onRotate).not.toHaveBeenCalled();
  });
});
