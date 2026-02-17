/**
 * @file Diagram Editor mock data and shape library
 */

import type {
  DiagramDocument,
  DiagramNode,
  ShapeNode,
  TextNode,
  GroupNode,
  Connection,
  ShapeDefinition,
  DiagramTheme,
  TextProperties,
  ShapeType,
  SymbolInstance,
  SymbolDefinition,
  SymbolPart,
  ShapePart,
  TextPart,
  CanvasPage,
  SymbolsPage,
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
  canvasBackground: "#f5f5f5",
  gridColor: "#cccccc",
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
  type: ShapeType,
  x: number,
  y: number,
  width: number = 120,
  height: number = 80,
): ShapeNode {
  return {
    id: generateNodeId(),
    type,
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

/**
 * Legacy createNode for backward compatibility
 */
export function createNode(
  type: DiagramNode["type"],
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
  return createShapeNode(type as ShapeType, x, y, width, height);
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

// Canvas page: contains symbol instances and standalone nodes
const canvasPage: CanvasPage = {
  id: "canvas",
  name: "Canvas",
  nodes: [instance1, instance2, instance3, instance4, instance5],
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
