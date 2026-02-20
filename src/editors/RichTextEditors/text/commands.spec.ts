/**
 * @file TextEditor commands tests
 */

import {
  defaultCommands,
  defaultCommandsMap,
  getCommand,
  executeCommand,
  getActiveTagsAtRange,
  executeBlockCommand,
} from "./commands";
import {
  createDocument,
  getDocumentText,
  wrapWithTag,
  getTagsAtOffset,
} from "./styledDocument";
import type { BlockDocument } from "../block/blockDocument";
import { createBlockDocumentWithStyles } from "../block/blockDocument";

// =============================================================================
// Tests
// =============================================================================

describe("commands", () => {
  describe("defaultCommands", () => {
    it("should include bold command", () => {
      const boldCmd = defaultCommands.find((c) => c.id === "bold");
      expect(boldCmd).toBeDefined();
      expect(boldCmd?.tag).toBe("bold");
    });

    it("should include italic command", () => {
      const italicCmd = defaultCommands.find((c) => c.id === "italic");
      expect(italicCmd).toBeDefined();
      expect(italicCmd?.tag).toBe("italic");
    });

    it("should include underline command", () => {
      const underlineCmd = defaultCommands.find((c) => c.id === "underline");
      expect(underlineCmd).toBeDefined();
      expect(underlineCmd?.tag).toBe("underline");
    });

    it("should include strikethrough command", () => {
      const strikeCmd = defaultCommands.find((c) => c.id === "strikethrough");
      expect(strikeCmd).toBeDefined();
      expect(strikeCmd?.tag).toBe("strikethrough");
    });

    it("should include code command", () => {
      const codeCmd = defaultCommands.find((c) => c.id === "code");
      expect(codeCmd).toBeDefined();
      expect(codeCmd?.tag).toBe("code");
    });
  });

  describe("defaultCommandsMap", () => {
    it("should provide quick lookup by id", () => {
      expect(defaultCommandsMap.get("bold")).toBeDefined();
      expect(defaultCommandsMap.get("italic")).toBeDefined();
      expect(defaultCommandsMap.get("nonexistent")).toBeUndefined();
    });
  });

  describe("getCommand", () => {
    it("should return command by id", () => {
      const boldCmd = getCommand("bold");
      expect(boldCmd).toBeDefined();
      expect(boldCmd?.id).toBe("bold");
    });

    it("should return undefined for unknown command", () => {
      const cmd = getCommand("unknown-command");
      expect(cmd).toBeUndefined();
    });
  });

  describe("executeCommand", () => {
    it("should apply bold tag to selection", () => {
      const doc = createDocument("Hello World", { bold: { fontWeight: "bold" } });

      // Apply bold to "World"
      const newDoc = executeCommand(doc, "bold", 6, 11);

      // Text should be unchanged
      expect(getDocumentText(newDoc)).toBe("Hello World");

      // Bold tag should be applied at position 6
      const tags = getTagsAtOffset(newDoc, 6);
      expect(tags).toContain("bold");
    });

    it("should toggle bold tag off when already applied", () => {
      // Create document with bold "World"
      const createBoldDoc = () => {
        const base = createDocument("Hello World", { bold: { fontWeight: "bold" } });
        return wrapWithTag(base, 6, 11, "bold");
      };
      const doc = createBoldDoc();

      // Verify bold is applied
      expect(getTagsAtOffset(doc, 6)).toContain("bold");

      // Toggle bold off
      const newDoc = executeCommand(doc, "bold", 6, 11);

      // Bold tag should be removed
      const tags = getTagsAtOffset(newDoc, 6);
      expect(tags).not.toContain("bold");
    });

    it("should return original document for unknown command", () => {
      const doc = createDocument("Hello World");

      const newDoc = executeCommand(doc, "unknown-command", 0, 5);

      // Should be same document
      expect(newDoc).toBe(doc);
    });

    it("should apply italic tag to selection", () => {
      const doc = createDocument("Hello World", { italic: { fontStyle: "italic" } });

      const newDoc = executeCommand(doc, "italic", 0, 5);

      const tags = getTagsAtOffset(newDoc, 0);
      expect(tags).toContain("italic");
    });

    it("should handle multiple commands on same range", () => {
      const createStyledDoc = () => {
        const base = createDocument("Hello World", {
          bold: { fontWeight: "bold" },
          italic: { fontStyle: "italic" },
        });
        // Apply bold then italic
        const withBold = executeCommand(base, "bold", 0, 5);
        return executeCommand(withBold, "italic", 0, 5);
      };
      const doc = createStyledDoc();

      const tags = getTagsAtOffset(doc, 0);
      expect(tags).toContain("bold");
      expect(tags).toContain("italic");
    });
  });

  describe("getActiveTagsAtRange", () => {
    it("should return tags at start of range", () => {
      const doc = wrapWithTag(
        createDocument("Hello World", { bold: { fontWeight: "bold" } }),
        0,
        5,
        "bold"
      );

      const tags = getActiveTagsAtRange(doc, 0);
      expect(tags).toContain("bold");
    });

    it("should return empty array when no tags", () => {
      const doc = createDocument("Hello World");

      const tags = getActiveTagsAtRange(doc, 0);
      expect(tags).toEqual([]);
    });

    it("should return multiple tags when overlapping", () => {
      const createOverlappingDoc = () => {
        const base = createDocument("Hello World", {
          bold: { fontWeight: "bold" },
          italic: { fontStyle: "italic" },
        });
        const withBold = wrapWithTag(base, 0, 5, "bold");
        return wrapWithTag(withBold, 0, 5, "italic");
      };
      const doc = createOverlappingDoc();

      const tags = getActiveTagsAtRange(doc, 0);
      expect(tags).toContain("bold");
      expect(tags).toContain("italic");
    });
  });
});

// =============================================================================
// BlockDocument Commands Tests
// =============================================================================

describe("executeBlockCommand", () => {
  const createTestBlockDoc = (text: string): BlockDocument => {
    return createBlockDocumentWithStyles(text);
  };

  describe("style deduplication", () => {
    it("should not duplicate styles when applying same style twice to same range", () => {
      const doc = createTestBlockDoc("Hello World");

      // Apply bold to "World" (offset 6-11)
      const withBold1 = executeBlockCommand(doc, "bold", 6, 11);

      // Toggle bold off
      const withoutBold = executeBlockCommand(withBold1, "bold", 6, 11);

      // Apply bold again
      const withBold2 = executeBlockCommand(withoutBold, "bold", 6, 11);

      // Should only have one bold segment
      const styles = withBold2.blocks[0].styles;
      const boldStyles = styles.filter(s => s.style.fontWeight === "bold");
      expect(boldStyles.length).toBe(1);
    });

    it("should merge overlapping styles when extending selection", () => {
      const doc = createTestBlockDoc("Hello World");

      // Apply bold to "Hello" (0-5)
      const withBold1 = executeBlockCommand(doc, "bold", 0, 5);

      // Apply bold to " World" (5-11) - adjacent, not overlapping
      // This should extend the bold range
      const withBold2 = executeBlockCommand(withBold1, "bold", 5, 11);

      // Should merge into one segment covering 0-11
      const styles = withBold2.blocks[0].styles;
      const boldStyles = styles.filter(s => s.style.fontWeight === "bold");
      expect(boldStyles.length).toBe(1);
      expect(boldStyles[0].start).toBe(0);
      expect(boldStyles[0].end).toBe(11);
    });

    it("should handle partial overlap with toggle-off behavior", () => {
      const doc = createTestBlockDoc("Hello World");

      // Apply bold to "Hello" (0-5)
      const withBold1 = executeBlockCommand(doc, "bold", 0, 5);

      // Apply bold to "llo W" (2-7) - overlapping range
      // Since position 2 already has bold, this toggles OFF bold for 2-7
      const withBold2 = executeBlockCommand(withBold1, "bold", 2, 7);

      // Should have bold only on 0-2 (the part before the toggle-off range)
      const styles = withBold2.blocks[0].styles;
      const boldStyles = styles.filter(s => s.style.fontWeight === "bold");
      expect(boldStyles.length).toBe(1);
      expect(boldStyles[0].start).toBe(0);
      expect(boldStyles[0].end).toBe(2);
    });

    it("should merge adjacent styles with same properties", () => {
      const doc = createTestBlockDoc("Hello World");

      // Apply bold to "Hello" (0-5)
      const withBold1 = executeBlockCommand(doc, "bold", 0, 5);

      // Apply bold to " World" (5-11) - adjacent range
      const withBold2 = executeBlockCommand(withBold1, "bold", 5, 11);

      // Should merge into one segment covering 0-11
      const styles = withBold2.blocks[0].styles;
      const boldStyles = styles.filter(s => s.style.fontWeight === "bold");
      expect(boldStyles.length).toBe(1);
      expect(boldStyles[0].start).toBe(0);
      expect(boldStyles[0].end).toBe(11);
    });

    it("should keep separate styles when not overlapping", () => {
      const doc = createTestBlockDoc("Hello World Test");

      // Apply bold to "Hello" (0-5)
      const withBold1 = executeBlockCommand(doc, "bold", 0, 5);

      // Apply bold to "Test" (12-16) - non-overlapping
      const withBold2 = executeBlockCommand(withBold1, "bold", 12, 16);

      // Should have two separate segments
      const styles = withBold2.blocks[0].styles;
      const boldStyles = styles.filter(s => s.style.fontWeight === "bold");
      expect(boldStyles.length).toBe(2);
    });

    it("should handle color style deduplication", () => {
      const doc = createTestBlockDoc("Hello World");

      // Apply red color to "Hello" (0-5)
      const withColor1 = executeBlockCommand(doc, "textColor", 0, 5, { color: "#ff0000" });

      // Apply same red color to "llo" (2-5) - subset range
      const withColor2 = executeBlockCommand(withColor1, "textColor", 2, 5, { color: "#ff0000" });

      // Should still be one segment (no duplication within same range)
      const styles = withColor2.blocks[0].styles;
      const colorStyles = styles.filter(s => s.style.color === "#ff0000");
      expect(colorStyles.length).toBe(1);
    });
  });

  describe("inline styles", () => {
    it("should apply bold style to BlockDocument", () => {
      const doc = createTestBlockDoc("Hello World");

      const newDoc = executeBlockCommand(doc, "bold", 6, 11);

      expect(newDoc.blocks[0].styles.length).toBeGreaterThan(0);
      expect(newDoc.blocks[0].styles[0].style.fontWeight).toBe("bold");
    });

    it("should toggle bold off when already applied", () => {
      const doc = createTestBlockDoc("Hello World");

      // Apply bold
      const withBold = executeBlockCommand(doc, "bold", 6, 11);
      expect(withBold.blocks[0].styles.length).toBe(1);

      // Toggle off
      const withoutBold = executeBlockCommand(withBold, "bold", 6, 11);
      expect(withoutBold.blocks[0].styles.length).toBe(0);
    });
  });

  describe("block-level commands", () => {
    it("should toggle heading-1 (visual only - no prefix)", () => {
      const doc = createTestBlockDoc("Hello World");

      const withHeading = executeBlockCommand(doc, "heading-1", 0, 11);

      // Block type changes, but content stays the same (visual styling only)
      expect(withHeading.blocks[0].type).toBe("heading-1");
      expect(withHeading.blocks[0].content).toBe("Hello World");
    });

    it("should toggle bullet-list (visual only - no prefix)", () => {
      const doc = createTestBlockDoc("Item 1");

      const withList = executeBlockCommand(doc, "bullet-list", 0, 6);

      // Block type changes, but content stays the same (visual styling only)
      expect(withList.blocks[0].type).toBe("bullet-list");
      expect(withList.blocks[0].content).toBe("Item 1");
    });

    it("should preserve style offsets when changing block type", () => {
      const doc = createTestBlockDoc("Hello");

      // Apply bold to "Hello" (0-5)
      const withBold = executeBlockCommand(doc, "bold", 0, 5);

      // Convert to bullet list (only changes type, no prefix added)
      const withList = executeBlockCommand(withBold, "bullet-list", 0, 5);

      // Style offsets should remain unchanged (no prefix adjustment needed)
      expect(withList.blocks[0].styles[0].start).toBe(0);
      expect(withList.blocks[0].styles[0].end).toBe(5);
    });

    it("should toggle back to paragraph when same type applied", () => {
      const doc = createTestBlockDoc("Hello");

      // Apply heading-2
      const withHeading = executeBlockCommand(doc, "heading-2", 0, 5);
      expect(withHeading.blocks[0].type).toBe("heading-2");

      // Toggle back to paragraph
      const withParagraph = executeBlockCommand(withHeading, "heading-2", 0, 5);
      expect(withParagraph.blocks[0].type).toBe("paragraph");
      expect(withParagraph.blocks[0].content).toBe("Hello");
    });

    it("should change between different block types", () => {
      const doc = createTestBlockDoc("Content");

      // Apply heading-1
      const withH1 = executeBlockCommand(doc, "heading-1", 0, 7);
      expect(withH1.blocks[0].type).toBe("heading-1");

      // Change to blockquote
      const withQuote = executeBlockCommand(withH1, "blockquote", 0, 7);
      expect(withQuote.blocks[0].type).toBe("blockquote");
      expect(withQuote.blocks[0].content).toBe("Content");
    });
  });
});
