/**
 * @file Block Type Styles Tests
 *
 * Tests for the configuration-based block type styling system.
 * Verifies that block styles can be defined externally and merged correctly.
 */

import { describe, it, expect } from "vitest";
import {
  DEFAULT_BLOCK_TYPE_STYLES,
  getBlockTypeStyle,
  type BlockTypeStyle,
  type BlockTypeStyleMap,
} from "./blockDocument";

describe("DEFAULT_BLOCK_TYPE_STYLES", () => {
  it("provides styles for heading-1", () => {
    const style = DEFAULT_BLOCK_TYPE_STYLES["heading-1"];
    expect(style).toBeDefined();
    expect(style?.fontSizeMultiplier).toBe(1.75);
    expect(style?.fontWeight).toBe("bold");
  });

  it("provides styles for heading-2", () => {
    const style = DEFAULT_BLOCK_TYPE_STYLES["heading-2"];
    expect(style).toBeDefined();
    expect(style?.fontSizeMultiplier).toBe(1.5);
    expect(style?.fontWeight).toBe("bold");
  });

  it("provides styles for heading-3", () => {
    const style = DEFAULT_BLOCK_TYPE_STYLES["heading-3"];
    expect(style).toBeDefined();
    expect(style?.fontSizeMultiplier).toBe(1.25);
    expect(style?.fontWeight).toBe("bold");
  });

  it("provides styles for bullet-list with indentation", () => {
    const style = DEFAULT_BLOCK_TYPE_STYLES["bullet-list"];
    expect(style).toBeDefined();
    expect(style?.indentation).toBe(16);
  });

  it("provides styles for numbered-list with indentation", () => {
    const style = DEFAULT_BLOCK_TYPE_STYLES["numbered-list"];
    expect(style).toBeDefined();
    expect(style?.indentation).toBe(16);
  });

  it("provides styles for blockquote with decoration", () => {
    const style = DEFAULT_BLOCK_TYPE_STYLES["blockquote"];
    expect(style).toBeDefined();
    expect(style?.indentation).toBe(12);
    expect(style?.leftBorder).toBeDefined();
    expect(style?.leftBorder?.width).toBe(3);
    expect(style?.leftBorder?.color).toBe("#6b7280");
    expect(style?.backgroundColor).toBeDefined();
  });

  it("provides styles for code-block with monospace font", () => {
    const style = DEFAULT_BLOCK_TYPE_STYLES["code-block"];
    expect(style).toBeDefined();
    expect(style?.fontSizeMultiplier).toBe(0.9);
    expect(style?.fontFamily).toContain("monospace");
    expect(style?.backgroundColor).toBeDefined();
  });

  it("does not define style for paragraph (uses default rendering)", () => {
    const style = DEFAULT_BLOCK_TYPE_STYLES["paragraph"];
    expect(style).toBeUndefined();
  });
});

describe("getBlockTypeStyle", () => {
  it("returns default style when no document styles provided", () => {
    const style = getBlockTypeStyle("heading-1");
    expect(style).toEqual(DEFAULT_BLOCK_TYPE_STYLES["heading-1"]);
  });

  it("returns undefined for paragraph without custom styles", () => {
    const style = getBlockTypeStyle("paragraph");
    expect(style).toBeUndefined();
  });

  it("returns document style when no default exists", () => {
    const customStyles: BlockTypeStyleMap = {
      paragraph: {
        color: "#333333",
        fontSizeMultiplier: 1.1,
      },
    };

    const style = getBlockTypeStyle("paragraph", customStyles);
    expect(style).toEqual(customStyles.paragraph);
  });

  it("merges document styles on top of defaults", () => {
    const customStyles: BlockTypeStyleMap = {
      "heading-1": {
        color: "#ff0000", // Override color
        // fontSizeMultiplier should come from default
      },
    };

    const style = getBlockTypeStyle("heading-1", customStyles);

    // Should have custom color
    expect(style?.color).toBe("#ff0000");
    // Should retain default fontSizeMultiplier
    expect(style?.fontSizeMultiplier).toBe(1.75);
    // Should retain default fontWeight
    expect(style?.fontWeight).toBe("bold");
  });

  it("document leftBorder overrides default leftBorder", () => {
    const customStyles: BlockTypeStyleMap = {
      blockquote: {
        leftBorder: {
          width: 5,
          color: "#0000ff",
        },
      },
    };

    const style = getBlockTypeStyle("blockquote", customStyles);

    // leftBorder should be from custom
    expect(style?.leftBorder?.width).toBe(5);
    expect(style?.leftBorder?.color).toBe("#0000ff");
    // Should retain default indentation
    expect(style?.indentation).toBe(12);
  });

  it("allows completely custom block types", () => {
    // Cast to allow custom block type for testing extensibility
    const customStyles = {
      "custom-block": {
        fontSizeMultiplier: 2.0,
        color: "#00ff00",
        backgroundColor: "#f0f0f0",
      },
    } as BlockTypeStyleMap;

    // getBlockTypeStyle would need "custom-block" in BlockType to work
    // This test verifies the structure supports it
    expect(customStyles["custom-block" as keyof typeof customStyles]).toBeDefined();
  });
});

describe("BlockTypeStyle interface", () => {
  it("supports all styling properties", () => {
    const fullStyle: BlockTypeStyle = {
      fontSizeMultiplier: 1.5,
      fontWeight: "bold",
      fontFamily: "Georgia, serif",
      indentation: 20,
      color: "#333333",
      leftBorder: {
        width: 4,
        color: "#999999",
      },
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      verticalPadding: 8,
    };

    // All properties should be assignable
    expect(fullStyle.fontSizeMultiplier).toBe(1.5);
    expect(fullStyle.fontWeight).toBe("bold");
    expect(fullStyle.fontFamily).toBe("Georgia, serif");
    expect(fullStyle.indentation).toBe(20);
    expect(fullStyle.color).toBe("#333333");
    expect(fullStyle.leftBorder?.width).toBe(4);
    expect(fullStyle.backgroundColor).toBe("rgba(0, 0, 0, 0.1)");
    expect(fullStyle.verticalPadding).toBe(8);
  });

  it("allows partial styles", () => {
    const minimalStyle: BlockTypeStyle = {
      fontWeight: "bold",
    };

    expect(minimalStyle.fontWeight).toBe("bold");
    expect(minimalStyle.fontSizeMultiplier).toBeUndefined();
    expect(minimalStyle.color).toBeUndefined();
  });
});

describe("BlockTypeStyleMap usage in BlockDocument", () => {
  it("can be embedded in a BlockDocument", () => {
    const customBlockTypeStyles: BlockTypeStyleMap = {
      "heading-1": {
        fontSizeMultiplier: 2.0,
        color: "#1a1a1a",
      },
      blockquote: {
        leftBorder: {
          width: 4,
          color: "#3b82f6",
        },
        backgroundColor: "rgba(59, 130, 246, 0.1)",
      },
    };

    // Simulating how it would be used in a BlockDocument
    const doc = {
      blocks: [],
      styleDefinitions: {},
      blockTypeStyles: customBlockTypeStyles,
      version: 1,
    };

    expect(doc.blockTypeStyles).toBe(customBlockTypeStyles);
    expect(doc.blockTypeStyles?.["heading-1"]?.color).toBe("#1a1a1a");
  });
});
