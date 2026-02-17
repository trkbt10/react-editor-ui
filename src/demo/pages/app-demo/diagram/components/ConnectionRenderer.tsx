/**
 * @file ConnectionRenderer - Renders connection lines between nodes
 */

import { memo, useMemo, useCallback, type ReactNode } from "react";
import type { Connection, DiagramNode, ConnectionPosition, ArrowheadType, WidthProfile, BrushType, BrushDirection } from "../types";

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

type StrokeSettings = {
  widthProfile: WidthProfile;
  frequency: number;
  wiggle: number;
  smoothen: number;
  brushType: BrushType;
  brushDirection: BrushDirection;
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
// Path Effects
// =============================================================================

/**
 * Parse path string into points array
 */
function parsePathToPoints(pathStr: string): Point[] {
  const points: Point[] = [];
  const matches = pathStr.match(/[ML]\s*([\d.-]+)\s+([\d.-]+)/g);
  if (matches) {
    for (const match of matches) {
      const coords = match.match(/[ML]\s*([\d.-]+)\s+([\d.-]+)/);
      if (coords) {
        points.push({ x: parseFloat(coords[1]), y: parseFloat(coords[2]) });
      }
    }
  }
  return points;
}

/**
 * Apply wiggle effect to path
 */
function applyWiggleToPath(pathStr: string, frequency: number, wiggle: number): string {
  if (frequency === 0 || wiggle === 0) return pathStr;

  const points = parsePathToPoints(pathStr);
  if (points.length < 2) return pathStr;

  const newPoints: Point[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const start = points[i - 1];
    const end = points[i];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Number of subdivisions based on frequency
    const numSubdivisions = Math.max(1, Math.round(length * frequency / 100));

    for (let j = 1; j <= numSubdivisions; j++) {
      const t = j / numSubdivisions;
      const x = start.x + dx * t;
      const y = start.y + dy * t;

      // Add perpendicular wiggle
      const perpX = -dy / length;
      const perpY = dx / length;
      const wiggleAmount = Math.sin(j * Math.PI) * wiggle * 0.5;

      newPoints.push({
        x: x + perpX * wiggleAmount,
        y: y + perpY * wiggleAmount,
      });
    }
  }

  // Build new path
  let result = `M ${newPoints[0].x} ${newPoints[0].y}`;
  for (let i = 1; i < newPoints.length; i++) {
    result += ` L ${newPoints[i].x} ${newPoints[i].y}`;
  }
  return result;
}

/**
 * Generate width profile gradient stops
 */
function getWidthProfileStops(profile: WidthProfile): { offset: string; width: number }[] {
  switch (profile) {
    case "taper-start":
      return [
        { offset: "0%", width: 0.2 },
        { offset: "100%", width: 1 },
      ];
    case "taper-end":
      return [
        { offset: "0%", width: 1 },
        { offset: "100%", width: 0.2 },
      ];
    case "taper-both":
      return [
        { offset: "0%", width: 0.2 },
        { offset: "50%", width: 1 },
        { offset: "100%", width: 0.2 },
      ];
    default: // uniform
      return [
        { offset: "0%", width: 1 },
        { offset: "100%", width: 1 },
      ];
  }
}

/**
 * Generate outline path for variable width stroke
 */
function generateOutlinePath(
  pathStr: string,
  baseWidth: number,
  profile: WidthProfile
): string {
  if (profile === "uniform") return "";

  const points = parsePathToPoints(pathStr);
  if (points.length < 2) return "";

  const stops = getWidthProfileStops(profile);

  // Calculate total path length
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }

  // Generate upper and lower edges
  const upperEdge: Point[] = [];
  const lowerEdge: Point[] = [];
  let currentLength = 0;

  for (let i = 0; i < points.length; i++) {
    // Calculate progress along path (0 to 1)
    const progress = totalLength > 0 ? currentLength / totalLength : 0;

    // Interpolate width from stops
    let widthMultiplier = 1;
    for (let j = 0; j < stops.length - 1; j++) {
      const startOffset = parseFloat(stops[j].offset) / 100;
      const endOffset = parseFloat(stops[j + 1].offset) / 100;
      if (progress >= startOffset && progress <= endOffset) {
        const t = (progress - startOffset) / (endOffset - startOffset);
        widthMultiplier = stops[j].width + (stops[j + 1].width - stops[j].width) * t;
        break;
      }
    }

    const halfWidth = (baseWidth * widthMultiplier) / 2;

    // Calculate perpendicular direction
    let perpX = 0, perpY = 0;
    if (i < points.length - 1) {
      const dx = points[i + 1].x - points[i].x;
      const dy = points[i + 1].y - points[i].y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        perpX = -dy / len;
        perpY = dx / len;
      }
    } else if (i > 0) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        perpX = -dy / len;
        perpY = dx / len;
      }
    }

    upperEdge.push({
      x: points[i].x + perpX * halfWidth,
      y: points[i].y + perpY * halfWidth,
    });
    lowerEdge.push({
      x: points[i].x - perpX * halfWidth,
      y: points[i].y - perpY * halfWidth,
    });

    // Update current length
    if (i < points.length - 1) {
      const dx = points[i + 1].x - points[i].x;
      const dy = points[i + 1].y - points[i].y;
      currentLength += Math.sqrt(dx * dx + dy * dy);
    }
  }

  // Build closed outline path
  let result = `M ${upperEdge[0].x} ${upperEdge[0].y}`;
  for (let i = 1; i < upperEdge.length; i++) {
    result += ` L ${upperEdge[i].x} ${upperEdge[i].y}`;
  }
  for (let i = lowerEdge.length - 1; i >= 0; i--) {
    result += ` L ${lowerEdge[i].x} ${lowerEdge[i].y}`;
  }
  result += " Z";

  return result;
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

  // Base path
  const basePath = useMemo(() => {
    if (!sourceNode || !targetNode) return "";
    const start = getConnectionPointCoords(sourceNode, connection.source.position);
    const end = getConnectionPointCoords(targetNode, connection.target.position);
    return generateOrthogonalPath(start, end);
  }, [sourceNode, targetNode, connection.source.position, connection.target.position]);

  // Stroke settings
  const strokeSettings: StrokeSettings = useMemo(() => ({
    widthProfile: connection.stroke.widthProfile ?? "uniform",
    frequency: connection.stroke.frequency ?? 0,
    wiggle: connection.stroke.wiggle ?? 0,
    smoothen: connection.stroke.smoothen ?? 0,
    brushType: connection.stroke.brushType ?? "smooth",
    brushDirection: connection.stroke.brushDirection ?? "left",
  }), [
    connection.stroke.widthProfile,
    connection.stroke.frequency,
    connection.stroke.wiggle,
    connection.stroke.smoothen,
    connection.stroke.brushType,
    connection.stroke.brushDirection,
  ]);

  // Apply wiggle effect to path
  const path = useMemo(() => {
    if (!basePath) return "";
    return applyWiggleToPath(basePath, strokeSettings.frequency, strokeSettings.wiggle);
  }, [basePath, strokeSettings.frequency, strokeSettings.wiggle]);

  // Generate outline path for variable width
  const outlinePath = useMemo(() => {
    if (!path || strokeSettings.widthProfile === "uniform") return "";
    return generateOutlinePath(path, connection.stroke.width, strokeSettings.widthProfile);
  }, [path, connection.stroke.width, strokeSettings.widthProfile]);

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

  // Use outline path for variable width, otherwise use regular stroke
  const useOutline = strokeSettings.widthProfile !== "uniform" && outlinePath;

  return (
    <g
      data-connection-id={connection.id}
      data-stroke-settings={JSON.stringify(strokeSettings)}
      style={{ color: strokeColor }}
    >
      {/* Invisible thick path for easier clicking */}
      <path
        d={basePath}
        stroke="transparent"
        strokeWidth={Math.max(connection.stroke.width + 10, 12)}
        fill="none"
        style={{ cursor: "pointer", pointerEvents: "auto" }}
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
      {/* Visible connection line - variable width outline */}
      {useOutline && (
        <path
          d={outlinePath}
          fill={strokeColor}
          stroke="none"
          style={{ pointerEvents: "none" }}
          data-width-profile={strokeSettings.widthProfile}
        />
      )}
      {/* Visible connection line - regular stroke */}
      {!useOutline && (
        <path
          d={path}
          stroke={strokeColor}
          strokeWidth={connection.stroke.width}
          strokeDasharray={strokeDashArray}
          strokeLinejoin={connection.stroke.join ?? "miter"}
          strokeMiterlimit={connection.stroke.miterAngle ?? 4}
          fill="none"
          markerStart={startMarkerId ? `url(#${startMarkerId})` : undefined}
          markerEnd={endMarkerId ? `url(#${endMarkerId})` : undefined}
          style={{ pointerEvents: "none" }}
          data-stroke-join={connection.stroke.join ?? "miter"}
          data-stroke-miterlimit={connection.stroke.miterAngle ?? 4}
        />
      )}
      {/* Arrow markers for outline mode */}
      {useOutline && (startMarkerId || endMarkerId) && (
        <path
          d={path}
          stroke="transparent"
          strokeWidth={connection.stroke.width}
          fill="none"
          markerStart={startMarkerId ? `url(#${startMarkerId})` : undefined}
          markerEnd={endMarkerId ? `url(#${endMarkerId})` : undefined}
          style={{ pointerEvents: "none" }}
        />
      )}
      {/* Connection label */}
      {connection.label && (
        <ConnectionLabel path={basePath} label={connection.label} />
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
