/**
 * @file Block Position Tests
 */

import {
  createBlockPosition,
  createBlockCursor,
  createBlockSelection,
  isSelectionCollapsed,
  getSelectionBounds,
  isPositionInSelection,
  globalOffsetToBlockPosition,
  blockPositionToGlobalOffset,
  blockSelectionToGlobalOffsets,
  getLineColumnInBlock,
  getOffsetInBlockFromLineColumn,
  getGlobalLineColumn,
  globalLineColumnToBlockPosition,
  movePositionForward,
  movePositionBackward,
  getBlockStart,
  getBlockEnd,
  getDocumentStart,
  getDocumentEnd,
  comparePositions,
  positionsEqual,
} from "../block/blockPosition";
import {
  createBlockDocument,
  createBlock,
  type BlockId,
  type BlockDocument,
} from "../block/blockDocument";

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

// Helper to create a document with known block IDs
function createTestDoc(lines: string[]): BlockDocument {
  return createBlockDocument(lines.join("\n"));
}

// =============================================================================
// Position Factory
// =============================================================================

describe("createBlockPosition", () => {
  it("creates a position with blockId and offset", () => {
    const pos = createBlockPosition("b1" as BlockId, 5);
    expect(pos.blockId).toBe("b1");
    expect(pos.offset).toBe(5);
  });
});

describe("createBlockCursor", () => {
  it("creates a collapsed selection", () => {
    const pos = createBlockPosition("b1" as BlockId, 5);
    const cursor = createBlockCursor(pos);
    expect(cursor.anchor).toBe(pos);
    expect(cursor.focus).toBe(pos);
  });
});

describe("createBlockSelection", () => {
  it("creates a selection with anchor and focus", () => {
    const anchor = createBlockPosition("b1" as BlockId, 0);
    const focus = createBlockPosition("b1" as BlockId, 5);
    const selection = createBlockSelection(anchor, focus);
    expect(selection.anchor).toBe(anchor);
    expect(selection.focus).toBe(focus);
  });
});

// =============================================================================
// Selection Utilities
// =============================================================================

describe("isSelectionCollapsed", () => {
  it("returns true for collapsed selection", () => {
    const pos = createBlockPosition("b1" as BlockId, 5);
    const selection = createBlockCursor(pos);
    expect(isSelectionCollapsed(selection)).toBe(true);
  });

  it("returns false for non-collapsed selection", () => {
    const anchor = createBlockPosition("b1" as BlockId, 0);
    const focus = createBlockPosition("b1" as BlockId, 5);
    const selection = createBlockSelection(anchor, focus);
    expect(isSelectionCollapsed(selection)).toBe(false);
  });

  it("returns false for selection spanning blocks", () => {
    const anchor = createBlockPosition("b1" as BlockId, 0);
    const focus = createBlockPosition("b2" as BlockId, 0);
    const selection = createBlockSelection(anchor, focus);
    expect(isSelectionCollapsed(selection)).toBe(false);
  });
});

describe("getSelectionBounds", () => {
  it("returns anchor/focus in order when anchor is before focus", () => {
    const doc = createTestDoc(["AB", "CD"]);
    const anchor = { blockId: doc.blocks[0].id, offset: 0 };
    const focus = { blockId: doc.blocks[0].id, offset: 2 };
    const selection = createBlockSelection(anchor, focus);

    const { start, end } = getSelectionBounds(doc, selection);
    expect(start).toBe(anchor);
    expect(end).toBe(focus);
  });

  it("swaps anchor/focus when focus is before anchor", () => {
    const doc = createTestDoc(["AB", "CD"]);
    const anchor = { blockId: doc.blocks[0].id, offset: 2 };
    const focus = { blockId: doc.blocks[0].id, offset: 0 };
    const selection = createBlockSelection(anchor, focus);

    const { start, end } = getSelectionBounds(doc, selection);
    expect(start).toBe(focus);
    expect(end).toBe(anchor);
  });

  it("handles selection spanning blocks", () => {
    const doc = createTestDoc(["AB", "CD"]);
    const anchor = { blockId: doc.blocks[1].id, offset: 1 };
    const focus = { blockId: doc.blocks[0].id, offset: 1 };
    const selection = createBlockSelection(anchor, focus);

    const { start, end } = getSelectionBounds(doc, selection);
    expect(start.blockId).toBe(doc.blocks[0].id);
    expect(end.blockId).toBe(doc.blocks[1].id);
  });
});

describe("isPositionInSelection", () => {
  it("returns true for position within selection", () => {
    const doc = createTestDoc(["ABCDE"]);
    const selection = createBlockSelection(
      { blockId: doc.blocks[0].id, offset: 1 },
      { blockId: doc.blocks[0].id, offset: 4 }
    );
    const position = { blockId: doc.blocks[0].id, offset: 2 };

    expect(isPositionInSelection(doc, position, selection)).toBe(true);
  });

  it("returns false for position before selection", () => {
    const doc = createTestDoc(["ABCDE"]);
    const selection = createBlockSelection(
      { blockId: doc.blocks[0].id, offset: 2 },
      { blockId: doc.blocks[0].id, offset: 4 }
    );
    const position = { blockId: doc.blocks[0].id, offset: 1 };

    expect(isPositionInSelection(doc, position, selection)).toBe(false);
  });

  it("returns false for position after selection", () => {
    const doc = createTestDoc(["ABCDE"]);
    const selection = createBlockSelection(
      { blockId: doc.blocks[0].id, offset: 1 },
      { blockId: doc.blocks[0].id, offset: 3 }
    );
    const position = { blockId: doc.blocks[0].id, offset: 4 };

    expect(isPositionInSelection(doc, position, selection)).toBe(false);
  });

  it("returns true for position in middle block of multi-block selection", () => {
    const doc = createTestDoc(["AB", "CD", "EF"]);
    const selection = createBlockSelection(
      { blockId: doc.blocks[0].id, offset: 1 },
      { blockId: doc.blocks[2].id, offset: 1 }
    );
    const position = { blockId: doc.blocks[1].id, offset: 0 };

    expect(isPositionInSelection(doc, position, selection)).toBe(true);
  });
});

// =============================================================================
// Global Offset Conversion
// =============================================================================

describe("globalOffsetToBlockPosition", () => {
  it("converts offset in first block", () => {
    const doc = createTestDoc(["Hello", "World"]);
    const pos = globalOffsetToBlockPosition(doc, 2);
    expect(pos?.blockId).toBe(doc.blocks[0].id);
    expect(pos?.offset).toBe(2);
  });

  it("converts offset in second block", () => {
    const doc = createTestDoc(["AB", "CD"]);
    // "AB\nCD" - offset 3 is "C" in second block
    const pos = globalOffsetToBlockPosition(doc, 3);
    expect(pos?.blockId).toBe(doc.blocks[1].id);
    expect(pos?.offset).toBe(0);
  });

  it("returns undefined for empty document", () => {
    const doc: BlockDocument = { blocks: [], styleDefinitions: {}, version: 1 };
    const pos = globalOffsetToBlockPosition(doc, 0);
    expect(pos).toBeUndefined();
  });
});

describe("blockPositionToGlobalOffset", () => {
  it("converts position in first block", () => {
    const doc = createTestDoc(["Hello", "World"]);
    const pos = { blockId: doc.blocks[0].id, offset: 2 };
    expect(blockPositionToGlobalOffset(doc, pos)).toBe(2);
  });

  it("converts position in second block", () => {
    const doc = createTestDoc(["AB", "CD"]);
    const pos = { blockId: doc.blocks[1].id, offset: 1 };
    // "AB\nCD" - position in second block at offset 1 = global 4
    expect(blockPositionToGlobalOffset(doc, pos)).toBe(4);
  });

  it("returns undefined for unknown block", () => {
    const doc = createTestDoc(["AB"]);
    const pos = { blockId: "nonexistent" as BlockId, offset: 0 };
    expect(blockPositionToGlobalOffset(doc, pos)).toBeUndefined();
  });
});

describe("blockSelectionToGlobalOffsets", () => {
  it("converts selection to global offsets", () => {
    const doc = createTestDoc(["AB", "CD"]);
    const selection = createBlockSelection(
      { blockId: doc.blocks[0].id, offset: 1 },
      { blockId: doc.blocks[1].id, offset: 1 }
    );

    const result = blockSelectionToGlobalOffsets(doc, selection);
    expect(result).not.toBeUndefined();
    expect(result?.start).toBe(1); // "B" in first block
    expect(result?.end).toBe(4); // "D" in second block
  });

  it("returns undefined when block not found", () => {
    const doc = createTestDoc(["AB", "CD"]);
    const selection = createBlockSelection(
      { blockId: "nonexistent" as BlockId, offset: 0 },
      { blockId: doc.blocks[1].id, offset: 1 }
    );

    const result = blockSelectionToGlobalOffsets(doc, selection);
    expect(result).toBeUndefined();
  });
});

// =============================================================================
// Line/Column Conversion
// =============================================================================

describe("getLineColumnInBlock", () => {
  it("returns line 1, column 1 for offset 0", () => {
    const block = createBlock("Hello");
    const pos = getLineColumnInBlock(block, 0);
    expect(pos.line).toBe(1);
    expect(pos.column).toBe(1);
  });

  it("returns correct column for offset in first line", () => {
    const block = createBlock("Hello");
    const pos = getLineColumnInBlock(block, 3);
    expect(pos.line).toBe(1);
    expect(pos.column).toBe(4);
  });

  it("handles multi-line block content", () => {
    const block = createBlock("AB\nCD\nEF");
    // Offset 4 is "D" (positions: A=0, B=1, \n=2, C=3, D=4)
    const pos = getLineColumnInBlock(block, 4);
    expect(pos.line).toBe(2);
    expect(pos.column).toBe(2);
  });
});

describe("getOffsetInBlockFromLineColumn", () => {
  it("returns 0 for line 1, column 1", () => {
    const block = createBlock("Hello");
    expect(getOffsetInBlockFromLineColumn(block, 1, 1)).toBe(0);
  });

  it("returns correct offset for given line/column", () => {
    const block = createBlock("AB\nCD");
    // Line 2, column 2 is "D" at offset 4
    expect(getOffsetInBlockFromLineColumn(block, 2, 2)).toBe(4);
  });

  it("clamps line number to valid range", () => {
    const block = createBlock("AB");
    expect(getOffsetInBlockFromLineColumn(block, 10, 1)).toBe(0);
  });

  it("clamps column to line length", () => {
    const block = createBlock("AB");
    expect(getOffsetInBlockFromLineColumn(block, 1, 10)).toBe(2);
  });
});

describe("getGlobalLineColumn", () => {
  it("returns correct line in first block", () => {
    const doc = createTestDoc(["AB", "CD"]);
    const pos = { blockId: doc.blocks[0].id, offset: 1 };
    const result = getGlobalLineColumn(doc, pos);
    expect(result.line).toBe(1);
    expect(result.column).toBe(2);
  });

  it("returns correct line in second block", () => {
    const doc = createTestDoc(["AB", "CD"]);
    const pos = { blockId: doc.blocks[1].id, offset: 1 };
    const result = getGlobalLineColumn(doc, pos);
    expect(result.line).toBe(2);
    expect(result.column).toBe(2);
  });

  it("handles multi-line blocks", () => {
    // Create blocks with multi-line content directly
    const block1 = createBlock("A\nB");
    const block2 = createBlock("C\nD");
    const doc: BlockDocument = {
      blocks: [block1, block2],
      styleDefinitions: {},
      version: 1,
    };
    // Second block, offset 2 = "D" (positions: C=0, \n=1, D=2)
    const pos = { blockId: doc.blocks[1].id, offset: 2 };
    const result = getGlobalLineColumn(doc, pos);
    // Block1 has 2 lines (A, B), Block2 line 2 is global line 4
    expect(result.line).toBe(4); // Line 1: A, Line 2: B, Line 3: C, Line 4: D
    expect(result.column).toBe(1);
  });
});

describe("globalLineColumnToBlockPosition", () => {
  it("converts first line to first block", () => {
    const doc = createTestDoc(["AB", "CD"]);
    const pos = globalLineColumnToBlockPosition(doc, 1, 2);
    expect(pos?.blockId).toBe(doc.blocks[0].id);
    expect(pos?.offset).toBe(1);
  });

  it("converts second line to second block", () => {
    const doc = createTestDoc(["AB", "CD"]);
    const pos = globalLineColumnToBlockPosition(doc, 2, 1);
    expect(pos?.blockId).toBe(doc.blocks[1].id);
    expect(pos?.offset).toBe(0);
  });

  it("returns end of document for line beyond document", () => {
    const doc = createTestDoc(["AB"]);
    const pos = globalLineColumnToBlockPosition(doc, 10, 1);
    expect(pos?.blockId).toBe(doc.blocks[0].id);
    expect(pos?.offset).toBe(2);
  });

  it("returns undefined for empty document", () => {
    const doc: BlockDocument = { blocks: [], styleDefinitions: {}, version: 1 };
    const pos = globalLineColumnToBlockPosition(doc, 1, 1);
    expect(pos).toBeUndefined();
  });
});

// =============================================================================
// Position Navigation
// =============================================================================

describe("movePositionForward", () => {
  it("moves within block", () => {
    const doc = createTestDoc(["ABC"]);
    const pos = { blockId: doc.blocks[0].id, offset: 1 };
    const result = movePositionForward(doc, pos);
    expect(result?.offset).toBe(2);
    expect(result?.blockId).toBe(doc.blocks[0].id);
  });

  it("moves to next block at end", () => {
    const doc = createTestDoc(["AB", "CD"]);
    const pos = { blockId: doc.blocks[0].id, offset: 2 };
    const result = movePositionForward(doc, pos);
    expect(result?.blockId).toBe(doc.blocks[1].id);
    expect(result?.offset).toBe(0);
  });

  it("returns undefined at end of document", () => {
    const doc = createTestDoc(["AB"]);
    const pos = { blockId: doc.blocks[0].id, offset: 2 };
    const result = movePositionForward(doc, pos);
    expect(result).toBeUndefined();
  });
});

describe("movePositionBackward", () => {
  it("moves within block", () => {
    const doc = createTestDoc(["ABC"]);
    const pos = { blockId: doc.blocks[0].id, offset: 2 };
    const result = movePositionBackward(doc, pos);
    expect(result?.offset).toBe(1);
  });

  it("moves to previous block at start", () => {
    const doc = createTestDoc(["AB", "CD"]);
    const pos = { blockId: doc.blocks[1].id, offset: 0 };
    const result = movePositionBackward(doc, pos);
    expect(result?.blockId).toBe(doc.blocks[0].id);
    expect(result?.offset).toBe(2);
  });

  it("returns undefined at start of document", () => {
    const doc = createTestDoc(["AB"]);
    const pos = { blockId: doc.blocks[0].id, offset: 0 };
    const result = movePositionBackward(doc, pos);
    expect(result).toBeUndefined();
  });
});

describe("getBlockStart", () => {
  it("returns position at start of block", () => {
    const pos = getBlockStart("b1" as BlockId);
    expect(pos.blockId).toBe("b1");
    expect(pos.offset).toBe(0);
  });
});

describe("getBlockEnd", () => {
  it("returns position at end of block", () => {
    const doc = createTestDoc(["Hello"]);
    const pos = getBlockEnd(doc, doc.blocks[0].id);
    expect(pos?.offset).toBe(5);
  });

  it("returns undefined for unknown block", () => {
    const doc = createTestDoc(["Hello"]);
    const pos = getBlockEnd(doc, "nonexistent" as BlockId);
    expect(pos).toBeUndefined();
  });
});

describe("getDocumentStart", () => {
  it("returns position at start of first block", () => {
    const doc = createTestDoc(["AB", "CD"]);
    const pos = getDocumentStart(doc);
    expect(pos?.blockId).toBe(doc.blocks[0].id);
    expect(pos?.offset).toBe(0);
  });

  it("returns undefined for empty document", () => {
    const doc: BlockDocument = { blocks: [], styleDefinitions: {}, version: 1 };
    const pos = getDocumentStart(doc);
    expect(pos).toBeUndefined();
  });
});

describe("getDocumentEnd", () => {
  it("returns position at end of last block", () => {
    const doc = createTestDoc(["AB", "CD"]);
    const pos = getDocumentEnd(doc);
    expect(pos?.blockId).toBe(doc.blocks[1].id);
    expect(pos?.offset).toBe(2);
  });

  it("returns undefined for empty document", () => {
    const doc: BlockDocument = { blocks: [], styleDefinitions: {}, version: 1 };
    const pos = getDocumentEnd(doc);
    expect(pos).toBeUndefined();
  });
});

// =============================================================================
// Position Comparison
// =============================================================================

describe("comparePositions", () => {
  it("returns negative when a is before b in same block", () => {
    const doc = createTestDoc(["ABC"]);
    const a = { blockId: doc.blocks[0].id, offset: 1 };
    const b = { blockId: doc.blocks[0].id, offset: 2 };
    expect(comparePositions(doc, a, b)).toBeLessThan(0);
  });

  it("returns positive when a is after b in same block", () => {
    const doc = createTestDoc(["ABC"]);
    const a = { blockId: doc.blocks[0].id, offset: 2 };
    const b = { blockId: doc.blocks[0].id, offset: 1 };
    expect(comparePositions(doc, a, b)).toBeGreaterThan(0);
  });

  it("returns 0 for equal positions", () => {
    const doc = createTestDoc(["ABC"]);
    const a = { blockId: doc.blocks[0].id, offset: 1 };
    const b = { blockId: doc.blocks[0].id, offset: 1 };
    expect(comparePositions(doc, a, b)).toBe(0);
  });

  it("returns negative when a is in earlier block", () => {
    const doc = createTestDoc(["AB", "CD"]);
    const a = { blockId: doc.blocks[0].id, offset: 1 };
    const b = { blockId: doc.blocks[1].id, offset: 0 };
    expect(comparePositions(doc, a, b)).toBeLessThan(0);
  });
});

describe("positionsEqual", () => {
  it("returns true for equal positions", () => {
    const a = createBlockPosition("b1" as BlockId, 5);
    const b = createBlockPosition("b1" as BlockId, 5);
    expect(positionsEqual(a, b)).toBe(true);
  });

  it("returns false for different offsets", () => {
    const a = createBlockPosition("b1" as BlockId, 5);
    const b = createBlockPosition("b1" as BlockId, 6);
    expect(positionsEqual(a, b)).toBe(false);
  });

  it("returns false for different blocks", () => {
    const a = createBlockPosition("b1" as BlockId, 5);
    const b = createBlockPosition("b2" as BlockId, 5);
    expect(positionsEqual(a, b)).toBe(false);
  });
});
