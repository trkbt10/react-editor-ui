/**
 * @file useMarkdownBlocks hook tests
 */

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMarkdownBlocks } from "./useMarkdownBlocks";

describe("useMarkdownBlocks", () => {
  it("parses markdown into blocks", async () => {
    const { result } = renderHook(() => useMarkdownBlocks());

    await act(async () => {
      await result.current.parse("# Hello\n\nWorld");
    });

    expect(result.current.blocks.length).toBeGreaterThan(0);
    expect(result.current.isStreaming).toBe(false);

    const header = result.current.blocks.find((b) => b.type === "header");
    expect(header).toBeDefined();
    expect(header!.content).toBe("Hello");

    const text = result.current.blocks.find((b) => b.type === "text");
    expect(text).toBeDefined();
    expect(text!.content).toBe("World");
  });

  it("parses code blocks with language metadata", async () => {
    const { result } = renderHook(() => useMarkdownBlocks());

    await act(async () => {
      await result.current.parse("```typescript\nconst x = 1;\n```");
    });

    const code = result.current.blocks.find((b) => b.type === "code");
    expect(code).toBeDefined();
    expect(code!.metadata?.language).toBe("typescript");
    expect(code!.content).toBe("const x = 1;");
  });

  it("parses lists with ordered metadata", async () => {
    const { result } = renderHook(() => useMarkdownBlocks());

    await act(async () => {
      await result.current.parse("- item 1\n- item 2");
    });

    const list = result.current.blocks.find((b) => b.type === "list");
    expect(list).toBeDefined();
    expect(list!.metadata?.ordered).toBe(false);
  });

  it("streams blocks incrementally", async () => {
    const { result } = renderHook(() => useMarkdownBlocks());

    await act(async () => {
      await result.current.streamParse("# Title\n\nParagraph text", 5);
    });

    expect(result.current.blocks.length).toBeGreaterThan(0);
    expect(result.current.isStreaming).toBe(false);
  });

  it("supports feedChunk and complete for real-time streaming", async () => {
    const { result } = renderHook(() => useMarkdownBlocks());

    await act(async () => {
      await result.current.feedChunk("# He");
    });
    expect(result.current.isStreaming).toBe(true);

    await act(async () => {
      await result.current.feedChunk("llo\n\nWorld");
    });

    await act(async () => {
      await result.current.complete();
    });

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.blocks.length).toBeGreaterThan(0);
  });

  it("resets state", async () => {
    const { result } = renderHook(() => useMarkdownBlocks());

    await act(async () => {
      await result.current.parse("# Test\n\nBody");
    });
    expect(result.current.blocks.length).toBeGreaterThan(0);

    act(() => {
      result.current.reset();
    });

    expect(result.current.blocks).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
  });
});
