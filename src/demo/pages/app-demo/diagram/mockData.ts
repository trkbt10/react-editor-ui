/**
 * @file Diagram Editor mock data and shape library
 */

import type {
  DiagramDocument,
  DiagramNode,
  ShapeNode,
  TextNode,
  GroupNode,
  FrameNode,
  FramePreset,
  Connection,
  ShapeDefinition,
  DiagramTheme,
  TextProperties,
  ShapeType,
  NodeType,
  SymbolInstance,
  SymbolDefinition,
  SymbolPart,
  ShapePart,
  TextPart,
  CanvasPage,
  SymbolsPage,
  TableNode,
  TableCell,
} from "./types";

// =============================================================================
// Shape Library
// =============================================================================

export const shapeLibrary: ShapeDefinition[] = [
  // Basic shapes
  { type: "rectangle", label: "Rectangle", category: "basic", defaultWidth: 120, defaultHeight: 80 },
  { type: "rounded-rect", label: "Rounded Rectangle", category: "basic", defaultWidth: 120, defaultHeight: 80 },
  { type: "ellipse", label: "Ellipse", category: "basic", defaultWidth: 120, defaultHeight: 80 },
  { type: "triangle", label: "Triangle", category: "basic", defaultWidth: 100, defaultHeight: 100 },
  { type: "hexagon", label: "Hexagon", category: "basic", defaultWidth: 100, defaultHeight: 90 },

  // Flowchart shapes
  { type: "diamond", label: "Decision", category: "flowchart", defaultWidth: 100, defaultHeight: 100 },
  { type: "parallelogram", label: "Input/Output", category: "flowchart", defaultWidth: 120, defaultHeight: 60 },
  { type: "cylinder", label: "Database", category: "flowchart", defaultWidth: 80, defaultHeight: 100 },

  // Text
  { type: "text", label: "Text", category: "basic", defaultWidth: 100, defaultHeight: 30 },

  // Table
  { type: "table", label: "Table", category: "misc", defaultWidth: 300, defaultHeight: 128 },
];

// =============================================================================
// Frame Presets
// =============================================================================

export type FramePresetInfo = {
  width: number;
  height: number;
  label: string;
  category: "paper" | "business" | "web" | "custom";
};

export const framePresets: Record<FramePreset, FramePresetInfo> = {
  // Paper
  "a3": { width: 1123, height: 1587, label: "A3", category: "paper" },
  "a4": { width: 794, height: 1123, label: "A4", category: "paper" },
  "a5": { width: 559, height: 794, label: "A5", category: "paper" },
  // Business
  "business-card": { width: 252, height: 168, label: "名刺", category: "business" },
  // Web / SNS
  "instagram-square": { width: 1080, height: 1080, label: "Instagram", category: "web" },
  "instagram-story": { width: 1080, height: 1920, label: "Instagram Story", category: "web" },
  "twitter-header": { width: 1500, height: 500, label: "Twitter Header", category: "web" },
  "web-1920": { width: 1920, height: 1080, label: "Desktop (1920)", category: "web" },
  "web-1440": { width: 1440, height: 900, label: "Laptop (1440)", category: "web" },
  // Custom
  "custom": { width: 800, height: 600, label: "カスタム", category: "custom" },
};

export const framePresetCategories = [
  { id: "paper", label: "紙サイズ", presets: ["a3", "a4", "a5"] as FramePreset[] },
  { id: "business", label: "ビジネス", presets: ["business-card"] as FramePreset[] },
  { id: "web", label: "Web / SNS", presets: ["instagram-square", "instagram-story", "twitter-header", "web-1920", "web-1440"] as FramePreset[] },
  { id: "custom", label: "その他", presets: ["custom"] as FramePreset[] },
];

// =============================================================================
// Default Values
// =============================================================================

export const defaultFill = {
  hex: "#ffffff",
  opacity: 100,
  visible: true,
};

export const defaultStroke = {
  color: { hex: "#333333", opacity: 100, visible: true },
  width: 2,
  style: "solid" as const,
};

export const defaultTextProps: TextProperties = {
  fontSize: 14,
  fontWeight: "normal",
  textAlign: "center",
  color: { hex: "#333333", opacity: 100, visible: true },
};

export const defaultTheme: DiagramTheme = {
  defaultNodeFill: { hex: "#ffffff", opacity: 100, visible: true },
  defaultNodeStroke: {
    color: { hex: "#333333", opacity: 100, visible: true },
    width: 2,
    style: "solid",
  },
  defaultConnectionStroke: {
    color: { hex: "#333333", opacity: 100, visible: true },
    width: 2,
    style: "solid",
  },
  defaultConnectionArrow: "arrow",
  canvasBackground: { hex: "#f5f5f5", opacity: 100, visible: true },
  gridColor: { hex: "#cccccc", opacity: 100, visible: true },
};

// =============================================================================
// Helper Functions
// =============================================================================

let nodeIdCounter = 0;
let connectionIdCounter = 0;
let partIdCounter = 0;

export function generateNodeId(): string {
  nodeIdCounter += 1;
  return `node-${nodeIdCounter}`;
}

export function generateConnectionId(): string {
  connectionIdCounter += 1;
  return `conn-${connectionIdCounter}`;
}

export function generatePartId(): string {
  partIdCounter += 1;
  return `part-${partIdCounter}`;
}

/**
 * Create a shape node
 */
export function createShapeNode(
  shape: ShapeType,
  x: number,
  y: number,
  width: number = 120,
  height: number = 80,
): ShapeNode {
  return {
    id: generateNodeId(),
    type: "shape",
    shape,
    x,
    y,
    width,
    height,
    rotation: 0,
    fill: { ...defaultFill },
    stroke: {
      color: { ...defaultStroke.color },
      width: defaultStroke.width,
      style: defaultStroke.style,
    },
  };
}

/**
 * Create a text node
 */
export function createTextNode(
  x: number,
  y: number,
  content: string = "Text",
  width: number = 100,
  height: number = 30,
): TextNode {
  return {
    id: generateNodeId(),
    type: "text",
    x,
    y,
    width,
    height,
    rotation: 0,
    content,
    textProps: { ...defaultTextProps },
  };
}

/**
 * Create a group node with children
 */
export function createGroupNode(
  x: number,
  y: number,
  width: number,
  height: number,
  children: string[],
): GroupNode {
  return {
    id: generateNodeId(),
    type: "group",
    x,
    y,
    width,
    height,
    rotation: 0,
    children,
  };
}

/**
 * Create a frame node with preset size
 */
export function createFrameNode(
  preset: FramePreset,
  x: number,
  y: number,
): FrameNode {
  const size = framePresets[preset];
  return {
    id: generateNodeId(),
    type: "frame",
    preset,
    x,
    y,
    width: size.width,
    height: size.height,
    rotation: 0,
    fill: { hex: "#ffffff", opacity: 100, visible: true },
    stroke: { color: { hex: "#e0e0e0", opacity: 100, visible: true }, width: 1, style: "solid" },
    children: [],
    clipContent: true,
    showBackground: true,
  };
}

/**
 * Create a frame node with custom size (for drawing mode)
 */
export function createFrameNodeCustom(
  x: number,
  y: number,
  width: number,
  height: number,
): FrameNode {
  return {
    id: generateNodeId(),
    type: "frame",
    preset: "custom",
    x,
    y,
    width,
    height,
    rotation: 0,
    fill: { hex: "#ffffff", opacity: 100, visible: true },
    stroke: { color: { hex: "#e0e0e0", opacity: 100, visible: true }, width: 1, style: "solid" },
    children: [],
    clipContent: true,
    showBackground: true,
  };
}

/**
 * Create a table node
 */
export function createTableNode(
  x: number,
  y: number,
  rows: number = 3,
  columns: number = 3,
  width?: number,
  height?: number,
): TableNode {
  const defaultColumnWidth = 100;
  const defaultRowHeight = 32;

  // Create empty cells
  const cells: TableCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => ({
      content: "",
    })),
  );

  // Column widths
  const columnWidths = Array.from({ length: columns }, () => defaultColumnWidth);

  // Row heights
  const rowHeights = Array.from({ length: rows }, () => defaultRowHeight);

  // Calculate dimensions if not provided
  const tableWidth = width ?? columnWidths.reduce((sum, w) => sum + w, 0);
  const tableHeight = height ?? rowHeights.reduce((sum, h) => sum + h, 0);

  return {
    id: generateNodeId(),
    type: "table",
    x,
    y,
    width: tableWidth,
    height: tableHeight,
    rotation: 0,
    cells,
    columnWidths,
    rowHeights,
    stroke: {
      color: { ...defaultStroke.color },
      width: 1,
      style: "solid",
    },
    hasHeaderRow: true,
    defaultTextProps: { ...defaultTextProps },
  };
}

/**
 * Create a shape part for symbol definition
 */
export function createShapePart(
  name: string,
  shape: ShapeType,
  fill = defaultFill,
  stroke = defaultStroke,
): ShapePart {
  return {
    id: generatePartId(),
    name,
    type: "shape",
    shape,
    fill: { ...fill },
    stroke: {
      color: { ...stroke.color },
      width: stroke.width,
      style: stroke.style,
    },
  };
}

/**
 * Create a text part for symbol definition
 */
export function createTextPart(
  name: string,
  content: string = "",
  textProps = defaultTextProps,
): TextPart {
  return {
    id: generatePartId(),
    name,
    type: "text",
    content,
    textProps: { ...textProps },
  };
}

/** Set of valid shape types for type checking */
const shapeTypes = new Set<string>([
  "rectangle",
  "ellipse",
  "diamond",
  "parallelogram",
  "rounded-rect",
  "cylinder",
  "hexagon",
  "triangle",
]);

/**
 * Create a node from a NodeType (ShapeType | "text" | "group" | ...)
 */
export function createNode(
  type: NodeType,
  x: number,
  y: number,
  width: number = 120,
  height: number = 80,
): DiagramNode {
  if (type === "text") {
    return createTextNode(x, y, "Text", width, height);
  }
  if (type === "group") {
    return createGroupNode(x, y, width, height, []);
  }
  if (type === "instance") {
    // Cannot create instance without symbolId
    return createGroupNode(x, y, width, height, []);
  }
  if (type === "table") {
    // Calculate rows/columns from size
    const cols = Math.max(2, Math.round(width / 100));
    const rows = Math.max(2, Math.round(height / 32));
    return createTableNode(x, y, rows, cols, width, height);
  }
  if (shapeTypes.has(type)) {
    return createShapeNode(type as ShapeType, x, y, width, height);
  }
  // Fallback to rectangle
  return createShapeNode("rectangle", x, y, width, height);
}

export function createConnection(
  sourceNodeId: string,
  sourcePosition: Connection["source"]["position"],
  targetNodeId: string,
  targetPosition: Connection["target"]["position"],
): Connection {
  return {
    id: generateConnectionId(),
    source: { nodeId: sourceNodeId, position: sourcePosition },
    target: { nodeId: targetNodeId, position: targetPosition },
    stroke: {
      color: { hex: "#333333", opacity: 100, visible: true },
      width: 2,
      style: "solid",
    },
    startArrow: "none",
    endArrow: "arrow",
    label: "",
  };
}

/**
 * Create a symbol instance referencing a symbol definition with variant
 */
export function createSymbolInstance(
  symbolId: string,
  variantId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  partOverrides?: Record<string, Partial<SymbolPart>>,
): SymbolInstance {
  return {
    id: generateNodeId(),
    type: "instance",
    symbolId,
    variantId,
    x,
    y,
    width,
    height,
    rotation: 0,
    partOverrides,
  };
}

// =============================================================================
// Symbol Definition (Flowchart Node)
// =============================================================================

// Create parts for the flowchart symbol
const backgroundPart = createShapePart("background", "rectangle");
const labelPart = createTextPart("label", "");

// Single symbol definition with variants
const flowchartSymbol: SymbolDefinition = {
  id: "symbol-flowchart",
  name: "FlowchartNode",
  width: 140,
  height: 60,
  parts: [backgroundPart, labelPart],
  variants: {
    start: {
      name: "Start",
      parts: {
        [backgroundPart.id]: {
          shape: "rounded-rect",
          fill: { hex: "#e8f5e9", opacity: 100, visible: true },
        },
        [labelPart.id]: {
          content: "Start",
        },
      },
    },
    process: {
      name: "Process",
      parts: {
        [backgroundPart.id]: {
          shape: "rectangle",
          fill: { hex: "#ffffff", opacity: 100, visible: true },
        },
        [labelPart.id]: {
          content: "Process",
        },
      },
    },
    decision: {
      name: "Decision",
      parts: {
        [backgroundPart.id]: {
          shape: "diamond",
          fill: { hex: "#fff3e0", opacity: 100, visible: true },
        },
        [labelPart.id]: {
          content: "Decision?",
        },
      },
    },
    end: {
      name: "End",
      parts: {
        [backgroundPart.id]: {
          shape: "rounded-rect",
          fill: { hex: "#ffebee", opacity: 100, visible: true },
        },
        [labelPart.id]: {
          content: "End",
        },
      },
    },
    database: {
      name: "Database",
      parts: {
        [backgroundPart.id]: {
          shape: "cylinder",
          fill: { hex: "#e3f2fd", opacity: 100, visible: true },
        },
        [labelPart.id]: {
          content: "Database",
        },
      },
    },
  },
};

// =============================================================================
// Initial Document
// =============================================================================

// Create instances for canvas (referencing symbol + variant)
const instance1 = createSymbolInstance(flowchartSymbol.id, "start", 100, 100, 140, 60);
const instance2 = createSymbolInstance(flowchartSymbol.id, "process", 100, 220, 140, 60);
const instance3 = createSymbolInstance(flowchartSymbol.id, "decision", 90, 340, 160, 100);
const instance4 = createSymbolInstance(flowchartSymbol.id, "process", 300, 340, 120, 60, {
  // Override the label content for this instance
  [labelPart.id]: { content: "Action A" },
});
const instance5 = createSymbolInstance(flowchartSymbol.id, "end", 100, 500, 140, 60);

// Create a frame to contain the flowchart (with children)
const flowchartFrame: FrameNode = {
  ...createFrameNode("a4", 50, 50),
  children: [instance1.id, instance2.id, instance3.id, instance4.id, instance5.id],
};

// Canvas page: contains symbol instances and standalone nodes
const canvasPage: CanvasPage = {
  id: "canvas",
  name: "Canvas",
  nodes: [flowchartFrame, instance1, instance2, instance3, instance4, instance5],
  connections: [
    createConnection(instance1.id, "bottom", instance2.id, "top"),
    createConnection(instance2.id, "bottom", instance3.id, "top"),
    createConnection(instance3.id, "right", instance4.id, "left"),
    createConnection(instance3.id, "bottom", instance5.id, "top"),
  ],
};

// Symbols page: contains the single symbol definition
const symbolsPage: SymbolsPage = {
  id: "symbols",
  name: "Symbols",
  symbol: flowchartSymbol,
};

export const initialDocument: DiagramDocument = {
  canvasPage,
  symbolsPage,
  activePageId: "canvas",
  gridSize: 20,
  theme: { ...defaultTheme },
};
