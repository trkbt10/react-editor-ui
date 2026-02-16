/**
 * @file TextEditor commands tests
 */

import { describe, it, expect } from "vitest";
import {
  defaultCommands,
  defaultCommandsMap,
  getCommand,
  executeCommand,
  getActiveTagsAtRange,
} from "./commands";
import {
  createDocument,
  getDocumentText,
  wrapWithTag,
  getTagsAtOffset,
} from "../core/styledDocument";

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
      let doc = createDocument("Hello World", { bold: { fontWeight: "bold" } });
      doc = wrapWithTag(doc, 6, 11, "bold");

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
      let doc = createDocument("Hello World", {
        bold: { fontWeight: "bold" },
        italic: { fontStyle: "italic" },
      });

      // Apply bold
      doc = executeCommand(doc, "bold", 0, 5);
      // Apply italic
      doc = executeCommand(doc, "italic", 0, 5);

      const tags = getTagsAtOffset(doc, 0);
      expect(tags).toContain("bold");
      expect(tags).toContain("italic");
    });
  });

  describe("getActiveTagsAtRange", () => {
    it("should return tags at start of range", () => {
      let doc = createDocument("Hello World", { bold: { fontWeight: "bold" } });
      doc = wrapWithTag(doc, 0, 5, "bold");

      const tags = getActiveTagsAtRange(doc, 0);
      expect(tags).toContain("bold");
    });

    it("should return empty array when no tags", () => {
      const doc = createDocument("Hello World");

      const tags = getActiveTagsAtRange(doc, 0);
      expect(tags).toEqual([]);
    });

    it("should return multiple tags when overlapping", () => {
      let doc = createDocument("Hello World", {
        bold: { fontWeight: "bold" },
        italic: { fontStyle: "italic" },
      });
      doc = wrapWithTag(doc, 0, 5, "bold");
      doc = wrapWithTag(doc, 0, 5, "italic");

      const tags = getActiveTagsAtRange(doc, 0);
      expect(tags).toContain("bold");
      expect(tags).toContain("italic");
    });
  });
});
