/**
 * @file useLineIndex tests
 *
 * Tests for line index utilities: buildLineOffsets, findLineIndex,
 * offsetToLineColumnFromIndex, lineColumnToOffsetFromIndex.
 */

import {
  buildLineOffsets,
  findLineIndex,
  offsetToLineColumnFromIndex,
  lineColumnToOffsetFromIndex,
  useLineIndex,
} from "./useLineIndex";
import { renderHook } from "@testing-library/react";

// =============================================================================
// buildLineOffsets tests
// =============================================================================

describe("buildLineOffsets", () => {
  it("returns empty array for empty input", () => {
    const result = buildLineOffsets([]);
    expect(result).toEqual([]);
  });

  it("returns [0] for single empty line", () => {
    const result = buildLineOffsets([""]);
    expect(result).toEqual([0]);
  });

  it("returns [0] for single non-empty line", () => {
    const result = buildLineOffsets(["hello"]);
    expect(result).toEqual([0]);
  });

  it("calculates offsets for multiple lines", () => {
    const lines = ["hello", "world", "test"];
    const result = buildLineOffsets(lines);
    // line 0: offset 0
    // line 1: offset 6 (5 chars + 1 newline)
    // line 2: offset 12 (5 chars + 1 newline + 5 chars + 1 newline)
    expect(result).toEqual([0, 6, 12]);
  });

  it("handles empty lines", () => {
    const lines = ["a", "", "b"];
    const result = buildLineOffsets(lines);
    // line 0: offset 0
    // line 1: offset 2 (1 char + 1 newline)
    // line 2: offset 3 (empty line + 1 newline)
    expect(result).toEqual([0, 2, 3]);
  });

  it("handles CJK characters correctly", () => {
    const lines = ["あいう", "日本語"];
    const result = buildLineOffsets(lines);
    // line 0: offset 0
    // line 1: offset 4 (3 chars + 1 newline)
    expect(result).toEqual([0, 4]);
  });
});

// =============================================================================
// findLineIndex tests
// =============================================================================

describe("findLineIndex", () => {
  it("returns 0 for empty lineOffsets", () => {
    const result = findLineIndex([], 0);
    expect(result).toBe(0);
  });

  it("returns 0 for offset 0", () => {
    const result = findLineIndex([0, 6, 12], 0);
    expect(result).toBe(0);
  });

  it("returns correct line for offset in first line", () => {
    const result = findLineIndex([0, 6, 12], 3);
    expect(result).toBe(0);
  });

  it("returns correct line for offset at line boundary", () => {
    // offset 6 is start of line 1
    const result = findLineIndex([0, 6, 12], 6);
    expect(result).toBe(1);
  });

  it("returns correct line for offset in middle line", () => {
    const result = findLineIndex([0, 6, 12], 8);
    expect(result).toBe(1);
  });

  it("returns correct line for offset in last line", () => {
    const result = findLineIndex([0, 6, 12], 15);
    expect(result).toBe(2);
  });

  it("handles single line", () => {
    const result = findLineIndex([0], 5);
    expect(result).toBe(0);
  });
});

// =============================================================================
// offsetToLineColumnFromIndex tests
// =============================================================================

describe("offsetToLineColumnFromIndex", () => {
  it("returns (1, 1) for empty lines", () => {
    const result = offsetToLineColumnFromIndex([], [], 0);
    expect(result).toEqual({ line: 1, column: 1 });
  });

  it("returns (1, 1) for offset 0", () => {
    const lines = ["hello", "world"];
    const offsets = [0, 6];
    const result = offsetToLineColumnFromIndex(lines, offsets, 0);
    expect(result).toEqual({ line: 1, column: 1 });
  });

  it("returns correct position in first line", () => {
    const lines = ["hello", "world"];
    const offsets = [0, 6];
    const result = offsetToLineColumnFromIndex(lines, offsets, 3);
    expect(result).toEqual({ line: 1, column: 4 });
  });

  it("returns correct position at end of first line", () => {
    const lines = ["hello", "world"];
    const offsets = [0, 6];
    const result = offsetToLineColumnFromIndex(lines, offsets, 5);
    expect(result).toEqual({ line: 1, column: 6 });
  });

  it("returns correct position at start of second line", () => {
    const lines = ["hello", "world"];
    const offsets = [0, 6];
    const result = offsetToLineColumnFromIndex(lines, offsets, 6);
    expect(result).toEqual({ line: 2, column: 1 });
  });

  it("handles negative offset by clamping to 0", () => {
    const lines = ["hello"];
    const offsets = [0];
    const result = offsetToLineColumnFromIndex(lines, offsets, -5);
    expect(result).toEqual({ line: 1, column: 1 });
  });

  it("handles multiline text", () => {
    const lines = ["abc", "defgh", "ij"];
    const offsets = [0, 4, 10];
    // offset 7 = 4 (line 2 start) + 3 = column 4
    const result = offsetToLineColumnFromIndex(lines, offsets, 7);
    expect(result).toEqual({ line: 2, column: 4 });
  });
});

// =============================================================================
// lineColumnToOffsetFromIndex tests
// =============================================================================

describe("lineColumnToOffsetFromIndex", () => {
  it("returns 0 for empty lines", () => {
    const result = lineColumnToOffsetFromIndex({
      lines: [],
      lineOffsets: [],
      line: 1,
      column: 1,
    });
    expect(result).toBe(0);
  });

  it("returns 0 for (1, 1)", () => {
    const result = lineColumnToOffsetFromIndex({
      lines: ["hello", "world"],
      lineOffsets: [0, 6],
      line: 1,
      column: 1,
    });
    expect(result).toBe(0);
  });

  it("returns correct offset for position in first line", () => {
    const result = lineColumnToOffsetFromIndex({
      lines: ["hello", "world"],
      lineOffsets: [0, 6],
      line: 1,
      column: 4,
    });
    expect(result).toBe(3);
  });

  it("returns correct offset for position at start of second line", () => {
    const result = lineColumnToOffsetFromIndex({
      lines: ["hello", "world"],
      lineOffsets: [0, 6],
      line: 2,
      column: 1,
    });
    expect(result).toBe(6);
  });

  it("returns correct offset for position in second line", () => {
    const result = lineColumnToOffsetFromIndex({
      lines: ["hello", "world"],
      lineOffsets: [0, 6],
      line: 2,
      column: 3,
    });
    expect(result).toBe(8);
  });

  it("clamps line to valid range (too small)", () => {
    const result = lineColumnToOffsetFromIndex({
      lines: ["hello", "world"],
      lineOffsets: [0, 6],
      line: 0,
      column: 1,
    });
    expect(result).toBe(0);
  });

  it("clamps line to valid range (too large)", () => {
    const result = lineColumnToOffsetFromIndex({
      lines: ["hello", "world"],
      lineOffsets: [0, 6],
      line: 10,
      column: 1,
    });
    expect(result).toBe(6);
  });

  it("clamps column to line length", () => {
    const result = lineColumnToOffsetFromIndex({
      lines: ["abc"],
      lineOffsets: [0],
      line: 1,
      column: 100,
    });
    expect(result).toBe(3);
  });
});

// =============================================================================
// useLineIndex hook tests
// =============================================================================

describe("useLineIndex", () => {
  it("splits text into lines", () => {
    const { result } = renderHook(() => useLineIndex("hello\nworld"));
    expect(result.current.lines).toEqual(["hello", "world"]);
  });

  it("calculates line offsets", () => {
    const { result } = renderHook(() => useLineIndex("hello\nworld"));
    expect(result.current.lineOffsets).toEqual([0, 6]);
  });

  it("getLineAtOffset works correctly", () => {
    const { result } = renderHook(() => useLineIndex("hello\nworld"));
    expect(result.current.getLineAtOffset(0)).toEqual({ line: 1, column: 1 });
    expect(result.current.getLineAtOffset(5)).toEqual({ line: 1, column: 6 });
    expect(result.current.getLineAtOffset(6)).toEqual({ line: 2, column: 1 });
    expect(result.current.getLineAtOffset(9)).toEqual({ line: 2, column: 4 });
  });

  it("getOffsetAtLineColumn works correctly", () => {
    const { result } = renderHook(() => useLineIndex("hello\nworld"));
    expect(result.current.getOffsetAtLineColumn(1, 1)).toBe(0);
    expect(result.current.getOffsetAtLineColumn(1, 6)).toBe(5);
    expect(result.current.getOffsetAtLineColumn(2, 1)).toBe(6);
    expect(result.current.getOffsetAtLineColumn(2, 4)).toBe(9);
  });

  it("handles empty text", () => {
    const { result } = renderHook(() => useLineIndex(""));
    expect(result.current.lines).toEqual([""]);
    expect(result.current.getLineAtOffset(0)).toEqual({ line: 1, column: 1 });
  });

  it("handles single line", () => {
    const { result } = renderHook(() => useLineIndex("hello"));
    expect(result.current.lines).toEqual(["hello"]);
    expect(result.current.getLineAtOffset(3)).toEqual({ line: 1, column: 4 });
  });

  it("memoizes result", () => {
    const { result, rerender } = renderHook(
      ({ text }) => useLineIndex(text),
      { initialProps: { text: "hello\nworld" } }
    );

    const first = result.current;
    rerender({ text: "hello\nworld" });
    expect(result.current).toBe(first);

    rerender({ text: "changed" });
    expect(result.current).not.toBe(first);
  });
});
