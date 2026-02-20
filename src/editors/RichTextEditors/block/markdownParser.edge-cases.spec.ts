/**
 * @file Markdown Parser Edge Cases Tests
 *
 * Comprehensive edge case testing for:
 * - Parser: Markdown → BlockDocument
 * - Serializer: BlockDocument → Markdown
 */

import {
  parseInlineMarkdown,
  parseMarkdownToBlockDocument,
  blockDocumentToMarkdown,
} from "./markdownParser";
import type { BlockDocument, LocalStyleSegment } from "./blockDocument";
import { createBlockId } from "./blockDocument";

// =============================================================================
// Helper: Create BlockDocument for testing
// =============================================================================

function createTestDoc(
  content: string,
  styles: LocalStyleSegment[] = [],
  type: "paragraph" | "heading-1" = "paragraph"
): BlockDocument {
  return {
    blocks: [
      {
        id: createBlockId(),
        type,
        content,
        styles,
      },
    ],
    styleDefinitions: {},
    version: 1,
  };
}

// =============================================================================
// Parser: Inline Markdown → Styles (Edge Cases)
// =============================================================================

describe("parseInlineMarkdown: edge cases", () => {
  describe("delimiter stripping", () => {
    it("should strip bold delimiters **text**", () => {
      const result = parseInlineMarkdown("**bold** text");
      // Expected: content = "bold text", style at 0-4
      expect(result.content).toBe("bold text");
      expect(result.styles).toHaveLength(1);
      expect(result.styles[0]).toEqual({
        start: 0,
        end: 4,
        style: { fontWeight: "bold" },
      });
    });

    it("should strip italic delimiters *text*", () => {
      const result = parseInlineMarkdown("*italic* text");
      expect(result.content).toBe("italic text");
      expect(result.styles).toHaveLength(1);
      expect(result.styles[0]).toEqual({
        start: 0,
        end: 6,
        style: { fontStyle: "italic" },
      });
    });

    it("should strip code delimiters `text`", () => {
      const result = parseInlineMarkdown("use `const` here");
      expect(result.content).toBe("use const here");
      expect(result.styles).toHaveLength(1);
      expect(result.styles[0]).toEqual({
        start: 4,
        end: 9,
        style: { fontFamily: "monospace" },
      });
    });

    it("should strip strikethrough delimiters ~~text~~", () => {
      const result = parseInlineMarkdown("~~deleted~~ text");
      expect(result.content).toBe("deleted text");
      expect(result.styles).toHaveLength(1);
      expect(result.styles[0]).toEqual({
        start: 0,
        end: 7,
        style: { textDecoration: "line-through" },
      });
    });
  });

  describe("multiple styles in same line", () => {
    it("should handle bold followed by italic", () => {
      const result = parseInlineMarkdown("**bold** and *italic*");
      expect(result.content).toBe("bold and italic");
      expect(result.styles).toHaveLength(2);
      // bold at 0-4, italic at 9-15
      expect(result.styles).toContainEqual({
        start: 0,
        end: 4,
        style: { fontWeight: "bold" },
      });
      expect(result.styles).toContainEqual({
        start: 9,
        end: 15,
        style: { fontStyle: "italic" },
      });
    });

    it("should handle three different styles", () => {
      const result = parseInlineMarkdown("**bold** *italic* `code`");
      expect(result.content).toBe("bold italic code");
      expect(result.styles).toHaveLength(3);
    });
  });

  describe("nested styles", () => {
    it("should handle bold+italic ***text***", () => {
      const result = parseInlineMarkdown("***bold italic***");
      expect(result.content).toBe("bold italic");
      expect(result.styles).toHaveLength(2);
      // Both bold and italic should apply to same range
      const boldStyle = result.styles.find(s => s.style.fontWeight === "bold");
      const italicStyle = result.styles.find(s => s.style.fontStyle === "italic");
      expect(boldStyle).toBeDefined();
      expect(italicStyle).toBeDefined();
      expect(boldStyle?.start).toBe(0);
      expect(boldStyle?.end).toBe(11);
      expect(italicStyle?.start).toBe(0);
      expect(italicStyle?.end).toBe(11);
    });

    it("should handle **bold *and italic* text** (nested styles)", () => {
      const result = parseInlineMarkdown("**bold *and italic* text**");
      expect(result.content).toBe("bold and italic text");
      expect(result.styles).toHaveLength(2);
      // Bold covers entire content
      const boldStyle = result.styles.find(s => s.style.fontWeight === "bold");
      expect(boldStyle).toBeDefined();
      expect(boldStyle?.start).toBe(0);
      expect(boldStyle?.end).toBe(20);
      // Italic covers "and italic"
      const italicStyle = result.styles.find(s => s.style.fontStyle === "italic");
      expect(italicStyle).toBeDefined();
      expect(italicStyle?.start).toBe(5);
      expect(italicStyle?.end).toBe(15);
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const result = parseInlineMarkdown("");
      expect(result.content).toBe("");
      expect(result.styles).toHaveLength(0);
    });

    it("should handle no markdown", () => {
      const result = parseInlineMarkdown("plain text");
      expect(result.content).toBe("plain text");
      expect(result.styles).toHaveLength(0);
    });

    it("should handle unclosed delimiters **text", () => {
      const result = parseInlineMarkdown("**unclosed bold");
      expect(result.content).toBe("**unclosed bold");
      expect(result.styles).toHaveLength(0);
    });

    it("should handle escaped asterisks \\*not italic\\*", () => {
      const result = parseInlineMarkdown("\\*not italic\\*");
      expect(result.content).toBe("*not italic*");
      expect(result.styles).toHaveLength(0);
    });

    it("should handle adjacent styles **bold***italic*", () => {
      const result = parseInlineMarkdown("**bold***italic*");
      expect(result.content).toBe("bolditalic");
      expect(result.styles).toHaveLength(2);
      // Bold covers "bold"
      const boldStyle = result.styles.find(s => s.style.fontWeight === "bold");
      expect(boldStyle).toBeDefined();
      expect(boldStyle?.start).toBe(0);
      expect(boldStyle?.end).toBe(4);
      // Italic covers "italic"
      const italicStyle = result.styles.find(s => s.style.fontStyle === "italic");
      expect(italicStyle).toBeDefined();
      expect(italicStyle?.start).toBe(4);
      expect(italicStyle?.end).toBe(10);
    });

    it("should handle style at end of line", () => {
      const result = parseInlineMarkdown("end **bold**");
      expect(result.content).toBe("end bold");
      expect(result.styles).toHaveLength(1);
      expect(result.styles[0].start).toBe(4);
      expect(result.styles[0].end).toBe(8);
    });

    it("should handle multiple same-type styles", () => {
      const result = parseInlineMarkdown("**one** and **two**");
      expect(result.content).toBe("one and two");
      expect(result.styles).toHaveLength(2);
      expect(result.styles[0]).toEqual({ start: 0, end: 3, style: { fontWeight: "bold" } });
      expect(result.styles[1]).toEqual({ start: 8, end: 11, style: { fontWeight: "bold" } });
    });
  });
});

// =============================================================================
// Serializer: Styles → Markdown (Edge Cases)
// =============================================================================

describe("blockDocumentToMarkdown: edge cases", () => {
  describe("overlapping styles", () => {
    it("should handle overlapping bold and italic", () => {
      // "Hello World" with bold 0-8 and italic 6-11
      // Expected: "**Hello **~~*Wo*~~***rld***" or similar valid nesting
      const doc = createTestDoc("Hello World", [
        { start: 0, end: 8, style: { fontWeight: "bold" } },
        { start: 6, end: 11, style: { fontStyle: "italic" } },
      ]);
      const md = blockDocumentToMarkdown(doc);
      // Should produce valid markdown (exact format may vary)
      expect(md).toContain("**");
      expect(md).toContain("*");
    });

    it("should handle completely overlapping styles (same range)", () => {
      const doc = createTestDoc("bold italic", [
        { start: 0, end: 11, style: { fontWeight: "bold" } },
        { start: 0, end: 11, style: { fontStyle: "italic" } },
      ]);
      const md = blockDocumentToMarkdown(doc);
      // Should be ***bold italic*** or **_bold italic_** etc.
      expect(md).toMatch(/\*{3}bold italic\*{3}|\*\*\*bold italic\*\*\*/);
    });
  });

  describe("adjacent styles", () => {
    it("should handle adjacent bold and italic", () => {
      const doc = createTestDoc("bolditalic", [
        { start: 0, end: 4, style: { fontWeight: "bold" } },
        { start: 4, end: 10, style: { fontStyle: "italic" } },
      ]);
      const md = blockDocumentToMarkdown(doc);
      expect(md).toBe("**bold***italic*");
    });
  });

  describe("special characters", () => {
    it("should handle asterisks in content", () => {
      // Content has literal asterisk that should be escaped
      const doc = createTestDoc("2 * 3 = 6", []);
      const md = blockDocumentToMarkdown(doc);
      // Should not interpret * as markdown
      expect(md).toBe("2 * 3 = 6");
    });

    it("should handle backticks in content", () => {
      const doc = createTestDoc("use `template`", []);
      const md = blockDocumentToMarkdown(doc);
      expect(md).toBe("use `template`");
    });
  });

  describe("block types with inline styles", () => {
    it("should handle heading with bold", () => {
      const doc = createTestDoc("Bold Heading", [
        { start: 0, end: 4, style: { fontWeight: "bold" } },
      ], "heading-1");
      const md = blockDocumentToMarkdown(doc);
      expect(md).toBe("# **Bold** Heading");
    });
  });

  describe("empty and edge cases", () => {
    it("should handle empty content with styles", () => {
      // Empty content should produce empty output regardless of styles
      const doc = createTestDoc("", [
        { start: 0, end: 0, style: { fontWeight: "bold" } },
      ]);
      const md = blockDocumentToMarkdown(doc);
      // Zero-length styles on empty content produce empty output
      expect(md).toBe("");
    });

    it("should handle style extending beyond content", () => {
      const doc = createTestDoc("Hi", [
        { start: 0, end: 10, style: { fontWeight: "bold" } },
      ]);
      const md = blockDocumentToMarkdown(doc);
      expect(md).toBe("**Hi**");
    });
  });
});

// =============================================================================
// Round-trip: Markdown → BlockDocument → Markdown
// =============================================================================

describe("round-trip: parse → serialize", () => {
  const roundTrip = (input: string): string => {
    const doc = parseMarkdownToBlockDocument(input);
    return blockDocumentToMarkdown(doc);
  };

  it("should preserve plain text", () => {
    expect(roundTrip("Hello World")).toBe("Hello World");
  });

  it("should preserve bold", () => {
    expect(roundTrip("**bold** text")).toBe("**bold** text");
  });

  it("should preserve italic", () => {
    expect(roundTrip("*italic* text")).toBe("*italic* text");
  });

  it("should preserve code", () => {
    expect(roundTrip("`code` text")).toBe("`code` text");
  });

  it("should preserve heading", () => {
    expect(roundTrip("# Heading")).toBe("# Heading");
  });

  it("should preserve bullet list", () => {
    expect(roundTrip("- Item")).toBe("- Item");
  });

  it("should preserve complex document", () => {
    const input = `# **Bold** Heading
This is *italic* and \`code\`.
- List **item**`;
    expect(roundTrip(input)).toBe(input);
  });
});
