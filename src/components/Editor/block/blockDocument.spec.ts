/**
 * @file Block Document Tests
 */

import {
  createBlockId,
  createBlock,
  createEmptyBlock,
  createEmptyBlockDocument,
  createBlockDocument,
  getBlockDocumentText,
  getBlockDocumentLength,
  getBlockById,
  getBlockIndexById,
  getBlockAtGlobalOffset,
  updateBlock,
  insertTextInBlock,
  deleteRangeInBlock,
  replaceRangeInBlock,
  insertTextInDocument,
  deleteRangeInDocument,
  replaceRangeInDocument,
  fromStyledDocument,
  toStyledDocument,
  applyStyleToBlock,
  removeStylesFromBlock,
  splitBlock,
  mergeBlocks,
  type BlockId,
  type BlockDocument,
} from "../block/blockDocument";
import { createDocument, setStyleDefinition, wrapWithTag } from "../text/styledDocument";

// Mock crypto.randomUUID for deterministic tests
const createUuidCounter = () => {
  const state = { counter: 0 };
  return {
    next: () => ++state.counter,
    reset: () => { state.counter = 0; },
  };
};
const uuidCounter = createUuidCounter();

beforeEach(() => {
  uuidCounter.reset();
  vi.spyOn(crypto, "randomUUID").mockImplementation(() => {
    return `test-uuid-${uuidCounter.next()}` as `${string}-${string}-${string}-${string}-${string}`;
  });
});

// =============================================================================
// Factory Functions
// =============================================================================

describe("createBlockId", () => {
  it("creates a unique BlockId", () => {
    const id1 = createBlockId();
    const id2 = createBlockId();
    expect(id1).toBe("test-uuid-1");
    expect(id2).toBe("test-uuid-2");
    expect(id1).not.toBe(id2);
  });
});

describe("createBlock", () => {
  it("creates a block with default type", () => {
    const block = createBlock("Hello");
    expect(block.content).toBe("Hello");
    expect(block.type).toBe("paragraph");
    expect(block.styles).toEqual([]);
  });

  it("creates a block with custom type", () => {
    const block = createBlock("const x = 1;", "code-block");
    expect(block.type).toBe("code-block");
  });

  it("creates a block with styles", () => {
    const styles = [{ start: 0, end: 5, style: { fontWeight: "bold" } }];
    const block = createBlock("Hello", "paragraph", styles);
    expect(block.styles).toEqual(styles);
  });
});

describe("createEmptyBlock", () => {
  it("creates an empty paragraph by default", () => {
    const block = createEmptyBlock();
    expect(block.content).toBe("");
    expect(block.type).toBe("paragraph");
  });

  it("creates an empty block with custom type", () => {
    const block = createEmptyBlock("heading");
    expect(block.type).toBe("heading");
  });
});

describe("createEmptyBlockDocument", () => {
  it("creates a document with one empty block", () => {
    const doc = createEmptyBlockDocument();
    expect(doc.blocks).toHaveLength(1);
    expect(doc.blocks[0].content).toBe("");
    expect(doc.version).toBe(1);
  });
});

describe("createBlockDocument", () => {
  it("creates a document from single line text", () => {
    const doc = createBlockDocument("Hello world");
    expect(doc.blocks).toHaveLength(1);
    expect(doc.blocks[0].content).toBe("Hello world");
  });

  it("creates multiple blocks from multiline text", () => {
    const doc = createBlockDocument("Line 1\nLine 2\nLine 3");
    expect(doc.blocks).toHaveLength(3);
    expect(doc.blocks[0].content).toBe("Line 1");
    expect(doc.blocks[1].content).toBe("Line 2");
    expect(doc.blocks[2].content).toBe("Line 3");
  });

  it("preserves empty lines as empty blocks", () => {
    const doc = createBlockDocument("Line 1\n\nLine 3");
    expect(doc.blocks).toHaveLength(3);
    expect(doc.blocks[1].content).toBe("");
  });

  it("includes style definitions", () => {
    const styles = { bold: { fontWeight: "bold" } };
    const doc = createBlockDocument("Text", styles);
    expect(doc.styleDefinitions).toEqual(styles);
  });
});

// =============================================================================
// Text Extraction
// =============================================================================

describe("getBlockDocumentText", () => {
  it("returns empty string for empty document", () => {
    const doc = createEmptyBlockDocument();
    expect(getBlockDocumentText(doc)).toBe("");
  });

  it("returns single block content", () => {
    const doc = createBlockDocument("Hello");
    expect(getBlockDocumentText(doc)).toBe("Hello");
  });

  it("joins blocks with newlines", () => {
    const doc = createBlockDocument("Line 1\nLine 2");
    expect(getBlockDocumentText(doc)).toBe("Line 1\nLine 2");
  });
});

describe("getBlockDocumentLength", () => {
  it("returns 0 for empty blocks array", () => {
    const doc: BlockDocument = { blocks: [], styleDefinitions: {}, version: 1 };
    expect(getBlockDocumentLength(doc)).toBe(0);
  });

  it("returns content length for single block", () => {
    const doc = createBlockDocument("Hello");
    expect(getBlockDocumentLength(doc)).toBe(5);
  });

  it("includes newlines between blocks", () => {
    const doc = createBlockDocument("AB\nCD");
    // "AB" (2) + "\n" (1) + "CD" (2) = 5
    expect(getBlockDocumentLength(doc)).toBe(5);
  });
});

// =============================================================================
// Block Lookup
// =============================================================================

describe("getBlockById", () => {
  it("returns block when found", () => {
    const doc = createBlockDocument("Test");
    const block = getBlockById(doc, doc.blocks[0].id);
    expect(block).toBe(doc.blocks[0]);
  });

  it("returns undefined when not found", () => {
    const doc = createBlockDocument("Test");
    const block = getBlockById(doc, "nonexistent" as BlockId);
    expect(block).toBeUndefined();
  });
});

describe("getBlockIndexById", () => {
  it("returns index when found", () => {
    const doc = createBlockDocument("A\nB\nC");
    expect(getBlockIndexById(doc, doc.blocks[1].id)).toBe(1);
  });

  it("returns -1 when not found", () => {
    const doc = createBlockDocument("Test");
    expect(getBlockIndexById(doc, "nonexistent" as BlockId)).toBe(-1);
  });
});

describe("getBlockAtGlobalOffset", () => {
  it("returns first block for offset 0", () => {
    const doc = createBlockDocument("AB\nCD");
    const result = getBlockAtGlobalOffset(doc, 0);
    expect(result?.blockIndex).toBe(0);
    expect(result?.localOffset).toBe(0);
  });

  it("returns correct block and local offset", () => {
    const doc = createBlockDocument("AB\nCD");
    // Offset 3 is "C" in second block (after "AB\n")
    const result = getBlockAtGlobalOffset(doc, 3);
    expect(result?.blockIndex).toBe(1);
    expect(result?.localOffset).toBe(0);
  });

  it("returns end of first block for offset at newline", () => {
    const doc = createBlockDocument("AB\nCD");
    // Offset 2 is end of "AB"
    const result = getBlockAtGlobalOffset(doc, 2);
    expect(result?.blockIndex).toBe(0);
    expect(result?.localOffset).toBe(2);
  });

  it("returns last block for offset beyond document", () => {
    const doc = createBlockDocument("AB");
    const result = getBlockAtGlobalOffset(doc, 100);
    expect(result?.blockIndex).toBe(0);
    expect(result?.localOffset).toBe(2);
  });

  it("returns undefined for empty document", () => {
    const doc: BlockDocument = { blocks: [], styleDefinitions: {}, version: 1 };
    const result = getBlockAtGlobalOffset(doc, 0);
    expect(result).toBeUndefined();
  });
});

// =============================================================================
// Block Edit Operations
// =============================================================================

describe("updateBlock", () => {
  it("updates a block and increments version", () => {
    const doc = createBlockDocument("Hello");
    const updated = updateBlock(doc, doc.blocks[0].id, (block) => ({
      ...block,
      content: "World",
    }));
    expect(updated.blocks[0].content).toBe("World");
    expect(updated.version).toBe(2);
  });

  it("returns same document if block not found", () => {
    const doc = createBlockDocument("Hello");
    const updated = updateBlock(doc, "nonexistent" as BlockId, (block) => ({
      ...block,
      content: "World",
    }));
    expect(updated).toBe(doc);
  });

  it("returns same document if updater returns same block", () => {
    const doc = createBlockDocument("Hello");
    const updated = updateBlock(doc, doc.blocks[0].id, (block) => block);
    expect(updated).toBe(doc);
  });
});

describe("insertTextInBlock", () => {
  it("inserts text at beginning", () => {
    const block = createBlock("World");
    const result = insertTextInBlock(block, 0, "Hello ");
    expect(result.content).toBe("Hello World");
  });

  it("inserts text at end", () => {
    const block = createBlock("Hello");
    const result = insertTextInBlock(block, 5, " World");
    expect(result.content).toBe("Hello World");
  });

  it("inserts text in middle", () => {
    const block = createBlock("Helo");
    const result = insertTextInBlock(block, 2, "l");
    expect(result.content).toBe("Hello");
  });

  it("returns same block for empty text", () => {
    const block = createBlock("Hello");
    const result = insertTextInBlock(block, 0, "");
    expect(result).toBe(block);
  });

  it("shifts styles after insertion point", () => {
    const block = createBlock("AC", "paragraph", [
      { start: 1, end: 2, style: { fontWeight: "bold" } },
    ]);
    const result = insertTextInBlock(block, 1, "B");
    expect(result.styles[0]).toEqual({
      start: 2,
      end: 3,
      style: { fontWeight: "bold" },
    });
  });

  it("extends style that spans insertion point", () => {
    const block = createBlock("ABCD", "paragraph", [
      { start: 1, end: 3, style: { fontWeight: "bold" } },
    ]);
    const result = insertTextInBlock(block, 2, "X");
    expect(result.content).toBe("ABXCD");
    expect(result.styles[0]).toEqual({
      start: 1,
      end: 4,
      style: { fontWeight: "bold" },
    });
  });
});

describe("deleteRangeInBlock", () => {
  it("deletes from beginning", () => {
    const block = createBlock("Hello World");
    const result = deleteRangeInBlock(block, 0, 6);
    expect(result.content).toBe("World");
  });

  it("deletes from end", () => {
    const block = createBlock("Hello World");
    const result = deleteRangeInBlock(block, 5, 11);
    expect(result.content).toBe("Hello");
  });

  it("deletes from middle", () => {
    const block = createBlock("Hello World");
    const result = deleteRangeInBlock(block, 5, 6);
    expect(result.content).toBe("HelloWorld");
  });

  it("returns same block for invalid range", () => {
    const block = createBlock("Hello");
    expect(deleteRangeInBlock(block, 5, 3)).toBe(block);
    expect(deleteRangeInBlock(block, -1, 3)).toBe(block);
    expect(deleteRangeInBlock(block, 0, 100)).toBe(block);
  });

  it("shifts styles after deletion", () => {
    const block = createBlock("ABCDE", "paragraph", [
      { start: 3, end: 5, style: { fontWeight: "bold" } },
    ]);
    const result = deleteRangeInBlock(block, 1, 2);
    expect(result.content).toBe("ACDE");
    expect(result.styles[0]).toEqual({
      start: 2,
      end: 4,
      style: { fontWeight: "bold" },
    });
  });

  it("removes styles entirely within deleted range", () => {
    const block = createBlock("ABCDE", "paragraph", [
      { start: 1, end: 3, style: { fontWeight: "bold" } },
    ]);
    const result = deleteRangeInBlock(block, 0, 4);
    expect(result.content).toBe("E");
    expect(result.styles).toHaveLength(0);
  });
});

describe("replaceRangeInBlock", () => {
  it("replaces text in block", () => {
    const block = createBlock("Hello World");
    const result = replaceRangeInBlock(block, 6, 11, "Universe");
    expect(result.content).toBe("Hello Universe");
  });
});

// =============================================================================
// Document Edit Operations
// =============================================================================

describe("insertTextInDocument", () => {
  it("inserts text without newlines", () => {
    const doc = createBlockDocument("Hello");
    const result = insertTextInDocument(doc, 5, " World");
    expect(getBlockDocumentText(result)).toBe("Hello World");
    expect(result.blocks).toHaveLength(1);
  });

  it("splits block when inserting newline", () => {
    const doc = createBlockDocument("HelloWorld");
    const result = insertTextInDocument(doc, 5, "\n");
    expect(getBlockDocumentText(result)).toBe("Hello\nWorld");
    expect(result.blocks).toHaveLength(2);
    expect(result.blocks[0].content).toBe("Hello");
    expect(result.blocks[1].content).toBe("World");
  });

  it("creates multiple blocks for multiple newlines", () => {
    const doc = createBlockDocument("AD");
    const result = insertTextInDocument(doc, 1, "B\nC\n");
    expect(getBlockDocumentText(result)).toBe("AB\nC\nD");
    expect(result.blocks).toHaveLength(3);
  });

  it("increments version", () => {
    const doc = createBlockDocument("Hello");
    const result = insertTextInDocument(doc, 0, "X");
    expect(result.version).toBe(2);
  });

  it("returns same document for empty text", () => {
    const doc = createBlockDocument("Hello");
    const result = insertTextInDocument(doc, 0, "");
    expect(result).toBe(doc);
  });
});

describe("deleteRangeInDocument", () => {
  it("deletes within single block", () => {
    const doc = createBlockDocument("Hello World");
    const result = deleteRangeInDocument(doc, 5, 6);
    expect(getBlockDocumentText(result)).toBe("HelloWorld");
    expect(result.blocks).toHaveLength(1);
  });

  it("merges blocks when deleting across newline", () => {
    const doc = createBlockDocument("Hello\nWorld");
    // Delete from end of "Hello" (5) through start of "World" (7 = 5+newline+1)
    const result = deleteRangeInDocument(doc, 5, 7);
    expect(getBlockDocumentText(result)).toBe("Helloorld");
    expect(result.blocks).toHaveLength(1);
  });

  it("removes entire middle blocks", () => {
    const doc = createBlockDocument("A\nB\nC");
    // "A\nB\nC" positions: A=0, \n=1, B=2, \n=3, C=4
    // Delete from 1 (newline after A) to 4 (C)
    const result = deleteRangeInDocument(doc, 1, 4);
    expect(getBlockDocumentText(result)).toBe("AC");
    expect(result.blocks).toHaveLength(1);
  });

  it("returns same document for invalid range", () => {
    const doc = createBlockDocument("Hello");
    expect(deleteRangeInDocument(doc, 5, 3)).toBe(doc);
  });

  it("ensures at least one block remains", () => {
    const doc = createBlockDocument("Hi");
    const result = deleteRangeInDocument(doc, 0, 2);
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].content).toBe("");
  });
});

describe("replaceRangeInDocument", () => {
  it("replaces text in document", () => {
    const doc = createBlockDocument("Hello World");
    const result = replaceRangeInDocument(doc, 6, 11, "Universe");
    expect(getBlockDocumentText(result)).toBe("Hello Universe");
  });
});

// =============================================================================
// Conversion Functions
// =============================================================================

describe("fromStyledDocument", () => {
  it("converts single line document", () => {
    const styled = createDocument("Hello");
    const block = fromStyledDocument(styled);
    expect(block.blocks).toHaveLength(1);
    expect(block.blocks[0].content).toBe("Hello");
  });

  it("converts multiline document", () => {
    const styled = createDocument("Line 1\nLine 2");
    const block = fromStyledDocument(styled);
    expect(block.blocks).toHaveLength(2);
  });

  it("converts styles to local offsets", () => {
    const styledBase = createDocument("AB\nCD");
    const styledWithDef = setStyleDefinition(styledBase, "bold", { fontWeight: "bold" });
    // Wrap "B\nC" with bold (offset 1-4)
    const styled = wrapWithTag(styledWithDef, 1, 4, "bold");

    const block = fromStyledDocument(styled);

    // First block "AB" should have style from 1-2
    expect(block.blocks[0].styles).toHaveLength(1);
    expect(block.blocks[0].styles[0].start).toBe(1);
    expect(block.blocks[0].styles[0].end).toBe(2);

    // Second block "CD" should have style from 0-1
    expect(block.blocks[1].styles).toHaveLength(1);
    expect(block.blocks[1].styles[0].start).toBe(0);
    expect(block.blocks[1].styles[0].end).toBe(1);
  });
});

describe("toStyledDocument", () => {
  it("converts block document to styled document", () => {
    const block = createBlockDocument("Hello\nWorld");
    const styled = toStyledDocument(block);
    expect(styled.length).toBe(11); // "Hello\nWorld"
  });

  it("preserves style definitions", () => {
    const block = createBlockDocument("Hello", { bold: { fontWeight: "bold" } });
    const styled = toStyledDocument(block);
    expect(styled.styles).toEqual({ bold: { fontWeight: "bold" } });
  });
});

// =============================================================================
// Block Style Operations
// =============================================================================

describe("applyStyleToBlock", () => {
  it("adds style segment to block", () => {
    const block = createBlock("Hello");
    const result = applyStyleToBlock(block, 0, 5, { fontWeight: "bold" });
    expect(result.styles).toHaveLength(1);
    expect(result.styles[0]).toEqual({
      start: 0,
      end: 5,
      style: { fontWeight: "bold" },
    });
  });

  it("sorts styles by start position", () => {
    const block1 = createBlock("Hello");
    const block2 = applyStyleToBlock(block1, 3, 5, { fontWeight: "bold" });
    const block3 = applyStyleToBlock(block2, 0, 2, { fontStyle: "italic" });
    expect(block3.styles[0].start).toBe(0);
    expect(block3.styles[1].start).toBe(3);
  });

  it("returns same block for invalid range", () => {
    const block = createBlock("Hello");
    expect(applyStyleToBlock(block, 5, 3, { fontWeight: "bold" })).toBe(block);
    expect(applyStyleToBlock(block, -1, 3, { fontWeight: "bold" })).toBe(block);
    expect(applyStyleToBlock(block, 0, 100, { fontWeight: "bold" })).toBe(block);
  });
});

describe("removeStylesFromBlock", () => {
  it("removes styles entirely within range", () => {
    const block = createBlock("Hello", "paragraph", [
      { start: 1, end: 4, style: { fontWeight: "bold" } },
    ]);
    const result = removeStylesFromBlock(block, 0, 5);
    expect(result.styles).toHaveLength(0);
  });

  it("truncates style that starts before range", () => {
    const block = createBlock("Hello", "paragraph", [
      { start: 0, end: 5, style: { fontWeight: "bold" } },
    ]);
    const result = removeStylesFromBlock(block, 3, 5);
    expect(result.styles).toHaveLength(1);
    expect(result.styles[0].end).toBe(3);
  });

  it("truncates style that ends after range", () => {
    const block = createBlock("Hello", "paragraph", [
      { start: 0, end: 5, style: { fontWeight: "bold" } },
    ]);
    const result = removeStylesFromBlock(block, 0, 2);
    expect(result.styles).toHaveLength(1);
    expect(result.styles[0].start).toBe(2);
  });

  it("splits style that spans range", () => {
    const block = createBlock("Hello", "paragraph", [
      { start: 0, end: 5, style: { fontWeight: "bold" } },
    ]);
    const result = removeStylesFromBlock(block, 2, 3);
    expect(result.styles).toHaveLength(2);
    expect(result.styles[0]).toEqual({ start: 0, end: 2, style: { fontWeight: "bold" } });
    expect(result.styles[1]).toEqual({ start: 3, end: 5, style: { fontWeight: "bold" } });
  });
});

// =============================================================================
// Block Split and Merge
// =============================================================================

describe("splitBlock", () => {
  it("splits block at offset", () => {
    const block = createBlock("HelloWorld");
    const { before, after } = splitBlock(block, 5);
    expect(before.content).toBe("Hello");
    expect(after.content).toBe("World");
  });

  it("preserves original block ID for before", () => {
    const block = createBlock("HelloWorld");
    const { before, after } = splitBlock(block, 5);
    expect(before.id).toBe(block.id);
    expect(after.id).not.toBe(block.id);
  });

  it("splits styles correctly", () => {
    const block = createBlock("HelloWorld", "paragraph", [
      { start: 3, end: 7, style: { fontWeight: "bold" } }, // "loWo"
    ]);
    const { before, after } = splitBlock(block, 5);

    // Before: "Hello" with style on "lo" (3-5)
    expect(before.styles).toHaveLength(1);
    expect(before.styles[0]).toEqual({
      start: 3,
      end: 5,
      style: { fontWeight: "bold" },
    });

    // After: "World" with style on "Wo" (0-2)
    expect(after.styles).toHaveLength(1);
    expect(after.styles[0]).toEqual({
      start: 0,
      end: 2,
      style: { fontWeight: "bold" },
    });
  });
});

describe("mergeBlocks", () => {
  it("merges two blocks", () => {
    const first = createBlock("Hello");
    const second = createBlock("World");
    const merged = mergeBlocks(first, second);
    expect(merged.content).toBe("HelloWorld");
  });

  it("preserves first block ID", () => {
    const first = createBlock("Hello");
    const second = createBlock("World");
    const merged = mergeBlocks(first, second);
    expect(merged.id).toBe(first.id);
  });

  it("adjusts second block style offsets", () => {
    const first = createBlock("Hello");
    const second = createBlock("World", "paragraph", [
      { start: 0, end: 5, style: { fontWeight: "bold" } },
    ]);
    const merged = mergeBlocks(first, second);
    expect(merged.styles).toHaveLength(1);
    expect(merged.styles[0]).toEqual({
      start: 5,
      end: 10,
      style: { fontWeight: "bold" },
    });
  });

  it("combines styles from both blocks", () => {
    const first = createBlock("Hello", "paragraph", [
      { start: 0, end: 2, style: { fontStyle: "italic" } },
    ]);
    const second = createBlock("World", "paragraph", [
      { start: 0, end: 5, style: { fontWeight: "bold" } },
    ]);
    const merged = mergeBlocks(first, second);
    expect(merged.styles).toHaveLength(2);
  });
});

// =============================================================================
// Style Preservation in Document Operations
// =============================================================================

describe("insertTextInDocument with styles", () => {
  it("preserves styles when inserting newline", () => {
    const doc: BlockDocument = {
      blocks: [
        createBlock("HelloWorld", "paragraph", [
          { start: 0, end: 5, style: { fontWeight: "bold" } },
          { start: 5, end: 10, style: { fontStyle: "italic" } },
        ]),
      ],
      styleDefinitions: {},
      version: 1,
    };

    // Insert newline at position 5 (between "Hello" and "World")
    const result = insertTextInDocument(doc, 5, "\n");

    expect(result.blocks).toHaveLength(2);
    // First block should have "Hello" with bold style
    expect(result.blocks[0].content).toBe("Hello");
    expect(result.blocks[0].styles).toHaveLength(1);
    expect(result.blocks[0].styles[0]).toEqual({
      start: 0,
      end: 5,
      style: { fontWeight: "bold" },
    });
    // Second block should have "World" with italic style
    expect(result.blocks[1].content).toBe("World");
    expect(result.blocks[1].styles).toHaveLength(1);
    expect(result.blocks[1].styles[0]).toEqual({
      start: 0,
      end: 5,
      style: { fontStyle: "italic" },
    });
  });

  it("preserves styles when inserting text with multiple newlines", () => {
    const doc: BlockDocument = {
      blocks: [
        createBlock("AB", "paragraph", [
          { start: 0, end: 2, style: { fontWeight: "bold" } },
        ]),
      ],
      styleDefinitions: {},
      version: 1,
    };

    // Insert "X\nY\nZ" at position 1 (between "A" and "B")
    const result = insertTextInDocument(doc, 1, "X\nY\nZ");

    expect(result.blocks).toHaveLength(3);
    expect(result.blocks[0].content).toBe("AX");
    expect(result.blocks[1].content).toBe("Y");
    expect(result.blocks[2].content).toBe("ZB");
    // Last block should have shifted bold style for "B"
    expect(result.blocks[2].styles).toHaveLength(1);
    expect(result.blocks[2].styles[0]).toEqual({
      start: 1,
      end: 2,
      style: { fontWeight: "bold" },
    });
  });
});

describe("deleteRangeInDocument with styles", () => {
  it("preserves styles when deleting across blocks", () => {
    const doc: BlockDocument = {
      blocks: [
        createBlock("Hello", "paragraph", [
          { start: 0, end: 2, style: { fontWeight: "bold" } },
        ]),
        createBlock("World", "paragraph", [
          { start: 3, end: 5, style: { fontStyle: "italic" } },
        ]),
      ],
      styleDefinitions: {},
      version: 1,
    };

    // Delete from position 3 to 8 ("lo" + newline + "Wor")
    // Result should be "Helld" with bold "He" and italic "ld"
    const result = deleteRangeInDocument(doc, 3, 9);

    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].content).toBe("Helld");
    expect(result.blocks[0].styles).toHaveLength(2);
    // Bold style for "He" (0-2)
    expect(result.blocks[0].styles[0]).toEqual({
      start: 0,
      end: 2,
      style: { fontWeight: "bold" },
    });
    // Italic style for "ld" (3-5)
    expect(result.blocks[0].styles[1]).toEqual({
      start: 3,
      end: 5,
      style: { fontStyle: "italic" },
    });
  });

  it("removes styles that are entirely within deletion range", () => {
    const doc: BlockDocument = {
      blocks: [
        createBlock("ABCDEF", "paragraph", [
          { start: 2, end: 4, style: { fontWeight: "bold" } },
        ]),
      ],
      styleDefinitions: {},
      version: 1,
    };

    // Delete "CD" (positions 2-4), which removes the bold style
    const result = deleteRangeInDocument(doc, 2, 4);

    expect(result.blocks[0].content).toBe("ABEF");
    expect(result.blocks[0].styles).toHaveLength(0);
  });

  it("truncates styles that partially overlap deletion", () => {
    const doc: BlockDocument = {
      blocks: [
        createBlock("ABCDEF", "paragraph", [
          { start: 1, end: 5, style: { fontWeight: "bold" } },
        ]),
      ],
      styleDefinitions: {},
      version: 1,
    };

    // Delete "CD" (positions 2-4)
    const result = deleteRangeInDocument(doc, 2, 4);

    expect(result.blocks[0].content).toBe("ABEF");
    // Bold should now be 1-3 (was 1-5, "BCDE" -> "BE")
    expect(result.blocks[0].styles).toHaveLength(1);
    expect(result.blocks[0].styles[0]).toEqual({
      start: 1,
      end: 3,
      style: { fontWeight: "bold" },
    });
  });
});
