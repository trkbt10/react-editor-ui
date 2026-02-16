/**
 * @file useCoordinates tests
 *
 * Tests for coordinate conversion utilities: offsetToLineColumn, lineColumnToOffset,
 * lineColumnToCoordinates, coordinatesToPosition, calculateSelectionRects.
 */

import {
  offsetToLineColumn,
  lineColumnToOffset,
  lineColumnToCoordinates,
  coordinatesToPosition,
  calculateSelectionRects,
  DEFAULT_CHAR_WIDTH,
  DEFAULT_LINE_HEIGHT,
  CODE_AREA_PADDING_LEFT,
  CODE_AREA_PADDING_TOP,
} from "../font/coordinates";

/**
 * Default measureText function for tests.
 * Uses fixed character width (DEFAULT_CHAR_WIDTH).
 */
const defaultMeasureText = (text: string): number => text.length * DEFAULT_CHAR_WIDTH;

// =============================================================================
// offsetToLineColumn tests
// =============================================================================

describe("offsetToLineColumn", () => {
  it("returns (1, 1) for offset 0", () => {
    const result = offsetToLineColumn("hello\nworld", 0);
    expect(result).toEqual({ line: 1, column: 1 });
  });

  it("returns correct position in first line", () => {
    const result = offsetToLineColumn("hello\nworld", 3);
    expect(result).toEqual({ line: 1, column: 4 });
  });

  it("returns correct position at end of first line", () => {
    const result = offsetToLineColumn("hello\nworld", 5);
    expect(result).toEqual({ line: 1, column: 6 });
  });

  it("returns correct position at start of second line", () => {
    const result = offsetToLineColumn("hello\nworld", 6);
    expect(result).toEqual({ line: 2, column: 1 });
  });

  it("returns correct position in second line", () => {
    const result = offsetToLineColumn("hello\nworld", 8);
    expect(result).toEqual({ line: 2, column: 3 });
  });

  it("handles offset past end of text", () => {
    const result = offsetToLineColumn("hello", 100);
    expect(result).toEqual({ line: 1, column: 6 });
  });

  it("handles empty text", () => {
    const result = offsetToLineColumn("", 0);
    expect(result).toEqual({ line: 1, column: 1 });
  });

  it("handles single line", () => {
    const result = offsetToLineColumn("hello", 3);
    expect(result).toEqual({ line: 1, column: 4 });
  });

  it("handles empty lines", () => {
    const result = offsetToLineColumn("a\n\nb", 2);
    expect(result).toEqual({ line: 2, column: 1 });
  });
});

// =============================================================================
// lineColumnToOffset tests
// =============================================================================

describe("lineColumnToOffset", () => {
  it("returns 0 for (1, 1)", () => {
    const result = lineColumnToOffset("hello\nworld", 1, 1);
    expect(result).toBe(0);
  });

  it("returns correct offset for position in first line", () => {
    const result = lineColumnToOffset("hello\nworld", 1, 4);
    expect(result).toBe(3);
  });

  it("returns correct offset at end of first line", () => {
    const result = lineColumnToOffset("hello\nworld", 1, 6);
    expect(result).toBe(5);
  });

  it("returns correct offset at start of second line", () => {
    const result = lineColumnToOffset("hello\nworld", 2, 1);
    expect(result).toBe(6);
  });

  it("returns correct offset for position in second line", () => {
    const result = lineColumnToOffset("hello\nworld", 2, 3);
    expect(result).toBe(8);
  });

  it("clamps column to line length", () => {
    const result = lineColumnToOffset("abc", 1, 100);
    expect(result).toBe(3);
  });

  it("handles empty text", () => {
    const result = lineColumnToOffset("", 1, 1);
    expect(result).toBe(0);
  });

  it("handles third line", () => {
    const result = lineColumnToOffset("a\nb\nc", 3, 2);
    expect(result).toBe(5);
  });
});

// =============================================================================
// lineColumnToCoordinates tests
// =============================================================================

describe("lineColumnToCoordinates", () => {
  it("returns correct coordinates for (1, 1)", () => {
    const result = lineColumnToCoordinates({
      line: 1,
      column: 1,
      lineText: "hello",
      measureText: defaultMeasureText,
    });
    expect(result).toEqual({
      x: CODE_AREA_PADDING_LEFT,
      y: CODE_AREA_PADDING_TOP,
      height: DEFAULT_LINE_HEIGHT,
    });
  });

  it("returns correct X for column > 1", () => {
    const result = lineColumnToCoordinates({
      line: 1,
      column: 4,
      lineText: "hello",
      measureText: defaultMeasureText,
    });
    // x = padding + measureText("hel") = 8 + 3 * 7.8
    expect(result.x).toBeCloseTo(CODE_AREA_PADDING_LEFT + 3 * DEFAULT_CHAR_WIDTH, 5);
  });

  it("returns correct Y for line > 1", () => {
    const result = lineColumnToCoordinates({
      line: 3,
      column: 1,
      lineText: "test",
      measureText: defaultMeasureText,
    });
    // y = padding + (3-1) * lineHeight
    expect(result.y).toBe(CODE_AREA_PADDING_TOP + 2 * DEFAULT_LINE_HEIGHT);
  });

  it("uses custom measureText function", () => {
    const measureText = (text: string) => text.length * 10; // 10px per char
    const result = lineColumnToCoordinates({
      line: 1,
      column: 4,
      lineText: "hello",
      measureText,
    });
    expect(result.x).toBe(CODE_AREA_PADDING_LEFT + 30);
  });

  it("uses custom lineHeight", () => {
    const result = lineColumnToCoordinates({
      line: 2,
      column: 1,
      lineText: "hello",
      lineHeight: 30,
      measureText: defaultMeasureText,
    });
    expect(result.y).toBe(CODE_AREA_PADDING_TOP + 30);
    expect(result.height).toBe(30);
  });

  it("uses custom padding", () => {
    const result = lineColumnToCoordinates({
      line: 1,
      column: 1,
      lineText: "hello",
      paddingLeft: 20,
      paddingTop: 15,
      measureText: defaultMeasureText,
    });
    expect(result.x).toBe(20);
    expect(result.y).toBe(15);
  });
});

// =============================================================================
// coordinatesToPosition tests
// =============================================================================

describe("coordinatesToPosition", () => {
  const lines = ["hello", "world", "test"];

  it("returns (1, 1) for coordinates at top-left", () => {
    const result = coordinatesToPosition({
      x: CODE_AREA_PADDING_LEFT,
      y: CODE_AREA_PADDING_TOP,
      lines,
      measureText: defaultMeasureText,
    });
    expect(result).toEqual({ line: 1, column: 1 });
  });

  it("returns correct line for y coordinate", () => {
    const result = coordinatesToPosition({
      x: CODE_AREA_PADDING_LEFT,
      y: CODE_AREA_PADDING_TOP + DEFAULT_LINE_HEIGHT + 5,
      lines,
      measureText: defaultMeasureText,
    });
    expect(result.line).toBe(2);
  });

  it("returns correct column for x coordinate", () => {
    const result = coordinatesToPosition({
      x: CODE_AREA_PADDING_LEFT + 3.5 * DEFAULT_CHAR_WIDTH,
      y: CODE_AREA_PADDING_TOP,
      lines,
      measureText: defaultMeasureText,
    });
    // Should snap to nearest character boundary
    expect(result.column).toBeGreaterThanOrEqual(3);
    expect(result.column).toBeLessThanOrEqual(5);
  });

  it("handles negative y (clamps to first line)", () => {
    const result = coordinatesToPosition({
      x: CODE_AREA_PADDING_LEFT,
      y: -100,
      lines,
      measureText: defaultMeasureText,
    });
    expect(result.line).toBe(1);
  });

  it("handles y past last line (clamps to last line)", () => {
    const result = coordinatesToPosition({
      x: CODE_AREA_PADDING_LEFT,
      y: 1000,
      lines,
      measureText: defaultMeasureText,
    });
    expect(result.line).toBe(3);
  });

  it("handles x before start (returns column 1)", () => {
    const result = coordinatesToPosition({
      x: 0,
      y: CODE_AREA_PADDING_TOP,
      lines,
      measureText: defaultMeasureText,
    });
    expect(result.column).toBe(1);
  });

  it("accounts for scrollTop", () => {
    const result = coordinatesToPosition({
      x: CODE_AREA_PADDING_LEFT,
      y: CODE_AREA_PADDING_TOP,
      lines,
      scrollTop: DEFAULT_LINE_HEIGHT,
      measureText: defaultMeasureText,
    });
    expect(result.line).toBe(2);
  });

  it("uses custom measureText function", () => {
    const measureText = (text: string) => text.length * 10;
    const result = coordinatesToPosition({
      x: CODE_AREA_PADDING_LEFT + 25,
      y: CODE_AREA_PADDING_TOP,
      lines,
      measureText,
    });
    expect(result.column).toBeGreaterThanOrEqual(2);
    expect(result.column).toBeLessThanOrEqual(4);
  });

  it("handles empty lines array", () => {
    const result = coordinatesToPosition({
      x: CODE_AREA_PADDING_LEFT,
      y: CODE_AREA_PADDING_TOP,
      lines: [""],
      measureText: defaultMeasureText,
    });
    expect(result).toEqual({ line: 1, column: 1 });
  });
});

// =============================================================================
// calculateSelectionRects tests
// =============================================================================

describe("calculateSelectionRects", () => {
  const lines = ["hello", "world", "test"];

  it("returns empty array for collapsed selection", () => {
    const result = calculateSelectionRects({
      startLine: 1,
      startColumn: 3,
      endLine: 1,
      endColumn: 3,
      lines,
      measureText: defaultMeasureText,
    });
    expect(result).toEqual([]);
  });

  it("returns single rect for single-line selection", () => {
    const result = calculateSelectionRects({
      startLine: 1,
      startColumn: 1,
      endLine: 1,
      endColumn: 4,
      lines,
      measureText: defaultMeasureText,
    });
    expect(result).toHaveLength(1);
    expect(result[0].y).toBe(CODE_AREA_PADDING_TOP);
    expect(result[0].height).toBe(DEFAULT_LINE_HEIGHT);
  });

  it("returns multiple rects for multi-line selection", () => {
    const result = calculateSelectionRects({
      startLine: 1,
      startColumn: 3,
      endLine: 3,
      endColumn: 2,
      lines,
      measureText: defaultMeasureText,
    });
    expect(result).toHaveLength(3);
    expect(result[0].y).toBe(CODE_AREA_PADDING_TOP);
    expect(result[1].y).toBe(CODE_AREA_PADDING_TOP + DEFAULT_LINE_HEIGHT);
    expect(result[2].y).toBe(CODE_AREA_PADDING_TOP + 2 * DEFAULT_LINE_HEIGHT);
  });

  it("normalizes reversed selection", () => {
    const forward = calculateSelectionRects({
      startLine: 1,
      startColumn: 2,
      endLine: 2,
      endColumn: 4,
      lines,
      measureText: defaultMeasureText,
    });
    const reversed = calculateSelectionRects({
      startLine: 2,
      startColumn: 4,
      endLine: 1,
      endColumn: 2,
      lines,
      measureText: defaultMeasureText,
    });
    expect(forward).toEqual(reversed);
  });

  it("uses custom measureText for width calculation", () => {
    const measureText = (text: string) => text.length * 10;
    const result = calculateSelectionRects({
      startLine: 1,
      startColumn: 1,
      endLine: 1,
      endColumn: 4,
      lines,
      measureText,
    });
    expect(result[0].width).toBe(30); // 3 chars * 10px
  });

  it("handles selection in middle of line", () => {
    const result = calculateSelectionRects({
      startLine: 1,
      startColumn: 2,
      endLine: 1,
      endColumn: 5,
      lines,
      measureText: defaultMeasureText,
    });
    expect(result).toHaveLength(1);
    // x should be offset by 1 character
    expect(result[0].x).toBeCloseTo(CODE_AREA_PADDING_LEFT + DEFAULT_CHAR_WIDTH, 5);
    // width should be 3 characters
    expect(result[0].width).toBeCloseTo(3 * DEFAULT_CHAR_WIDTH, 5);
  });

  it("handles selection on second line only", () => {
    const result = calculateSelectionRects({
      startLine: 2,
      startColumn: 1,
      endLine: 2,
      endColumn: 3,
      lines,
      measureText: defaultMeasureText,
    });
    expect(result).toHaveLength(1);
    expect(result[0].y).toBe(CODE_AREA_PADDING_TOP + DEFAULT_LINE_HEIGHT);
  });

  it("handles full-line selection", () => {
    const result = calculateSelectionRects({
      startLine: 1,
      startColumn: 1,
      endLine: 1,
      endColumn: 6, // past end of "hello"
      lines,
      measureText: defaultMeasureText,
    });
    expect(result).toHaveLength(1);
    expect(result[0].x).toBe(CODE_AREA_PADDING_LEFT);
    expect(result[0].width).toBeCloseTo(5 * DEFAULT_CHAR_WIDTH, 5);
  });
});
