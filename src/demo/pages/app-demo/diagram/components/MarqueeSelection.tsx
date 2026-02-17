/**
 * @file MarqueeSelection - Drag selection rectangle overlay
 */

import { memo, type ReactNode } from "react";

export type MarqueeState = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

export type MarqueeSelectionProps = {
  marquee: MarqueeState;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  scale?: number;
};

/**
 * MarqueeSelection renders the selection rectangle in SVG
 */
export const MarqueeSelection = memo(function MarqueeSelection({
  marquee,
  strokeColor = "#18a0fb",
  fillColor = "rgba(24, 160, 251, 0.1)",
  strokeWidth = 1,
  scale = 1,
}: MarqueeSelectionProps): ReactNode {
  const { startX, startY, currentX, currentY } = marquee;

  // Calculate rect bounds (handle negative dimensions)
  const x = Math.min(startX, currentX);
  const y = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  // Scale stroke width for consistent appearance
  const scaledStrokeWidth = strokeWidth / scale;

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
      data-testid="marquee-selection"
    />
  );
});

/**
 * Check if a node intersects with the marquee rectangle
 */
export function intersectsMarquee(
  nodeX: number,
  nodeY: number,
  nodeWidth: number,
  nodeHeight: number,
  marquee: MarqueeState,
): boolean {
  const marqueeX = Math.min(marquee.startX, marquee.currentX);
  const marqueeY = Math.min(marquee.startY, marquee.currentY);
  const marqueeWidth = Math.abs(marquee.currentX - marquee.startX);
  const marqueeHeight = Math.abs(marquee.currentY - marquee.startY);

  // Check for intersection
  return !(
    nodeX + nodeWidth < marqueeX ||
    nodeX > marqueeX + marqueeWidth ||
    nodeY + nodeHeight < marqueeY ||
    nodeY > marqueeY + marqueeHeight
  );
}
