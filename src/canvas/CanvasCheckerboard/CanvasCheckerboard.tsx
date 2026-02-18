/**
 * @file CanvasCheckerboard component - Checkerboard background pattern for Canvas
 *
 * @description
 * Renders a checkerboard pattern typically used to indicate transparency.
 * Uses SVG pattern for efficient rendering. Add to Canvas via svgLayers prop.
 *
 * @example
 * ```tsx
 * import { Canvas } from "react-editor-ui/canvas/Canvas";
 * import { CanvasCheckerboard } from "react-editor-ui/canvas/CanvasCheckerboard";
 *
 * <Canvas svgLayers={<CanvasCheckerboard size={10} />} />
 * ```
 */

import { memo, useId, type ReactNode } from "react";
import {
  COLOR_CANVAS_CHECKER_LIGHT,
  COLOR_CANVAS_CHECKER_DARK,
} from "../../themes/styles";
import { useCanvasContext } from "../core/CanvasContext";

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
export const CanvasCheckerboard = memo(function CanvasCheckerboard({
  size = 10,
  lightColor = COLOR_CANVAS_CHECKER_LIGHT,
  darkColor = COLOR_CANVAS_CHECKER_DARK,
}: CanvasCheckerboardProps): ReactNode {
  const { viewport, canvasWidth, canvasHeight } = useCanvasContext();

  // Calculate view dimensions
  const viewWidth = canvasWidth / viewport.scale;
  const viewHeight = canvasHeight / viewport.scale;

  // Unique pattern ID to avoid conflicts
  const patternId = useId();

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
});
