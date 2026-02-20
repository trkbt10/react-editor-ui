/**
 * @file BlockLayoutIndex unit tests
 */

import {
  buildBlockLayoutIndex,
  findLineAtY,
  getLineY,
  getLineHeight,
  getLineLayout,
  getCumulativeHeight,
} from "./BlockLayoutIndex";
import type { BlockDocument, BlockTypeStyleMap } from "../block/blockDocument";
import { createBlockId } from "../block/blockDocument";
import type { LayoutConfig } from "./types";
import { EDITOR_DEFAULTS } from "../styles/tokens";

// =============================================================================
// Test Helpers
// =============================================================================

// Default layout config for tests (uses values from EDITOR_DEFAULTS - Single Source of Truth)
const DEFAULT_TEST_CONFIG: LayoutConfig = {
  paddingLeft: EDITOR_DEFAULTS.PADDING_PX,
  paddingTop: EDITOR_DEFAULTS.PADDING_PX,
  baseLineHeight: EDITOR_DEFAULTS.LINE_HEIGHT_PX,
};

function createTestDocument(blocks: Array<{ content: string; type: string }>): BlockDocument {
  return {
    blocks: blocks.map((b) => ({
      id: createBlockId(),
      type: b.type as BlockDocument["blocks"][0]["type"],
      content: b.content,
      styles: [],
    })),
    styleDefinitions: {},
    version: 1,
  };
}

// Helper to create layout config with custom baseLineHeight
function configWithLineHeight(baseLineHeight: number): LayoutConfig {
  return { ...DEFAULT_TEST_CONFIG, baseLineHeight };
}

// =============================================================================
// Tests
// =============================================================================

describe("BlockLayoutIndex", () => {
  describe("buildBlockLayoutIndex", () => {
    it("should build index for single paragraph", () => {
      const doc = createTestDocument([{ content: "Hello world", type: "paragraph" }]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(layoutIndex.lines.length).toBe(1);
      expect(layoutIndex.lines[0]).toEqual({
        index: 0,
        blockIndex: 0,
        y: 0,
        height: 21,
        charOffset: 0,
      });
      expect(layoutIndex.totalHeight).toBe(21);
    });

    it("should build index for multiple paragraphs", () => {
      const doc = createTestDocument([
        { content: "Line 1", type: "paragraph" },
        { content: "Line 2", type: "paragraph" },
        { content: "Line 3", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(layoutIndex.lines.length).toBe(3);
      expect(layoutIndex.lines[0]).toEqual({
        index: 0,
        blockIndex: 0,
        y: 0,
        height: 21,
        charOffset: 0,
      });
      expect(layoutIndex.lines[1]).toEqual({
        index: 1,
        blockIndex: 1,
        y: 21,
        height: 21,
        charOffset: 7, // "Line 1" + newline = 7
      });
      expect(layoutIndex.lines[2]).toEqual({
        index: 2,
        blockIndex: 2,
        y: 42,
        height: 21,
        charOffset: 14, // "Line 1\nLine 2" + newline = 14
      });
      expect(layoutIndex.totalHeight).toBe(63);
    });

    it("should apply fontSizeMultiplier for heading-1", () => {
      const doc = createTestDocument([
        { content: "Heading", type: "heading-1" },
        { content: "Paragraph", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      // heading-1 has fontSizeMultiplier of 1.75
      expect(layoutIndex.lines[0].height).toBe(21 * 1.75);
      expect(layoutIndex.lines[1].y).toBe(21 * 1.75);
      expect(layoutIndex.lines[1].height).toBe(21);
      expect(layoutIndex.totalHeight).toBe(21 * 1.75 + 21);
    });

    it("should apply fontSizeMultiplier for heading-2", () => {
      const doc = createTestDocument([
        { content: "Heading", type: "heading-2" },
        { content: "Paragraph", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      // heading-2 has fontSizeMultiplier of 1.5
      expect(layoutIndex.lines[0].height).toBe(21 * 1.5);
      expect(layoutIndex.lines[1].y).toBe(21 * 1.5);
    });

    it("should apply fontSizeMultiplier for heading-3", () => {
      const doc = createTestDocument([
        { content: "Heading", type: "heading-3" },
        { content: "Paragraph", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      // heading-3 has fontSizeMultiplier of 1.25
      expect(layoutIndex.lines[0].height).toBe(21 * 1.25);
    });

    it("should apply fontSizeMultiplier for code-block", () => {
      const doc = createTestDocument([
        { content: "const x = 1;", type: "code-block" },
        { content: "Paragraph", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      // code-block has fontSizeMultiplier of 0.9
      expect(layoutIndex.lines[0].height).toBe(21 * 0.9);
    });

    it("should use custom blockTypeStyles when provided", () => {
      const doc = createTestDocument([
        { content: "Heading", type: "heading-1" },
        { content: "Paragraph", type: "paragraph" },
      ]);
      const customStyles: BlockTypeStyleMap = {
        "heading-1": { fontSizeMultiplier: 2.0 },
      };
      const layoutIndex = buildBlockLayoutIndex({
        document: doc,
        config: configWithLineHeight(21),
        blockTypeStyles: customStyles,
      });

      expect(layoutIndex.lines[0].height).toBe(42); // 21 * 2.0
    });

    it("should handle mixed block types", () => {
      const doc = createTestDocument([
        { content: "Title", type: "heading-1" },
        { content: "Intro", type: "paragraph" },
        { content: "Subtitle", type: "heading-2" },
        { content: "Code", type: "code-block" },
        { content: "Conclusion", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({
        document: doc,
        config: configWithLineHeight(20),
      });

      // Heights: h1=35, p=20, h2=30, code=18, p=20 = 123
      expect(layoutIndex.lines[0].height).toBe(35); // 20 * 1.75
      expect(layoutIndex.lines[1].height).toBe(20);
      expect(layoutIndex.lines[2].height).toBe(30); // 20 * 1.5
      expect(layoutIndex.lines[3].height).toBe(18); // 20 * 0.9
      expect(layoutIndex.lines[4].height).toBe(20);

      expect(layoutIndex.lines[0].y).toBe(0);
      expect(layoutIndex.lines[1].y).toBe(35);
      expect(layoutIndex.lines[2].y).toBe(55);
      expect(layoutIndex.lines[3].y).toBe(85);
      expect(layoutIndex.lines[4].y).toBe(103);

      expect(layoutIndex.totalHeight).toBe(123);
    });

    it("should handle empty document", () => {
      const doc: BlockDocument = {
        blocks: [],
        styleDefinitions: {},
        version: 1,
      };
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(layoutIndex.lines.length).toBe(1);
      expect(layoutIndex.lines[0].height).toBe(21);
      expect(layoutIndex.totalHeight).toBe(0);
    });

    it("should calculate correct charOffsets", () => {
      const doc = createTestDocument([
        { content: "AB", type: "paragraph" },
        { content: "CDE", type: "paragraph" },
        { content: "F", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(layoutIndex.lines[0].charOffset).toBe(0);
      expect(layoutIndex.lines[1].charOffset).toBe(3); // "AB\n"
      expect(layoutIndex.lines[2].charOffset).toBe(7); // "AB\nCDE\n"
    });
  });

  describe("findLineAtY", () => {
    it("should find line at Y=0", () => {
      const doc = createTestDocument([
        { content: "Line 1", type: "paragraph" },
        { content: "Line 2", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(findLineAtY(layoutIndex, 0)).toBe(0);
    });

    it("should find line at Y within first line", () => {
      const doc = createTestDocument([
        { content: "Line 1", type: "paragraph" },
        { content: "Line 2", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(findLineAtY(layoutIndex, 10)).toBe(0);
      expect(findLineAtY(layoutIndex, 20)).toBe(0);
    });

    it("should find line at Y boundary", () => {
      const doc = createTestDocument([
        { content: "Line 1", type: "paragraph" },
        { content: "Line 2", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(findLineAtY(layoutIndex, 21)).toBe(1);
    });

    it("should find line at Y within second line", () => {
      const doc = createTestDocument([
        { content: "Line 1", type: "paragraph" },
        { content: "Line 2", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(findLineAtY(layoutIndex, 30)).toBe(1);
    });

    it("should handle negative Y", () => {
      const doc = createTestDocument([
        { content: "Line 1", type: "paragraph" },
        { content: "Line 2", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(findLineAtY(layoutIndex, -10)).toBe(0);
    });

    it("should handle Y beyond total height", () => {
      const doc = createTestDocument([
        { content: "Line 1", type: "paragraph" },
        { content: "Line 2", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(findLineAtY(layoutIndex, 100)).toBe(1);
    });

    it("should work with variable heights", () => {
      const doc = createTestDocument([
        { content: "Heading", type: "heading-1" }, // 36.75
        { content: "Paragraph", type: "paragraph" }, // 21
        { content: "Code", type: "code-block" }, // 18.9
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      const h1Height = 21 * 1.75; // 36.75

      expect(findLineAtY(layoutIndex, 0)).toBe(0);
      expect(findLineAtY(layoutIndex, h1Height - 1)).toBe(0);
      expect(findLineAtY(layoutIndex, h1Height)).toBe(1);
      expect(findLineAtY(layoutIndex, h1Height + 20)).toBe(1);
      expect(findLineAtY(layoutIndex, h1Height + 21)).toBe(2);
    });

    it("should handle empty layout index", () => {
      const doc: BlockDocument = {
        blocks: [],
        styleDefinitions: {},
        version: 1,
      };
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(findLineAtY(layoutIndex, 0)).toBe(0);
      expect(findLineAtY(layoutIndex, 100)).toBe(0);
    });
  });

  describe("getLineY", () => {
    it("should return Y position for valid line", () => {
      const doc = createTestDocument([
        { content: "Line 1", type: "paragraph" },
        { content: "Line 2", type: "paragraph" },
        { content: "Line 3", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(getLineY(layoutIndex, 0)).toBe(0);
      expect(getLineY(layoutIndex, 1)).toBe(21);
      expect(getLineY(layoutIndex, 2)).toBe(42);
    });

    it("should return 0 for out of bounds index", () => {
      const doc = createTestDocument([{ content: "Line 1", type: "paragraph" }]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(getLineY(layoutIndex, -1)).toBe(0);
      expect(getLineY(layoutIndex, 5)).toBe(0);
    });
  });

  describe("getLineHeight", () => {
    it("should return height for valid line", () => {
      const doc = createTestDocument([
        { content: "Heading", type: "heading-1" },
        { content: "Paragraph", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(getLineHeight(layoutIndex, 0, 21)).toBe(21 * 1.75);
      expect(getLineHeight(layoutIndex, 1, 21)).toBe(21);
    });

    it("should return default for out of bounds index", () => {
      const doc = createTestDocument([{ content: "Line 1", type: "paragraph" }]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(getLineHeight(layoutIndex, -1, 21)).toBe(21);
      expect(getLineHeight(layoutIndex, 5, 21)).toBe(21);
    });
  });

  describe("getLineLayout", () => {
    it("should return line layout for valid index", () => {
      const doc = createTestDocument([
        { content: "Line 1", type: "paragraph" },
        { content: "Line 2", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      const layout = getLineLayout(layoutIndex, 1);
      expect(layout).toBeDefined();
      expect(layout?.index).toBe(1);
      expect(layout?.y).toBe(21);
    });

    it("should return undefined for out of bounds index", () => {
      const doc = createTestDocument([{ content: "Line 1", type: "paragraph" }]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(getLineLayout(layoutIndex, -1)).toBeUndefined();
      expect(getLineLayout(layoutIndex, 5)).toBeUndefined();
    });
  });

  describe("getCumulativeHeight", () => {
    it("should return cumulative height", () => {
      const doc = createTestDocument([
        { content: "Line 1", type: "paragraph" },
        { content: "Line 2", type: "paragraph" },
        { content: "Line 3", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(getCumulativeHeight(layoutIndex, 0)).toBe(0);
      expect(getCumulativeHeight(layoutIndex, 1)).toBe(21);
      expect(getCumulativeHeight(layoutIndex, 2)).toBe(42);
      expect(getCumulativeHeight(layoutIndex, 3)).toBe(63);
    });

    it("should handle negative index", () => {
      const doc = createTestDocument([{ content: "Line 1", type: "paragraph" }]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(getCumulativeHeight(layoutIndex, -1)).toBe(0);
    });

    it("should return total height for index beyond lines", () => {
      const doc = createTestDocument([
        { content: "Line 1", type: "paragraph" },
        { content: "Line 2", type: "paragraph" },
      ]);
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });

      expect(getCumulativeHeight(layoutIndex, 10)).toBe(42);
    });
  });

  describe("performance", () => {
    it("should handle 10k lines efficiently", () => {
      const blocks = Array.from({ length: 10000 }, (_, i) => ({
        content: `Line ${i}`,
        type: i % 10 === 0 ? "heading-1" : "paragraph",
      }));
      const doc = createTestDocument(blocks);

      const startBuild = performance.now();
      const layoutIndex = buildBlockLayoutIndex({ document: doc, config: configWithLineHeight(21) });
      const buildTime = performance.now() - startBuild;

      expect(buildTime).toBeLessThan(100); // Should build in under 100ms

      // Test lookup performance
      const startLookup = performance.now();
      for (let i = 0; i < 10000; i++) {
        const y = Math.random() * layoutIndex.totalHeight;
        findLineAtY(layoutIndex, y);
      }
      const lookupTime = performance.now() - startLookup;

      expect(lookupTime).toBeLessThan(100); // 10k lookups in under 100ms
    });
  });
});
