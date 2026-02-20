/**
 * @file Wrap Calculation Tests
 */

import { describe, it, expect } from "vitest";
import {
  isWordBoundaryChar,
  isCJKChar,
  isWordBreakPoint,
  findWrapPosition,
  calculateLineWrapPoints,
  getLineSegments,
} from "./wrapCalculation";

// =============================================================================
// Character Classification Tests
// =============================================================================

describe("isWordBoundaryChar", () => {
  it("returns true for space", () => {
    expect(isWordBoundaryChar(" ")).toBe(true);
  });

  it("returns true for tab", () => {
    expect(isWordBoundaryChar("\t")).toBe(true);
  });

  it("returns true for punctuation", () => {
    expect(isWordBoundaryChar(".")).toBe(true);
    expect(isWordBoundaryChar(",")).toBe(true);
    expect(isWordBoundaryChar("!")).toBe(true);
    expect(isWordBoundaryChar("-")).toBe(true);
  });

  it("returns false for letters", () => {
    expect(isWordBoundaryChar("a")).toBe(false);
    expect(isWordBoundaryChar("Z")).toBe(false);
  });

  it("returns false for digits", () => {
    expect(isWordBoundaryChar("0")).toBe(false);
    expect(isWordBoundaryChar("9")).toBe(false);
  });
});

describe("isCJKChar", () => {
  it("returns true for Chinese characters", () => {
    expect(isCJKChar("漢")).toBe(true);
    expect(isCJKChar("中")).toBe(true);
  });

  it("returns true for Japanese characters", () => {
    expect(isCJKChar("あ")).toBe(true);
    expect(isCJKChar("ア")).toBe(true);
  });

  it("returns true for Korean characters", () => {
    expect(isCJKChar("한")).toBe(true);
  });

  it("returns false for ASCII characters", () => {
    expect(isCJKChar("a")).toBe(false);
    expect(isCJKChar("Z")).toBe(false);
    expect(isCJKChar(" ")).toBe(false);
  });
});

describe("isWordBreakPoint", () => {
  it("returns true at start of line", () => {
    expect(isWordBreakPoint("hello", 0)).toBe(true);
  });

  it("returns true at end of line", () => {
    expect(isWordBreakPoint("hello", 5)).toBe(true);
  });

  it("returns true after space", () => {
    expect(isWordBreakPoint("hello world", 6)).toBe(true);
  });

  it("returns false in middle of word", () => {
    expect(isWordBreakPoint("hello", 2)).toBe(false);
  });

  it("returns true before CJK character", () => {
    expect(isWordBreakPoint("hello漢字", 5)).toBe(true);
  });

  it("returns true after CJK character", () => {
    expect(isWordBreakPoint("漢字hello", 2)).toBe(true);
  });
});

// =============================================================================
// Wrap Position Finding Tests
// =============================================================================

describe("findWrapPosition", () => {
  // Simple measureText that returns character count (1 unit per char)
  const measureText = (text: string) => text.length;

  it("returns line length when line fits", () => {
    const result = findWrapPosition("hello", 0, 10, measureText, true);
    expect(result).toBe(5);
  });

  it("finds wrap position at max width", () => {
    const result = findWrapPosition("hello world", 0, 5, measureText, false);
    expect(result).toBe(5);
  });

  it("with word wrap, finds word boundary before max width", () => {
    const result = findWrapPosition("hello world test", 0, 7, measureText, true);
    // Should break at "hello " (6 chars) since "hello w" is 7 but "w" is not a complete word
    expect(result).toBe(6);
  });

  it("with word wrap disabled, breaks at character boundary", () => {
    const result = findWrapPosition("helloworld", 0, 5, measureText, false);
    expect(result).toBe(5);
  });

  it("handles long word with word wrap by falling back to character wrap", () => {
    // A very long word with no word boundaries
    const result = findWrapPosition("superlongword", 0, 5, measureText, true);
    // Should fall back to character wrap since no word boundary found
    expect(result).toBe(5);
  });

  it("handles starting offset", () => {
    const result = findWrapPosition("hello world", 6, 5, measureText, true);
    // Starting from offset 6 ("world"), max width 5, should fit
    expect(result).toBe(11);
  });
});

// =============================================================================
// Line Wrap Point Calculation Tests
// =============================================================================

describe("calculateLineWrapPoints", () => {
  const measureText = (text: string) => text.length;

  it("returns empty array when line fits", () => {
    const result = calculateLineWrapPoints("hello", measureText, {
      maxWidth: 10,
      wordWrap: true,
    });
    expect(result).toEqual([]);
  });

  it("returns empty array when maxWidth is 0", () => {
    const result = calculateLineWrapPoints("hello", measureText, {
      maxWidth: 0,
      wordWrap: true,
    });
    expect(result).toEqual([]);
  });

  it("returns empty array for empty line", () => {
    const result = calculateLineWrapPoints("", measureText, {
      maxWidth: 10,
      wordWrap: true,
    });
    expect(result).toEqual([]);
  });

  it("calculates single wrap point", () => {
    const result = calculateLineWrapPoints("hello world", measureText, {
      maxWidth: 6,
      wordWrap: true,
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ offset: 6, isSoftWrap: true });
  });

  it("calculates multiple wrap points", () => {
    const result = calculateLineWrapPoints("hello world test again", measureText, {
      maxWidth: 6,
      wordWrap: true,
    });
    expect(result.length).toBeGreaterThan(1);
    expect(result.every((wp) => wp.isSoftWrap)).toBe(true);
  });
});

// =============================================================================
// Line Segments Tests
// =============================================================================

describe("getLineSegments", () => {
  it("returns single segment for no wrap points", () => {
    const result = getLineSegments(10, []);
    expect(result).toEqual([{ start: 0, end: 10, isSoftWrapped: false }]);
  });

  it("returns segments for single wrap point", () => {
    const result = getLineSegments(11, [{ offset: 6, isSoftWrap: true }]);
    expect(result).toEqual([
      { start: 0, end: 6, isSoftWrapped: true },
      { start: 6, end: 11, isSoftWrapped: false },
    ]);
  });

  it("returns segments for multiple wrap points", () => {
    const result = getLineSegments(20, [
      { offset: 6, isSoftWrap: true },
      { offset: 12, isSoftWrap: true },
    ]);
    expect(result).toEqual([
      { start: 0, end: 6, isSoftWrapped: true },
      { start: 6, end: 12, isSoftWrapped: true },
      { start: 12, end: 20, isSoftWrapped: false },
    ]);
  });
});
