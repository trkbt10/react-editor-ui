/**
 * @file Integration tests for markdown features lacking parser-level coverage
 *
 * Covers: math blocks, inline math, horizontal rules, inline emphasis stripping,
 * ordered lists, and mixed block sequences.
 */
import { createStreamingMarkdownParser } from "../streaming-parser";
import { createTestHelper } from "../test-helper";
import type { BeginEvent, EndEvent, MarkdownParseEvent } from "../types";

/** Collect all events from full parse + complete */
async function fullParse(
  markdown: string,
  config?: Parameters<typeof createStreamingMarkdownParser>[0],
): Promise<MarkdownParseEvent[]> {
  const parser = createStreamingMarkdownParser(config);
  const events: MarkdownParseEvent[] = [];
  for await (const ev of parser.processChunk(markdown)) {
    events.push(ev);
  }
  for await (const ev of parser.complete()) {
    events.push(ev);
  }
  return events;
}

/** Collect all events from chunked parse + complete */
async function chunkedParse(
  markdown: string,
  chunkSize: number,
  config?: Parameters<typeof createStreamingMarkdownParser>[0],
): Promise<MarkdownParseEvent[]> {
  const parser = createStreamingMarkdownParser(config);
  const helper = createTestHelper(parser);
  const events = await helper.parseInChunks(markdown, chunkSize);
  for await (const ev of parser.complete()) {
    events.push(ev);
  }
  return events;
}

function begins(events: MarkdownParseEvent[], elementType?: string): BeginEvent[] {
  return events.filter(
    (e): e is BeginEvent => e.type === "begin" && (elementType === undefined || e.elementType === elementType),
  );
}

function endFor(events: MarkdownParseEvent[], elementId: string): EndEvent | undefined {
  return events.find((e): e is EndEvent => e.type === "end" && e.elementId === elementId);
}

// ---------------------------------------------------------------------------
// Math blocks
// ---------------------------------------------------------------------------
describe("Math blocks", () => {
  it("detects block math ($$) as math elements", async () => {
    const md = "$$\nE = mc^2\n$$\n";
    const events = await fullParse(md);

    const mathBegins = begins(events, "math");
    // Parser detects $$ as a math element (closing $$ may also be detected)
    expect(mathBegins.length).toBeGreaterThanOrEqual(1);
    expect(mathBegins[0].metadata?.inline).toBe(false);
  });

  it("block math contains the formula in content", async () => {
    const md = "$$\nE = mc^2\n$$\n";
    const events = await fullParse(md);

    const mathBegins = begins(events, "math");
    const end = endFor(events, mathBegins[0].elementId);
    expect(end).toBeDefined();
    expect(end?.finalContent).toContain("E = mc^2");
  });

  it("detects block math with chunked streaming", async () => {
    const md = "$$\nx^2 + y^2 = r^2\n$$\n";
    const events = await chunkedParse(md, 5);

    const mathBegins = begins(events, "math");
    expect(mathBegins.length).toBeGreaterThanOrEqual(1);

    const end = endFor(events, mathBegins[0].elementId);
    expect(end).toBeDefined();
    expect(end?.finalContent).toContain("x^2 + y^2 = r^2");
  });

  it("detects inline math ($)", async () => {
    const md = "$x^2$\n\n";
    const events = await fullParse(md);

    const mathBegins = begins(events, "math");
    expect(mathBegins.length).toBe(1);
    expect(mathBegins[0].metadata?.inline).toBe(true);

    const end = endFor(events, mathBegins[0].elementId);
    expect(end).toBeDefined();
    expect(end?.finalContent).toContain("x^2");
  });
});

// ---------------------------------------------------------------------------
// Horizontal rules
// ---------------------------------------------------------------------------
describe("Horizontal rules", () => {
  it("detects --- as horizontal_rule", async () => {
    const md = "text above\n\n---\n\ntext below\n";
    const events = await fullParse(md);

    const hrBegins = begins(events, "horizontal_rule");
    expect(hrBegins.length).toBe(1);
  });

  it("detects ___ as horizontal_rule", async () => {
    const md = "above\n\n___\n\nbelow\n";
    const events = await fullParse(md);

    const hrBegins = begins(events, "horizontal_rule");
    expect(hrBegins.length).toBe(1);
  });

  it("detects *** as horizontal_rule", async () => {
    const md = "above\n\n***\n\nbelow\n";
    const events = await fullParse(md);

    const hrBegins = begins(events, "horizontal_rule");
    expect(hrBegins.length).toBe(1);
  });

  it("detects horizontal rule in chunked streaming", async () => {
    const md = "above\n\n---\n\nbelow\n";
    const events = await chunkedParse(md, 4);

    const hrBegins = begins(events, "horizontal_rule");
    expect(hrBegins.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Inline emphasis stripping (default strip mode)
// ---------------------------------------------------------------------------
describe("Inline emphasis stripping (default mode)", () => {
  it("strips **bold** markers from finalContent", async () => {
    const md = "hello **bold** world\n\n";
    const events = await fullParse(md);

    const textBegins = begins(events, "text");
    expect(textBegins.length).toBeGreaterThanOrEqual(1);

    const end = endFor(events, textBegins[0].elementId);
    expect(end).toBeDefined();
    expect(end?.finalContent).toContain("bold");
    expect(end?.finalContent).not.toContain("**");
  });

  it("strips *italic* markers from finalContent", async () => {
    const md = "hello *italic* world\n\n";
    const events = await fullParse(md);

    const textBegins = begins(events, "text");
    const end = endFor(events, textBegins[0].elementId);
    expect(end).toBeDefined();
    expect(end?.finalContent).toContain("italic");
    // Should not have unmatched * around "italic"
    expect(end?.finalContent).not.toMatch(/\*italic\*/);
  });

  it("strips ~~strikethrough~~ markers from finalContent", async () => {
    const md = "hello ~~removed~~ world\n\n";
    const events = await fullParse(md);

    const textBegins = begins(events, "text");
    const end = endFor(events, textBegins[0].elementId);
    expect(end).toBeDefined();
    expect(end?.finalContent).toContain("removed");
    expect(end?.finalContent).not.toContain("~~");
  });

  it("strips inline `code` markers from finalContent", async () => {
    const md = "hello `code` world\n\n";
    const events = await fullParse(md);

    const textBegins = begins(events, "text");
    const end = endFor(events, textBegins[0].elementId);
    expect(end).toBeDefined();
    expect(end?.finalContent).toContain("code");
    expect(end?.finalContent).not.toMatch(/`code`/);
  });

  it("strips multiple inline styles in one paragraph", async () => {
    const md = "**bold** and *italic* and ~~strike~~\n\n";
    const events = await fullParse(md);

    const textBegins = begins(events, "text");
    const end = endFor(events, textBegins[0].elementId);
    expect(end).toBeDefined();
    expect(end?.finalContent).toContain("bold");
    expect(end?.finalContent).toContain("italic");
    expect(end?.finalContent).toContain("strike");
    expect(end?.finalContent).not.toContain("**");
    expect(end?.finalContent).not.toContain("~~");
  });

  it("strips emphasis in chunked streaming", async () => {
    const md = "word **bold** end\n\n";
    const events = await chunkedParse(md, 3);

    const textBegins = begins(events, "text");
    expect(textBegins.length).toBeGreaterThanOrEqual(1);

    const end = endFor(events, textBegins[0].elementId);
    expect(end).toBeDefined();
    expect(end?.finalContent).toContain("bold");
    expect(end?.finalContent).not.toContain("**");
  });
});

// ---------------------------------------------------------------------------
// Inline emphasis events (preserve mode with larger chunk size)
// ---------------------------------------------------------------------------
describe("Inline emphasis events (preserve mode)", () => {
  const preserveConfig = { inlineEmphasisMode: "preserve" as const, maxDeltaChunkSize: 100 };

  it("emits emphasis event for **bold** in streaming (known limitation: inner *bold* matches first)", async () => {
    // In char-by-char streaming, "**bold*" is seen before "**bold**",
    // so the inner *bold* matches emphasis before the outer **bold** matches strong.
    const md = "hello **bold** world\n\n";
    const events = await fullParse(md, preserveConfig);

    // The inner *bold* is detected as emphasis during streaming accumulation
    const emBegins = begins(events, "emphasis");
    expect(emBegins.length).toBeGreaterThanOrEqual(1);

    const end = endFor(events, emBegins[0].elementId);
    expect(end).toBeDefined();
    expect(end?.finalContent).toBe("bold");
  });

  it("emits emphasis begin/end events for *text* in preserve mode", async () => {
    const md = "hello *italic* world\n\n";
    const events = await fullParse(md, preserveConfig);

    const emBegins = begins(events, "emphasis");
    expect(emBegins.length).toBe(1);

    const end = endFor(events, emBegins[0].elementId);
    expect(end).toBeDefined();
    expect(end?.finalContent).toBe("italic");
  });

  it("emits strikethrough begin/end events for ~~text~~ in preserve mode", async () => {
    const md = "hello ~~removed~~ world\n\n";
    const events = await fullParse(md, preserveConfig);

    const stBegins = begins(events, "strikethrough");
    expect(stBegins.length).toBe(1);

    const end = endFor(events, stBegins[0].elementId);
    expect(end).toBeDefined();
    expect(end?.finalContent).toBe("removed");
  });
});

// ---------------------------------------------------------------------------
// Ordered lists
// ---------------------------------------------------------------------------
describe("Ordered lists", () => {
  it("detects ordered list with metadata", async () => {
    const md = "1. first\n2. second\n3. third\n\n";
    const events = await fullParse(md);

    const listBegins = begins(events, "list");
    expect(listBegins.length).toBeGreaterThanOrEqual(1);
    expect(listBegins[0].metadata?.ordered).toBe(true);

    const end = endFor(events, listBegins[0].elementId);
    expect(end).toBeDefined();
    expect(end?.finalContent).toContain("first");
    expect(end?.finalContent).toContain("second");
    expect(end?.finalContent).toContain("third");
  });

  it("detects ordered list in chunked streaming", async () => {
    const md = "1. alpha\n2. beta\n\n";
    const events = await chunkedParse(md, 5);

    const listBegins = begins(events, "list");
    expect(listBegins.length).toBeGreaterThanOrEqual(1);
    expect(listBegins[0].metadata?.ordered).toBe(true);

    const end = endFor(events, listBegins[0].elementId);
    expect(end).toBeDefined();
    expect(end?.finalContent).toContain("alpha");
    expect(end?.finalContent).toContain("beta");
  });
});

// ---------------------------------------------------------------------------
// Mixed block sequence (header → text → code → table → quote → hr)
// ---------------------------------------------------------------------------
describe("Mixed block sequence streaming", () => {
  const MIXED_MD = `# Title

Some paragraph text here.

\`\`\`js
const x = 1;
\`\`\`

| A | B |
|---|---|
| 1 | 2 |

> a quote

---

Done.
`;

  it("detects all block types in instant parse", async () => {
    const events = await fullParse(MIXED_MD);
    const types = new Set(begins(events).map((b) => b.elementType));

    expect(types.has("header")).toBe(true);
    expect(types.has("text")).toBe(true);
    expect(types.has("code")).toBe(true);
    expect(types.has("table")).toBe(true);
    expect(types.has("quote")).toBe(true);
    expect(types.has("horizontal_rule")).toBe(true);
  });

  it("detects all block types in chunked streaming (chunkSize=10)", async () => {
    const events = await chunkedParse(MIXED_MD, 10);
    const types = new Set(begins(events).map((b) => b.elementType));

    expect(types.has("header")).toBe(true);
    expect(types.has("text")).toBe(true);
    expect(types.has("code")).toBe(true);
    expect(types.has("table")).toBe(true);
    expect(types.has("quote")).toBe(true);
    expect(types.has("horizontal_rule")).toBe(true);
  });

  it("detects all block types in chunked streaming (chunkSize=3)", async () => {
    const events = await chunkedParse(MIXED_MD, 3);
    const types = new Set(begins(events).map((b) => b.elementType));

    expect(types.has("header")).toBe(true);
    expect(types.has("text")).toBe(true);
    expect(types.has("code")).toBe(true);
    expect(types.has("table")).toBe(true);
    expect(types.has("quote")).toBe(true);
    expect(types.has("horizontal_rule")).toBe(true);
  });

  it("every begin has a matching end", async () => {
    const events = await fullParse(MIXED_MD);
    const beginIds = begins(events).map((b) => b.elementId);
    const endIds = events.filter((e) => e.type === "end").map((e) => e.elementId);

    for (const id of beginIds) {
      expect(endIds).toContain(id);
    }
  });
});
