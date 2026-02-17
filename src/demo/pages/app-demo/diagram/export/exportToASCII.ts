/**
 * @file ASCII export for diagram documents
 */

import type {
  DiagramDocument,
  DiagramNode,
  ShapeNode,
  TextNode,
  GroupNode,
  FrameNode,
  Connection,
  ShapeType,
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
// ASCII Box Drawing
// =============================================================================

type BoxStyle = {
  tl: string; // top-left
  tr: string; // top-right
  bl: string; // bottom-left
  br: string; // bottom-right
  h: string;  // horizontal
  v: string;  // vertical
};

const RECTANGLE_BOX: BoxStyle = {
  tl: "┌",
  tr: "┐",
  bl: "└",
  br: "┘",
  h: "─",
  v: "│",
};

const ROUNDED_BOX: BoxStyle = {
  tl: "╭",
  tr: "╮",
  bl: "╰",
  br: "╯",
  h: "─",
  v: "│",
};

const DOUBLE_BOX: BoxStyle = {
  tl: "╔",
  tr: "╗",
  bl: "╚",
  br: "╝",
  h: "═",
  v: "║",
};

function getBoxStyle(shapeType: ShapeType | "group" | "instance"): BoxStyle {
  switch (shapeType) {
    case "rounded-rect":
    case "ellipse":
      return ROUNDED_BOX;
    case "diamond":
    case "hexagon":
      return DOUBLE_BOX;
    default:
      return RECTANGLE_BOX;
  }
}

function drawBox(label: string, style: BoxStyle, minWidth = 10): string[] {
  const labelLines = label.split("\n").map((l) => l.trim());
  const maxLabelWidth = Math.max(...labelLines.map((l) => l.length), minWidth - 4);
  const boxWidth = maxLabelWidth + 4;

  const lines: string[] = [];

  // Top border
  lines.push(style.tl + style.h.repeat(boxWidth - 2) + style.tr);

  // Content with padding
  for (const labelLine of labelLines) {
    const paddedLabel = labelLine.padStart(
      Math.floor((maxLabelWidth + labelLine.length) / 2),
    ).padEnd(maxLabelWidth);
    lines.push(`${style.v} ${paddedLabel} ${style.v}`);
  }

  // Bottom border
  lines.push(style.bl + style.h.repeat(boxWidth - 2) + style.br);

  return lines;
}

function drawDiamond(label: string, minWidth = 12): string[] {
  const labelLines = label.split("\n").map((l) => l.trim());
  const maxLabelWidth = Math.max(...labelLines.map((l) => l.length), 4);
  const width = Math.max(maxLabelWidth + 6, minWidth);
  const halfWidth = Math.floor(width / 2);

  const lines: string[] = [];

  // Top half
  for (let i = 0; i < halfWidth; i++) {
    const spaces = " ".repeat(halfWidth - i - 1);
    const innerWidth = i * 2 + 1;
    if (innerWidth <= 1) {
      lines.push(spaces + "/\\");
    } else {
      lines.push(spaces + "/" + " ".repeat(innerWidth) + "\\");
    }
  }

  // Label in center
  for (const labelLine of labelLines) {
    const paddedLabel = labelLine.padStart(
      Math.floor((width - 2 + labelLine.length) / 2),
    ).padEnd(width - 2);
    lines.push(`<${paddedLabel}>`);
  }

  // Bottom half
  for (let i = halfWidth - 1; i >= 0; i--) {
    const spaces = " ".repeat(halfWidth - i - 1);
    const innerWidth = i * 2 + 1;
    if (innerWidth <= 1) {
      lines.push(spaces + "\\/");
    } else {
      lines.push(spaces + "\\" + " ".repeat(innerWidth) + "/");
    }
  }

  return lines;
}

// =============================================================================
// Grid Layout
// =============================================================================

type AsciiNode = {
  id: string;
  label: string;
  shapeType: ShapeType | "group" | "instance";
  x: number;
  y: number;
  width: number;
  height: number;
};

type AsciiConnection = {
  fromId: string;
  toId: string;
  label?: string;
};

function layoutNodes(nodes: AsciiNode[]): { grid: string[][]; nodePositions: Map<string, { row: number; col: number; width: number; height: number }> } {
  if (nodes.length === 0) {
    return { grid: [[" "]], nodePositions: new Map() };
  }

  // Sort by y then x for consistent layout
  const sortedNodes = [...nodes].sort((a, b) => {
    if (Math.abs(a.y - b.y) < 50) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  // Group nodes by approximate row
  const rows: AsciiNode[][] = [];
  const rowY: number[] = [];

  for (const node of sortedNodes) {
    const existingRowIndex = rowY.findIndex((y) => Math.abs(y - node.y) < 80);
    if (existingRowIndex >= 0) {
      rows[existingRowIndex].push(node);
    } else {
      rows.push([node]);
      rowY.push(node.y);
    }
  }

  // Sort nodes within each row by x
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
  }

  // Build the grid
  const nodePositions = new Map<string, { row: number; col: number; width: number; height: number }>();
  const grid: string[][] = [];
  const nodeSpacing = 4;
  const rowSpacing = 2;

  let currentRow = 0;

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const rowNodes = rows[rowIdx];
    const rowBoxes: string[][][] = [];
    let maxHeight = 0;

    // Draw each node in this row
    for (const node of rowNodes) {
      let box: string[];
      if (node.shapeType === "diamond") {
        box = drawDiamond(node.label);
      } else {
        const style = getBoxStyle(node.shapeType);
        box = drawBox(node.label, style);
      }
      rowBoxes.push(box.map((line) => line.split("")));
      maxHeight = Math.max(maxHeight, box.length);
    }

    // Add row spacing
    if (rowIdx > 0) {
      for (let i = 0; i < rowSpacing; i++) {
        grid.push([]);
        currentRow++;
      }
    }

    const startRow = currentRow;

    // Initialize grid rows for this node row
    for (let i = 0; i < maxHeight; i++) {
      grid.push([]);
    }

    // Place each node box
    let currentCol = 0;
    for (let nodeIdx = 0; nodeIdx < rowNodes.length; nodeIdx++) {
      const node = rowNodes[nodeIdx];
      const box = rowBoxes[nodeIdx];
      const boxHeight = box.length;
      const boxWidth = box[0]?.length ?? 0;

      // Add spacing between nodes
      if (nodeIdx > 0) {
        currentCol += nodeSpacing;
      }

      // Record node position (center)
      nodePositions.set(node.id, {
        row: startRow + Math.floor(boxHeight / 2),
        col: currentCol + Math.floor(boxWidth / 2),
        width: boxWidth,
        height: boxHeight,
      });

      // Place box in grid
      for (let lineIdx = 0; lineIdx < boxHeight; lineIdx++) {
        const gridRow = grid[startRow + lineIdx];
        // Pad grid row to current column
        while (gridRow.length < currentCol) {
          gridRow.push(" ");
        }
        // Add box line
        for (const char of box[lineIdx]) {
          gridRow.push(char);
        }
      }

      currentCol += boxWidth;
    }

    currentRow += maxHeight;
  }

  return { grid, nodePositions };
}

function drawConnections(
  grid: string[][],
  connections: AsciiConnection[],
  nodePositions: Map<string, { row: number; col: number; width: number; height: number }>,
): void {
  for (const conn of connections) {
    const from = nodePositions.get(conn.fromId);
    const to = nodePositions.get(conn.toId);

    if (!from || !to) continue;

    // Simple vertical connection for nodes in different rows
    if (from.row !== to.row) {
      const startRow = from.row + Math.floor(from.height / 2);
      const endRow = to.row - Math.floor(to.height / 2);
      const col = from.col;

      // Ensure grid has enough columns
      for (let row = startRow; row <= endRow; row++) {
        if (!grid[row]) grid[row] = [];
        while (grid[row].length <= col) {
          grid[row].push(" ");
        }
      }

      // Draw vertical line
      for (let row = startRow + 1; row < endRow; row++) {
        if (grid[row][col] === " ") {
          grid[row][col] = "│";
        }
      }

      // Add arrow
      if (endRow > startRow && grid[endRow - 1]) {
        grid[endRow - 1][col] = "▼";
      }
    }
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

function getGroupLabel(group: GroupNode, nodes: DiagramNode[]): string {
  for (const childId of group.children) {
    const child = nodes.find((n) => n.id === childId);
    if (child && isTextNode(child)) {
      return child.content;
    }
  }
  return "";
}

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
 * Core function to generate ASCII from nodes and connections
 */
function generateASCII(
  nodes: DiagramNode[],
  connections: Connection[],
  title: string,
  symbolDef: SymbolDefinition | null,
): string {
  // Get groups for export
  const groups = nodes.filter(isGroupNode);
  // Get symbol instances
  const instances = nodes.filter(isSymbolInstance);
  const groupChildIds = new Set(groups.flatMap((g: GroupNode) => g.children));
  const standaloneShapes = nodes.filter(
    (n: DiagramNode) => isShapeNode(n) && !groupChildIds.has(n.id),
  );

  const exportableNodes = [...groups, ...instances, ...standaloneShapes];

  if (exportableNodes.length === 0) {
    return [
      "┌─────────────────┐",
      "│  Empty diagram  │",
      "└─────────────────┘",
    ].join("\n");
  }

  // Convert to ASCII nodes
  const asciiNodes: AsciiNode[] = exportableNodes.map((node) => {
    if (isGroupNode(node)) {
      return {
        id: node.id,
        label: getGroupLabel(node, nodes) || node.id,
        shapeType: getGroupShapeType(node, nodes),
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
      };
    }
    if (isSymbolInstance(node)) {
      return {
        id: node.id,
        label: getInstanceLabel(node, symbolDef),
        shapeType: getInstanceShapeType(node, symbolDef),
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
      };
    }
    return {
      id: node.id,
      label: node.id,
      shapeType: (node as ShapeNode).type,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
    };
  });

  // Convert connections
  const asciiConnections: AsciiConnection[] = connections.map((conn: Connection) => ({
    fromId: conn.source.nodeId,
    toId: conn.target.nodeId,
    label: conn.label,
  }));

  // Layout nodes and get positions
  const { grid, nodePositions } = layoutNodes(asciiNodes);

  // Draw connections
  drawConnections(grid, asciiConnections, nodePositions);

  // Convert grid to string
  const lines = grid.map((row) => row.join(""));

  // Build output with header
  const output: string[] = [];
  output.push("╔" + "═".repeat(60) + "╗");
  output.push("║" + `  ${title}`.padEnd(60) + "║");
  output.push("╠" + "═".repeat(60) + "╣");
  output.push("║" + `  Nodes: ${exportableNodes.length}  Connections: ${connections.length}`.padEnd(60) + "║");
  output.push("╚" + "═".repeat(60) + "╝");
  output.push("");
  output.push(...lines);

  // Add connection legend if there are connections
  if (connections.length > 0) {
    output.push("");
    output.push("Connections:");
    for (const conn of connections) {
      const sourceNode = nodes.find((n: DiagramNode) => n.id === conn.source.nodeId);
      const targetNode = nodes.find((n: DiagramNode) => n.id === conn.target.nodeId);

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

      const labelPart = conn.label ? ` [${conn.label}]` : "";
      output.push(`  ${sourceName} --> ${targetName}${labelPart}`);
    }
  }

  return output.join("\n");
}

/**
 * Export diagram document to ASCII art
 */
export function exportToASCII(document: DiagramDocument): string {
  return generateASCII(
    document.canvasPage.nodes,
    document.canvasPage.connections,
    "Diagram (ASCII Export)",
    document.symbolsPage.symbol,
  );
}

/**
 * Export a specific frame to ASCII art
 */
export function exportFrameToASCII(
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

  return generateASCII(
    childNodes,
    relevantConnections,
    `Frame: ${frame.preset} (ASCII Export)`,
    symbolDef,
  );
}
