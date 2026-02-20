/**
 * @file Markdown Parser Tests
 */

import {
  detectBlockType,
  parseMarkdownToBlockDocument,
  blockDocumentToMarkdown,
} from "./markdownParser";

describe("detectBlockType", () => {
  it("detects heading-1", () => {
    const result = detectBlockType("# Hello World");
    expect(result.type).toBe("heading-1");
    expect(result.content).toBe("Hello World");
    expect(result.prefix).toBe("# ");
  });

  it("detects heading-2", () => {
    const result = detectBlockType("## Hello World");
    expect(result.type).toBe("heading-2");
    expect(result.content).toBe("Hello World");
  });

  it("detects heading-3", () => {
    const result = detectBlockType("### Hello World");
    expect(result.type).toBe("heading-3");
    expect(result.content).toBe("Hello World");
  });

  it("detects bullet-list with -", () => {
    const result = detectBlockType("- Item 1");
    expect(result.type).toBe("bullet-list");
    expect(result.content).toBe("Item 1");
  });

  it("detects bullet-list with *", () => {
    const result = detectBlockType("* Item 1");
    expect(result.type).toBe("bullet-list");
    expect(result.content).toBe("Item 1");
  });

  it("detects numbered-list", () => {
    const result = detectBlockType("1. First item");
    expect(result.type).toBe("numbered-list");
    expect(result.content).toBe("First item");
  });

  it("detects numbered-list with double digits", () => {
    const result = detectBlockType("10. Tenth item");
    expect(result.type).toBe("numbered-list");
    expect(result.content).toBe("Tenth item");
  });

  it("detects blockquote", () => {
    const result = detectBlockType("> A quote");
    expect(result.type).toBe("blockquote");
    expect(result.content).toBe("A quote");
  });

  it("detects code-block fence", () => {
    const result = detectBlockType("```javascript");
    expect(result.type).toBe("code-block");
    expect(result.content).toBe("javascript");
  });

  it("detects paragraph for plain text", () => {
    const result = detectBlockType("Hello World");
    expect(result.type).toBe("paragraph");
    expect(result.content).toBe("Hello World");
  });
});

describe("parseMarkdownToBlockDocument", () => {
  it("parses empty markdown", () => {
    const doc = parseMarkdownToBlockDocument("");
    expect(doc.blocks.length).toBe(1);
    expect(doc.blocks[0].type).toBe("paragraph");
  });

  it("parses single paragraph", () => {
    const doc = parseMarkdownToBlockDocument("Hello World");
    expect(doc.blocks.length).toBe(1);
    expect(doc.blocks[0].type).toBe("paragraph");
    expect(doc.blocks[0].content).toBe("Hello World");
  });

  it("parses multiple paragraphs", () => {
    const doc = parseMarkdownToBlockDocument("Line 1\nLine 2\nLine 3");
    expect(doc.blocks.length).toBe(3);
    expect(doc.blocks.every(b => b.type === "paragraph")).toBe(true);
  });

  it("parses headings", () => {
    const markdown = `# Heading 1
## Heading 2
### Heading 3`;
    const doc = parseMarkdownToBlockDocument(markdown);

    expect(doc.blocks.length).toBe(3);
    expect(doc.blocks[0].type).toBe("heading-1");
    expect(doc.blocks[1].type).toBe("heading-2");
    expect(doc.blocks[2].type).toBe("heading-3");
  });

  it("strips prefix from heading content for visual rendering", () => {
    const doc = parseMarkdownToBlockDocument("# My Title");
    expect(doc.blocks[0].type).toBe("heading-1");
    expect(doc.blocks[0].content).toBe("My Title"); // No "# " prefix
  });

  it("strips prefix from bullet list content", () => {
    const doc = parseMarkdownToBlockDocument("- Item text");
    expect(doc.blocks[0].type).toBe("bullet-list");
    expect(doc.blocks[0].content).toBe("Item text"); // No "- " prefix
  });

  it("strips prefix from numbered list content", () => {
    const doc = parseMarkdownToBlockDocument("1. First item");
    expect(doc.blocks[0].type).toBe("numbered-list");
    expect(doc.blocks[0].content).toBe("First item"); // No "1. " prefix
  });

  it("strips prefix from blockquote content", () => {
    const doc = parseMarkdownToBlockDocument("> Quote text");
    expect(doc.blocks[0].type).toBe("blockquote");
    expect(doc.blocks[0].content).toBe("Quote text"); // No "> " prefix
  });

  it("parses bullet list", () => {
    const markdown = `- Item 1
- Item 2
- Item 3`;
    const doc = parseMarkdownToBlockDocument(markdown);

    expect(doc.blocks.length).toBe(3);
    expect(doc.blocks.every(b => b.type === "bullet-list")).toBe(true);
  });

  it("parses numbered list", () => {
    const markdown = `1. First
2. Second
3. Third`;
    const doc = parseMarkdownToBlockDocument(markdown);

    expect(doc.blocks.length).toBe(3);
    expect(doc.blocks.every(b => b.type === "numbered-list")).toBe(true);
  });

  it("parses blockquote", () => {
    const markdown = `> This is a quote
> with multiple lines`;
    const doc = parseMarkdownToBlockDocument(markdown);

    expect(doc.blocks.length).toBe(2);
    expect(doc.blocks.every(b => b.type === "blockquote")).toBe(true);
  });

  it("parses code block", () => {
    const markdown = `\`\`\`
function hello() {
  console.log("Hello");
}
\`\`\``;
    const doc = parseMarkdownToBlockDocument(markdown);

    expect(doc.blocks.length).toBe(1);
    expect(doc.blocks[0].type).toBe("code-block");
    expect(doc.blocks[0].content).toContain("function hello()");
  });

  it("parses mixed content", () => {
    const markdown = `# Title

A paragraph of text.

- List item 1
- List item 2

> A quote

\`\`\`
code
\`\`\``;
    const doc = parseMarkdownToBlockDocument(markdown);

    expect(doc.blocks.length).toBe(10);
    expect(doc.blocks[0].type).toBe("heading-1");
    expect(doc.blocks[1].type).toBe("paragraph"); // empty line
    expect(doc.blocks[2].type).toBe("paragraph");
    expect(doc.blocks[3].type).toBe("paragraph"); // empty line
    expect(doc.blocks[4].type).toBe("bullet-list");
    expect(doc.blocks[5].type).toBe("bullet-list");
    expect(doc.blocks[6].type).toBe("paragraph"); // empty line
    expect(doc.blocks[7].type).toBe("blockquote");
    expect(doc.blocks[8].type).toBe("paragraph"); // empty line before code
    expect(doc.blocks[9].type).toBe("code-block");
  });

  it("includes styleDefinitions", () => {
    const doc = parseMarkdownToBlockDocument("Hello");
    expect(doc.styleDefinitions).toHaveProperty("bold");
    expect(doc.styleDefinitions).toHaveProperty("italic");
    expect(doc.styleDefinitions).toHaveProperty("code");
  });
});

describe("blockDocumentToMarkdown", () => {
  it("converts paragraph", () => {
    const doc = parseMarkdownToBlockDocument("Hello World");
    const markdown = blockDocumentToMarkdown(doc);
    expect(markdown).toBe("Hello World");
  });

  it("converts headings", () => {
    const doc = parseMarkdownToBlockDocument("# Heading");
    const markdown = blockDocumentToMarkdown(doc);
    expect(markdown).toBe("# Heading");
  });

  it("converts lists", () => {
    const doc = parseMarkdownToBlockDocument("- Item");
    const markdown = blockDocumentToMarkdown(doc);
    expect(markdown).toBe("- Item");
  });

  it("roundtrip preserves content", () => {
    const original = `# Title
A paragraph.
- Item 1
- Item 2`;
    const doc = parseMarkdownToBlockDocument(original);
    const result = blockDocumentToMarkdown(doc);
    expect(result).toBe(original);
  });
});

describe("blockDocumentToMarkdown: inline styles", () => {
  it("converts bold style to **text**", () => {
    const doc = {
      blocks: [
        {
          id: "b1" as any,
          type: "paragraph" as const,
          content: "Hello World",
          styles: [{ start: 0, end: 5, style: { fontWeight: "bold" } }],
        },
      ],
      styleDefinitions: {},
      version: 1,
    };
    const markdown = blockDocumentToMarkdown(doc);
    expect(markdown).toBe("**Hello** World");
  });

  it("converts italic style to *text*", () => {
    const doc = {
      blocks: [
        {
          id: "b1" as any,
          type: "paragraph" as const,
          content: "Hello World",
          styles: [{ start: 6, end: 11, style: { fontStyle: "italic" as const } }],
        },
      ],
      styleDefinitions: {},
      version: 1,
    };
    const markdown = blockDocumentToMarkdown(doc);
    expect(markdown).toBe("Hello *World*");
  });

  it("converts code style to `text`", () => {
    const doc = {
      blocks: [
        {
          id: "b1" as any,
          type: "paragraph" as const,
          content: "Use const keyword",
          styles: [{ start: 4, end: 9, style: { fontFamily: "monospace" } }],
        },
      ],
      styleDefinitions: {},
      version: 1,
    };
    const markdown = blockDocumentToMarkdown(doc);
    expect(markdown).toBe("Use `const` keyword");
  });

  it("converts strikethrough style to ~~text~~", () => {
    const doc = {
      blocks: [
        {
          id: "b1" as any,
          type: "paragraph" as const,
          content: "This is deleted",
          styles: [{ start: 8, end: 15, style: { textDecoration: "line-through" as const } }],
        },
      ],
      styleDefinitions: {},
      version: 1,
    };
    const markdown = blockDocumentToMarkdown(doc);
    expect(markdown).toBe("This is ~~deleted~~");
  });

  it("converts underline style to <u>text</u>", () => {
    const doc = {
      blocks: [
        {
          id: "b1" as any,
          type: "paragraph" as const,
          content: "Important text here",
          styles: [{ start: 0, end: 9, style: { textDecoration: "underline" as const } }],
        },
      ],
      styleDefinitions: {},
      version: 1,
    };
    const markdown = blockDocumentToMarkdown(doc);
    expect(markdown).toBe("<u>Important</u> text here");
  });

  it("handles multiple non-overlapping styles", () => {
    const doc = {
      blocks: [
        {
          id: "b1" as any,
          type: "paragraph" as const,
          content: "Bold and Italic text",
          styles: [
            { start: 0, end: 4, style: { fontWeight: "bold" } },
            { start: 9, end: 15, style: { fontStyle: "italic" as const } },
          ],
        },
      ],
      styleDefinitions: {},
      version: 1,
    };
    const markdown = blockDocumentToMarkdown(doc);
    expect(markdown).toBe("**Bold** and *Italic* text");
  });

  it("handles adjacent styles", () => {
    const doc = {
      blocks: [
        {
          id: "b1" as any,
          type: "paragraph" as const,
          content: "BoldItalic",
          styles: [
            { start: 0, end: 4, style: { fontWeight: "bold" } },
            { start: 4, end: 10, style: { fontStyle: "italic" as const } },
          ],
        },
      ],
      styleDefinitions: {},
      version: 1,
    };
    const markdown = blockDocumentToMarkdown(doc);
    expect(markdown).toBe("**Bold***Italic*");
  });

  it("applies inline styles to headings", () => {
    const doc = {
      blocks: [
        {
          id: "b1" as any,
          type: "heading-1" as const,
          content: "Bold Heading",
          styles: [{ start: 0, end: 4, style: { fontWeight: "bold" } }],
        },
      ],
      styleDefinitions: {},
      version: 1,
    };
    const markdown = blockDocumentToMarkdown(doc);
    expect(markdown).toBe("# **Bold** Heading");
  });

  it("applies inline styles to bullet list", () => {
    const doc = {
      blocks: [
        {
          id: "b1" as any,
          type: "bullet-list" as const,
          content: "Item with code",
          styles: [{ start: 10, end: 14, style: { fontFamily: "monospace" } }],
        },
      ],
      styleDefinitions: {},
      version: 1,
    };
    const markdown = blockDocumentToMarkdown(doc);
    expect(markdown).toBe("- Item with `code`");
  });

  it("does not apply inline styles to code blocks", () => {
    const doc = {
      blocks: [
        {
          id: "b1" as any,
          type: "code-block" as const,
          content: "const x = 1",
          styles: [{ start: 0, end: 5, style: { fontWeight: "bold" } }],
        },
      ],
      styleDefinitions: {},
      version: 1,
    };
    const markdown = blockDocumentToMarkdown(doc);
    expect(markdown).toBe("```\nconst x = 1\n```");
  });

  it("ignores color styles (no Markdown equivalent)", () => {
    const doc = {
      blocks: [
        {
          id: "b1" as any,
          type: "paragraph" as const,
          content: "Red text",
          styles: [{ start: 0, end: 3, style: { color: "#ff0000" } }],
        },
      ],
      styleDefinitions: {},
      version: 1,
    };
    const markdown = blockDocumentToMarkdown(doc);
    expect(markdown).toBe("Red text");
  });

  it("handles empty styles array", () => {
    const doc = {
      blocks: [
        {
          id: "b1" as any,
          type: "paragraph" as const,
          content: "Plain text",
          styles: [],
        },
      ],
      styleDefinitions: {},
      version: 1,
    };
    const markdown = blockDocumentToMarkdown(doc);
    expect(markdown).toBe("Plain text");
  });
});
