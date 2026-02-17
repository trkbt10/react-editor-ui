/**
 * @file DrawingPreview - Preview rectangle shown while drawing shapes
 */

import { memo, type ReactNode } from "react";
import type { NodeType } from "../types";

export type DrawingPreviewState = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

export type DrawingPreviewProps = {
  drawing: DrawingPreviewState;
  toolType: NodeType | "frame";
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  scale?: number;
};

/**
 * DrawingPreview renders the shape preview while drawing
 */
export const DrawingPreview = memo(function DrawingPreview({
  drawing,
  toolType,
  strokeColor = "#18a0fb",
  fillColor = "rgba(24, 160, 251, 0.1)",
  strokeWidth = 1,
  scale = 1,
}: DrawingPreviewProps): ReactNode {
  const { startX, startY, currentX, currentY } = drawing;

  // Calculate rect bounds (handle negative dimensions)
  const x = Math.min(startX, currentX);
  const y = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  // Scale stroke width for consistent appearance
  const scaledStrokeWidth = strokeWidth / scale;

  // Render shape based on tool type
  switch (toolType) {
    case "ellipse":
      return (
        <ellipse
          cx={x + width / 2}
          cy={y + height / 2}
          rx={width / 2}
          ry={height / 2}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={scaledStrokeWidth}
          strokeDasharray={`${4 / scale} ${2 / scale}`}
          style={{ pointerEvents: "none" }}
          data-testid="drawing-preview"
        />
      );

    case "diamond": {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const points = `${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`;
      return (
        <polygon
          points={points}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={scaledStrokeWidth}
          strokeDasharray={`${4 / scale} ${2 / scale}`}
          style={{ pointerEvents: "none" }}
          data-testid="drawing-preview"
        />
      );
    }

    case "triangle": {
      const cx = x + width / 2;
      const points = `${cx},${y} ${x + width},${y + height} ${x},${y + height}`;
      return (
        <polygon
          points={points}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={scaledStrokeWidth}
          strokeDasharray={`${4 / scale} ${2 / scale}`}
          style={{ pointerEvents: "none" }}
          data-testid="drawing-preview"
        />
      );
    }

    case "hexagon": {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const hw = width / 2;
      const hh = height / 2;
      const points = [
        `${x + hw * 0.5},${y}`,
        `${x + hw * 1.5},${y}`,
        `${x + width},${cy}`,
        `${x + hw * 1.5},${y + height}`,
        `${x + hw * 0.5},${y + height}`,
        `${x},${cy}`,
      ].join(" ");
      return (
        <polygon
          points={points}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={scaledStrokeWidth}
          strokeDasharray={`${4 / scale} ${2 / scale}`}
          style={{ pointerEvents: "none" }}
          data-testid="drawing-preview"
        />
      );
    }

    case "rounded-rect":
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={8}
          ry={8}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={scaledStrokeWidth}
          strokeDasharray={`${4 / scale} ${2 / scale}`}
          style={{ pointerEvents: "none" }}
          data-testid="drawing-preview"
        />
      );

    case "frame":
      // Frame preview with a label-like appearance
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="rgba(255, 255, 255, 0.8)"
          stroke="#e0e0e0"
          strokeWidth={scaledStrokeWidth}
          strokeDasharray={`${4 / scale} ${2 / scale}`}
          style={{ pointerEvents: "none" }}
          data-testid="drawing-preview"
        />
      );

    case "table": {
      // Table preview with 3x3 grid
      const cols = 3;
      const rows = 3;
      const cellWidth = width / cols;
      const cellHeight = height / rows;
      const gridLines: React.ReactNode[] = [];

      // Vertical lines
      for (let i = 1; i < cols; i += 1) {
        gridLines.push(
          <line
            key={`v-${i}`}
            x1={x + i * cellWidth}
            y1={y}
            x2={x + i * cellWidth}
            y2={y + height}
            stroke={strokeColor}
            strokeWidth={scaledStrokeWidth}
            strokeDasharray={`${4 / scale} ${2 / scale}`}
          />
        );
      }

      // Horizontal lines
      for (let i = 1; i < rows; i += 1) {
        gridLines.push(
          <line
            key={`h-${i}`}
            x1={x}
            y1={y + i * cellHeight}
            x2={x + width}
            y2={y + i * cellHeight}
            stroke={strokeColor}
            strokeWidth={scaledStrokeWidth}
            strokeDasharray={`${4 / scale} ${2 / scale}`}
          />
        );
      }

      return (
        <g style={{ pointerEvents: "none" }} data-testid="drawing-preview">
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={scaledStrokeWidth}
            strokeDasharray={`${4 / scale} ${2 / scale}`}
          />
          {gridLines}
        </g>
      );
    }

    // Default: rectangle (includes rectangle, cylinder, parallelogram, text)
    default:
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={scaledStrokeWidth}
          strokeDasharray={`${4 / scale} ${2 / scale}`}
          style={{ pointerEvents: "none" }}
          data-testid="drawing-preview"
        />
      );
  }
});
