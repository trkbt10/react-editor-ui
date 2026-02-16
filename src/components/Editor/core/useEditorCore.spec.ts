/**
 * @file useEditorCore tests
 *
 * Tests for pure functions and editor core utilities.
 */

import { describe, it, expect } from "vitest";
import {
  createCursorState,
  createSelectionHighlight,
  createCompositionHighlight,
  combineHighlights,
} from "./useEditorCore";
import {
  INITIAL_COMPOSITION_STATE,
  computeDisplayText,
  adjustStyleForComposition,
  type CompositionState,
} from "./types";
import { useLineIndex } from "./useLineIndex";

// =============================================================================
// Helper to create LineIndex for testing
// =============================================================================

function createTestLineIndex(text: string) {
  // Simulate useLineIndex behavior for pure function testing
  const lines = text.split("\n");
  const lineOffsets: number[] = [];
  let offset = 0;
  for (const line of lines) {
    lineOffsets.push(offset);
    offset += line.length + 1;
  }

  return {
    lines,
    lineOffsets,
    getLineAtOffset: (off: number) => {
      let remaining = off;
      for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length;
        if (remaining <= lineLength) {
          return { line: i + 1, column: remaining + 1 };
        }
        remaining -= lineLength + 1;
      }
      const lastLine = lines.length;
      return { line: lastLine, column: (lines[lastLine - 1]?.length ?? 0) + 1 };
    },
    getOffsetAtLineColumn: (line: number, column: number) => {
      const lineIndex = Math.max(0, Math.min(line - 1, lines.length - 1));
      const lineStart = lineOffsets[lineIndex];
      const lineText = lines[lineIndex];
      const colOffset = Math.max(0, Math.min(column - 1, lineText.length));
      return lineStart + colOffset;
    },
  };
}

// =============================================================================
// createCursorState tests
// =============================================================================

describe("createCursorState", () => {
  it("creates visible blinking cursor when focused without selection", () => {
    const cursorPos = { line: 1, column: 5 };
    const result = createCursorState(cursorPos, true, false, false);

    expect(result).toEqual({
      line: 1,
      column: 5,
      visible: true,
      blinking: true,
    });
  });

  it("creates visible non-blinking cursor when focused with selection", () => {
    const cursorPos = { line: 2, column: 10 };
    const result = createCursorState(cursorPos, true, true, false);

    expect(result).toEqual({
      line: 2,
      column: 10,
      visible: true,
      blinking: false,
    });
  });

  it("creates visible non-blinking cursor during IME composition", () => {
    const cursorPos = { line: 1, column: 3 };
    const result = createCursorState(cursorPos, true, false, true);

    expect(result).toEqual({
      line: 1,
      column: 3,
      visible: true,
      blinking: false,
    });
  });

  it("creates invisible cursor when not focused", () => {
    const cursorPos = { line: 1, column: 1 };
    const result = createCursorState(cursorPos, false, false, false);

    expect(result).toEqual({
      line: 1,
      column: 1,
      visible: false,
      blinking: false,
    });
  });
});

// =============================================================================
// createSelectionHighlight tests
// =============================================================================

describe("createSelectionHighlight", () => {
  it("creates selection highlight for single line", () => {
    const startPos = { line: 1, column: 5 };
    const endPos = { line: 1, column: 10 };
    const result = createSelectionHighlight(startPos, endPos);

    expect(result).toEqual({
      startLine: 1,
      startColumn: 5,
      endLine: 1,
      endColumn: 10,
      type: "selection",
    });
  });

  it("creates selection highlight for multiple lines", () => {
    const startPos = { line: 1, column: 5 };
    const endPos = { line: 3, column: 2 };
    const result = createSelectionHighlight(startPos, endPos);

    expect(result).toEqual({
      startLine: 1,
      startColumn: 5,
      endLine: 3,
      endColumn: 2,
      type: "selection",
    });
  });
});

// =============================================================================
// createCompositionHighlight tests
// =============================================================================

describe("createCompositionHighlight", () => {
  it("returns null when not composing", () => {
    const lineIndex = createTestLineIndex("hello world");
    const result = createCompositionHighlight(INITIAL_COMPOSITION_STATE, lineIndex);

    expect(result).toBeNull();
  });

  it("returns null when composition text is empty", () => {
    const lineIndex = createTestLineIndex("hello world");
    const composition: CompositionState = {
      isComposing: true,
      text: "",
      startOffset: 5,
      replacedLength: 0,
      baseValue: "hello world",
    };
    const result = createCompositionHighlight(composition, lineIndex);

    expect(result).toBeNull();
  });

  it("creates highlight for composition text on single line", () => {
    const lineIndex = createTestLineIndex("helloあいうworld");
    const composition: CompositionState = {
      isComposing: true,
      text: "あいう",
      startOffset: 5,
      replacedLength: 0,
      baseValue: "hello world",
    };
    const result = createCompositionHighlight(composition, lineIndex);

    expect(result).toEqual({
      startLine: 1,
      startColumn: 6,
      endLine: 1,
      endColumn: 9,
      type: "composition",
    });
  });

  it("creates highlight spanning multiple lines", () => {
    const lineIndex = createTestLineIndex("hello\nあいう\nworld");
    const composition: CompositionState = {
      isComposing: true,
      text: "\nあいう\n",
      startOffset: 5,
      replacedLength: 0,
      baseValue: "helloworld",
    };
    const result = createCompositionHighlight(composition, lineIndex);

    expect(result).not.toBeNull();
    expect(result?.startLine).toBe(1);
    expect(result?.endLine).toBe(3);
  });
});

// =============================================================================
// combineHighlights tests
// =============================================================================

describe("combineHighlights", () => {
  it("returns empty array when both are null", () => {
    const result = combineHighlights(null, null);
    expect(result).toEqual([]);
  });

  it("returns array with selection only", () => {
    const selection = {
      startLine: 1,
      startColumn: 1,
      endLine: 1,
      endColumn: 5,
      type: "selection" as const,
    };
    const result = combineHighlights(selection, null);
    expect(result).toEqual([selection]);
  });

  it("returns array with composition only", () => {
    const composition = {
      startLine: 1,
      startColumn: 5,
      endLine: 1,
      endColumn: 8,
      type: "composition" as const,
    };
    const result = combineHighlights(null, composition);
    expect(result).toEqual([composition]);
  });

  it("returns array with both in order", () => {
    const selection = {
      startLine: 1,
      startColumn: 1,
      endLine: 1,
      endColumn: 5,
      type: "selection" as const,
    };
    const composition = {
      startLine: 1,
      startColumn: 5,
      endLine: 1,
      endColumn: 8,
      type: "composition" as const,
    };
    const result = combineHighlights(selection, composition);
    expect(result).toEqual([selection, composition]);
  });
});

// =============================================================================
// computeDisplayText tests
// =============================================================================

describe("computeDisplayText", () => {
  it("returns value as-is when not composing", () => {
    const result = computeDisplayText("hello world", INITIAL_COMPOSITION_STATE);
    expect(result).toBe("hello world");
  });

  it("returns value as-is during composition (browser handles it)", () => {
    const composition: CompositionState = {
      isComposing: true,
      text: "あ",
      startOffset: 5,
      replacedLength: 0,
      baseValue: "hello",
    };
    // During composition, browser updates textarea.value directly
    // so we just return value as-is
    const result = computeDisplayText("helloあ", composition);
    expect(result).toBe("helloあ");
  });
});

// =============================================================================
// adjustStyleForComposition tests
// =============================================================================

describe("adjustStyleForComposition", () => {
  it("returns segment unchanged when not composing", () => {
    const segment = { start: 5, end: 10, color: "red" };
    const result = adjustStyleForComposition(segment, INITIAL_COMPOSITION_STATE);
    expect(result).toEqual(segment);
  });

  it("returns segment unchanged when entirely before composition", () => {
    const segment = { start: 0, end: 3 };
    const composition: CompositionState = {
      isComposing: true,
      text: "あ",
      startOffset: 5,
      replacedLength: 0,
      baseValue: "hello",
    };
    const result = adjustStyleForComposition(segment, composition);
    expect(result).toEqual(segment);
  });

  it("shifts segment when entirely after composition", () => {
    const segment = { start: 10, end: 15 };
    const composition: CompositionState = {
      isComposing: true,
      text: "あいう", // 3 chars
      startOffset: 5,
      replacedLength: 0,
      baseValue: "hello",
    };
    const result = adjustStyleForComposition(segment, composition);
    // Shift = 3 - 0 = 3
    expect(result).toEqual({ start: 13, end: 18 });
  });

  it("shifts segment accounting for replaced text", () => {
    const segment = { start: 10, end: 15 };
    const composition: CompositionState = {
      isComposing: true,
      text: "あ", // 1 char replacing 2 chars
      startOffset: 5,
      replacedLength: 2,
      baseValue: "helloXX",
    };
    const result = adjustStyleForComposition(segment, composition);
    // Shift = 1 - 2 = -1
    expect(result).toEqual({ start: 9, end: 14 });
  });

  it("returns null for segment entirely inside composition range", () => {
    const segment = { start: 5, end: 7 };
    const composition: CompositionState = {
      isComposing: true,
      text: "あ",
      startOffset: 5,
      replacedLength: 5,
      baseValue: "helloworld",
    };
    const result = adjustStyleForComposition(segment, composition);
    expect(result).toBeNull();
  });

  it("truncates segment that overlaps composition start", () => {
    const segment = { start: 3, end: 8 };
    const composition: CompositionState = {
      isComposing: true,
      text: "あ",
      startOffset: 5,
      replacedLength: 2,
      baseValue: "hello",
    };
    const result = adjustStyleForComposition(segment, composition);
    expect(result).toEqual({ start: 3, end: 5 });
  });

  it("shifts segment that overlaps composition end", () => {
    const segment = { start: 6, end: 10 };
    const composition: CompositionState = {
      isComposing: true,
      text: "あ", // 1 char
      startOffset: 5,
      replacedLength: 2, // composition range: 5-7
      baseValue: "hello",
    };
    const result = adjustStyleForComposition(segment, composition);
    // Start is inside composition (6 >= 5 && 6 < 7), end is after (10 > 7)
    // New start = 5 + 1 = 6, shift = 1 - 2 = -1, new end = 10 - 1 = 9
    expect(result).toEqual({ start: 6, end: 9 });
  });

  it("truncates segment spanning entire composition", () => {
    const segment = { start: 3, end: 12 };
    const composition: CompositionState = {
      isComposing: true,
      text: "あ",
      startOffset: 5,
      replacedLength: 2,
      baseValue: "hello",
    };
    const result = adjustStyleForComposition(segment, composition);
    // First part: 3-5
    expect(result).toEqual({ start: 3, end: 5 });
  });
});

// =============================================================================
// useLineIndex integration tests
// =============================================================================

describe("useLineIndex helper", () => {
  it("correctly calculates line positions", () => {
    const lineIndex = createTestLineIndex("hello\nworld\ntest");

    expect(lineIndex.getLineAtOffset(0)).toEqual({ line: 1, column: 1 });
    expect(lineIndex.getLineAtOffset(5)).toEqual({ line: 1, column: 6 });
    expect(lineIndex.getLineAtOffset(6)).toEqual({ line: 2, column: 1 });
    expect(lineIndex.getLineAtOffset(11)).toEqual({ line: 2, column: 6 });
    expect(lineIndex.getLineAtOffset(12)).toEqual({ line: 3, column: 1 });
  });

  it("correctly calculates offsets from positions", () => {
    const lineIndex = createTestLineIndex("hello\nworld\ntest");

    expect(lineIndex.getOffsetAtLineColumn(1, 1)).toBe(0);
    expect(lineIndex.getOffsetAtLineColumn(1, 6)).toBe(5);
    expect(lineIndex.getOffsetAtLineColumn(2, 1)).toBe(6);
    expect(lineIndex.getOffsetAtLineColumn(2, 6)).toBe(11);
    expect(lineIndex.getOffsetAtLineColumn(3, 1)).toBe(12);
  });
});
