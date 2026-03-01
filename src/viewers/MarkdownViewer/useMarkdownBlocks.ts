/**
 * @file useMarkdownBlocks - Hook to parse markdown text into MarkdownBlock[]
 */

import { useState, useCallback, useRef } from "react";
import { createStreamingMarkdownParser } from "../../parsers/Markdown";
import type {
  MarkdownParseEvent,
  EndEvent,
  MarkdownParserConfig,
} from "../../parsers/Markdown";
import type { MarkdownBlock } from "./types";

export type UseMarkdownBlocksOptions = {
  parserConfig?: MarkdownParserConfig;
};

export type UseMarkdownBlocksReturn = {
  blocks: MarkdownBlock[];
  isStreaming: boolean;
  parse: (text: string) => Promise<void>;
  streamParse: (text: string, chunkSize: number) => Promise<void>;
  feedChunk: (chunk: string) => Promise<void>;
  complete: () => Promise<void>;
  reset: () => void;
};

function snapshotBlocks(
  finishedBlocks: MarkdownBlock[],
  pendingBlocks: Map<string, MarkdownBlock>,
): MarkdownBlock[] {
  const pending = Array.from(pendingBlocks.values(), (b) => ({ ...b }));
  return [...finishedBlocks, ...pending];
}

function handleEvent(
  event: MarkdownParseEvent,
  pendingBlocks: Map<string, MarkdownBlock>,
  finishedBlocks: MarkdownBlock[],
): void {
  if (event.type === "begin") {
    pendingBlocks.set(event.elementId, {
      id: event.elementId,
      type: event.elementType,
      content: "",
      metadata: event.metadata,
    });
    return;
  }

  if (event.type === "delta") {
    const block = pendingBlocks.get(event.elementId);
    if (block) {
      block.content += event.content;
    }
    return;
  }

  if (event.type === "end") {
    const endEvent = event as EndEvent;
    const block = pendingBlocks.get(endEvent.elementId);
    if (block) {
      block.content = endEvent.finalContent;
      finishedBlocks.push(block);
      pendingBlocks.delete(endEvent.elementId);
    }
  }
}

type StreamState = {
  parser: ReturnType<typeof createStreamingMarkdownParser>;
  pendingBlocks: Map<string, MarkdownBlock>;
  finishedBlocks: MarkdownBlock[];
};

/** Hook to parse markdown text into MarkdownBlock[]. */
export function useMarkdownBlocks(
  options: UseMarkdownBlocksOptions = {},
): UseMarkdownBlocksReturn {
  const [blocks, setBlocks] = useState<MarkdownBlock[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamStateRef = useRef<StreamState | null>(null);

  const parse = useCallback(
    async (text: string) => {
      setBlocks([]);
      setIsStreaming(true);

      const parser = createStreamingMarkdownParser(options.parserConfig);
      const pendingBlocks = new Map<string, MarkdownBlock>();
      const finishedBlocks: MarkdownBlock[] = [];

      for await (const event of parser.processChunk(text)) {
        handleEvent(event, pendingBlocks, finishedBlocks);
      }

      for await (const event of parser.complete()) {
        handleEvent(event, pendingBlocks, finishedBlocks);
      }

      setBlocks(finishedBlocks);
      setIsStreaming(false);
    },
    [options.parserConfig],
  );

  const streamParse = useCallback(
    async (text: string, chunkSize: number) => {
      setBlocks([]);
      setIsStreaming(true);

      const parser = createStreamingMarkdownParser(options.parserConfig);
      const pendingBlocks = new Map<string, MarkdownBlock>();
      const finishedBlocks: MarkdownBlock[] = [];

      for (
        const [i] of Array.from({
          length: Math.ceil(text.length / chunkSize),
        }).entries()
      ) {
        const chunk = text.slice(i * chunkSize, (i + 1) * chunkSize);

        for await (const event of parser.processChunk(chunk)) {
          handleEvent(event, pendingBlocks, finishedBlocks);
        }

        setBlocks(snapshotBlocks(finishedBlocks, pendingBlocks));
        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      for await (const event of parser.complete()) {
        handleEvent(event, pendingBlocks, finishedBlocks);
      }

      setBlocks([...finishedBlocks]);
      setIsStreaming(false);
    },
    [options.parserConfig],
  );

  const feedChunk = useCallback(
    async (chunk: string) => {
      if (!streamStateRef.current) {
        const parser = createStreamingMarkdownParser(options.parserConfig);
        streamStateRef.current = {
          parser,
          pendingBlocks: new Map(),
          finishedBlocks: [],
        };
        setIsStreaming(true);
      }

      const state = streamStateRef.current;

      for await (const event of state.parser.processChunk(chunk)) {
        handleEvent(event, state.pendingBlocks, state.finishedBlocks);
      }

      setBlocks(snapshotBlocks(state.finishedBlocks, state.pendingBlocks));
    },
    [options.parserConfig],
  );

  const complete = useCallback(async () => {
    const state = streamStateRef.current;
    if (!state) {
      return;
    }

    for await (const event of state.parser.complete()) {
      handleEvent(event, state.pendingBlocks, state.finishedBlocks);
    }

    setBlocks([...state.finishedBlocks]);
    setIsStreaming(false);
    streamStateRef.current = null;
  }, []);

  const reset = useCallback(() => {
    setBlocks([]);
    setIsStreaming(false);
    streamStateRef.current = null;
  }, []);

  return { blocks, isStreaming, parse, streamParse, feedChunk, complete, reset };
}
