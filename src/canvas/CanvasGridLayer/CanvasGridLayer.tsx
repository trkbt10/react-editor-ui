/**
 * @file CanvasGridLayer - Grid/guideline layer for Canvas
 *
 * Renders minor grid, major grid, and origin lines as SVG.
 * Uses SVG pattern for efficient rendering (minimal DOM elements).
 * Use with Canvas svgLayers prop.
 */

import { memo, useId, type ReactNode } from "react";
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
 * - Minor grid lines (thin, frequent) via SVG pattern
 * - Major grid lines (thicker, less frequent) via SVG pattern
 * - Origin lines (X=0, Y=0) as individual lines
 *
 * Uses SVG pattern elements instead of individual line elements
 * for much better performance (2-3 patterns vs 100+ lines)
 */
export const CanvasGridLayer = memo(function CanvasGridLayer(
  props: CanvasGridLayerProps,
): ReactNode {
  const { minorSize, majorSize, showOrigin } = { ...DEFAULT_GRID_CONFIG, ...props };
  const { viewport, canvasWidth, canvasHeight } = useCanvasContext();

  // Unique IDs for patterns
  const minorPatternId = useId();
  const majorPatternId = useId();

  // Calculate view dimensions
  const viewWidth = canvasWidth / viewport.scale;
  const viewHeight = canvasHeight / viewport.scale;

  // Scaled stroke widths
  const minorStroke = 1 / viewport.scale;
  const majorStroke = 1 / viewport.scale;
  const originStroke = 2 / viewport.scale;

  return (
    <g data-testid="canvas-grid-layer">
      <defs>
        {/* Minor grid pattern */}
        <pattern
          id={minorPatternId}
          x={0}
          y={0}
          width={minorSize}
          height={minorSize}
          patternUnits="userSpaceOnUse"
        >
          <line
            x1={minorSize}
            y1={0}
            x2={minorSize}
            y2={minorSize}
            stroke={COLOR_CANVAS_GRID_MINOR}
            strokeWidth={minorStroke}
          />
          <line
            x1={0}
            y1={minorSize}
            x2={minorSize}
            y2={minorSize}
            stroke={COLOR_CANVAS_GRID_MINOR}
            strokeWidth={minorStroke}
          />
        </pattern>

        {/* Major grid pattern */}
        <pattern
          id={majorPatternId}
          x={0}
          y={0}
          width={majorSize}
          height={majorSize}
          patternUnits="userSpaceOnUse"
        >
          <line
            x1={majorSize}
            y1={0}
            x2={majorSize}
            y2={majorSize}
            stroke={COLOR_CANVAS_GRID_MAJOR}
            strokeWidth={majorStroke}
          />
          <line
            x1={0}
            y1={majorSize}
            x2={majorSize}
            y2={majorSize}
            stroke={COLOR_CANVAS_GRID_MAJOR}
            strokeWidth={majorStroke}
          />
        </pattern>
      </defs>

      {/* Minor grid fill */}
      <rect
        data-testid="canvas-grid-minor"
        x={viewport.x}
        y={viewport.y}
        width={viewWidth}
        height={viewHeight}
        fill={`url(#${minorPatternId})`}
      />

      {/* Major grid fill */}
      <rect
        data-testid="canvas-grid-major"
        x={viewport.x}
        y={viewport.y}
        width={viewWidth}
        height={viewHeight}
        fill={`url(#${majorPatternId})`}
      />

      {/* Origin lines (individual elements for visibility) */}
      {showOrigin && (
        <g data-testid="canvas-grid-origin">
          {/* Vertical origin line (X=0) */}
          <line
            x1={0}
            y1={viewport.y}
            x2={0}
            y2={viewport.y + viewHeight}
            stroke={COLOR_CANVAS_GRID_ORIGIN}
            strokeWidth={originStroke}
          />
          {/* Horizontal origin line (Y=0) */}
          <line
            x1={viewport.x}
            y1={0}
            x2={viewport.x + viewWidth}
            y2={0}
            stroke={COLOR_CANVAS_GRID_ORIGIN}
            strokeWidth={originStroke}
          />
        </g>
      )}
    </g>
  );
});
