/**
 * @file useTextStyles Tests
 *
 * Tests for style segment tokenization and style utilities.
 */

import { renderHook } from "@testing-library/react";
import { useTextStyles } from "./useTextStyles";
import type { TextStyleSegment, TextStyle } from "../core/types";

// =============================================================================
// Test Data
// =============================================================================

const BOLD_STYLE: TextStyle = { fontWeight: "bold" };
const ITALIC_STYLE: TextStyle = { fontStyle: "italic" };
const RED_STYLE: TextStyle = { color: "red" };
const COMBINED_STYLE: TextStyle = { fontWeight: "bold", fontStyle: "italic" };

// =============================================================================
// Tokenizer Tests
// =============================================================================

describe("useTextStyles tokenizer", () => {
  describe("empty and basic cases", () => {
    it("returns empty array for empty line", () => {
      const { result } = renderHook(() => useTextStyles([]));

      const tokens = result.current.tokenizer.tokenize("");
      expect(tokens).toEqual([]);
    });

    it("returns single default token for text without styles", () => {
      const { result } = renderHook(() => useTextStyles([]));

      const tokens = result.current.tokenizer.tokenize("hello world");
      expect(tokens).toEqual([
        { type: "text", text: "hello world", start: 0, end: 11 },
      ]);
    });

    it("returns styled token when style covers entire line", () => {
      const styles: TextStyleSegment[] = [
        { start: 0, end: 5, style: BOLD_STYLE },
      ];
      const { result } = renderHook(() => useTextStyles(styles));

      const tokens = result.current.tokenizer.tokenize("hello", 0);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe("styled-0");
      expect(tokens[0].text).toBe("hello");
      expect(tokens[0].start).toBe(0);
      expect(tokens[0].end).toBe(5);
    });
  });

  describe("partial coverage", () => {
    it("returns gap token before styled segment", () => {
      const styles: TextStyleSegment[] = [
        { start: 3, end: 6, style: BOLD_STYLE },
      ];
      const { result } = renderHook(() => useTextStyles(styles));

      const tokens = result.current.tokenizer.tokenize("abc123xyz", 0);
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: "text", text: "abc", start: 0, end: 3 });
      expect(tokens[1]).toEqual({ type: "styled-0", text: "123", start: 3, end: 6 });
      expect(tokens[2]).toEqual({ type: "text", text: "xyz", start: 6, end: 9 });
    });

    it("returns gap token after styled segment", () => {
      const styles: TextStyleSegment[] = [
        { start: 0, end: 3, style: BOLD_STYLE },
      ];
      const { result } = renderHook(() => useTextStyles(styles));

      const tokens = result.current.tokenizer.tokenize("abcdef", 0);
      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: "styled-0", text: "abc", start: 0, end: 3 });
      expect(tokens[1]).toEqual({ type: "text", text: "def", start: 3, end: 6 });
    });
  });

  describe("multiple styles", () => {
    it("creates interleaved tokens for adjacent styles", () => {
      const styles: TextStyleSegment[] = [
        { start: 0, end: 3, style: BOLD_STYLE },
        { start: 3, end: 6, style: ITALIC_STYLE },
      ];
      const { result } = renderHook(() => useTextStyles(styles));

      const tokens = result.current.tokenizer.tokenize("abcdef", 0);
      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: "styled-0", text: "abc", start: 0, end: 3 });
      expect(tokens[1]).toEqual({ type: "styled-1", text: "def", start: 3, end: 6 });
    });

    it("creates gap between non-adjacent styles", () => {
      const styles: TextStyleSegment[] = [
        { start: 0, end: 2, style: BOLD_STYLE },
        { start: 4, end: 6, style: ITALIC_STYLE },
      ];
      const { result } = renderHook(() => useTextStyles(styles));

      const tokens = result.current.tokenizer.tokenize("abcdef", 0);
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: "styled-0", text: "ab", start: 0, end: 2 });
      expect(tokens[1]).toEqual({ type: "text", text: "cd", start: 2, end: 4 });
      expect(tokens[2]).toEqual({ type: "styled-1", text: "ef", start: 4, end: 6 });
    });

    it("handles unsorted styles by sorting them", () => {
      const styles: TextStyleSegment[] = [
        { start: 4, end: 6, style: ITALIC_STYLE },
        { start: 0, end: 2, style: BOLD_STYLE },
      ];
      const { result } = renderHook(() => useTextStyles(styles));

      const tokens = result.current.tokenizer.tokenize("abcdef", 0);
      expect(tokens).toHaveLength(3);
      // sorted by start position: styled-1 (bold at 0-2) comes first in output
      expect(tokens[0].text).toBe("ab");
      expect(tokens[1].text).toBe("cd");
      expect(tokens[2].text).toBe("ef");
    });
  });

  describe("lineOffset handling", () => {
    it("applies styles based on document offset, not line offset", () => {
      // Style covers characters 10-15 in the document
      const styles: TextStyleSegment[] = [
        { start: 10, end: 15, style: BOLD_STYLE },
      ];
      const { result } = renderHook(() => useTextStyles(styles));

      // Line starts at offset 10, so style covers the entire line
      const tokens = result.current.tokenizer.tokenize("hello", 10);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe("styled-0");
      expect(tokens[0].text).toBe("hello");
    });

    it("clips style to line boundaries", () => {
      // Style covers characters 8-18 in the document
      const styles: TextStyleSegment[] = [
        { start: 8, end: 18, style: BOLD_STYLE },
      ];
      const { result } = renderHook(() => useTextStyles(styles));

      // Line "world" starts at offset 10, ends at 15
      // Style should be clipped to 0-5 within line
      const tokens = result.current.tokenizer.tokenize("world", 10);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe("styled-0");
      expect(tokens[0].text).toBe("world");
      expect(tokens[0].start).toBe(0);
      expect(tokens[0].end).toBe(5);
    });

    it("ignores styles outside line bounds", () => {
      const styles: TextStyleSegment[] = [
        { start: 0, end: 5, style: BOLD_STYLE },
      ];
      const { result } = renderHook(() => useTextStyles(styles));

      // Line starts at offset 20, style is at 0-5
      const tokens = result.current.tokenizer.tokenize("hello", 20);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe("text");
      expect(tokens[0].text).toBe("hello");
    });

    it("handles style partially overlapping line start", () => {
      const styles: TextStyleSegment[] = [
        { start: 5, end: 12, style: BOLD_STYLE },
      ];
      const { result } = renderHook(() => useTextStyles(styles));

      // Line "hello" starts at offset 10, style starts at 5
      // Style should cover characters 0-2 in line (offsets 10-12)
      const tokens = result.current.tokenizer.tokenize("hello", 10);
      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: "styled-0", text: "he", start: 0, end: 2 });
      expect(tokens[1]).toEqual({ type: "text", text: "llo", start: 2, end: 5 });
    });

    it("handles style that clips to zero length in line", () => {
      const styles: TextStyleSegment[] = [
        // Style ends exactly at line start
        { start: 5, end: 10, style: BOLD_STYLE },
      ];
      const { result } = renderHook(() => useTextStyles(styles));

      // Line starts at offset 10, style ends at 10 - no overlap
      const tokens = result.current.tokenizer.tokenize("hello", 10);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe("text");
      expect(tokens[0].text).toBe("hello");
    });

    it("handles style starting exactly at line end", () => {
      const styles: TextStyleSegment[] = [
        { start: 15, end: 20, style: BOLD_STYLE },
      ];
      const { result } = renderHook(() => useTextStyles(styles));

      // Line is at offset 10-15, style starts at 15 - no overlap
      const tokens = result.current.tokenizer.tokenize("hello", 10);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe("text");
    });

    it("handles zero-length segment in tokenizer (start equals end)", () => {
      // Zero-length segment that falls within line range
      // This tests the `if (entryStartInLine < entryEndInLine)` false branch
      const styles: TextStyleSegment[] = [
        { start: 2, end: 2, style: BOLD_STYLE }, // Zero-length at position 2
      ];
      const { result } = renderHook(() => useTextStyles(styles));

      // Line "hello" at offset 0
      // findOverlappingEntries: 2 < 5 && 2 > 0 → true, included
      // entryStartInLine = max(0, 2-0) = 2
      // entryEndInLine = min(5, 2-0) = 2
      // 2 < 2 is FALSE → segment skipped
      const tokens = result.current.tokenizer.tokenize("hello", 0);

      // Should have gap [0-2], zero-length skipped, gap [2-5]
      // But since both gaps are "text" type, they might be merged or separate
      // The key test is that no "styled-0" token exists
      expect(tokens.every(t => t.type === "text")).toBe(true);
    });
  });
});

// =============================================================================
// getStyleAt Tests
// =============================================================================

describe("useTextStyles getStyleAt", () => {
  it("returns undefined when no style at offset", () => {
    const styles: TextStyleSegment[] = [
      { start: 5, end: 10, style: BOLD_STYLE },
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    expect(result.current.getStyleAt(0)).toBeUndefined();
    expect(result.current.getStyleAt(4)).toBeUndefined();
  });

  it("returns style when offset is at segment start", () => {
    const styles: TextStyleSegment[] = [
      { start: 5, end: 10, style: BOLD_STYLE },
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    expect(result.current.getStyleAt(5)).toEqual(BOLD_STYLE);
  });

  it("returns style when offset is within segment", () => {
    const styles: TextStyleSegment[] = [
      { start: 5, end: 10, style: BOLD_STYLE },
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    expect(result.current.getStyleAt(7)).toEqual(BOLD_STYLE);
  });

  it("returns undefined when offset is at segment end (exclusive)", () => {
    const styles: TextStyleSegment[] = [
      { start: 5, end: 10, style: BOLD_STYLE },
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    expect(result.current.getStyleAt(10)).toBeUndefined();
  });

  it("returns correct style from multiple segments", () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 5, style: BOLD_STYLE },
      { start: 5, end: 10, style: ITALIC_STYLE },
      { start: 10, end: 15, style: RED_STYLE },
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    expect(result.current.getStyleAt(2)).toEqual(BOLD_STYLE);
    expect(result.current.getStyleAt(7)).toEqual(ITALIC_STYLE);
    expect(result.current.getStyleAt(12)).toEqual(RED_STYLE);
  });
});

// =============================================================================
// getLineStyles Tests
// =============================================================================

describe("useTextStyles getLineStyles", () => {
  it("returns default StyleToken when no styles", () => {
    const { result } = renderHook(() => useTextStyles([]));

    const styles = result.current.getLineStyles(0, 10);
    expect(styles).toHaveLength(1);
    expect(styles[0]).toEqual({
      text: "",
      start: 0,
      end: 10,
      style: {},
    });
  });

  it("returns styled segment with correct line-relative positions", () => {
    const styles: TextStyleSegment[] = [
      { start: 5, end: 15, style: BOLD_STYLE },
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    const lineStyles = result.current.getLineStyles(5, 15);
    expect(lineStyles).toHaveLength(1);
    expect(lineStyles[0]).toEqual({
      text: "",
      start: 0,
      end: 10,
      style: BOLD_STYLE,
    });
  });

  it("fills gap at start of line", () => {
    const styles: TextStyleSegment[] = [
      { start: 5, end: 10, style: BOLD_STYLE },
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    // Line from 0 to 10, style starts at 5
    const lineStyles = result.current.getLineStyles(0, 10);
    expect(lineStyles).toHaveLength(2);
    expect(lineStyles[0]).toEqual({
      text: "",
      start: 0,
      end: 5,
      style: {},
    });
    expect(lineStyles[1]).toEqual({
      text: "",
      start: 5,
      end: 10,
      style: BOLD_STYLE,
    });
  });

  it("fills gap at end of line", () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 5, style: BOLD_STYLE },
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    // Line from 0 to 10, style ends at 5
    const lineStyles = result.current.getLineStyles(0, 10);
    expect(lineStyles).toHaveLength(2);
    expect(lineStyles[0]).toEqual({
      text: "",
      start: 0,
      end: 5,
      style: BOLD_STYLE,
    });
    expect(lineStyles[1]).toEqual({
      text: "",
      start: 5,
      end: 10,
      style: {},
    });
  });

  it("fills gap between segments", () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 3, style: BOLD_STYLE },
      { start: 7, end: 10, style: ITALIC_STYLE },
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    const lineStyles = result.current.getLineStyles(0, 10);
    expect(lineStyles).toHaveLength(3);
    expect(lineStyles[0]).toEqual({
      text: "",
      start: 0,
      end: 3,
      style: BOLD_STYLE,
    });
    expect(lineStyles[1]).toEqual({
      text: "",
      start: 3,
      end: 7,
      style: {},
    });
    expect(lineStyles[2]).toEqual({
      text: "",
      start: 7,
      end: 10,
      style: ITALIC_STYLE,
    });
  });

  it("clips styles that extend beyond line", () => {
    const styles: TextStyleSegment[] = [
      { start: 5, end: 20, style: BOLD_STYLE },
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    // Line from 10 to 15, style is 5-20
    const lineStyles = result.current.getLineStyles(10, 15);
    expect(lineStyles).toHaveLength(1);
    expect(lineStyles[0]).toEqual({
      text: "",
      start: 0,
      end: 5,
      style: BOLD_STYLE,
    });
  });

  it("clips styles that start before line", () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 15, style: BOLD_STYLE },
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    // Line from 10 to 20, style is 0-15
    const lineStyles = result.current.getLineStyles(10, 20);
    expect(lineStyles).toHaveLength(2);
    expect(lineStyles[0]).toEqual({
      text: "",
      start: 0,
      end: 5,
      style: BOLD_STYLE,
    });
    expect(lineStyles[1]).toEqual({
      text: "",
      start: 5,
      end: 10,
      style: {},
    });
  });

  it("handles style that clips to zero-length segment", () => {
    const styles: TextStyleSegment[] = [
      // Style at exactly line start position, so after clipping start === end
      { start: 10, end: 10, style: BOLD_STYLE },
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    // This style has zero length, should be effectively ignored
    const lineStyles = result.current.getLineStyles(10, 20);
    // Only default segment for the full line
    expect(lineStyles).toHaveLength(1);
    expect(lineStyles[0].style).toEqual({});
  });

  it("handles style completely before line (no overlap)", () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 5, style: BOLD_STYLE },
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    // Line starts at 10, style ends at 5 - no overlap
    const lineStyles = result.current.getLineStyles(10, 20);
    expect(lineStyles).toHaveLength(1);
    expect(lineStyles[0]).toEqual({
      text: "",
      start: 0,
      end: 10,
      style: {},
    });
  });

  it("handles degenerate segment with start equal to end (zero-length)", () => {
    // Edge case: segment where start === end (zero-length)
    // findOverlappingEntries: 5 < 10 && 5 > 0 → included in overlapping
    // But after clipping: start=5, end=5, so start < end is FALSE → segment skipped
    const styles: TextStyleSegment[] = [
      { start: 5, end: 5, style: BOLD_STYLE }, // Zero-length segment
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    const lineStyles = result.current.getLineStyles(0, 10);
    // Result: gap [0-5], zero-length segment SKIPPED, gap [5-10]
    expect(lineStyles).toHaveLength(2);
    expect(lineStyles[0]).toEqual({ text: "", start: 0, end: 5, style: {} });
    expect(lineStyles[1]).toEqual({ text: "", start: 5, end: 10, style: {} });
    // No bold style because the zero-length segment was skipped
  });

  it("handles segment that barely overlaps line start", () => {
    const styles: TextStyleSegment[] = [
      { start: 8, end: 11, style: BOLD_STYLE }, // Overlaps line start by 1
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    // Line from 10-20, style 8-11 overlaps at 10-11
    const lineStyles = result.current.getLineStyles(10, 20);
    expect(lineStyles.length).toBeGreaterThanOrEqual(1);
    // Should have styled segment at start
    const styledSegment = lineStyles.find(s => s.style.fontWeight === "bold");
    expect(styledSegment).toBeDefined();
  });

  it("handles segment that barely overlaps line end", () => {
    const styles: TextStyleSegment[] = [
      { start: 18, end: 22, style: BOLD_STYLE }, // Overlaps line end by 2
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    // Line from 10-20, style 18-22 overlaps at 18-20
    const lineStyles = result.current.getLineStyles(10, 20);
    const styledSegment = lineStyles.find(s => s.style.fontWeight === "bold");
    expect(styledSegment).toBeDefined();
    expect(styledSegment?.end).toBe(10); // 20 - 10 = line-relative end
  });
});

// =============================================================================
// tokenStyles Tests
// =============================================================================

describe("useTextStyles tokenStyles", () => {
  it("includes default 'text' style", () => {
    const { result } = renderHook(() => useTextStyles([]));

    expect(result.current.tokenStyles).toHaveProperty("text");
    expect(result.current.tokenStyles.text).toEqual({});
  });

  it("converts TextStyle to CSSProperties", () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 5, style: COMBINED_STYLE },
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    expect(result.current.tokenStyles["styled-0"]).toEqual({
      fontFamily: undefined,
      fontSize: undefined,
      fontWeight: "bold",
      fontStyle: "italic",
      textDecoration: undefined,
      color: undefined,
    });
  });

  it("maps each style segment to a unique token type", () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 5, style: BOLD_STYLE },
      { start: 5, end: 10, style: ITALIC_STYLE },
      { start: 10, end: 15, style: RED_STYLE },
    ];
    const { result } = renderHook(() => useTextStyles(styles));

    expect(result.current.tokenStyles).toHaveProperty("styled-0");
    expect(result.current.tokenStyles).toHaveProperty("styled-1");
    expect(result.current.tokenStyles).toHaveProperty("styled-2");
    expect(result.current.tokenStyles["styled-0"].fontWeight).toBe("bold");
    expect(result.current.tokenStyles["styled-1"].fontStyle).toBe("italic");
    expect(result.current.tokenStyles["styled-2"].color).toBe("red");
  });
});

// =============================================================================
// Memoization Tests
// =============================================================================

describe("useTextStyles memoization", () => {
  it("returns stable references when styles don't change", () => {
    const styles: TextStyleSegment[] = [
      { start: 0, end: 5, style: BOLD_STYLE },
    ];
    const { result, rerender } = renderHook(() => useTextStyles(styles));

    const initialTokenizer = result.current.tokenizer;
    const initialTokenStyles = result.current.tokenStyles;

    rerender();

    expect(result.current.tokenizer).toBe(initialTokenizer);
    expect(result.current.tokenStyles).toBe(initialTokenStyles);
  });

  it("updates references when styles change", () => {
    const { result, rerender } = renderHook(
      ({ styles }) => useTextStyles(styles),
      {
        initialProps: {
          styles: [{ start: 0, end: 5, style: BOLD_STYLE }] as TextStyleSegment[],
        },
      }
    );

    const initialTokenizer = result.current.tokenizer;
    const initialTokenStyles = result.current.tokenStyles;

    rerender({
      styles: [{ start: 0, end: 5, style: ITALIC_STYLE }],
    });

    expect(result.current.tokenizer).not.toBe(initialTokenizer);
    expect(result.current.tokenStyles).not.toBe(initialTokenStyles);
  });
});
