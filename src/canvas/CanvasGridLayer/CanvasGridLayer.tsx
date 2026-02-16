/**
 * @file CanvasGridLayer - Grid/guideline layer for Canvas
 *
 * Renders minor grid, major grid, and origin lines as SVG.
 * Use with Canvas svgLayers prop.
 */

import type { ReactNode } from "react";
import { useCanvasContext } from "../core/CanvasContext";
import {
  COLOR_CANVAS_GRID_MAJOR,
  COLOR_CANVAS_GRID_MINOR,
  COLOR_CANVAS_GRID_ORIGIN,
} from "../../constants/styles";
import type { GridLayerConfig } from "../core/types";
import { DEFAULT_GRID_CONFIG } from "../core/types";

export type CanvasGridLayerProps = Partial<GridLayerConfig>;

/**
 * Grid layer component for Canvas
 *
 * Renders:
 * - Minor grid lines (thin, frequent)
 * - Major grid lines (thicker, less frequent)
 * - Origin lines (X=0, Y=0) in accent color
 */
export function CanvasGridLayer(props: CanvasGridLayerProps): ReactNode {
  const { minorSize, majorSize, showOrigin } = { ...DEFAULT_GRID_CONFIG, ...props };
  const { viewport, canvasWidth, canvasHeight } = useCanvasContext();

  // Calculate view dimensions
  const viewWidth = canvasWidth / viewport.scale;
  const viewHeight = canvasHeight / viewport.scale;

  // Calculate grid bounds
  const startX = Math.floor(viewport.x / minorSize) * minorSize;
  const startY = Math.floor(viewport.y / minorSize) * minorSize;
  const endX = viewport.x + viewWidth;
  const endY = viewport.y + viewHeight;

  const minorLines: ReactNode[] = [];
  const majorLines: ReactNode[] = [];
  const originLines: ReactNode[] = [];

  // Vertical lines
  for (let x = startX; x <= endX; x += minorSize) {
    const isMajor = x % majorSize === 0;
    const isOrigin = x === 0;

    if (isOrigin && showOrigin) {
      originLines.push(
        <line
          key={`origin-v-${x}`}
          x1={x}
          y1={viewport.y}
          x2={x}
          y2={viewport.y + viewHeight}
          stroke={COLOR_CANVAS_GRID_ORIGIN}
          strokeWidth={2 / viewport.scale}
        />,
      );
    } else if (isMajor) {
      majorLines.push(
        <line
          key={`major-v-${x}`}
          x1={x}
          y1={viewport.y}
          x2={x}
          y2={viewport.y + viewHeight}
          stroke={COLOR_CANVAS_GRID_MAJOR}
          strokeWidth={1 / viewport.scale}
        />,
      );
    } else {
      minorLines.push(
        <line
          key={`minor-v-${x}`}
          x1={x}
          y1={viewport.y}
          x2={x}
          y2={viewport.y + viewHeight}
          stroke={COLOR_CANVAS_GRID_MINOR}
          strokeWidth={1 / viewport.scale}
        />,
      );
    }
  }

  // Horizontal lines
  for (let y = startY; y <= endY; y += minorSize) {
    const isMajor = y % majorSize === 0;
    const isOrigin = y === 0;

    if (isOrigin && showOrigin) {
      originLines.push(
        <line
          key={`origin-h-${y}`}
          x1={viewport.x}
          y1={y}
          x2={viewport.x + viewWidth}
          y2={y}
          stroke={COLOR_CANVAS_GRID_ORIGIN}
          strokeWidth={2 / viewport.scale}
        />,
      );
    } else if (isMajor) {
      majorLines.push(
        <line
          key={`major-h-${y}`}
          x1={viewport.x}
          y1={y}
          x2={viewport.x + viewWidth}
          y2={y}
          stroke={COLOR_CANVAS_GRID_MAJOR}
          strokeWidth={1 / viewport.scale}
        />,
      );
    } else {
      minorLines.push(
        <line
          key={`minor-h-${y}`}
          x1={viewport.x}
          y1={y}
          x2={viewport.x + viewWidth}
          y2={y}
          stroke={COLOR_CANVAS_GRID_MINOR}
          strokeWidth={1 / viewport.scale}
        />,
      );
    }
  }

  return (
    <g data-testid="canvas-grid-layer">
      <g data-testid="canvas-grid-minor">{minorLines}</g>
      <g data-testid="canvas-grid-major">{majorLines}</g>
      <g data-testid="canvas-grid-origin">{originLines}</g>
    </g>
  );
}
