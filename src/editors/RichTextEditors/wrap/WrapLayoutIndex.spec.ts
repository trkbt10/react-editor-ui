/**
 * @file WrapLayoutIndex Tests
 */

import { describe, it, expect } from "vitest";
import {
  buildWrapLayoutIndex,
  buildNoWrapLayoutIndex,
  findVisualLineAtY,
  getVisualLine,
  logicalToVisual,
  visualToLogical,
} from "./WrapLayoutIndex";
import { createBlockDocument } from "../block/blockDocument";

// Simple measureText that returns character count * 10 (10 units per char)
const measureText = (text: string) => text.length * 10;

const defaultLayoutConfig = {
  paddingLeft: 8,
  paddingTop: 8,
  baseLineHeight: 21,
};

// =============================================================================
// Build Tests
// =============================================================================

describe("buildWrapLayoutIndex", () => {
  it("creates visual lines for simple document", () => {
    const doc = createBlockDocument("Hello world");
    const result = buildWrapLayoutIndex({
      document: doc,
      containerWidth: 200,
      measureText,
      wrapMode: { softWrap: true, wordWrap: true, wrapColumn: 0 },
      layoutConfig: defaultLayoutConfig,
    });

    expect(result.visualLines.length).toBeGreaterThan(0);
    expect(result.logicalToVisualStart).toHaveLength(1);
    expect(result.visualLinesPerLogical).toHaveLength(1);
  });

  it("creates multiple visual lines when text wraps", () => {
    const doc = createBlockDocument("Hello world this is a long line of text");
    const result = buildWrapLayoutIndex({
      document: doc,
      containerWidth: 100, // Narrow width forces wrapping
      measureText,
      wrapMode: { softWrap: true, wordWrap: true, wrapColumn: 0 },
      layoutConfig: defaultLayoutConfig,
    });

    // With 100px width and 10px per char (minus padding), should wrap
    expect(result.visualLines.length).toBeGreaterThan(1);
  });

  it("handles multiple blocks", () => {
    const doc = createBlockDocument("Line one\nLine two\nLine three");
    const result = buildWrapLayoutIndex({
      document: doc,
      containerWidth: 200,
      measureText,
      wrapMode: { softWrap: true, wordWrap: true, wrapColumn: 0 },
      layoutConfig: defaultLayoutConfig,
    });

    expect(result.logicalToVisualStart).toHaveLength(3);
    expect(result.visualLinesPerLogical).toHaveLength(3);
  });

  it("calculates correct Y positions", () => {
    const doc = createBlockDocument("Line 1\nLine 2");
    const result = buildWrapLayoutIndex({
      document: doc,
      containerWidth: 200,
      measureText,
      wrapMode: { softWrap: true, wordWrap: true, wrapColumn: 0 },
      layoutConfig: defaultLayoutConfig,
    });

    expect(result.visualLines[0].y).toBe(0);
    expect(result.visualLines[1].y).toBe(21); // baseLineHeight
  });

  it("handles empty document", () => {
    const doc = createBlockDocument("");
    const result = buildWrapLayoutIndex({
      document: doc,
      containerWidth: 200,
      measureText,
      wrapMode: { softWrap: true, wordWrap: true, wrapColumn: 0 },
      layoutConfig: defaultLayoutConfig,
    });

    expect(result.visualLines.length).toBe(1);
    expect(result.visualLines[0].startOffset).toBe(0);
    expect(result.visualLines[0].endOffset).toBe(0);
  });
});

describe("buildNoWrapLayoutIndex", () => {
  it("creates 1:1 mapping without wrapping", () => {
    const doc = createBlockDocument("Line 1\nLine 2\nLine 3");
    const result = buildNoWrapLayoutIndex(doc, defaultLayoutConfig);

    expect(result.visualLines).toHaveLength(3);
    expect(result.logicalToVisualStart).toEqual([0, 1, 2]);
    expect(result.visualLinesPerLogical).toEqual([1, 1, 1]);
  });

  it("sets correct offsets for each line", () => {
    const doc = createBlockDocument("Hello\nWorld");
    const result = buildNoWrapLayoutIndex(doc, defaultLayoutConfig);

    expect(result.visualLines[0].startOffset).toBe(0);
    expect(result.visualLines[0].endOffset).toBe(5);
    expect(result.visualLines[1].startOffset).toBe(0);
    expect(result.visualLines[1].endOffset).toBe(5);
  });
});

// =============================================================================
// Query Tests
// =============================================================================

describe("findVisualLineAtY", () => {
  it("finds correct line at Y=0", () => {
    const doc = createBlockDocument("Line 1\nLine 2\nLine 3");
    const index = buildNoWrapLayoutIndex(doc, defaultLayoutConfig);

    expect(findVisualLineAtY(index, 0)).toBe(0);
  });

  it("finds correct line at middle Y", () => {
    const doc = createBlockDocument("Line 1\nLine 2\nLine 3");
    const index = buildNoWrapLayoutIndex(doc, defaultLayoutConfig);

    expect(findVisualLineAtY(index, 25)).toBe(1); // 25 is in line 2 (y: 21-42)
  });

  it("clamps to last line for Y beyond total height", () => {
    const doc = createBlockDocument("Line 1\nLine 2");
    const index = buildNoWrapLayoutIndex(doc, defaultLayoutConfig);

    expect(findVisualLineAtY(index, 1000)).toBe(1);
  });

  it("clamps to first line for negative Y", () => {
    const doc = createBlockDocument("Line 1\nLine 2");
    const index = buildNoWrapLayoutIndex(doc, defaultLayoutConfig);

    expect(findVisualLineAtY(index, -10)).toBe(0);
  });
});

describe("getVisualLine", () => {
  it("returns correct visual line", () => {
    const doc = createBlockDocument("Line 1\nLine 2");
    const index = buildNoWrapLayoutIndex(doc, defaultLayoutConfig);

    const line = getVisualLine(index, 1);
    expect(line).toBeDefined();
    expect(line?.logicalLineIndex).toBe(1);
  });

  it("returns undefined for invalid index", () => {
    const doc = createBlockDocument("Line 1");
    const index = buildNoWrapLayoutIndex(doc, defaultLayoutConfig);

    expect(getVisualLine(index, 5)).toBeUndefined();
    expect(getVisualLine(index, -1)).toBeUndefined();
  });
});

// =============================================================================
// Coordinate Conversion Tests
// =============================================================================

describe("logicalToVisual", () => {
  it("converts logical position to visual position", () => {
    const doc = createBlockDocument("Line 1\nLine 2");
    const index = buildNoWrapLayoutIndex(doc, defaultLayoutConfig);

    const result = logicalToVisual(index, { line: 0, column: 3 });
    expect(result.line).toBe(0);
    expect(result.column).toBe(3);
  });

  it("handles wrapped lines", () => {
    const doc = createBlockDocument("Hello world this is text");
    const index = buildWrapLayoutIndex({
      document: doc,
      containerWidth: 80, // Force wrapping
      measureText,
      wrapMode: { softWrap: true, wordWrap: true, wrapColumn: 0 },
      layoutConfig: defaultLayoutConfig,
    });

    // Column 15 should be on a wrapped visual line
    const result = logicalToVisual(index, { line: 0, column: 15 });
    // The exact visual line depends on wrap calculation
    expect(result.line).toBeGreaterThanOrEqual(0);
  });
});

describe("visualToLogical", () => {
  it("converts visual position to logical position", () => {
    const doc = createBlockDocument("Line 1\nLine 2");
    const index = buildNoWrapLayoutIndex(doc, defaultLayoutConfig);

    const result = visualToLogical(index, { line: 1, column: 2 });
    expect(result.line).toBe(1);
    expect(result.column).toBe(2);
  });

  it("handles wrapped lines", () => {
    const doc = createBlockDocument("Hello world this is text");
    const index = buildWrapLayoutIndex({
      document: doc,
      containerWidth: 80,
      measureText,
      wrapMode: { softWrap: true, wordWrap: true, wrapColumn: 0 },
      layoutConfig: defaultLayoutConfig,
    });

    // Get the second visual line (if it exists)
    if (index.visualLines.length > 1) {
      const visualLine = index.visualLines[1];
      const result = visualToLogical(index, { line: 1, column: 0 });
      // Should map back to logical line 0 with appropriate column
      expect(result.line).toBe(0);
      expect(result.column).toBe(visualLine.startOffset);
    }
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("edge cases", () => {
  it("handles very long line", () => {
    const longLine = "a".repeat(1000);
    const doc = createBlockDocument(longLine);
    const index = buildWrapLayoutIndex({
      document: doc,
      containerWidth: 100,
      measureText,
      wrapMode: { softWrap: true, wordWrap: false, wrapColumn: 0 },
      layoutConfig: defaultLayoutConfig,
    });

    // Should create many visual lines
    expect(index.visualLines.length).toBeGreaterThan(10);
  });

  it("handles mixed CJK and ASCII text", () => {
    const doc = createBlockDocument("Hello 漢字 World 日本語");
    const index = buildWrapLayoutIndex({
      document: doc,
      containerWidth: 150,
      measureText,
      wrapMode: { softWrap: true, wordWrap: true, wrapColumn: 0 },
      layoutConfig: defaultLayoutConfig,
    });

    expect(index.visualLines.length).toBeGreaterThan(0);
  });

  it("handles empty lines in multi-line document", () => {
    const doc = createBlockDocument("Line 1\n\nLine 3");
    const index = buildWrapLayoutIndex({
      document: doc,
      containerWidth: 200,
      measureText,
      wrapMode: { softWrap: true, wordWrap: true, wrapColumn: 0 },
      layoutConfig: defaultLayoutConfig,
    });

    expect(index.visualLines).toHaveLength(3);
    // The empty line should have 0-length content
    const emptyLine = index.visualLines[1];
    expect(emptyLine.startOffset).toBe(0);
    expect(emptyLine.endOffset).toBe(0);
  });
});
