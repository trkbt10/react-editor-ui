/**
 * @file Markdown export for diagram documents
 */

import type {
  DiagramDocument,
  DiagramNode,
  ShapeNode,
  TextNode,
  GroupNode,
  FrameNode,
  Connection,
  SymbolInstance,
  SymbolDefinition,
  TextPart,
} from "../types";
import { exportToMermaid, exportFrameToMermaid } from "./exportToMermaid";

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
function getGroupShapeType(group: GroupNode, nodes: DiagramNode[]): string {
  for (const childId of group.children) {
    const child = nodes.find((n) => n.id === childId);
    if (child && isShapeNode(child)) {
      return child.type;
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
): string {
  if (!symbolDef) return "instance";

  const variant = symbolDef.variants[instance.variantId];
  if (!variant) return "instance";

  // Find the shape part
  const shapePart = symbolDef.parts.find((p) => p.type === "shape");
  if (!shapePart || shapePart.type !== "shape") return "instance";

  // Check variant override for shape type
  const variantOverride = variant.parts[shapePart.id];
  if (variantOverride && "shape" in variantOverride) {
    return variantOverride.shape as string;
  }

  return shapePart.shape;
}

/**
 * Format date for export
 */
function formatDate(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Core function to generate Markdown from nodes and connections
 */
function generateMarkdown(
  nodes: DiagramNode[],
  connections: Connection[],
  mermaidContent: string,
  title: string,
  symbolDef: SymbolDefinition | null,
): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(`> Generated on ${formatDate()}`);
  lines.push("");

  // Mermaid source
  lines.push("## Diagram");
  lines.push("");
  lines.push("```mermaid");
  lines.push(mermaidContent);
  lines.push("```");
  lines.push("");

  // Get groups for node list (groups are the top-level elements)
  const groups = nodes.filter(isGroupNode);
  const instances = nodes.filter(isSymbolInstance);
  const groupChildIds = new Set(groups.flatMap((g: GroupNode) => g.children));
  const standaloneShapes = nodes.filter(
    (n: DiagramNode) => isShapeNode(n) && !groupChildIds.has(n.id),
  );
  const exportableNodes = [...groups, ...instances, ...standaloneShapes];

  // Statistics
  lines.push("## Statistics");
  lines.push("");
  lines.push(`- **Nodes**: ${exportableNodes.length}`);
  lines.push(`- **Connections**: ${connections.length}`);
  lines.push("");

  // Node list
  if (exportableNodes.length > 0) {
    lines.push("## Nodes");
    lines.push("");
    lines.push("| ID | Type | Label |");
    lines.push("|---|---|---|");
    for (const node of exportableNodes) {
      if (isGroupNode(node)) {
        const shapeType = getGroupShapeType(node, nodes);
        const label = getGroupLabel(node, nodes) || "(no label)";
        lines.push(`| ${node.id} | ${shapeType} | ${label} |`);
      } else if (isSymbolInstance(node)) {
        const shapeType = getInstanceShapeType(node, symbolDef);
        const label = getInstanceLabel(node, symbolDef);
        lines.push(`| ${node.id} | ${shapeType} | ${label} |`);
      } else if (isShapeNode(node)) {
        lines.push(`| ${node.id} | ${node.type} | (no label) |`);
      }
    }
    lines.push("");
  }

  // Connection list
  if (connections.length > 0) {
    lines.push("## Connections");
    lines.push("");
    lines.push("| From | To | Label |");
    lines.push("|---|---|---|");
    for (const conn of connections) {
      const sourceNode = nodes.find((n: DiagramNode) => n.id === conn.source.nodeId);
      const targetNode = nodes.find((n: DiagramNode) => n.id === conn.target.nodeId);

      // Get names from groups, instances, or use IDs
      let sourceName = conn.source.nodeId;
      if (sourceNode && isGroupNode(sourceNode)) {
        sourceName = getGroupLabel(sourceNode, nodes) || conn.source.nodeId;
      } else if (sourceNode && isSymbolInstance(sourceNode)) {
        sourceName = getInstanceLabel(sourceNode, symbolDef);
      }

      let targetName = conn.target.nodeId;
      if (targetNode && isGroupNode(targetNode)) {
        targetName = getGroupLabel(targetNode, nodes) || conn.target.nodeId;
      } else if (targetNode && isSymbolInstance(targetNode)) {
        targetName = getInstanceLabel(targetNode, symbolDef);
      }

      const label = conn.label || "-";
      lines.push(`| ${sourceName} | ${targetName} | ${label} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Export diagram document to Markdown with Mermaid code block
 */
export async function exportToMarkdown(document: DiagramDocument): Promise<string> {
  const mermaid = exportToMermaid(document);
  return generateMarkdown(
    document.canvasPage.nodes,
    document.canvasPage.connections,
    mermaid,
    "Diagram Export",
    document.symbolsPage.symbol,
  );
}

/**
 * Export a specific frame to Markdown with Mermaid code block
 */
export function exportFrameToMarkdown(
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

  const mermaid = exportFrameToMermaid(frame, allNodes, allConnections, symbolDef);
  return generateMarkdown(
    childNodes,
    relevantConnections,
    mermaid,
    `Frame: ${frame.preset}`,
    symbolDef,
  );
}
