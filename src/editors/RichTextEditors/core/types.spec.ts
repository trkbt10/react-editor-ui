/**
 * @file Core types tests
 *
 * Tests for CompositionState, display text utilities, and style adjustment.
 */

import {
  INITIAL_COMPOSITION_STATE,
  computeDisplayText,
  computeDisplayCursorOffset,
  adjustStyleForComposition,
  type CompositionState,
} from "./types";

// =============================================================================
// INITIAL_COMPOSITION_STATE tests
// =============================================================================

describe("INITIAL_COMPOSITION_STATE", () => {
  it("has correct initial values", () => {
    expect(INITIAL_COMPOSITION_STATE).toEqual({
      isComposing: false,
      text: "",
      startOffset: 0,
      replacedLength: 0,
      baseValue: "",
    });
  });
});

// =============================================================================
// computeDisplayText tests
// =============================================================================

describe("computeDisplayText", () => {
  it("returns value unchanged when not composing", () => {
    const value = "hello world";
    const result = computeDisplayText(value, INITIAL_COMPOSITION_STATE);
    expect(result).toBe(value);
  });

  it("returns value unchanged during composition (browser sync)", () => {
    // Browser updates textarea.value during composition
    // So we just pass through the value
    const composition: CompositionState = {
      isComposing: true,
      text: "あ",
      startOffset: 5,
      replacedLength: 0,
      baseValue: "hello",
    };
    const result = computeDisplayText("helloあ", composition);
    expect(result).toBe("helloあ");
  });

  it("handles empty value", () => {
    const result = computeDisplayText("", INITIAL_COMPOSITION_STATE);
    expect(result).toBe("");
  });

  it("handles multiline text", () => {
    const value = "line1\nline2\nline3";
    const result = computeDisplayText(value, INITIAL_COMPOSITION_STATE);
    expect(result).toBe(value);
  });
});

// =============================================================================
// computeDisplayCursorOffset tests
// =============================================================================

describe("computeDisplayCursorOffset", () => {
  it("returns cursor at end of composition text", () => {
    const composition: CompositionState = {
      isComposing: true,
      text: "あいう",
      startOffset: 5,
      replacedLength: 0,
      baseValue: "hello",
    };
    const result = computeDisplayCursorOffset(composition);
    // startOffset (5) + text.length (3) = 8
    expect(result).toBe(8);
  });

  it("returns startOffset when composition text is empty", () => {
    const composition: CompositionState = {
      isComposing: true,
      text: "",
      startOffset: 10,
      replacedLength: 0,
      baseValue: "hello",
    };
    const result = computeDisplayCursorOffset(composition);
    expect(result).toBe(10);
  });

  it("handles composition at start of text", () => {
    const composition: CompositionState = {
      isComposing: true,
      text: "あ",
      startOffset: 0,
      replacedLength: 0,
      baseValue: "",
    };
    const result = computeDisplayCursorOffset(composition);
    expect(result).toBe(1);
  });
});

// =============================================================================
// adjustStyleForComposition comprehensive tests
// =============================================================================

describe("adjustStyleForComposition", () => {
  describe("when not composing", () => {
    it("returns segment unchanged", () => {
      const segment = { start: 0, end: 10 };
      const result = adjustStyleForComposition(segment, INITIAL_COMPOSITION_STATE);
      expect(result).toEqual(segment);
    });

    it("preserves additional properties", () => {
      const segment = { start: 0, end: 10, color: "red", fontWeight: "bold" };
      const result = adjustStyleForComposition(segment, INITIAL_COMPOSITION_STATE);
      expect(result).toEqual(segment);
    });
  });

  describe("segment before composition", () => {
    const composition: CompositionState = {
      isComposing: true,
      text: "あいう",
      startOffset: 10,
      replacedLength: 0,
      baseValue: "0123456789",
    };

    it("returns unchanged when segment ends exactly at composition start", () => {
      const segment = { start: 5, end: 10 };
      const result = adjustStyleForComposition(segment, composition);
      expect(result).toEqual({ start: 5, end: 10 });
    });

    it("returns unchanged when segment ends before composition start", () => {
      const segment = { start: 0, end: 5 };
      const result = adjustStyleForComposition(segment, composition);
      expect(result).toEqual({ start: 0, end: 5 });
    });
  });

  describe("segment after composition", () => {
    it("shifts by text.length when replacedLength is 0", () => {
      const composition: CompositionState = {
        isComposing: true,
        text: "あいう", // 3 chars
        startOffset: 5,
        replacedLength: 0,
        baseValue: "hello",
      };
      const segment = { start: 10, end: 15 };
      const result = adjustStyleForComposition(segment, composition);
      // shift = 3 - 0 = 3
      expect(result).toEqual({ start: 13, end: 18 });
    });

    it("shifts correctly when replacing text", () => {
      const composition: CompositionState = {
        isComposing: true,
        text: "あ", // 1 char replacing 3 chars
        startOffset: 5,
        replacedLength: 3,
        baseValue: "helloXXX",
      };
      const segment = { start: 10, end: 15 };
      const result = adjustStyleForComposition(segment, composition);
      // shift = 1 - 3 = -2
      expect(result).toEqual({ start: 8, end: 13 });
    });

    it("handles segment starting exactly at composition end", () => {
      const composition: CompositionState = {
        isComposing: true,
        text: "あ",
        startOffset: 5,
        replacedLength: 2, // composition range: 5-7
        baseValue: "helloXX",
      };
      const segment = { start: 7, end: 10 };
      const result = adjustStyleForComposition(segment, composition);
      // shift = 1 - 2 = -1
      expect(result).toEqual({ start: 6, end: 9 });
    });
  });

  describe("segment inside composition", () => {
    it("returns null when segment is entirely within composition range", () => {
      const composition: CompositionState = {
        isComposing: true,
        text: "あ",
        startOffset: 5,
        replacedLength: 5, // range: 5-10
        baseValue: "hello12345",
      };
      const segment = { start: 6, end: 9 };
      const result = adjustStyleForComposition(segment, composition);
      expect(result).toBeNull();
    });

    it("returns null when segment matches composition range exactly", () => {
      const composition: CompositionState = {
        isComposing: true,
        text: "あ",
        startOffset: 5,
        replacedLength: 5,
        baseValue: "hello12345",
      };
      const segment = { start: 5, end: 10 };
      const result = adjustStyleForComposition(segment, composition);
      expect(result).toBeNull();
    });
  });

  describe("segment overlapping composition start", () => {
    it("truncates at composition start", () => {
      const composition: CompositionState = {
        isComposing: true,
        text: "あ",
        startOffset: 10,
        replacedLength: 2,
        baseValue: "0123456789XX",
      };
      const segment = { start: 5, end: 15 };
      const result = adjustStyleForComposition(segment, composition);
      expect(result).toEqual({ start: 5, end: 10 });
    });

    it("preserves properties when truncating", () => {
      const composition: CompositionState = {
        isComposing: true,
        text: "あ",
        startOffset: 10,
        replacedLength: 2,
        baseValue: "0123456789XX",
      };
      const segment = { start: 5, end: 15, color: "blue" };
      const result = adjustStyleForComposition(segment, composition);
      expect(result).toEqual({ start: 5, end: 10, color: "blue" });
    });
  });

  describe("segment overlapping composition end", () => {
    it("adjusts start and shifts end", () => {
      const composition: CompositionState = {
        isComposing: true,
        text: "あいう", // 3 chars
        startOffset: 5,
        replacedLength: 2, // composition range: 5-7
        baseValue: "helloXX",
      };
      const segment = { start: 6, end: 12 };
      const result = adjustStyleForComposition(segment, composition);
      // start is inside (6 >= 5 && 6 < 7), so new start = 5 + 3 = 8
      // shift = 3 - 2 = 1, new end = 12 + 1 = 13
      expect(result).toEqual({ start: 8, end: 13 });
    });
  });

  describe("segment spanning entire composition", () => {
    it("truncates to before composition (first part)", () => {
      const composition: CompositionState = {
        isComposing: true,
        text: "あ",
        startOffset: 10,
        replacedLength: 5,
        baseValue: "0123456789XXXXX",
      };
      const segment = { start: 5, end: 20 };
      const result = adjustStyleForComposition(segment, composition);
      // Returns first part only (limitation noted in code)
      expect(result).toEqual({ start: 5, end: 10 });
    });
  });

  describe("edge cases", () => {
    it("handles zero-length composition range", () => {
      const composition: CompositionState = {
        isComposing: true,
        text: "あ",
        startOffset: 5,
        replacedLength: 0,
        baseValue: "hello",
      };
      const segment = { start: 5, end: 10 };
      const result = adjustStyleForComposition(segment, composition);
      // shift = 1 - 0 = 1
      expect(result).toEqual({ start: 6, end: 11 });
    });

    it("handles composition at text start", () => {
      const composition: CompositionState = {
        isComposing: true,
        text: "あ",
        startOffset: 0,
        replacedLength: 0,
        baseValue: "",
      };
      const segment = { start: 0, end: 5 };
      const result = adjustStyleForComposition(segment, composition);
      // shift = 1
      expect(result).toEqual({ start: 1, end: 6 });
    });

    it("handles empty segment", () => {
      const composition: CompositionState = {
        isComposing: true,
        text: "あ",
        startOffset: 5,
        replacedLength: 0,
        baseValue: "hello",
      };
      const segment = { start: 3, end: 3 };
      const result = adjustStyleForComposition(segment, composition);
      expect(result).toEqual({ start: 3, end: 3 });
    });
  });
});
