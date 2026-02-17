/**
 * @file ConnectionRenderer - Renders connection lines between nodes
 */

import { memo, useMemo, useCallback, type ReactNode } from "react";
import type { Connection, DiagramNode, ConnectionPosition, ArrowheadType } from "../types";

// =============================================================================
// Types
// =============================================================================

type Point = { x: number; y: number };

type ConnectionRendererProps = {
  connection: Connection;
  nodes: DiagramNode[];
  selected: boolean;
  onSelect: (connectionId: string) => void;
};

// =============================================================================
// Connection Point Calculator
// =============================================================================

function getConnectionPointCoords(
  node: DiagramNode,
  position: ConnectionPosition,
): Point {
  const centerX = node.x + node.width / 2;
  const centerY = node.y + node.height / 2;

  switch (position) {
    case "top":
      return { x: centerX, y: node.y };
    case "right":
      return { x: node.x + node.width, y: centerY };
    case "bottom":
      return { x: centerX, y: node.y + node.height };
    case "left":
      return { x: node.x, y: centerY };
    case "center":
      return { x: centerX, y: centerY };
  }
}

// =============================================================================
// Path Generation
// =============================================================================

function generateOrthogonalPath(start: Point, end: Point): string {
  // Simple orthogonal routing with midpoint
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  // Determine if we should go horizontal first or vertical first
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);

  if (dx > dy) {
    // Go horizontal first
    return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
  } else {
    // Go vertical first
    return `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
  }
}

// =============================================================================
// Arrow Marker Definitions
// =============================================================================

export function getArrowMarkerId(type: ArrowheadType): string | undefined {
  if (type === "none") return undefined;
  return `arrow-${type}`;
}

export function ArrowMarkerDefs(): ReactNode {
  return (
    <defs>
      <marker
        id="arrow-arrow"
        markerWidth="10"
        markerHeight="10"
        refX="9"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </marker>
      <marker
        id="arrow-triangle"
        markerWidth="10"
        markerHeight="10"
        refX="9"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M 0 0 L 10 5 L 0 10 Z" fill="currentColor" />
      </marker>
      <marker
        id="arrow-diamond"
        markerWidth="12"
        markerHeight="12"
        refX="6"
        refY="6"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M 0 6 L 6 0 L 12 6 L 6 12 Z" fill="currentColor" />
      </marker>
      <marker
        id="arrow-circle"
        markerWidth="10"
        markerHeight="10"
        refX="5"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <circle cx="5" cy="5" r="4" fill="currentColor" />
      </marker>
    </defs>
  );
}

// =============================================================================
// Component
// =============================================================================

export const ConnectionRenderer = memo(function ConnectionRenderer({
  connection,
  nodes,
  selected,
  onSelect,
}: ConnectionRendererProps) {
  const sourceNode = useMemo(
    () => nodes.find((n) => n.id === connection.source.nodeId),
    [nodes, connection.source.nodeId],
  );
  const targetNode = useMemo(
    () => nodes.find((n) => n.id === connection.target.nodeId),
    [nodes, connection.target.nodeId],
  );

  const handleClick = useCallback(() => {
    onSelect(connection.id);
  }, [connection.id, onSelect]);

  const path = useMemo(() => {
    if (!sourceNode || !targetNode) return "";
    const start = getConnectionPointCoords(sourceNode, connection.source.position);
    const end = getConnectionPointCoords(targetNode, connection.target.position);
    return generateOrthogonalPath(start, end);
  }, [sourceNode, targetNode, connection.source.position, connection.target.position]);

  if (!sourceNode || !targetNode || !path) {
    return null;
  }

  const strokeColor = connection.stroke.color.visible
    ? `${connection.stroke.color.hex}${Math.round((connection.stroke.color.opacity / 100) * 255).toString(16).padStart(2, "0")}`
    : "#333333";

  const strokeDashArray = useMemo(() => {
    switch (connection.stroke.style) {
      case "dashed":
        return "8,4";
      case "dotted":
        return "2,4";
      default:
        return undefined;
    }
  }, [connection.stroke.style]);

  const startMarkerId = getArrowMarkerId(connection.startArrow);
  const endMarkerId = getArrowMarkerId(connection.endArrow);

  return (
    <g data-connection-id={connection.id} style={{ color: strokeColor }}>
      {/* Invisible thick path for easier clicking */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth={Math.max(connection.stroke.width + 10, 12)}
        fill="none"
        style={{ cursor: "pointer" }}
        onClick={handleClick}
      />
      {/* Selection highlight */}
      {selected && (
        <path
          d={path}
          stroke="#18a0fb"
          strokeWidth={connection.stroke.width + 4}
          fill="none"
          opacity={0.4}
          style={{ pointerEvents: "none" }}
        />
      )}
      {/* Visible connection line */}
      <path
        d={path}
        stroke={strokeColor}
        strokeWidth={connection.stroke.width}
        strokeDasharray={strokeDashArray}
        fill="none"
        markerStart={startMarkerId ? `url(#${startMarkerId})` : undefined}
        markerEnd={endMarkerId ? `url(#${endMarkerId})` : undefined}
        style={{ pointerEvents: "none" }}
      />
      {/* Connection label */}
      {connection.label && (
        <ConnectionLabel path={path} label={connection.label} />
      )}
    </g>
  );
});

// =============================================================================
// Connection Label
// =============================================================================

type ConnectionLabelProps = {
  path: string;
  label: string;
};

const ConnectionLabel = memo(function ConnectionLabel({ path, label }: ConnectionLabelProps) {
  // Calculate midpoint of path for label positioning
  const midpoint = useMemo(() => {
    const points = path.match(/[ML]\s*([\d.]+)\s+([\d.]+)/g);
    if (!points || points.length < 2) return null;

    let totalLength = 0;
    const segments: { start: Point; end: Point; length: number }[] = [];

    for (let i = 1; i < points.length; i++) {
      const startMatch = points[i - 1].match(/[ML]\s*([\d.]+)\s+([\d.]+)/);
      const endMatch = points[i].match(/[ML]\s*([\d.]+)\s+([\d.]+)/);
      if (startMatch && endMatch) {
        const start = { x: parseFloat(startMatch[1]), y: parseFloat(startMatch[2]) };
        const end = { x: parseFloat(endMatch[1]), y: parseFloat(endMatch[2]) };
        const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        segments.push({ start, end, length });
        totalLength += length;
      }
    }

    // Find midpoint
    let targetLength = totalLength / 2;
    for (const seg of segments) {
      if (targetLength <= seg.length) {
        const ratio = targetLength / seg.length;
        return {
          x: seg.start.x + (seg.end.x - seg.start.x) * ratio,
          y: seg.start.y + (seg.end.y - seg.start.y) * ratio,
        };
      }
      targetLength -= seg.length;
    }

    return null;
  }, [path]);

  if (!midpoint) return null;

  return (
    <g style={{ pointerEvents: "none" }}>
      <rect
        x={midpoint.x - 20}
        y={midpoint.y - 10}
        width={40}
        height={20}
        fill="var(--rei-color-surface)"
        rx={3}
      />
      <text
        x={midpoint.x}
        y={midpoint.y + 4}
        fontSize={11}
        fill="var(--rei-color-text)"
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
});
