/**
 * @file Styled Document Tests
 *
 * Comprehensive tests for tree-based styled document operations.
 */

import {
  createDocument,
  createEmptyDocument,
  text,
  element,
  getPlainText,
  getDocumentText,
  getNodeLength,
  getTagsAtOffset,
  insertText,
  deleteRange,
  replaceRange,
  wrapWithTag,
  unwrapTag,
  setStyleDefinition,
  setOverlayLayer,
  removeOverlayLayer,
  toFlatSegments,
  type StyledDocument,
} from "../text/styledDocument";

// =============================================================================
// Factory Functions
// =============================================================================

describe("Factory Functions", () => {
  describe("createEmptyDocument", () => {
    it("creates an empty document", () => {
      const doc = createEmptyDocument();
      expect(doc.length).toBe(0);
      expect(getDocumentText(doc)).toBe("");
    });
  });

  describe("createDocument", () => {
    it("creates a document from plain text", () => {
      const doc = createDocument("Hello, World!");
      expect(doc.length).toBe(13);
      expect(getDocumentText(doc)).toBe("Hello, World!");
    });

    it("creates a document with style definitions", () => {
      const doc = createDocument("test", {
        bold: { fontWeight: "bold" },
      });
      expect(doc.styles.bold).toEqual({ fontWeight: "bold" });
    });
  });

  describe("text and element helpers", () => {
    it("creates text nodes", () => {
      const node = text("hello");
      expect(node.type).toBe("text");
      expect(node.content).toBe("hello");
    });

    it("creates element nodes", () => {
      const node = element("bold", [text("hello")]);
      expect(node.type).toBe("element");
      expect(node.tag).toBe("bold");
      expect(node.children).toHaveLength(1);
    });
  });
});

// =============================================================================
// Text Extraction
// =============================================================================

describe("Text Extraction", () => {
  describe("getPlainText", () => {
    it("extracts text from text node", () => {
      const node = text("hello");
      expect(getPlainText(node)).toBe("hello");
    });

    it("extracts text from element node", () => {
      const node = element("bold", [text("hello"), text(" world")]);
      expect(getPlainText(node)).toBe("hello world");
    });

    it("extracts text from nested elements", () => {
      const node = element("bold", [
        text("hello "),
        element("italic", [text("world")]),
      ]);
      expect(getPlainText(node)).toBe("hello world");
    });
  });

  describe("getNodeLength", () => {
    it("returns length of text node", () => {
      expect(getNodeLength(text("hello"))).toBe(5);
    });

    it("returns length of nested nodes", () => {
      const node = element("bold", [text("hello"), text(" world")]);
      expect(getNodeLength(node)).toBe(11);
    });
  });
});

// =============================================================================
// Tree Traversal
// =============================================================================

describe("Tree Traversal", () => {
  describe("getTagsAtOffset", () => {
    it("returns empty array for plain text", () => {
      const doc = createDocument("hello");
      expect(getTagsAtOffset(doc, 2)).toEqual([]);
    });

    it("returns tags at offset in styled text", () => {
      const doc: StyledDocument = {
        content: element("bold", [text("hello")]),
        overlays: [],
        styles: { bold: { fontWeight: "bold" } },
        length: 5,
      };
      expect(getTagsAtOffset(doc, 2)).toEqual(["bold"]);
    });

    it("returns nested tags", () => {
      const doc: StyledDocument = {
        content: element("bold", [
          text("hel"),
          element("italic", [text("lo")]),
        ]),
        overlays: [],
        styles: {},
        length: 5,
      };
      expect(getTagsAtOffset(doc, 4)).toEqual(["bold", "italic"]);
    });
  });
});

// =============================================================================
// Edit Operations
// =============================================================================

describe("Edit Operations", () => {
  describe("insertText", () => {
    it("inserts text at the beginning", () => {
      const doc = createDocument("world");
      const result = insertText(doc, 0, "Hello ");
      expect(getDocumentText(result)).toBe("Hello world");
      expect(result.length).toBe(11);
    });

    it("inserts text in the middle", () => {
      const doc = createDocument("Hello!");
      const result = insertText(doc, 5, " World");
      expect(getDocumentText(result)).toBe("Hello World!");
      expect(result.length).toBe(12);
    });

    it("inserts text at the end", () => {
      const doc = createDocument("Hello");
      const result = insertText(doc, 5, " World");
      expect(getDocumentText(result)).toBe("Hello World");
    });

    it("preserves styles when inserting into styled text", () => {
      const doc: StyledDocument = {
        content: element("bold", [text("Hello")]),
        overlays: [],
        styles: { bold: { fontWeight: "bold" } },
        length: 5,
      };

      const result = insertText(doc, 2, "XX");
      expect(getDocumentText(result)).toBe("HeXXllo");
      expect(result.length).toBe(7);

      // Text should still be inside the bold element
      const tags = getTagsAtOffset(result, 3);
      expect(tags).toContain("bold");
    });

    it("handles empty insertion", () => {
      const doc = createDocument("Hello");
      const result = insertText(doc, 2, "");
      expect(getDocumentText(result)).toBe("Hello");
    });
  });

  describe("deleteRange", () => {
    it("deletes from the beginning", () => {
      const doc = createDocument("Hello World");
      const result = deleteRange(doc, 0, 6);
      expect(getDocumentText(result)).toBe("World");
      expect(result.length).toBe(5);
    });

    it("deletes from the middle", () => {
      const doc = createDocument("Hello World");
      const result = deleteRange(doc, 5, 6);
      expect(getDocumentText(result)).toBe("HelloWorld");
    });

    it("deletes from the end", () => {
      const doc = createDocument("Hello World");
      const result = deleteRange(doc, 6, 11);
      expect(getDocumentText(result)).toBe("Hello ");
    });

    it("handles invalid ranges", () => {
      const doc = createDocument("Hello");
      expect(deleteRange(doc, 3, 2)).toBe(doc); // start > end
      expect(deleteRange(doc, -1, 2)).toBe(doc); // negative start
      expect(deleteRange(doc, 0, 10)).toBe(doc); // end > length
    });

    it("deletes entire document", () => {
      const doc = createDocument("Hello");
      const result = deleteRange(doc, 0, 5);
      expect(getDocumentText(result)).toBe("");
      expect(result.length).toBe(0);
    });

    it("preserves structure when deleting from styled text", () => {
      const doc: StyledDocument = {
        content: element("bold", [text("Hello")]),
        overlays: [],
        styles: { bold: { fontWeight: "bold" } },
        length: 5,
      };

      const result = deleteRange(doc, 1, 3);
      expect(getDocumentText(result)).toBe("Hlo");

      // Remaining text should still be bold
      const tags = getTagsAtOffset(result, 1);
      expect(tags).toContain("bold");
    });
  });

  describe("replaceRange", () => {
    it("replaces text in the middle", () => {
      const doc = createDocument("Hello World");
      const result = replaceRange(doc, 6, 11, "Universe");
      expect(getDocumentText(result)).toBe("Hello Universe");
    });

    it("replaces with shorter text", () => {
      const doc = createDocument("Hello World");
      const result = replaceRange(doc, 0, 5, "Hi");
      expect(getDocumentText(result)).toBe("Hi World");
      expect(result.length).toBe(8);
    });

    it("replaces with longer text", () => {
      const doc = createDocument("Hi");
      const result = replaceRange(doc, 0, 2, "Hello");
      expect(getDocumentText(result)).toBe("Hello");
      expect(result.length).toBe(5);
    });
  });
});

// =============================================================================
// Style Operations
// =============================================================================

describe("Style Operations", () => {
  describe("wrapWithTag", () => {
    it("wraps entire text with a tag", () => {
      const doc = createDocument("Hello");
      const result = wrapWithTag(doc, 0, 5, "bold");
      expect(getDocumentText(result)).toBe("Hello");
      expect(getTagsAtOffset(result, 2)).toContain("bold");
    });

    it("wraps partial text with a tag", () => {
      const doc = createDocument("Hello World");
      const result = wrapWithTag(doc, 0, 5, "bold");
      expect(getDocumentText(result)).toBe("Hello World");
      expect(getTagsAtOffset(result, 2)).toContain("bold");
      expect(getTagsAtOffset(result, 7)).not.toContain("bold");
    });

    it("handles invalid ranges", () => {
      const doc = createDocument("Hello");
      expect(wrapWithTag(doc, 3, 2, "bold")).toBe(doc);
      expect(wrapWithTag(doc, -1, 2, "bold")).toBe(doc);
      expect(wrapWithTag(doc, 0, 10, "bold")).toBe(doc);
    });

    it("allows nested tags", () => {
      const doc = createDocument("Hello World");
      const withBold = wrapWithTag(doc, 0, 11, "bold");
      const withItalic = wrapWithTag(withBold, 6, 11, "italic");

      expect(getDocumentText(withItalic)).toBe("Hello World");
      expect(getTagsAtOffset(withItalic, 2)).toContain("bold");
      expect(getTagsAtOffset(withItalic, 8)).toContain("bold");
      expect(getTagsAtOffset(withItalic, 8)).toContain("italic");
    });
  });

  describe("unwrapTag", () => {
    it("removes a tag from the entire range", () => {
      const doc: StyledDocument = {
        content: element("bold", [text("Hello")]),
        overlays: [],
        styles: { bold: { fontWeight: "bold" } },
        length: 5,
      };

      const result = unwrapTag(doc, 0, 5, "bold");
      expect(getDocumentText(result)).toBe("Hello");
      expect(getTagsAtOffset(result, 2)).not.toContain("bold");
    });

    it("handles invalid ranges", () => {
      const doc = createDocument("Hello");
      expect(unwrapTag(doc, 3, 2, "bold")).toBe(doc);
    });
  });

  describe("setStyleDefinition", () => {
    it("adds a style definition", () => {
      const doc = createDocument("Hello");
      const result = setStyleDefinition(doc, "bold", { fontWeight: "bold" });
      expect(result.styles.bold).toEqual({ fontWeight: "bold" });
    });

    it("updates an existing style definition", () => {
      const doc = createDocument("Hello", { bold: { fontWeight: "bold" } });
      const result = setStyleDefinition(doc, "bold", { fontWeight: "900" });
      expect(result.styles.bold).toEqual({ fontWeight: "900" });
    });
  });
});

// =============================================================================
// Overlay Operations
// =============================================================================

describe("Overlay Operations", () => {
  describe("setOverlayLayer", () => {
    it("adds an overlay layer", () => {
      const doc = createDocument("Hello");
      const result = setOverlayLayer(doc, {
        id: "lint",
        root: element("warning", [text("Hello")]),
        priority: 1,
      });
      expect(result.overlays).toHaveLength(1);
      expect(result.overlays[0].id).toBe("lint");
    });

    it("updates an existing overlay layer", () => {
      const doc = createDocument("Hello");
      const withOverlay = setOverlayLayer(doc, {
        id: "lint",
        root: element("warning", [text("Hello")]),
        priority: 1,
      });
      const updated = setOverlayLayer(withOverlay, {
        id: "lint",
        root: element("error", [text("Hello")]),
        priority: 2,
      });
      expect(updated.overlays).toHaveLength(1);
      expect(updated.overlays[0].priority).toBe(2);
    });

    it("sorts overlays by priority", () => {
      const doc = createDocument("Hello");
      const ref = {
        result: setOverlayLayer(doc, {
          id: "high",
          root: text(""),
          priority: 10,
        }),
      };
      ref.result = setOverlayLayer(ref.result, {
        id: "low",
        root: text(""),
        priority: 1,
      });
      ref.result = setOverlayLayer(ref.result, {
        id: "mid",
        root: text(""),
        priority: 5,
      });

      expect(ref.result.overlays.map((l) => l.id)).toEqual(["low", "mid", "high"]);
    });
  });

  describe("removeOverlayLayer", () => {
    it("removes an overlay layer", () => {
      const doc = createDocument("Hello");
      const withOverlay = setOverlayLayer(doc, {
        id: "lint",
        root: text(""),
        priority: 1,
      });
      const result = removeOverlayLayer(withOverlay, "lint");
      expect(result.overlays).toHaveLength(0);
    });

    it("handles non-existent overlay", () => {
      const doc = createDocument("Hello");
      const result = removeOverlayLayer(doc, "nonexistent");
      expect(result.overlays).toHaveLength(0);
    });
  });
});

// =============================================================================
// Flat Segment Conversion
// =============================================================================

describe("toFlatSegments", () => {
  it("returns empty array for plain text", () => {
    const doc = createDocument("Hello");
    const segments = toFlatSegments(doc);
    expect(segments).toHaveLength(0);
  });

  it("converts styled text to segments", () => {
    const doc: StyledDocument = {
      content: element("bold", [text("Hello")]),
      overlays: [],
      styles: { bold: { fontWeight: "bold" } },
      length: 5,
    };

    const segments = toFlatSegments(doc);
    expect(segments).toHaveLength(1);
    expect(segments[0]).toEqual({
      start: 0,
      end: 5,
      style: { fontWeight: "bold" },
    });
  });

  it("handles nested styles", () => {
    const doc: StyledDocument = {
      content: element("bold", [
        text("Hello "),
        element("italic", [text("World")]),
      ]),
      overlays: [],
      styles: {
        bold: { fontWeight: "bold" },
        italic: { fontStyle: "italic" },
      },
      length: 11,
    };

    const segments = toFlatSegments(doc);
    expect(segments).toHaveLength(2);

    // "Hello " - just bold
    expect(segments[0]).toEqual({
      start: 0,
      end: 6,
      style: { fontWeight: "bold" },
    });

    // "World" - bold + italic
    expect(segments[1]).toEqual({
      start: 6,
      end: 11,
      style: { fontWeight: "bold", fontStyle: "italic" },
    });
  });

  it("merges overlay styles with higher priority", () => {
    const doc: StyledDocument = {
      content: element("keyword", [text("const")]),
      overlays: [
        {
          id: "lint",
          root: element("warning", [text("const")]),
          priority: 1,
        },
      ],
      styles: {
        keyword: { color: "blue" },
        warning: { textDecoration: "underline" },
      },
      length: 5,
    };

    const segments = toFlatSegments(doc);
    expect(segments).toHaveLength(1);
    expect(segments[0].style).toEqual({
      color: "blue",
      textDecoration: "underline",
    });
  });

  it("handles overlapping overlays with different priorities", () => {
    const doc: StyledDocument = {
      content: text("Hello"),
      overlays: [
        {
          id: "low",
          root: element("lowStyle", [text("Hello")]),
          priority: 1,
        },
        {
          id: "high",
          root: element("highStyle", [text("Hello")]),
          priority: 2,
        },
      ],
      styles: {
        lowStyle: { color: "red" },
        highStyle: { color: "blue" },
      },
      length: 5,
    };

    const segments = toFlatSegments(doc);
    expect(segments).toHaveLength(1);
    // Higher priority style should win
    expect(segments[0].style.color).toBe("blue");
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe("Integration", () => {
  it("maintains styles when editing text", () => {
    // Create: <bold>Hello</bold> <italic>World</italic>
    const ref = {
      doc: createDocument("Hello World", {
        bold: { fontWeight: "bold" },
        italic: { fontStyle: "italic" },
      }),
    };
    ref.doc = wrapWithTag(ref.doc, 0, 5, "bold");
    ref.doc = wrapWithTag(ref.doc, 6, 11, "italic");

    // Insert " there" after "Hello" (at the space before World)
    // Insertion at position 5 goes into the unstyled space, not extending bold
    ref.doc = insertText(ref.doc, 5, " there");

    expect(getDocumentText(ref.doc)).toBe("Hello there World");
    expect(ref.doc.length).toBe(17);

    const segments = toFlatSegments(ref.doc);

    // "Hello" should still be bold (not extended)
    const boldSegment = segments.find((s) => s.style.fontWeight === "bold");
    expect(boldSegment).toBeDefined();
    expect(boldSegment?.start).toBe(0);
    expect(boldSegment?.end).toBe(5);

    // "World" should still be italic (shifted by insertion length)
    const italicSegment = segments.find((s) => s.style.fontStyle === "italic");
    expect(italicSegment).toBeDefined();
    expect(italicSegment?.start).toBe(12); // 6 + " there".length
    expect(italicSegment?.end).toBe(17);
  });

  it("extends style when inserting inside styled text", () => {
    // Create: <bold>Hello</bold>
    const ref = {
      doc: createDocument("Hello", {
        bold: { fontWeight: "bold" },
      }),
    };
    ref.doc = wrapWithTag(ref.doc, 0, 5, "bold");

    // Insert " there" inside the bold text (at position 3)
    // "Hel" + " there" + "lo" = "Hel therelo"
    ref.doc = insertText(ref.doc, 3, " there");

    expect(getDocumentText(ref.doc)).toBe("Hel therelo");
    expect(ref.doc.length).toBe(11);

    const segments = toFlatSegments(ref.doc);

    // Entire text should be bold
    const boldSegment = segments.find((s) => s.style.fontWeight === "bold");
    expect(boldSegment).toBeDefined();
    expect(boldSegment?.start).toBe(0);
    expect(boldSegment?.end).toBe(11);
  });

  it("handles CJK text correctly", () => {
    const doc = createDocument("日本語テスト");
    expect(doc.length).toBe(6);
    expect(getDocumentText(doc)).toBe("日本語テスト");

    // Insert at position 3 (after "日本語")
    const inserted = insertText(doc, 3, "の");
    expect(getDocumentText(inserted)).toBe("日本語のテスト");
    expect(inserted.length).toBe(7);

    // Delete "テ"
    const deleted = deleteRange(inserted, 4, 5);
    expect(getDocumentText(deleted)).toBe("日本語のスト");
    expect(deleted.length).toBe(6);
  });

  it("handles mixed ASCII and CJK with styles", () => {
    const ref = {
      doc: createDocument("Hello日本語World", {
        cjk: { color: "blue" },
      }),
    };

    // Wrap the CJK characters
    ref.doc = wrapWithTag(ref.doc, 5, 8, "cjk");

    expect(getDocumentText(ref.doc)).toBe("Hello日本語World");

    const segments = toFlatSegments(ref.doc);
    expect(segments).toHaveLength(1);
    expect(segments[0]).toEqual({
      start: 5,
      end: 8,
      style: { color: "blue" },
    });
  });
});
