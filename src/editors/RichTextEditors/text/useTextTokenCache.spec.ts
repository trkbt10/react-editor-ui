/**
 * @file useTextTokenCache Tests
 *
 * Tests for token caching with style version invalidation and LRU eviction.
 */

import { renderHook, act } from "@testing-library/react";
import { useTextTokenCache, type TextTokenizer } from "./useTextTokenCache";
import type { Token } from "../code/types";
import type { LineIndex } from "../core/types";

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Create a mock tokenizer that tracks calls.
 */
function createMockTokenizer(): TextTokenizer & { tokenizeCalls: Array<{ line: string; offset: number }> } {
  const tokenizeCalls: Array<{ line: string; offset: number }> = [];

  return {
    tokenizeCalls,
    tokenize: (line: string, offset = 0): readonly Token[] => {
      tokenizeCalls.push({ line, offset });
      return [
        {
          type: "text",
          text: line,
          start: 0,
          end: line.length,
        },
      ];
    },
  };
}

/**
 * Create a mock LineIndex from an array of lines.
 */
function createMockLineIndex(lines: string[]): LineIndex {
  const lineOffsets: number[] = [];
  const offset = { value: 0 };
  for (const line of lines) {
    lineOffsets.push(offset.value);
    offset.value += line.length + 1; // +1 for newline
  }

  return {
    lines,
    lineOffsets,
    getLineAtOffset: vi.fn((off: number) => {
      const remaining = { value: off };
      for (const [i, line] of lines.entries()) {
        if (remaining.value <= line.length) {
          return { line: i + 1, column: remaining.value + 1 };
        }
        remaining.value -= line.length + 1;
      }
      return { line: lines.length, column: (lines[lines.length - 1]?.length ?? 0) + 1 };
    }),
    getOffsetAtLineColumn: vi.fn((line: number, column: number) => {
      const idx = Math.max(0, Math.min(line - 1, lines.length - 1));
      return (lineOffsets[idx] ?? 0) + Math.max(0, column - 1);
    }),
  };
}

// =============================================================================
// Cache Key Generation Tests
// =============================================================================

describe("useTextTokenCache cache key", () => {
  it("generates key from line index and content", () => {
    const tokenizer = createMockTokenizer();
    const lineIndex = createMockLineIndex(["hello", "world"]);

    const { result } = renderHook(() =>
      useTextTokenCache(tokenizer, lineIndex, 1)
    );

    // First call should tokenize
    result.current.getTokens("hello", 0);
    expect(tokenizer.tokenizeCalls).toHaveLength(1);
    expect(tokenizer.tokenizeCalls[0]).toEqual({ line: "hello", offset: 0 });

    // Same line index and content should hit cache
    result.current.getTokens("hello", 0);
    expect(tokenizer.tokenizeCalls).toHaveLength(1);

    // Different content should miss cache
    result.current.getTokens("world", 1);
    expect(tokenizer.tokenizeCalls).toHaveLength(2);
  });

  it("treats same content at different line indexes as different keys", () => {
    const tokenizer = createMockTokenizer();
    const lineIndex = createMockLineIndex(["hello", "hello"]);

    const { result } = renderHook(() =>
      useTextTokenCache(tokenizer, lineIndex, 1)
    );

    // First "hello" at line 0
    result.current.getTokens("hello", 0);
    expect(tokenizer.tokenizeCalls).toHaveLength(1);

    // Second "hello" at line 1 - different key, should tokenize again
    result.current.getTokens("hello", 1);
    expect(tokenizer.tokenizeCalls).toHaveLength(2);
  });
});

// =============================================================================
// Cache Hit/Miss Tests
// =============================================================================

describe("useTextTokenCache hit/miss", () => {
  it("returns cached tokens on cache hit", () => {
    const tokenizer = createMockTokenizer();
    const lineIndex = createMockLineIndex(["test line"]);

    const { result } = renderHook(() =>
      useTextTokenCache(tokenizer, lineIndex, 1)
    );

    const tokens1 = result.current.getTokens("test line", 0);
    const tokens2 = result.current.getTokens("test line", 0);

    // Should return the same object reference
    expect(tokens1).toBe(tokens2);
    expect(tokenizer.tokenizeCalls).toHaveLength(1);
  });

  it("tokenizes on cache miss", () => {
    const tokenizer = createMockTokenizer();
    const lineIndex = createMockLineIndex(["first", "second"]);

    const { result } = renderHook(() =>
      useTextTokenCache(tokenizer, lineIndex, 1)
    );

    result.current.getTokens("first", 0);
    result.current.getTokens("second", 1);

    expect(tokenizer.tokenizeCalls).toHaveLength(2);
    expect(tokenizer.tokenizeCalls[0].line).toBe("first");
    expect(tokenizer.tokenizeCalls[1].line).toBe("second");
  });

  it("passes correct offset to tokenizer", () => {
    const tokenizer = createMockTokenizer();
    // "hello" (5) + newline (1) + "world" starts at offset 6
    const lineIndex = createMockLineIndex(["hello", "world"]);

    const { result } = renderHook(() =>
      useTextTokenCache(tokenizer, lineIndex, 1)
    );

    result.current.getTokens("world", 1);

    expect(tokenizer.tokenizeCalls).toHaveLength(1);
    expect(tokenizer.tokenizeCalls[0].offset).toBe(6);
  });
});

// =============================================================================
// Style Version Invalidation Tests
// =============================================================================

describe("useTextTokenCache style version", () => {
  it("clears cache when style version changes", () => {
    const tokenizer = createMockTokenizer();
    const lineIndex = createMockLineIndex(["hello"]);

    const { result, rerender } = renderHook(
      ({ version }) => useTextTokenCache(tokenizer, lineIndex, version),
      { initialProps: { version: 1 } }
    );

    // Populate cache
    result.current.getTokens("hello", 0);
    expect(tokenizer.tokenizeCalls).toHaveLength(1);

    // Cache hit
    result.current.getTokens("hello", 0);
    expect(tokenizer.tokenizeCalls).toHaveLength(1);

    // Change version - should clear cache
    rerender({ version: 2 });

    // Should tokenize again
    result.current.getTokens("hello", 0);
    expect(tokenizer.tokenizeCalls).toHaveLength(2);
  });

  it("does not clear cache when version stays same", () => {
    const tokenizer = createMockTokenizer();
    const lineIndex = createMockLineIndex(["hello"]);

    const { result, rerender } = renderHook(
      ({ version }) => useTextTokenCache(tokenizer, lineIndex, version),
      { initialProps: { version: 1 } }
    );

    result.current.getTokens("hello", 0);
    expect(tokenizer.tokenizeCalls).toHaveLength(1);

    // Rerender with same version
    rerender({ version: 1 });

    // Should still hit cache
    result.current.getTokens("hello", 0);
    expect(tokenizer.tokenizeCalls).toHaveLength(1);
  });
});

// =============================================================================
// LRU Eviction Tests
// =============================================================================

describe("useTextTokenCache LRU eviction", () => {
  it("evicts half the cache when exceeding MAX_CACHE_SIZE", () => {
    const tokenizer = createMockTokenizer();
    const lines = Array.from({ length: 1100 }, (_, i) => `line${i}`);
    const lineIndex = createMockLineIndex(lines);

    const { result, rerender } = renderHook(() =>
      useTextTokenCache(tokenizer, lineIndex, 1)
    );

    // Fill cache beyond MAX_CACHE_SIZE (1000)
    for (let i = 0; i < 1001; i++) {
      result.current.getTokens(`line${i}`, i);
    }

    expect(tokenizer.tokenizeCalls).toHaveLength(1001);

    // Rerender to trigger eviction check
    rerender();

    // Access first item - should be evicted (was in first half)
    result.current.getTokens("line0", 0);

    // Should have been evicted and re-tokenized
    expect(tokenizer.tokenizeCalls).toHaveLength(1002);
  });

  it("preserves recently added items during eviction", () => {
    const tokenizer = createMockTokenizer();
    const lines = Array.from({ length: 1100 }, (_, i) => `line${i}`);
    const lineIndex = createMockLineIndex(lines);

    const { result, rerender } = renderHook(() =>
      useTextTokenCache(tokenizer, lineIndex, 1)
    );

    // Fill cache beyond MAX_CACHE_SIZE
    for (let i = 0; i < 1001; i++) {
      result.current.getTokens(`line${i}`, i);
    }

    const callCountBeforeRerender = tokenizer.tokenizeCalls.length;

    // Rerender to trigger eviction
    rerender();

    // Access a later item - should still be in cache (second half preserved)
    result.current.getTokens("line900", 900);

    // Should hit cache, no additional tokenization
    expect(tokenizer.tokenizeCalls.length).toBe(callCountBeforeRerender);
  });
});

// =============================================================================
// Clear Function Tests
// =============================================================================

describe("useTextTokenCache clear", () => {
  it("clears all cached tokens", () => {
    const tokenizer = createMockTokenizer();
    const lineIndex = createMockLineIndex(["hello", "world"]);

    const { result } = renderHook(() =>
      useTextTokenCache(tokenizer, lineIndex, 1)
    );

    // Populate cache
    result.current.getTokens("hello", 0);
    result.current.getTokens("world", 1);
    expect(tokenizer.tokenizeCalls).toHaveLength(2);

    // Clear cache
    act(() => {
      result.current.clear();
    });

    // Should tokenize again
    result.current.getTokens("hello", 0);
    result.current.getTokens("world", 1);
    expect(tokenizer.tokenizeCalls).toHaveLength(4);
  });
});

// =============================================================================
// Legacy Behavior Tests
// =============================================================================

describe("useTextTokenCache legacy behavior", () => {
  it("falls back to finding line by content when lineIdx not provided", () => {
    const tokenizer = createMockTokenizer();
    const lineIndex = createMockLineIndex(["hello", "world"]);

    const { result } = renderHook(() =>
      useTextTokenCache(tokenizer, lineIndex, 1)
    );

    // Call without lineIdx - should find by content
    result.current.getTokens("world");

    expect(tokenizer.tokenizeCalls).toHaveLength(1);
    // Found at index 1, offset should be 6
    expect(tokenizer.tokenizeCalls[0].offset).toBe(6);
  });

  it("uses offset 0 when line not found in index", () => {
    const tokenizer = createMockTokenizer();
    const lineIndex = createMockLineIndex(["hello", "world"]);

    const { result } = renderHook(() =>
      useTextTokenCache(tokenizer, lineIndex, 1)
    );

    // Call with content not in lines
    result.current.getTokens("unknown");

    expect(tokenizer.tokenizeCalls).toHaveLength(1);
    expect(tokenizer.tokenizeCalls[0].offset).toBe(0);
  });

  it("uses offset 0 fallback when lineOffset is undefined", () => {
    const tokenizer = createMockTokenizer();
    // Create a lineIndex with incomplete lineOffsets array
    const lineIndex: LineIndex = {
      lines: ["hello", "world", "test"],
      lineOffsets: [0, 6], // Missing offset for "test" at index 2
      getLineAtOffset: vi.fn(),
      getOffsetAtLineColumn: vi.fn(),
    };

    const { result } = renderHook(() =>
      useTextTokenCache(tokenizer, lineIndex, 1)
    );

    // Access line at index 2 where offset is undefined
    result.current.getTokens("test", 2);

    expect(tokenizer.tokenizeCalls).toHaveLength(1);
    // Should use fallback offset 0
    expect(tokenizer.tokenizeCalls[0].offset).toBe(0);
  });
});

// =============================================================================
// Reference Stability Tests
// =============================================================================

describe("useTextTokenCache reference stability", () => {
  it("returns stable getTokens reference", () => {
    const tokenizer = createMockTokenizer();
    const lineIndex = createMockLineIndex(["hello"]);

    const { result, rerender } = renderHook(() =>
      useTextTokenCache(tokenizer, lineIndex, 1)
    );

    const getTokens1 = result.current.getTokens;

    rerender();

    const getTokens2 = result.current.getTokens;

    expect(getTokens1).toBe(getTokens2);
  });

  it("returns stable clear reference", () => {
    const tokenizer = createMockTokenizer();
    const lineIndex = createMockLineIndex(["hello"]);

    const { result, rerender } = renderHook(() =>
      useTextTokenCache(tokenizer, lineIndex, 1)
    );

    const clear1 = result.current.clear;

    rerender();

    const clear2 = result.current.clear;

    expect(clear1).toBe(clear2);
  });
});
