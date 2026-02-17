/**
 * @file Mermaid export for diagram documents
 */

import type {
  DiagramDocument,
  ShapeType,
  DiagramNode,
  ShapeNode,
  TextNode,
  GroupNode,
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

function isGroupNode(node: DiagramNode): node is GroupNode {
  return node.type === "group";
}

// =============================================================================
// Shape Mapping
// =============================================================================

type MermaidShape = { start: string; end: string };

function getMermaidShape(type: ShapeType | "group"): MermaidShape {
  switch (type) {
    case "rectangle":
      return { start: "[", end: "]" };
    case "rounded-rect":
      return { start: "(", end: ")" };
    case "ellipse":
      return { start: "([", end: "])" };
    case "diamond":
      return { start: "{", end: "}" };
    case "hexagon":
      return { start: "{{", end: "}}" };
    case "parallelogram":
      return { start: "[/", end: "/]" };
    case "cylinder":
      return { start: "[(", end: ")]" };
    case "triangle":
      // Mermaid doesn't have triangle, use trapezoid as approximation
      return { start: "[\\", end: "\\]" };
    case "group":
      // Groups default to rectangle
      return { start: "[", end: "]" };
    default:
      return { start: "[", end: "]" };
  }
}

// =============================================================================
// Arrow Mapping
// =============================================================================

function getMermaidArrow(
  startArrow: ArrowheadType,
  endArrow: ArrowheadType,
): string {
  const hasStart = startArrow !== "none";
  const hasEnd = endArrow !== "none";

  if (hasStart && hasEnd) {
    return "<-->";
  } else if (hasStart) {
    return "<--";
  } else if (hasEnd) {
    return "-->";
  } else {
    return "---";
  }
}

function getMermaidLineStyle(
  style: "solid" | "dashed" | "dotted",
  arrow: string,
): string {
  if (style === "dotted" || style === "dashed") {
    // Replace -- with -..- for dashed/dotted lines
    return arrow.replace(/--/g, "-.-");
  }
  return arrow;
}

// =============================================================================
// Label Sanitization
// =============================================================================

function sanitizeLabel(label: string): string {
  // Remove or escape special characters that might break Mermaid syntax
  return label
    .replace(/"/g, "'")
    .replace(/\[/g, "(")
    .replace(/\]/g, ")")
    .replace(/\{/g, "(")
    .replace(/\}/g, ")")
    .replace(/\n/g, " ")
    .trim();
}

function sanitizeId(id: string): string {
  // Ensure ID is valid for Mermaid (alphanumeric with underscores)
  return id.replace(/[^a-zA-Z0-9_]/g, "_");
}

// =============================================================================
// Main Export Function
// =============================================================================

/**
 * Get label for a group by finding its text child
 */
function getGroupLabel(group: GroupNode, nodes: DiagramNode[]): string {
  for (const childId of group.children) {
    const child = nodes.find((n) => n.id === childId);
    if (child && isTextNode(child)) {
      return child.content;
    }
  }
  return "";
}

/**
 * Get shape type for a group by finding its shape child
 */
function getGroupShapeType(group: GroupNode, nodes: DiagramNode[]): ShapeType | "group" {
  for (const childId of group.children) {
    const child = nodes.find((n) => n.id === childId);
    if (child && isShapeNode(child)) {
      return child.type;
    }
  }
  return "group";
}

/**
 * Export diagram document to Mermaid flowchart syntax
 */
export function exportToMermaid(document: DiagramDocument): string {
  // Use canvas page for export
  const nodes = document.canvasPage.nodes;
  const connections = document.canvasPage.connections;

  // Get groups for node definitions (groups are the top-level elements in the new architecture)
  const groups = nodes.filter(isGroupNode);
  // Also include standalone shapes (not part of any group)
  const groupChildIds = new Set(groups.flatMap((g: GroupNode) => g.children));
  const standaloneShapes = nodes.filter(
    (n: DiagramNode) => isShapeNode(n) && !groupChildIds.has(n.id),
  );

  const exportableNodes = [...groups, ...standaloneShapes];

  if (exportableNodes.length === 0) {
    return "flowchart TD\n  empty[Empty diagram]";
  }

  const lines: string[] = [];
  lines.push("flowchart TD");

  // Generate node definitions
  for (const node of exportableNodes) {
    const id = sanitizeId(node.id);

    if (isGroupNode(node)) {
      const shapeType = getGroupShapeType(node, nodes);
      const shape = getMermaidShape(shapeType);
      const label = getGroupLabel(node, nodes) || id;
      lines.push(`  ${id}${shape.start}"${sanitizeLabel(label)}"${shape.end}`);
    } else if (isShapeNode(node)) {
      const shape = getMermaidShape(node.type);
      lines.push(`  ${id}${shape.start}"${id}"${shape.end}`);
    }
  }

  // Add blank line before connections
  if (connections.length > 0) {
    lines.push("");
  }

  // Generate connection lines
  for (const conn of connections) {
    const sourceId = sanitizeId(conn.source.nodeId);
    const targetId = sanitizeId(conn.target.nodeId);

    // Verify both nodes exist (in exportable nodes)
    const sourceExists = exportableNodes.some((n) => n.id === conn.source.nodeId);
    const targetExists = exportableNodes.some((n) => n.id === conn.target.nodeId);
    if (!sourceExists || !targetExists) continue;

    const baseArrow = getMermaidArrow(conn.startArrow, conn.endArrow);
    const arrow = getMermaidLineStyle(conn.stroke.style, baseArrow);

    if (conn.label) {
      const label = sanitizeLabel(conn.label);
      lines.push(`  ${sourceId} ${arrow}|"${label}"| ${targetId}`);
    } else {
      lines.push(`  ${sourceId} ${arrow} ${targetId}`);
    }
  }

  // Add styling section for shapes with custom colors
  // For groups, get the style from their shape children
  const styledEntries: Array<{ id: string; fill: string; stroke: string }> = [];

  for (const node of exportableNodes) {
    if (isGroupNode(node)) {
      // Find shape child for styling
      for (const childId of node.children) {
        const child = nodes.find((n: DiagramNode) => n.id === childId);
        if (child && isShapeNode(child)) {
          if (child.fill.hex !== "#ffffff" || child.stroke.color.hex !== "#333333") {
            styledEntries.push({
              id: node.id,
              fill: child.fill.visible ? child.fill.hex : "#ffffff",
              stroke: child.stroke.color.visible ? child.stroke.color.hex : "#333333",
            });
          }
          break;
        }
      }
    } else if (isShapeNode(node)) {
      if (node.fill.hex !== "#ffffff" || node.stroke.color.hex !== "#333333") {
        styledEntries.push({
          id: node.id,
          fill: node.fill.visible ? node.fill.hex : "#ffffff",
          stroke: node.stroke.color.visible ? node.stroke.color.hex : "#333333",
        });
      }
    }
  }

  if (styledEntries.length > 0) {
    lines.push("");
    lines.push("  %% Styling");

    for (const entry of styledEntries) {
      const id = sanitizeId(entry.id);
      lines.push(`  style ${id} fill:${entry.fill},stroke:${entry.stroke}`);
    }
  }

  return lines.join("\n");
}
