/**
 * @file Word and Line Boundary Tests
 */

import { findWordBoundaries, findLineBoundaries } from "./wordBoundaries";

describe("findWordBoundaries", () => {
  it("finds word at beginning of text", () => {
    const result = findWordBoundaries("hello world", 2);
    expect(result).toEqual({ start: 0, end: 5 });
  });

  it("finds word in middle of text", () => {
    const result = findWordBoundaries("hello world test", 8);
    expect(result).toEqual({ start: 6, end: 11 });
  });

  it("finds word at end of text", () => {
    const result = findWordBoundaries("hello world", 8);
    expect(result).toEqual({ start: 6, end: 11 });
  });

  it("handles offset at word boundary (space)", () => {
    const result = findWordBoundaries("hello world", 5);
    // At space position, selects the previous word "hello"
    // This is because scanning backwards from position 5 finds 'o' which is not a separator
    expect(result).toEqual({ start: 0, end: 5 });
  });

  it("handles punctuation as word separators", () => {
    const result = findWordBoundaries("hello, world", 2);
    expect(result).toEqual({ start: 0, end: 5 });
  });

  it("handles punctuation at end of word", () => {
    const result = findWordBoundaries("hello, world", 6);
    // Clicking on comma should select just the comma
    expect(result).toEqual({ start: 6, end: 7 });
  });

  it("handles empty string", () => {
    const result = findWordBoundaries("", 0);
    expect(result).toEqual({ start: 0, end: 0 });
  });

  it("clamps offset to valid range when too large", () => {
    const result = findWordBoundaries("hello", 100);
    expect(result.start).toBeLessThanOrEqual(5);
    expect(result.end).toBeLessThanOrEqual(5);
  });

  it("clamps negative offset to zero", () => {
    const result = findWordBoundaries("hello", -5);
    expect(result.start).toBe(0);
    expect(result.end).toBe(5);
  });

  it("handles offset at exact end of text", () => {
    const result = findWordBoundaries("hello", 5);
    expect(result).toEqual({ start: 0, end: 5 });
  });

  it("handles multiple spaces between words", () => {
    const result = findWordBoundaries("hello   world", 7);
    // Clicking in middle of spaces, selects single space
    expect(result.end - result.start).toBe(1);
  });

  it("handles special characters in word separators", () => {
    const text = "foo@bar#baz";
    // @ is a separator
    const result = findWordBoundaries(text, 0);
    expect(result).toEqual({ start: 0, end: 3 });
  });
});

describe("findLineBoundaries", () => {
  it("finds line in single-line text", () => {
    const result = findLineBoundaries("hello world", 5);
    expect(result).toEqual({ start: 0, end: 11 });
  });

  it("finds first line in multi-line text", () => {
    const result = findLineBoundaries("line one\nline two\nline three", 4);
    // Includes the newline character
    expect(result).toEqual({ start: 0, end: 9 });
  });

  it("finds middle line in multi-line text", () => {
    const result = findLineBoundaries("line one\nline two\nline three", 12);
    // Includes the newline character
    expect(result).toEqual({ start: 9, end: 18 });
  });

  it("finds last line in multi-line text", () => {
    const result = findLineBoundaries("line one\nline two\nline three", 22);
    // No trailing newline
    expect(result).toEqual({ start: 18, end: 28 });
  });

  it("handles empty string", () => {
    const result = findLineBoundaries("", 0);
    expect(result).toEqual({ start: 0, end: 0 });
  });

  it("handles empty lines", () => {
    const result = findLineBoundaries("first\n\nthird", 6);
    // Offset 6 is the empty line (just the newline)
    expect(result).toEqual({ start: 6, end: 7 });
  });

  it("handles offset at newline character", () => {
    const result = findLineBoundaries("line one\nline two", 8);
    // Offset 8 is the newline, should select first line including newline
    expect(result).toEqual({ start: 0, end: 9 });
  });

  it("clamps offset to valid range", () => {
    const result = findLineBoundaries("hello", 100);
    expect(result.start).toBe(0);
    expect(result.end).toBe(5);
  });

  it("handles single character lines", () => {
    const result = findLineBoundaries("a\nb\nc", 2);
    // Offset 2 is "b"
    expect(result).toEqual({ start: 2, end: 4 });
  });

  it("handles line at start with offset 0", () => {
    const result = findLineBoundaries("first\nsecond", 0);
    expect(result).toEqual({ start: 0, end: 6 });
  });
});
