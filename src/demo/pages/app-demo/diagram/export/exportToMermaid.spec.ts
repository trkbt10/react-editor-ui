/**
 * @file Mermaid export unit tests
 */

import { describe, it, expect } from "vitest";
import mermaid from "mermaid";
import { exportToMermaid, exportFrameToMermaid } from "./exportToMermaid";
import { initialDocument as mockDocument } from "../mockData";
import { isFrameNode } from "../types";
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

// Initialize mermaid for parsing
mermaid.initialize({ startOnLoad: false });

/**
 * Validate Mermaid syntax using mermaid.parse()
 */
async function validateMermaidSyntax(code: string): Promise<{ valid: boolean; error?: string }> {
  try {
    await mermaid.parse(code);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: String(e) };
  }
}

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
  partOverrides?: Record<string, Partial<SymbolPart>>,
): SymbolInstance {
  return {
    id,
    type: "instance",
    symbolId: "symbol-1",
    variantId,
    x: 0,
    y: 0,
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

describe("exportToMermaid", () => {
  describe("empty diagram", () => {
    it("returns valid mermaid for empty document", async () => {
      const doc = createEmptyDocument();
      const result = exportToMermaid(doc);

      expect(result).toContain("flowchart TD");
      expect(result).toContain("empty[Empty diagram]");

      const validation = await validateMermaidSyntax(result);
      expect(validation.valid).toBe(true);
    });
  });

  describe("group nodes", () => {
    it("exports group with shape and text children", async () => {
      const doc = createEmptyDocument();
      const shape = createShapeNode("shape-1", "rectangle");
      const text = createTextNode("text-1", "Hello");
      const group = createGroupNode("group-1", ["shape-1", "text-1"]);

      doc.canvasPage.nodes = [shape, text, group];

      const result = exportToMermaid(doc);

      expect(result).toContain("flowchart TD");
      expect(result).toContain("group_1");
      expect(result).toContain('"Hello"');

      const validation = await validateMermaidSyntax(result);
      expect(validation.valid).toBe(true);
    });

    it("exports different shape types correctly", async () => {
      const doc = createEmptyDocument();

      // Diamond shape
      const diamondShape = createShapeNode("diamond-shape", "diamond");
      const diamondText = createTextNode("diamond-text", "Is it?");
      const diamondGroup = createGroupNode("diamond-group", ["diamond-shape", "diamond-text"]);

      // Rounded rect shape
      const roundedShape = createShapeNode("rounded-shape", "rounded-rect");
      const roundedText = createTextNode("rounded-text", "Start");
      const roundedGroup = createGroupNode("rounded-group", ["rounded-shape", "rounded-text"]);

      doc.canvasPage.nodes = [
        diamondShape, diamondText, diamondGroup,
        roundedShape, roundedText, roundedGroup,
      ];

      const result = exportToMermaid(doc);

      // Diamond uses {} in mermaid
      expect(result).toMatch(/diamond_group\{"Is it\?"\}/);
      // Rounded rect uses () in mermaid
      expect(result).toMatch(/rounded_group\("Start"\)/);

      const validation = await validateMermaidSyntax(result);
      expect(validation.valid).toBe(true);
    });
  });

  describe("connections", () => {
    it("exports connections between groups", async () => {
      const doc = createEmptyDocument();

      const shape1 = createShapeNode("s1", "rectangle");
      const text1 = createTextNode("t1", "A");
      const group1 = createGroupNode("g1", ["s1", "t1"], 0, 0);

      const shape2 = createShapeNode("s2", "rectangle");
      const text2 = createTextNode("t2", "B");
      const group2 = createGroupNode("g2", ["s2", "t2"], 0, 100);

      const conn = createConnection("c1", "g1", "g2");

      doc.canvasPage.nodes = [shape1, text1, group1, shape2, text2, group2];
      doc.canvasPage.connections = [conn];

      const result = exportToMermaid(doc);

      expect(result).toContain("g1 --> g2");

      const validation = await validateMermaidSyntax(result);
      expect(validation.valid).toBe(true);
    });

    it("exports connection with label", async () => {
      const doc = createEmptyDocument();

      const shape1 = createShapeNode("s1", "rectangle");
      const text1 = createTextNode("t1", "A");
      const group1 = createGroupNode("g1", ["s1", "t1"]);

      const shape2 = createShapeNode("s2", "rectangle");
      const text2 = createTextNode("t2", "B");
      const group2 = createGroupNode("g2", ["s2", "t2"]);

      const conn = createConnection("c1", "g1", "g2", "Yes");

      doc.canvasPage.nodes = [shape1, text1, group1, shape2, text2, group2];
      doc.canvasPage.connections = [conn];

      const result = exportToMermaid(doc);

      expect(result).toContain('|"Yes"|');

      const validation = await validateMermaidSyntax(result);
      expect(validation.valid).toBe(true);
    });

    it("exports bidirectional arrows", async () => {
      const doc = createEmptyDocument();

      const shape1 = createShapeNode("s1", "rectangle");
      const group1 = createGroupNode("g1", ["s1"]);

      const shape2 = createShapeNode("s2", "rectangle");
      const group2 = createGroupNode("g2", ["s2"]);

      const conn: Connection = {
        id: "c1",
        source: { nodeId: "g1", position: "right" },
        target: { nodeId: "g2", position: "left" },
        stroke: { color: { ...defaultStrokeColor }, width: 1, style: "solid" },
        startArrow: "arrow",
        endArrow: "arrow",
        label: "",
      };

      doc.canvasPage.nodes = [shape1, group1, shape2, group2];
      doc.canvasPage.connections = [conn];

      const result = exportToMermaid(doc);

      expect(result).toContain("<-->");

      const validation = await validateMermaidSyntax(result);
      expect(validation.valid).toBe(true);
    });

    it("exports dashed line style", async () => {
      const doc = createEmptyDocument();

      const shape1 = createShapeNode("s1", "rectangle");
      const group1 = createGroupNode("g1", ["s1"]);

      const shape2 = createShapeNode("s2", "rectangle");
      const group2 = createGroupNode("g2", ["s2"]);

      const conn: Connection = {
        id: "c1",
        source: { nodeId: "g1", position: "right" },
        target: { nodeId: "g2", position: "left" },
        stroke: { color: { ...defaultStrokeColor }, width: 1, style: "dashed" },
        startArrow: "none",
        endArrow: "arrow",
        label: "",
      };

      doc.canvasPage.nodes = [shape1, group1, shape2, group2];
      doc.canvasPage.connections = [conn];

      const result = exportToMermaid(doc);

      expect(result).toContain("-.->");

      const validation = await validateMermaidSyntax(result);
      expect(validation.valid).toBe(true);
    });
  });

  describe("symbol instances", () => {
    it("exports symbol instances with correct label", async () => {
      const doc = createEmptyDocument();
      const symbolDef = createSymbolDefinition();
      doc.symbolsPage.symbol = symbolDef;

      const instance = createSymbolInstance("inst-1", "process");
      doc.canvasPage.nodes = [instance];

      const result = exportToMermaid(doc);

      expect(result).toContain("inst_1");
      expect(result).toContain('"Process"');

      const validation = await validateMermaidSyntax(result);
      expect(validation.valid).toBe(true);
    });

    it("exports symbol instance with instance override", async () => {
      const doc = createEmptyDocument();
      const symbolDef = createSymbolDefinition();
      doc.symbolsPage.symbol = symbolDef;

      const instance = createSymbolInstance("inst-1", "process", {
        "text-part": { content: "Custom Label" },
      });
      doc.canvasPage.nodes = [instance];

      const result = exportToMermaid(doc);

      expect(result).toContain('"Custom Label"');

      const validation = await validateMermaidSyntax(result);
      expect(validation.valid).toBe(true);
    });

    it("exports symbol instance with correct shape from variant", async () => {
      const doc = createEmptyDocument();
      const symbolDef = createSymbolDefinition();
      doc.symbolsPage.symbol = symbolDef;

      const instance = createSymbolInstance("inst-1", "decision");
      doc.canvasPage.nodes = [instance];

      const result = exportToMermaid(doc);

      // Diamond shape uses {} in mermaid
      expect(result).toMatch(/inst_1\{"Decision"\}/);

      const validation = await validateMermaidSyntax(result);
      expect(validation.valid).toBe(true);
    });
  });

  describe("special characters", () => {
    it("sanitizes special characters in labels", async () => {
      const doc = createEmptyDocument();
      const shape = createShapeNode("s1", "rectangle");
      const text = createTextNode("t1", 'Test [with] "quotes" {braces}');
      const group = createGroupNode("g1", ["s1", "t1"]);

      doc.canvasPage.nodes = [shape, text, group];

      const result = exportToMermaid(doc);

      // Should not contain raw [], {}, or "
      expect(result).not.toMatch(/\["Test \[with\]/);

      const validation = await validateMermaidSyntax(result);
      expect(validation.valid).toBe(true);
    });

    it("sanitizes special characters in IDs", async () => {
      const doc = createEmptyDocument();
      const shape = createShapeNode("shape-with-dashes", "rectangle");
      const group = createGroupNode("group.with.dots", ["shape-with-dashes"]);

      doc.canvasPage.nodes = [shape, group];

      const result = exportToMermaid(doc);

      // IDs should be sanitized to alphanumeric with underscores
      expect(result).toContain("group_with_dots");
      expect(result).not.toContain("group.with.dots");

      const validation = await validateMermaidSyntax(result);
      expect(validation.valid).toBe(true);
    });

    it("handles newlines in labels", async () => {
      const doc = createEmptyDocument();
      const shape = createShapeNode("s1", "rectangle");
      const text = createTextNode("t1", "Line 1\nLine 2");
      const group = createGroupNode("g1", ["s1", "t1"]);

      doc.canvasPage.nodes = [shape, text, group];

      const result = exportToMermaid(doc);

      // Newlines should be replaced with spaces
      expect(result).toContain("Line 1 Line 2");

      const validation = await validateMermaidSyntax(result);
      expect(validation.valid).toBe(true);
    });
  });
});

describe("real mockData integration", () => {
  it("exports initialDocument with valid mermaid syntax", async () => {
    const result = exportToMermaid(mockDocument);

    const validation = await validateMermaidSyntax(result);
    expect(validation.valid).toBe(true);
  });

  it("exports frame from initialDocument with valid mermaid syntax", async () => {
    const frame = mockDocument.canvasPage.nodes.find(isFrameNode);
    if (!frame) {
      throw new Error("No frame found in mockDocument");
    }

    const result = exportFrameToMermaid(
      frame,
      mockDocument.canvasPage.nodes,
      mockDocument.canvasPage.connections,
      mockDocument.symbolsPage.symbol,
    );

    const validation = await validateMermaidSyntax(result);
    expect(validation.valid).toBe(true);
  });
});

describe("special label edge cases", () => {
  it("handles question marks in labels (Decision?)", async () => {
    const doc = createEmptyDocument();
    const symbolDef: SymbolDefinition = {
      ...createSymbolDefinition(),
      variants: {
        ...createSymbolDefinition().variants,
        decision: {
          name: "Decision",
          parts: {
            "shape-part": { shape: "diamond" },
            "text-part": { content: "Decision?" },
          },
        },
      },
    };
    doc.symbolsPage.symbol = symbolDef;

    const instance = createSymbolInstance("inst-1", "decision");
    doc.canvasPage.nodes = [instance];

    const result = exportToMermaid(doc);

    expect(result).toContain("Decision?");

    const validation = await validateMermaidSyntax(result);
    expect(validation.valid).toBe(true);
  });

  it("handles labels with pipe characters", async () => {
    const doc = createEmptyDocument();
    const shape = createShapeNode("s1", "rectangle");
    const text = createTextNode("t1", "A | B | C");
    const group = createGroupNode("g1", ["s1", "t1"]);

    doc.canvasPage.nodes = [shape, text, group];

    const result = exportToMermaid(doc);

    const validation = await validateMermaidSyntax(result);
    expect(validation.valid).toBe(true);
  });

  it("handles labels with parentheses", async () => {
    const doc = createEmptyDocument();
    const shape = createShapeNode("s1", "rectangle");
    const text = createTextNode("t1", "Function(args)");
    const group = createGroupNode("g1", ["s1", "t1"]);

    doc.canvasPage.nodes = [shape, text, group];

    const result = exportToMermaid(doc);

    const validation = await validateMermaidSyntax(result);
    expect(validation.valid).toBe(true);
  });

  it("handles labels with angle brackets", async () => {
    const doc = createEmptyDocument();
    const shape = createShapeNode("s1", "rectangle");
    const text = createTextNode("t1", "<input> -> <output>");
    const group = createGroupNode("g1", ["s1", "t1"]);

    doc.canvasPage.nodes = [shape, text, group];

    const result = exportToMermaid(doc);

    const validation = await validateMermaidSyntax(result);
    expect(validation.valid).toBe(true);
  });

  it("handles labels with hash/pound sign", async () => {
    const doc = createEmptyDocument();
    const shape = createShapeNode("s1", "rectangle");
    const text = createTextNode("t1", "Step #1");
    const group = createGroupNode("g1", ["s1", "t1"]);

    doc.canvasPage.nodes = [shape, text, group];

    const result = exportToMermaid(doc);

    const validation = await validateMermaidSyntax(result);
    expect(validation.valid).toBe(true);
  });

  it("handles labels with semicolons", async () => {
    const doc = createEmptyDocument();
    const shape = createShapeNode("s1", "rectangle");
    const text = createTextNode("t1", "A; B; C");
    const group = createGroupNode("g1", ["s1", "t1"]);

    doc.canvasPage.nodes = [shape, text, group];

    const result = exportToMermaid(doc);

    const validation = await validateMermaidSyntax(result);
    expect(validation.valid).toBe(true);
  });

  it("handles empty labels", async () => {
    const doc = createEmptyDocument();
    const shape = createShapeNode("s1", "rectangle");
    const text = createTextNode("t1", "");
    const group = createGroupNode("g1", ["s1", "t1"]);

    doc.canvasPage.nodes = [shape, text, group];

    const result = exportToMermaid(doc);

    const validation = await validateMermaidSyntax(result);
    expect(validation.valid).toBe(true);
  });
});

describe("exportFrameToMermaid", () => {
  it("exports only nodes within the frame", async () => {
    const symbolDef = createSymbolDefinition();

    // Nodes inside frame
    const instance1 = createSymbolInstance("inst-1", "process");
    const instance2 = createSymbolInstance("inst-2", "decision");

    // Node outside frame
    const outsideInstance = createSymbolInstance("inst-outside", "start");

    // Frame containing only inst-1 and inst-2
    const frame = createFrameNode("frame-1", ["inst-1", "inst-2"]);

    const allNodes: DiagramNode[] = [instance1, instance2, outsideInstance, frame];

    // Connection inside frame
    const insideConn = createConnection("c1", "inst-1", "inst-2");

    // Connection from inside to outside (should be excluded)
    const crossConn = createConnection("c2", "inst-1", "inst-outside");

    const allConnections = [insideConn, crossConn];

    const result = exportFrameToMermaid(frame, allNodes, allConnections, symbolDef);

    expect(result).toContain("inst_1");
    expect(result).toContain("inst_2");
    expect(result).not.toContain("inst_outside");

    // Only inside connection should be included
    expect(result).toContain("inst_1 --> inst_2");
    expect(result).not.toContain("inst_outside");

    const validation = await validateMermaidSyntax(result);
    expect(validation.valid).toBe(true);
  });

  it("returns empty diagram for frame with no children", async () => {
    const frame = createFrameNode("frame-1", []);
    const result = exportFrameToMermaid(frame, [], [], null);

    expect(result).toContain("empty[Empty diagram]");

    const validation = await validateMermaidSyntax(result);
    expect(validation.valid).toBe(true);
  });
});
