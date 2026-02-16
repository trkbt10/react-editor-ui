/**
 * @file CanvasGuide - Fixed guide lines for Canvas
 *
 * Renders horizontal or vertical guide lines at fixed positions.
 * Guides are drawn from ruler and stay fixed (do not follow mouse).
 */

import type { ReactNode } from "react";
import { COLOR_CANVAS_GUIDE } from "../../constants/styles";
import { useCanvasContext } from "../core/CanvasContext";

export type CanvasGuideProps = {
  /** Guide orientation */
  orientation: "horizontal" | "vertical";
  /** Position in canvas coordinates (Y for horizontal, X for vertical) */
  position: number;
  /** Line color */
  color?: string;
};

/**
 * Single guide line component
 */
export function CanvasGuide({
  orientation,
  position,
  color = COLOR_CANVAS_GUIDE,
}: CanvasGuideProps): ReactNode {
  const { viewport, canvasWidth, canvasHeight } = useCanvasContext();

  const viewWidth = canvasWidth / viewport.scale;
  const viewHeight = canvasHeight / viewport.scale;

  if (orientation === "horizontal") {
    return (
      <line
        x1={viewport.x}
        y1={position}
        x2={viewport.x + viewWidth}
        y2={position}
        stroke={color}
        strokeWidth={1 / viewport.scale}
        data-testid="canvas-guide-horizontal"
      />
    );
  }

  return (
    <line
      x1={position}
      y1={viewport.y}
      x2={position}
      y2={viewport.y + viewHeight}
      stroke={color}
      strokeWidth={1 / viewport.scale}
      data-testid="canvas-guide-vertical"
    />
  );
}

export type CanvasGuidesProps = {
  /** Array of guide definitions */
  guides: Array<{
    orientation: "horizontal" | "vertical";
    position: number;
    color?: string;
  }>;
  /** Default color for all guides */
  color?: string;
};

/**
 * Multiple guides component
 */
export function CanvasGuides({
  guides,
  color = COLOR_CANVAS_GUIDE,
}: CanvasGuidesProps): ReactNode {
  return (
    <g data-testid="canvas-guides">
      {guides.map((guide, index) => (
        <CanvasGuide
          key={`${guide.orientation}-${guide.position}-${index}`}
          orientation={guide.orientation}
          position={guide.position}
          color={guide.color ?? color}
        />
      ))}
    </g>
  );
}
