/**
 * @file Markdown export for diagram documents
 */

import type { DiagramDocument, DiagramNode, ShapeNode, TextNode, GroupNode } from "../types";
import { exportToMermaid } from "./exportToMermaid";

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
 * Convert blob to data URL
 */
async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read blob as data URL"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Format date for export
 */
function formatDate(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Export diagram document to Markdown with Mermaid code block
 */
export async function exportToMarkdown(document: DiagramDocument): Promise<string> {
  const mermaid = exportToMermaid(document);

  const lines: string[] = [];

  // Header
  lines.push("# Diagram Export");
  lines.push("");
  lines.push(`> Generated on ${formatDate()}`);
  lines.push("");

  // Mermaid source
  lines.push("## Diagram");
  lines.push("");
  lines.push("```mermaid");
  lines.push(mermaid);
  lines.push("```");
  lines.push("");

  // Use canvas page for export
  const nodes = document.canvasPage.nodes;
  const connections = document.canvasPage.connections;

  // Statistics
  lines.push("## Statistics");
  lines.push("");
  lines.push(`- **Nodes**: ${nodes.length}`);
  lines.push(`- **Connections**: ${connections.length}`);
  lines.push(`- **Grid Size**: ${document.gridSize}px`);
  lines.push("");

  // Get groups for node list (groups are the top-level elements)
  const groups = nodes.filter(isGroupNode);
  const groupChildIds = new Set(groups.flatMap((g: GroupNode) => g.children));
  const standaloneShapes = nodes.filter(
    (n: DiagramNode) => isShapeNode(n) && !groupChildIds.has(n.id),
  );
  const exportableNodes = [...groups, ...standaloneShapes];

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

      // Get names from groups or use IDs
      const sourceName = sourceNode && isGroupNode(sourceNode)
        ? getGroupLabel(sourceNode, nodes) || conn.source.nodeId
        : conn.source.nodeId;
      const targetName = targetNode && isGroupNode(targetNode)
        ? getGroupLabel(targetNode, nodes) || conn.target.nodeId
        : conn.target.nodeId;
      const label = conn.label || "-";
      lines.push(`| ${sourceName} | ${targetName} | ${label} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
