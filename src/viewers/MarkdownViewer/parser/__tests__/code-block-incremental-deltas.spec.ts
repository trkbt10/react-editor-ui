/**
 * @file Ensure code block deltas are incremental (non-accumulating)
 */
import { createStreamingMarkdownParser } from "../streaming-parser";
import type { MarkdownParseEvent } from "../types";

describe("Code block incremental deltas", () => {
  it("emits character-by-character deltas for real-time streaming", async () => {
    const parser = createStreamingMarkdownParser();

    const chunk1 = "```python\n# Large\n";
    const chunk2 = "code line 2\n";
    const chunk3 = "```";

    const deltas: string[] = [];

    for await (const ev of parser.processChunk(chunk1)) {
      if (ev.type === "delta") {
        deltas.push(ev.content);
      }
    }

    for await (const ev of parser.processChunk(chunk2)) {
      if (ev.type === "delta") {
        deltas.push(ev.content);
      }
    }

    for await (const ev of parser.processChunk(chunk3)) {
      if (ev.type === "delta") {
        deltas.push(ev.content);
      }
    }

    // Should stream character by character for immediate display
    // "# Large\n" has 8 chars, "code line 2\n" has 12 chars = 20 total
    expect(deltas.length).toBe(20);
    expect(deltas.join("")).toBe("# Large\ncode line 2\n");

    // Completing should not add more delta for code block
    const postComplete: MarkdownParseEvent[] = [];
    for await (const ev of parser.complete()) {
      postComplete.push(ev);
    }
    expect(postComplete.some((e) => e.type === "delta")).toBe(false);
  });

  it("produces same result regardless of chunk size", async () => {
    const codeBlock = "```python\ndef hello():\n    print('Hi')\n```\n";

    const parseChunked = async (chunkSize: number) => {
      const parser = createStreamingMarkdownParser();
      const deltas: string[] = [];

      for (let i = 0; i < codeBlock.length; i += chunkSize) {
        const chunk = codeBlock.slice(i, i + chunkSize);
        for await (const ev of parser.processChunk(chunk)) {
          if (ev.type === "delta") {
            deltas.push(ev.content);
          }
        }
      }
      for await (const ev of parser.complete()) {
        if (ev.type === "delta") {
          deltas.push(ev.content);
        }
      }
      return deltas.join("");
    };

    const result1 = await parseChunked(1);
    const result5 = await parseChunked(5);
    const result50 = await parseChunked(50);

    expect(result1).toBe(result5);
    expect(result5).toBe(result50);
    expect(result1).toBe("def hello():\n    print('Hi')\n");
  });

  it("emits same number of deltas regardless of chunk size (character-by-character)", async () => {
    const codeTest = `\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`
`;

    const parseChunked = async (chunkSize: number) => {
      const parser = createStreamingMarkdownParser();
      const deltas: string[] = [];

      for (let i = 0; i < codeTest.length; i += chunkSize) {
        const chunk = codeTest.slice(i, i + chunkSize);
        for await (const ev of parser.processChunk(chunk)) {
          if (ev.type === "delta") {
            deltas.push(ev.content);
          }
        }
      }
      for await (const ev of parser.complete()) {
        if (ev.type === "delta") {
          deltas.push(ev.content);
        }
      }
      return deltas;
    };

    const deltas1 = await parseChunked(1);
    const deltas50 = await parseChunked(50);

    // Both should have the same number of deltas (one per character)
    expect(deltas1.length).toBe(deltas50.length);
    // The code content is "def hello():\n    print(\"Hello, World!\")\n" = 40 chars
    expect(deltas1.length).toBe(40);
    expect(deltas1.join("")).toBe(deltas50.join(""));
  });
});
