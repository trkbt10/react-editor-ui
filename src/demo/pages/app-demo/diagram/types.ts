/**
 * @file Diagram Editor type definitions
 */

import type { ColorValue } from "../../../../utils/color/types";

// =============================================================================
// Basic Types
// =============================================================================

export type ShapeType =
  | "rectangle"
  | "ellipse"
  | "diamond"
  | "parallelogram"
  | "rounded-rect"
  | "cylinder"
  | "hexagon"
  | "triangle";

export type StrokeStyle = "solid" | "dashed" | "dotted";

export type JoinType = "miter" | "round" | "bevel";

export type WidthProfile = "uniform" | "taper-start" | "taper-end" | "taper-both" | "pressure";

export type BrushType = "smooth" | "rough" | "spray";

export type BrushDirection = "left" | "right";

export type NodeStroke = {
  color: ColorValue;
  width: number;
  style: StrokeStyle;
  // Advanced stroke settings (optional)
  widthProfile?: WidthProfile;
  join?: JoinType;
  miterAngle?: number;
  // Dynamic stroke settings
  frequency?: number;
  wiggle?: number;
  smoothen?: number;
  // Brush settings
  brushType?: BrushType;
  brushDirection?: BrushDirection;
  brushWidthProfile?: WidthProfile;
};

export type TextAlign = "left" | "center" | "right";

export type VerticalAlign = "top" | "middle" | "bottom";

export type TextProperties = {
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: TextAlign;
  verticalAlign: VerticalAlign;
  color: ColorValue;
};

// =============================================================================
// Symbol Parts (editable/replaceable units)
// =============================================================================

type BasePartProps = {
  id: string;
  name: string; // "background", "label", "icon"
};

export type ShapePart = BasePartProps & {
  type: "shape";
  shape: ShapeType;
  fill: ColorValue;
  stroke: NodeStroke;
};

export type TextPart = BasePartProps & {
  type: "text";
  content: string;
  textProps: TextProperties;
};

export type SymbolPart = ShapePart | TextPart;

// =============================================================================
// Symbol Definition (template on Symbols page)
// =============================================================================

export type SymbolVariant = {
  name: string;
  /** Part overrides/replacements keyed by part ID */
  parts: Record<string, Partial<SymbolPart>>;
};

export type SymbolDefinition = {
  id: string;
  name: string; // "FlowchartNode"
  width: number;
  height: number;
  /** Parts list (render order) */
  parts: SymbolPart[];
  /** Variant definitions */
  variants: Record<string, SymbolVariant>;
};

// =============================================================================
// Symbol Instance (on Canvas page)
// =============================================================================

export type SymbolInstance = {
  id: string;
  type: "instance";
  symbolId: string;
  variantId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  /** Local part overrides */
  partOverrides?: Record<string, Partial<SymbolPart>>;
};

// =============================================================================
// Legacy Node Types (for standalone shapes/text not in symbols)
// =============================================================================

export type NodeType = ShapeType | "text" | "group" | "instance" | "frame" | "table";

// =============================================================================
// Frame Types
// =============================================================================

export type FramePreset =
  // Paper sizes (96 DPI)
  | "a4"             // 794 × 1123
  | "a3"             // 1123 × 1587
  | "a5"             // 559 × 794
  // Business
  | "business-card"  // 252 × 168 (3.5" × 2")
  // Web / SNS
  | "instagram-square"   // 1080 × 1080
  | "instagram-story"    // 1080 × 1920
  | "twitter-header"     // 1500 × 500
  | "web-1920"           // 1920 × 1080
  | "web-1440"           // 1440 × 900
  // Custom
  | "custom";

type BaseNodeProps = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

// =============================================================================
// Table Types
// =============================================================================

export type TableCell = {
  content: string;
  textProps?: Partial<TextProperties>;
};

export type TableNode = BaseNodeProps & {
  type: "table";
  cells: TableCell[][];
  columnWidths: number[];
  rowHeights: number[];
  stroke: NodeStroke;
  hasHeaderRow: boolean;
  defaultTextProps: TextProperties;
};

export type ShapeNode = BaseNodeProps & {
  type: "shape";
  shape: ShapeType;
  fill: ColorValue;
  stroke: NodeStroke;
};

export type TextNode = BaseNodeProps & {
  type: "text";
  content: string;
  textProps: TextProperties;
};

export type GroupNode = BaseNodeProps & {
  type: "group";
  /** Child node IDs or instance IDs */
  children: string[];
};

export type FrameNode = BaseNodeProps & {
  type: "frame";
  preset: FramePreset;
  fill: ColorValue;
  stroke: NodeStroke;
  /** Child node IDs */
  children: string[];
  /** Whether to clip child content */
  clipContent: boolean;
  /** Whether to show the background fill */
  showBackground: boolean;
};

/**
 * Union type for all diagram nodes
 */
export type DiagramNode = ShapeNode | TextNode | GroupNode | FrameNode | SymbolInstance | TableNode;

// =============================================================================
// Connection Types
// =============================================================================

export type ConnectionPosition = "top" | "right" | "bottom" | "left" | "center";

export type ConnectionPoint = {
  nodeId: string;
  position: ConnectionPosition;
};

export type ArrowheadType = "none" | "arrow" | "triangle" | "diamond" | "circle";

export type Connection = {
  id: string;
  source: ConnectionPoint;
  target: ConnectionPoint;
  stroke: NodeStroke;
  startArrow: ArrowheadType;
  endArrow: ArrowheadType;
  label: string;
};

// =============================================================================
// Theme
// =============================================================================

export type DiagramTheme = {
  defaultNodeFill: ColorValue;
  defaultNodeStroke: NodeStroke;
  defaultConnectionStroke: NodeStroke;
  defaultConnectionArrow: ArrowheadType;
  canvasBackground: ColorValue;
  gridColor: ColorValue;
};

// =============================================================================
// Page Types
// =============================================================================

export type PageId = "canvas" | "symbols";

/**
 * Canvas page - contains instances and standalone nodes
 */
export type CanvasPage = {
  id: "canvas";
  name: string;
  nodes: DiagramNode[];
  connections: Connection[];
};

/**
 * Symbols page - contains the single symbol definition
 */
export type SymbolsPage = {
  id: "symbols";
  name: string;
  symbol: SymbolDefinition | null;
};

export type DiagramPage = CanvasPage | SymbolsPage;

/**
 * Check if a node is a symbol instance
 */
export function isSymbolInstance(node: DiagramNode): node is SymbolInstance {
  return node.type === "instance";
}

/**
 * Type guard for shape nodes
 */
export function isShapeNode(node: DiagramNode): node is ShapeNode {
  return node.type === "shape";
}

/**
 * Type guard for table nodes
 */
export function isTableNode(node: DiagramNode): node is TableNode {
  return node.type === "table";
}

/**
 * Type guard for text nodes
 */
export function isTextNode(node: DiagramNode): node is TextNode {
  return node.type === "text";
}

/**
 * Type guard for group nodes
 */
export function isGroupNode(node: DiagramNode): node is GroupNode {
  return node.type === "group";
}

/**
 * Type guard for frame nodes
 */
export function isFrameNode(node: DiagramNode): node is FrameNode {
  return node.type === "frame";
}

// =============================================================================
// Document
// =============================================================================

export type DiagramDocument = {
  /** Main canvas page */
  canvasPage: CanvasPage;
  /** Symbols page (definition) */
  symbolsPage: SymbolsPage;
  /** Currently active page */
  activePageId: PageId;
  gridSize: number;
  theme: DiagramTheme;
};

// =============================================================================
// Tool Types
// =============================================================================

export type ToolType = "select" | "pan" | "connection" | NodeType;

// =============================================================================
// Shape Library
// =============================================================================

export type ShapeCategory = "basic" | "flowchart" | "uml" | "misc";

export type ShapeDefinition = {
  type: ShapeType | "text" | "table";
  label: string;
  category: ShapeCategory;
  defaultWidth: number;
  defaultHeight: number;
};

// =============================================================================
// Export Types
// =============================================================================

export type ExportFormat = "svg" | "png" | "mermaid" | "markdown";
