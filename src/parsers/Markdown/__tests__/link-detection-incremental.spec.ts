/**
 * @file Test for link detection during incremental parsing
 */
import { createStreamingMarkdownParser } from "../streaming-parser";
import type { MarkdownParseEvent } from "../types";

type BlockResult = {
  type: string;
  content: string;
};

const collectBlocks = (events: MarkdownParseEvent[]): BlockResult[] => {
  const blockInfo = new Map<string, BlockResult & { ended: boolean }>();
  const blockOrder: string[] = [];

  for (const event of events) {
    if (event.type === "begin") {
      if (!blockInfo.has(event.elementId)) {
        blockInfo.set(event.elementId, {
          type: event.elementType,
          content: "",
          ended: false,
        });
        blockOrder.push(event.elementId);
      }
    } else if (event.type === "delta") {
      const info = blockInfo.get(event.elementId);
      if (info && !info.ended) {
        info.content += event.content;
      }
    } else if (event.type === "end") {
      const info = blockInfo.get(event.elementId);
      if (info) {
        info.content = event.finalContent;
        info.ended = true;
      }
    }
  }

  return blockOrder
    .map((id) => blockInfo.get(id))
    .filter((info): info is BlockResult & { ended: boolean } => info !== undefined && info.ended)
    .map(({ type, content }) => ({ type, content }));
};

const parseFullText = async (text: string): Promise<BlockResult[]> => {
  const parser = createStreamingMarkdownParser();
  const events: MarkdownParseEvent[] = [];

  for await (const event of parser.processChunk(text)) {
    events.push(event);
  }
  for await (const event of parser.complete()) {
    events.push(event);
  }

  return collectBlocks(events);
};

const parseChunked = async (text: string, chunkSize: number): Promise<BlockResult[]> => {
  const parser = createStreamingMarkdownParser();
  const events: MarkdownParseEvent[] = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    for await (const event of parser.processChunk(chunk)) {
      events.push(event);
    }
  }
  for await (const event of parser.complete()) {
    events.push(event);
  }

  return collectBlocks(events);
};

describe("Link detection incremental parsing", () => {
  const testCases = [
    {
      name: "simple link",
      content: "Check out [OpenAI](https://openai.com) for more info.\n",
    },
    {
      name: "multiple links",
      content: "Visit [Google](https://google.com) or [GitHub](https://github.com).\n",
    },
    {
      name: "link with text before and after",
      content: "Here is a [link](http://example.com) in the middle.\n",
    },
    {
      name: "link at start of line",
      content: "[Start](http://start.com) of line.\n",
    },
    {
      name: "link at end of line",
      content: "End with [link](http://end.com)\n",
    },
  ];

  const chunkSizes = [1, 3, 5, 10];

  for (const { name, content } of testCases) {
    describe(name, () => {
      for (const chunkSize of chunkSizes) {
        test(`chunk size ${chunkSize} produces same result as full parse`, async () => {
          const fullResult = await parseFullText(content);
          const chunkedResult = await parseChunked(content, chunkSize);

          expect(chunkedResult.length).toBe(fullResult.length);

          for (let i = 0; i < fullResult.length; i++) {
            expect(chunkedResult[i].type).toBe(fullResult[i].type);
            expect(chunkedResult[i].content).toBe(fullResult[i].content);
          }
        });
      }
    });
  }
});
