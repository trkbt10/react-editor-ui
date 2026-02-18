/**
 * @file CanvasGuide component - Fixed guide lines for Canvas
 *
 * @description
 * Renders horizontal or vertical guide lines at fixed canvas positions.
 * Guides stay fixed in canvas coordinates regardless of pan/zoom.
 * Add to Canvas via svgLayers prop.
 *
 * @example
 * ```tsx
 * import { Canvas } from "react-editor-ui/canvas/Canvas";
 * import { CanvasGuide } from "react-editor-ui/canvas/CanvasGuide";
 *
 * <Canvas svgLayers={<CanvasGuide orientation="horizontal" position={100} />} />
 * ```
 */

import { memo, type ReactNode } from "react";
import { COLOR_CANVAS_GUIDE } from "../../themes/styles";
import { useCanvasContext } from "../core/CanvasContext";

type Orientation = "horizontal" | "vertical";

export type CanvasGuideProps = {
  /** Guide orientation */
  orientation: Orientation;
  /** Position in canvas coordinates (Y for horizontal, X for vertical) */
  position: number;
  /** Line color */
  color?: string;
};

type LineAttrs = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

/**
 * Calculate line coordinates based on orientation
 */
function getLineAttrs(
  orientation: Orientation,
  position: number,
  viewportX: number,
  viewportY: number,
  viewWidth: number,
  viewHeight: number,
): LineAttrs {
  if (orientation === "horizontal") {
    return {
      x1: viewportX,
      y1: position,
      x2: viewportX + viewWidth,
      y2: position,
    };
  }
  return {
    x1: position,
    y1: viewportY,
    x2: position,
    y2: viewportY + viewHeight,
  };
}

/**
 * Single guide line component
 */
export const CanvasGuide = memo(function CanvasGuide({
  orientation,
  position,
  color = COLOR_CANVAS_GUIDE,
}: CanvasGuideProps): ReactNode {
  const { viewport, canvasWidth, canvasHeight } = useCanvasContext();

  const viewWidth = canvasWidth / viewport.scale;
  const viewHeight = canvasHeight / viewport.scale;

  const attrs = getLineAttrs(
    orientation,
    position,
    viewport.x,
    viewport.y,
    viewWidth,
    viewHeight,
  );

  return (
    <line
      {...attrs}
      stroke={color}
      strokeWidth={1 / viewport.scale}
      data-testid={`canvas-guide-${orientation}`}
    />
  );
});

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
export const CanvasGuides = memo(function CanvasGuides({
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
});
