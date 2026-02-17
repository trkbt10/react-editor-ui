/**
 * @file SVG export for diagram documents
 */

import type {
  DiagramDocument,
  DiagramNode,
  Connection,
  ShapeType,
  ShapeNode,
  TextNode,
  ConnectionPosition,
  ArrowheadType,
} from "../types";

// =============================================================================
// Type Guards
// =============================================================================

function isShapeNode(node: DiagramNode): node is ShapeNode {
  return node.type !== "text" && node.type !== "group" && node.type !== "instance";
}

function isTextNode(node: DiagramNode): node is TextNode {
  return node.type === "text";
}

// =============================================================================
// Shape Path Generation
// =============================================================================

function getShapePath(type: ShapeType, width: number, height: number): string {
  const w = width;
  const h = height;
  const hw = w / 2;
  const hh = h / 2;

  switch (type) {
    case "rectangle":
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;

    case "rounded-rect": {
      const r = Math.min(10, w * 0.1, h * 0.1);
      return `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${h - r} Q ${w} ${h} ${w - r} ${h} L ${r} ${h} Q 0 ${h} 0 ${h - r} L 0 ${r} Q 0 0 ${r} 0 Z`;
    }

    case "ellipse":
      return `M ${hw} 0 A ${hw} ${hh} 0 1 1 ${hw} ${h} A ${hw} ${hh} 0 1 1 ${hw} 0 Z`;

    case "diamond":
      return `M ${hw} 0 L ${w} ${hh} L ${hw} ${h} L 0 ${hh} Z`;

    case "triangle":
      return `M ${hw} 0 L ${w} ${h} L 0 ${h} Z`;

    case "hexagon": {
      const offset = w * 0.25;
      return `M ${offset} 0 L ${w - offset} 0 L ${w} ${hh} L ${w - offset} ${h} L ${offset} ${h} L 0 ${hh} Z`;
    }

    case "parallelogram": {
      const skew = w * 0.2;
      return `M ${skew} 0 L ${w} 0 L ${w - skew} ${h} L 0 ${h} Z`;
    }

    case "cylinder": {
      const ry = h * 0.1;
      return `M 0 ${ry} A ${hw} ${ry} 0 0 1 ${w} ${ry} L ${w} ${h - ry} A ${hw} ${ry} 0 0 1 0 ${h - ry} Z M 0 ${ry} A ${hw} ${ry} 0 0 0 ${w} ${ry}`;
    }

    default:
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
  }
}

// =============================================================================
// Connection Path Generation
// =============================================================================

type Point = { x: number; y: number };

function getConnectionPointCoords(node: DiagramNode, position: ConnectionPosition): Point {
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

function generateConnectionPath(
  connection: Connection,
  nodes: DiagramNode[],
): string {
  const sourceNode = nodes.find((n) => n.id === connection.source.nodeId);
  const targetNode = nodes.find((n) => n.id === connection.target.nodeId);

  if (!sourceNode || !targetNode) return "";

  const start = getConnectionPointCoords(sourceNode, connection.source.position);
  const end = getConnectionPointCoords(targetNode, connection.target.position);

  // Orthogonal routing
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);

  if (dx > dy) {
    return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
  } else {
    return `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
  }
}

// =============================================================================
// Color Utilities
// =============================================================================

function colorToHex(color: { hex: string; opacity: number; visible: boolean }): string {
  if (!color.visible) return "none";
  if (color.opacity >= 100) return color.hex;
  const alpha = Math.round((color.opacity / 100) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${color.hex}${alpha}`;
}

function getStrokeDashArray(style: string): string | undefined {
  switch (style) {
    case "dashed":
      return "8,4";
    case "dotted":
      return "2,4";
    default:
      return undefined;
  }
}

// =============================================================================
// Arrow Marker Generation
// =============================================================================

function generateArrowMarkers(): string {
  return `
    <marker id="arrow-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
      <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="currentColor" stroke-width="1.5" />
    </marker>
    <marker id="arrow-triangle" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
      <path d="M 0 0 L 10 5 L 0 10 Z" fill="currentColor" />
    </marker>
    <marker id="arrow-diamond" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto" markerUnits="strokeWidth">
      <path d="M 0 6 L 6 0 L 12 6 L 6 12 Z" fill="currentColor" />
    </marker>
    <marker id="arrow-circle" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth">
      <circle cx="5" cy="5" r="4" fill="currentColor" />
    </marker>
  `;
}

function getMarkerRef(type: ArrowheadType): string | undefined {
  if (type === "none") return undefined;
  return `url(#arrow-${type})`;
}

// =============================================================================
// Bounds Calculation
// =============================================================================

function calculateBounds(nodes: DiagramNode[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  }

  const padding = 40;
  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}

// =============================================================================
// XML Escaping
// =============================================================================

function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// =============================================================================
// Main Export Function
// =============================================================================

/**
 * Export diagram document to SVG string
 */
export function exportToSVG(document: DiagramDocument): string {
  // Use canvas page for export
  const nodes = document.canvasPage.nodes;
  const connections = document.canvasPage.connections;
  const bounds = calculateBounds(nodes);

  // Generate shape node SVG
  const shapesSVG = nodes
    .filter(isShapeNode)
    .map((node: ShapeNode) => {
      const path = getShapePath(node.type, node.width, node.height);
      const fill = colorToHex(node.fill);
      const stroke = colorToHex(node.stroke.color);
      const strokeDash = getStrokeDashArray(node.stroke.style);
      const transform = node.rotation !== 0
        ? `translate(${node.x}, ${node.y}) rotate(${node.rotation} ${node.width / 2} ${node.height / 2})`
        : `translate(${node.x}, ${node.y})`;

      return `
  <g transform="${transform}" data-node-id="${node.id}">
    <path d="${path}"
      fill="${fill}"
      stroke="${stroke}"
      stroke-width="${node.stroke.width}"${strokeDash ? ` stroke-dasharray="${strokeDash}"` : ""} />
  </g>`;
    })
    .join("");

  // Generate text node SVG
  const textsSVG = nodes
    .filter(isTextNode)
    .map((node: TextNode) => {
      const textX = node.x + node.width / 2;
      const textY = node.y + node.height / 2;
      const textColor = colorToHex(node.textProps.color);
      const transform = node.rotation !== 0
        ? `rotate(${node.rotation} ${textX} ${textY})`
        : undefined;

      return `
  <text x="${textX}" y="${textY}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="${node.textProps.fontSize}"
    font-weight="${node.textProps.fontWeight}"
    fill="${textColor}"${transform ? ` transform="${transform}"` : ""}
    data-node-id="${node.id}">${escapeXML(node.content)}</text>`;
    })
    .join("");

  const nodesSVG = shapesSVG + textsSVG;

  // Generate connection SVG
  const connectionsSVG = connections
    .map((conn: Connection) => {
      const path = generateConnectionPath(conn, nodes);
      if (!path) return "";

      const stroke = colorToHex(conn.stroke.color);
      const strokeDash = getStrokeDashArray(conn.stroke.style);
      const startMarker = getMarkerRef(conn.startArrow);
      const endMarker = getMarkerRef(conn.endArrow);

      return `
  <path d="${path}"
    fill="none"
    stroke="${stroke}"
    stroke-width="${conn.stroke.width}"${strokeDash ? ` stroke-dasharray="${strokeDash}"` : ""}${startMarker ? ` marker-start="${startMarker}"` : ""}${endMarker ? ` marker-end="${endMarker}"` : ""}
    data-connection-id="${conn.id}" />`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
  viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}"
  width="${bounds.width}"
  height="${bounds.height}">
  <defs>
    ${generateArrowMarkers()}
  </defs>
  <g id="connections">
    ${connectionsSVG}
  </g>
  <g id="nodes">
    ${nodesSVG}
  </g>
</svg>`;
}
