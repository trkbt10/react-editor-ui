/**
 * @file Tests for table detection during chunked streaming
 */
import { createStreamingMarkdownParser } from "../streaming-parser";
import { createTestHelper } from "../test-helper";
import type { BeginEvent, EndEvent, MarkdownParseEvent } from "../types";

const TABLE_MARKDOWN = `| Feature | Status |
|---------|--------|
| Headers | Done |
| Lists | Done |
| Code | Done |
`;

describe("StreamingMarkdownParser - table chunked streaming", () => {
  it("detects table with small chunks (chunkSize=20)", async () => {
    const parser = createStreamingMarkdownParser();
    const helper = createTestHelper(parser);

    const events = await helper.parseInChunks(TABLE_MARKDOWN, 20);
    for await (const ev of parser.complete()) {
      events.push(ev);
    }

    const begins = events.filter(
      (e): e is BeginEvent => e.type === "begin" && e.elementType === "table",
    );
    expect(begins.length).toBeGreaterThanOrEqual(1);
  });

  it("table finalContent contains all rows when streamed in small chunks", async () => {
    const parser = createStreamingMarkdownParser();
    const helper = createTestHelper(parser);

    const events = await helper.parseInChunks(TABLE_MARKDOWN, 10);
    for await (const ev of parser.complete()) {
      events.push(ev);
    }

    const begins = events.filter(
      (e): e is BeginEvent => e.type === "begin" && e.elementType === "table",
    );
    expect(begins.length).toBeGreaterThanOrEqual(1);

    const tableId = begins[0].elementId;
    const end = events.find(
      (e): e is EndEvent => e.type === "end" && e.elementId === tableId,
    );
    expect(end).toBeDefined();
    expect(end?.finalContent).toContain("Headers");
    expect(end?.finalContent).toContain("Lists");
    expect(end?.finalContent).toContain("Code");
  });

  it("table is not misdetected as text with very small chunks", async () => {
    const parser = createStreamingMarkdownParser();
    const helper = createTestHelper(parser);

    const events = await helper.parseInChunks(TABLE_MARKDOWN, 5);
    for await (const ev of parser.complete()) {
      events.push(ev);
    }

    const textBegins = events.filter(
      (e): e is BeginEvent => e.type === "begin" && e.elementType === "text",
    );
    const tableBegins = events.filter(
      (e): e is BeginEvent => e.type === "begin" && e.elementType === "table",
    );

    // Table should be detected as table, not text
    expect(tableBegins.length).toBeGreaterThanOrEqual(1);
    // No text blocks should contain pipe-delimited table content
    for (const tb of textBegins) {
      const end = events.find(
        (e): e is EndEvent => e.type === "end" && e.elementId === tb.elementId,
      );
      if (end) {
        expect(end.finalContent).not.toMatch(/\|.*\|.*\|/);
      }
    }
  });

  it("detects table preceded by a header in chunked mode", async () => {
    const markdown = `## Table

| Feature | Status |
|---------|--------|
| Headers | Done |
| Tables | Done |

Done.
`;
    const parser = createStreamingMarkdownParser();
    const helper = createTestHelper(parser);

    const events = await helper.parseInChunks(markdown, 15);
    for await (const ev of parser.complete()) {
      events.push(ev);
    }

    const blockTypes = events
      .filter((e): e is BeginEvent => e.type === "begin")
      .map((e) => e.elementType);

    expect(blockTypes).toContain("header");
    expect(blockTypes).toContain("table");
  });

  it("produces same table block for instant vs chunked parsing", async () => {
    const collectTableContent = async (events: MarkdownParseEvent[]): Promise<string | undefined> => {
      const begin = events.find(
        (e): e is BeginEvent => e.type === "begin" && e.elementType === "table",
      );
      if (!begin) {
        return undefined;
      }
      const end = events.find(
        (e): e is EndEvent => e.type === "end" && e.elementId === begin.elementId,
      );
      return end?.finalContent;
    };

    // Instant
    const p1 = createStreamingMarkdownParser();
    const instantEvents: MarkdownParseEvent[] = [];
    for await (const ev of p1.processChunk(TABLE_MARKDOWN)) {
      instantEvents.push(ev);
    }
    for await (const ev of p1.complete()) {
      instantEvents.push(ev);
    }

    // Chunked
    const p2 = createStreamingMarkdownParser();
    const helper2 = createTestHelper(p2);
    const chunkedEvents = await helper2.parseInChunks(TABLE_MARKDOWN, 12);
    for await (const ev of p2.complete()) {
      chunkedEvents.push(ev);
    }

    const instantContent = await collectTableContent(instantEvents);
    const chunkedContent = await collectTableContent(chunkedEvents);

    expect(instantContent).toBeDefined();
    expect(chunkedContent).toBeDefined();
    // Normalize whitespace for comparison
    const norm = (s: string) => s.replace(/\s+/g, " ").trim();
    expect(norm(chunkedContent!)).toBe(norm(instantContent!));
  });
});
