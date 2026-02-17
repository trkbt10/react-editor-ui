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
  FrameNode,
  Connection,
  SymbolInstance,
  SymbolDefinition,
  TextPart,
} from "../types";

// =============================================================================
// Type Guards
// =============================================================================

function isShapeNode(node: DiagramNode): node is ShapeNode {
  return node.type !== "text" && node.type !== "group" && node.type !== "instance" && node.type !== "frame";
}

function isTextNode(node: DiagramNode): node is TextNode {
  return node.type === "text";
}

function isGroupNode(node: DiagramNode): node is GroupNode {
  return node.type === "group";
}

function isSymbolInstance(node: DiagramNode): node is SymbolInstance {
  return node.type === "instance";
}

// =============================================================================
// Shape Mapping
// =============================================================================

type MermaidShape = { start: string; end: string };

function getMermaidShape(type: ShapeType | "group" | "instance"): MermaidShape {
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
    case "instance":
      // Groups and instances default to rectangle
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
// Helper Functions
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
      return child.shape;
    }
  }
  return "group";
}

/**
 * Get label for a symbol instance from its variant
 */
function getInstanceLabel(
  instance: SymbolInstance,
  symbolDef: SymbolDefinition | null,
): string {
  if (!symbolDef) return instance.variantId;

  const variant = symbolDef.variants[instance.variantId];
  if (!variant) return instance.variantId;

  // Find the text part and get label from variant override or instance override
  const textPart = symbolDef.parts.find((p) => p.type === "text") as TextPart | undefined;
  if (!textPart) return instance.variantId;

  // Check instance override first
  const instanceOverride = instance.partOverrides?.[textPart.id];
  if (instanceOverride && "content" in instanceOverride) {
    return instanceOverride.content as string;
  }

  // Check variant override
  const variantOverride = variant.parts[textPart.id];
  if (variantOverride && "content" in variantOverride) {
    return variantOverride.content as string;
  }

  // Fall back to base text part content
  return textPart.content || instance.variantId;
}

/**
 * Get shape type for a symbol instance from its variant
 */
function getInstanceShapeType(
  instance: SymbolInstance,
  symbolDef: SymbolDefinition | null,
): ShapeType | "instance" {
  if (!symbolDef) return "instance";

  const variant = symbolDef.variants[instance.variantId];
  if (!variant) return "instance";

  // Find the shape part
  const shapePart = symbolDef.parts.find((p) => p.type === "shape");
  if (!shapePart || shapePart.type !== "shape") return "instance";

  // Check variant override for shape type
  const variantOverride = variant.parts[shapePart.id];
  if (variantOverride && "shape" in variantOverride) {
    return variantOverride.shape as ShapeType;
  }

  return shapePart.shape;
}

// =============================================================================
// Main Export Function
// =============================================================================

/**
 * Core function to generate Mermaid from nodes and connections
 */
function generateMermaid(
  nodes: DiagramNode[],
  connections: Connection[],
  symbolDef: SymbolDefinition | null,
): string {
  // Get groups for node definitions (groups are the top-level elements)
  const groups = nodes.filter(isGroupNode);
  // Get symbol instances
  const instances = nodes.filter(isSymbolInstance);
  // Also include standalone shapes (not part of any group)
  const groupChildIds = new Set(groups.flatMap((g: GroupNode) => g.children));
  const standaloneShapes = nodes.filter(
    (n: DiagramNode) => isShapeNode(n) && !groupChildIds.has(n.id),
  );

  const exportableNodes = [...groups, ...instances, ...standaloneShapes];

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
    } else if (isSymbolInstance(node)) {
      const shapeType = getInstanceShapeType(node, symbolDef);
      const shape = getMermaidShape(shapeType);
      const label = getInstanceLabel(node, symbolDef);
      lines.push(`  ${id}${shape.start}"${sanitizeLabel(label)}"${shape.end}`);
    } else if (isShapeNode(node)) {
      const shape = getMermaidShape(node.shape);
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

  return lines.join("\n");
}

/**
 * Export diagram document to Mermaid flowchart syntax
 */
export function exportToMermaid(document: DiagramDocument): string {
  return generateMermaid(
    document.canvasPage.nodes,
    document.canvasPage.connections,
    document.symbolsPage.symbol,
  );
}

/**
 * Export a specific frame to Mermaid flowchart syntax
 */
export function exportFrameToMermaid(
  frame: FrameNode,
  allNodes: DiagramNode[],
  allConnections: Connection[],
  symbolDef: SymbolDefinition | null,
): string {
  // Get child nodes within the frame
  const childNodeIds = new Set(frame.children);
  const childNodes = allNodes.filter((n) => childNodeIds.has(n.id));

  // Filter connections that are between child nodes
  const relevantConnections = allConnections.filter(
    (c) => childNodeIds.has(c.source.nodeId) && childNodeIds.has(c.target.nodeId),
  );

  return generateMermaid(childNodes, relevantConnections, symbolDef);
}
