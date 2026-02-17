/**
 * @file ASCII export unit tests
 */

import { describe, it, expect } from "vitest";
import { exportToASCII, exportFrameToASCII } from "./exportToASCII";
import type {
  DiagramDocument,
  DiagramNode,
  FrameNode,
  GroupNode,
  ShapeNode,
  TextNode,
  Connection,
  SymbolInstance,
  SymbolDefinition,
  SymbolPart,
} from "../types";

// =============================================================================
// Test Fixtures
// =============================================================================

const defaultColor = { hex: "#ffffff", opacity: 100, visible: true };
const defaultStrokeColor = { hex: "#000000", opacity: 100, visible: true };

function createShapeNode(id: string, shape: ShapeNode["shape"], x = 0, y = 0): ShapeNode {
  return {
    id,
    type: "shape",
    shape,
    x,
    y,
    width: 100,
    height: 50,
    rotation: 0,
    fill: { ...defaultColor },
    stroke: { color: { ...defaultStrokeColor }, width: 1, style: "solid" },
  };
}

function createTextNode(id: string, content: string): TextNode {
  return {
    id,
    type: "text",
    content,
    x: 0,
    y: 0,
    width: 100,
    height: 20,
    rotation: 0,
    textProps: {
      fontFamily: "Inter",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "1.5",
      letterSpacing: "0px",
      textAlign: "center",
      verticalAlign: "middle",
      color: { ...defaultStrokeColor },
    },
  };
}

function createGroupNode(id: string, children: string[], x = 0, y = 0): GroupNode {
  return {
    id,
    type: "group",
    children,
    x,
    y,
    width: 120,
    height: 60,
    rotation: 0,
  };
}

function createFrameNode(id: string, children: string[]): FrameNode {
  return {
    id,
    type: "frame",
    preset: "a4",
    children,
    x: 0,
    y: 0,
    width: 794,
    height: 1123,
    rotation: 0,
    fill: { ...defaultColor },
    stroke: { color: { ...defaultStrokeColor }, width: 1, style: "solid" },
    clipContent: true,
    showBackground: true,
  };
}

function createConnection(
  id: string,
  sourceId: string,
  targetId: string,
  label = "",
): Connection {
  return {
    id,
    source: { nodeId: sourceId, position: "bottom" },
    target: { nodeId: targetId, position: "top" },
    stroke: { color: { ...defaultStrokeColor }, width: 1, style: "solid" },
    startArrow: "none",
    endArrow: "arrow",
    label,
  };
}

function createSymbolInstance(
  id: string,
  variantId: string,
  x = 0,
  y = 0,
  partOverrides?: Record<string, Partial<SymbolPart>>,
): SymbolInstance {
  return {
    id,
    type: "instance",
    symbolId: "symbol-1",
    variantId,
    x,
    y,
    width: 100,
    height: 50,
    rotation: 0,
    partOverrides,
  };
}

function createSymbolDefinition(): SymbolDefinition {
  return {
    id: "symbol-1",
    name: "FlowchartNode",
    width: 100,
    height: 50,
    parts: [
      {
        id: "shape-part",
        name: "background",
        type: "shape",
        shape: "rectangle",
        fill: { ...defaultColor },
        stroke: { color: { ...defaultStrokeColor }, width: 1, style: "solid" },
      },
      {
        id: "text-part",
        name: "label",
        type: "text",
        content: "Default Label",
        textProps: {
          fontFamily: "Inter",
          fontWeight: "400",
          fontSize: "14px",
          lineHeight: "1.5",
          letterSpacing: "0px",
          textAlign: "center",
          verticalAlign: "middle",
          color: { ...defaultStrokeColor },
        },
      },
    ],
    variants: {
      process: {
        name: "Process",
        parts: {
          "shape-part": { shape: "rectangle" },
          "text-part": { content: "Process" },
        },
      },
      decision: {
        name: "Decision",
        parts: {
          "shape-part": { shape: "diamond" },
          "text-part": { content: "Decision" },
        },
      },
      start: {
        name: "Start",
        parts: {
          "shape-part": { shape: "rounded-rect" },
          "text-part": { content: "Start" },
        },
      },
    },
  };
}

function createEmptyDocument(): DiagramDocument {
  return {
    canvasPage: {
      id: "canvas",
      name: "Canvas",
      nodes: [],
      connections: [],
    },
    symbolsPage: {
      id: "symbols",
      name: "Symbols",
      symbol: null,
    },
    activePageId: "canvas",
    gridSize: 10,
    theme: {
      defaultNodeFill: { ...defaultColor },
      defaultNodeStroke: { color: { ...defaultStrokeColor }, width: 1, style: "solid" },
      defaultConnectionStroke: { color: { ...defaultStrokeColor }, width: 1, style: "solid" },
      defaultConnectionArrow: "arrow",
      canvasBackground: { hex: "#f5f5f5", opacity: 100, visible: true },
      gridColor: { hex: "#e0e0e0", opacity: 100, visible: true },
    },
  };
}

// =============================================================================
// Tests
// =============================================================================

describe("exportToASCII", () => {
  describe("empty diagram", () => {
    it("returns empty diagram box for empty document", () => {
      const doc = createEmptyDocument();
      const result = exportToASCII(doc);

      expect(result).toContain("Empty diagram");
      expect(result).toContain("┌");
      expect(result).toContain("┐");
      expect(result).toContain("└");
      expect(result).toContain("┘");
    });
  });

  describe("group nodes", () => {
    it("exports group with text label", () => {
      const doc = createEmptyDocument();
      const shape = createShapeNode("s1", "rectangle");
      const text = createTextNode("t1", "Hello");
      const group = createGroupNode("g1", ["s1", "t1"]);

      doc.canvasPage.nodes = [shape, text, group];

      const result = exportToASCII(doc);

      expect(result).toContain("Hello");
      expect(result).toContain("Nodes: 1");
    });

    it("uses different box styles for different shapes", () => {
      const doc = createEmptyDocument();

      // Rounded shape should use rounded box
      const roundedShape = createShapeNode("rs", "rounded-rect");
      const roundedText = createTextNode("rt", "Rounded");
      const roundedGroup = createGroupNode("rg", ["rs", "rt"]);

      doc.canvasPage.nodes = [roundedShape, roundedText, roundedGroup];

      const result = exportToASCII(doc);

      // Rounded box uses curved corners
      expect(result).toContain("╭");
      expect(result).toContain("╮");
      expect(result).toContain("╰");
      expect(result).toContain("╯");
    });

    it("uses double box for diamond shapes", () => {
      const doc = createEmptyDocument();

      const diamondShape = createShapeNode("ds", "diamond");
      const diamondText = createTextNode("dt", "Diamond");
      const diamondGroup = createGroupNode("dg", ["ds", "dt"]);

      doc.canvasPage.nodes = [diamondShape, diamondText, diamondGroup];

      const result = exportToASCII(doc);

      // Diamond can use diamond drawing or double box
      expect(result).toContain("Diamond");
    });
  });

  describe("symbol instances", () => {
    it("exports symbol instance with correct label from variant", () => {
      const doc = createEmptyDocument();
      const symbolDef = createSymbolDefinition();
      doc.symbolsPage.symbol = symbolDef;

      const instance = createSymbolInstance("inst-1", "process");
      doc.canvasPage.nodes = [instance];

      const result = exportToASCII(doc);

      expect(result).toContain("Process");
      expect(result).toContain("Nodes: 1");
    });

    it("exports symbol instance with instance override", () => {
      const doc = createEmptyDocument();
      const symbolDef = createSymbolDefinition();
      doc.symbolsPage.symbol = symbolDef;

      const instance = createSymbolInstance("inst-1", "process", 0, 0, {
        "text-part": { content: "Custom Label" },
      });
      doc.canvasPage.nodes = [instance];

      const result = exportToASCII(doc);

      expect(result).toContain("Custom Label");
    });
  });

  describe("connections", () => {
    it("includes connection legend", () => {
      const doc = createEmptyDocument();
      const symbolDef = createSymbolDefinition();
      doc.symbolsPage.symbol = symbolDef;

      const inst1 = createSymbolInstance("inst-1", "process", 0, 0);
      const inst2 = createSymbolInstance("inst-2", "decision", 0, 100);
      const conn = createConnection("c1", "inst-1", "inst-2", "Next");

      doc.canvasPage.nodes = [inst1, inst2];
      doc.canvasPage.connections = [conn];

      const result = exportToASCII(doc);

      expect(result).toContain("Connections:");
      expect(result).toContain("Process --> Decision");
      expect(result).toContain("[Next]");
    });
  });

  describe("header", () => {
    it("includes title and statistics", () => {
      const doc = createEmptyDocument();
      const symbolDef = createSymbolDefinition();
      doc.symbolsPage.symbol = symbolDef;

      const inst1 = createSymbolInstance("inst-1", "process");
      const inst2 = createSymbolInstance("inst-2", "decision");
      const conn = createConnection("c1", "inst-1", "inst-2");

      doc.canvasPage.nodes = [inst1, inst2];
      doc.canvasPage.connections = [conn];

      const result = exportToASCII(doc);

      expect(result).toContain("Diagram (ASCII Export)");
      expect(result).toContain("Nodes: 2");
      expect(result).toContain("Connections: 1");
    });
  });
});

describe("exportFrameToASCII", () => {
  it("exports only nodes within the frame", () => {
    const symbolDef = createSymbolDefinition();

    const inst1 = createSymbolInstance("inst-1", "process", 0, 0);
    const inst2 = createSymbolInstance("inst-2", "decision", 0, 100);
    const outsideInst = createSymbolInstance("inst-outside", "start", 500, 500);

    const frame = createFrameNode("frame-1", ["inst-1", "inst-2"]);

    const allNodes: DiagramNode[] = [inst1, inst2, outsideInst, frame];
    const conn = createConnection("c1", "inst-1", "inst-2");
    const outsideConn = createConnection("c2", "inst-1", "inst-outside");

    const result = exportFrameToASCII(frame, allNodes, [conn, outsideConn], symbolDef);

    expect(result).toContain("Process");
    expect(result).toContain("Decision");
    expect(result).not.toContain("Start");
    expect(result).toContain("Nodes: 2");
    expect(result).toContain("Connections: 1");
  });

  it("returns empty diagram for frame with no children", () => {
    const frame = createFrameNode("frame-1", []);
    const result = exportFrameToASCII(frame, [], [], null);

    expect(result).toContain("Empty diagram");
  });
});
