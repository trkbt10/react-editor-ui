/**
 * @file CanvasCheckerboard - Checkerboard background pattern for Canvas
 *
 * Renders a checkerboard pattern typically used to indicate transparency.
 * Use as an SVG layer in Canvas.
 */

import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  COLOR_CANVAS_CHECKER_LIGHT,
  COLOR_CANVAS_CHECKER_DARK,
} from "../../constants/styles";
import { useCanvasContext } from "./core/CanvasContext";

export type CanvasCheckerboardProps = {
  /** Size of each checker square in canvas units */
  size?: number;
  /** Light color */
  lightColor?: string;
  /** Dark color */
  darkColor?: string;
};

/**
 * Checkerboard background component for Canvas
 *
 * Renders a checkerboard pattern using SVG pattern.
 * Use with Canvas svgLayers prop.
 */
export function CanvasCheckerboard({
  size = 10,
  lightColor = COLOR_CANVAS_CHECKER_LIGHT,
  darkColor = COLOR_CANVAS_CHECKER_DARK,
}: CanvasCheckerboardProps): ReactNode {
  const { viewport, canvasWidth, canvasHeight } = useCanvasContext();

  // Calculate view dimensions
  const viewWidth = canvasWidth / viewport.scale;
  const viewHeight = canvasHeight / viewport.scale;

  // Unique pattern ID to avoid conflicts
  const patternId = useMemo(() => `checker-${Math.random().toString(36).slice(2, 9)}`, []);

  return (
    <g data-testid="canvas-checkerboard">
      <defs>
        <pattern
          id={patternId}
          x={0}
          y={0}
          width={size * 2}
          height={size * 2}
          patternUnits="userSpaceOnUse"
        >
          {/* Dark squares */}
          <rect x={0} y={0} width={size} height={size} fill={darkColor} />
          <rect x={size} y={size} width={size} height={size} fill={darkColor} />
          {/* Light squares */}
          <rect x={size} y={0} width={size} height={size} fill={lightColor} />
          <rect x={0} y={size} width={size} height={size} fill={lightColor} />
        </pattern>
      </defs>
      <rect
        x={viewport.x}
        y={viewport.y}
        width={viewWidth}
        height={viewHeight}
        fill={`url(#${patternId})`}
      />
    </g>
  );
}
