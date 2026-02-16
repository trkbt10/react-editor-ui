/**
 * @file Block Renderer Tests
 */

import { render } from "@testing-library/react";
import { BlockRenderer } from "./BlockRenderer";
import { createBlock, type Block } from "../core/blockDocument";
import type { TokenCache } from "./types";

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

// Mock token cache
const createMockTokenCache = (): TokenCache => ({
  getTokens: (line: string) => [
    { type: "text", text: line, start: 0, end: line.length },
  ],
  clear: () => {},
});

// Mock measureText
const mockMeasureText = (text: string) => text.length * 8;

describe("BlockRenderer", () => {
  const defaultProps = {
    visibleRange: { start: 0, end: 10 },
    topSpacerHeight: 0,
    bottomSpacerHeight: 0,
    tokenCache: createMockTokenCache(),
    lineHeight: 21,
    padding: 8,
    measureText: mockMeasureText,
  };

  describe("rendering", () => {
    it("renders blocks as SVG groups", () => {
      const blocks: Block[] = [
        createBlock("Hello"),
        createBlock("World"),
      ];

      const { container } = render(
        <BlockRenderer {...defaultProps} blocks={blocks} />
      );

      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();

      // Each block should have a group with data-block-id
      const blockGroups = container.querySelectorAll("g[data-block-id]");
      expect(blockGroups).toHaveLength(2);
    });

    it("renders multi-line blocks correctly", () => {
      const blocks: Block[] = [
        createBlock("Line 1\nLine 2\nLine 3"),
      ];

      const { container } = render(
        <BlockRenderer {...defaultProps} blocks={blocks} />
      );

      // Block should contain 3 text elements (one per line)
      const textElements = container.querySelectorAll("text");
      expect(textElements).toHaveLength(3);
    });

    it("renders empty blocks", () => {
      const blocks: Block[] = [createBlock("")];

      const { container } = render(
        <BlockRenderer {...defaultProps} blocks={blocks} />
      );

      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
    });
  });

  describe("virtual scrolling", () => {
    it("respects visible range", () => {
      const blocks: Block[] = [
        createBlock("Block 1"),
        createBlock("Block 2"),
        createBlock("Block 3"),
        createBlock("Block 4"),
      ];

      const { container } = render(
        <BlockRenderer
          {...defaultProps}
          blocks={blocks}
          visibleRange={{ start: 1, end: 3 }}
        />
      );

      // Only blocks 2 and 3 should be rendered
      const blockGroups = container.querySelectorAll("g[data-block-id]");
      expect(blockGroups).toHaveLength(2);
    });

    it("renders top spacer when needed", () => {
      const blocks: Block[] = [createBlock("Content")];

      const { container } = render(
        <BlockRenderer {...defaultProps} blocks={blocks} topSpacerHeight={100} />
      );

      // Find the spacer div before the SVG
      const outerDiv = container.firstElementChild;
      const spacer = outerDiv?.firstElementChild;
      expect(spacer?.tagName).toBe("DIV");
      expect(spacer?.getAttribute("style")).toContain("height: 100px");
    });

    it("renders bottom spacer when needed", () => {
      const blocks: Block[] = [createBlock("Content")];

      const { container } = render(
        <BlockRenderer {...defaultProps} blocks={blocks} bottomSpacerHeight={50} />
      );

      // Find the spacer div after the SVG
      const outerDiv = container.firstElementChild;
      const spacer = outerDiv?.lastElementChild;
      expect(spacer?.tagName).toBe("DIV");
      expect(spacer?.getAttribute("style")).toContain("height: 50px");
    });
  });

  describe("cursor rendering", () => {
    it("renders cursor on correct line", () => {
      const blocks: Block[] = [
        createBlock("Hello"),
        createBlock("World"),
      ];

      const { container } = render(
        <BlockRenderer
          {...defaultProps}
          blocks={blocks}
          cursor={{ line: 2, column: 3, visible: true, blinking: true }}
        />
      );

      // Cursor should be rendered as a rect
      const cursors = container.querySelectorAll("rect[fill]");
      // At least one rect should be a cursor
      const cursorRects = Array.from(cursors).filter(
        (r) => r.getAttribute("width") === "2"
      );
      expect(cursorRects).toHaveLength(1);
    });

    it("does not render cursor when not visible", () => {
      const blocks: Block[] = [createBlock("Hello")];

      const { container } = render(
        <BlockRenderer
          {...defaultProps}
          blocks={blocks}
          cursor={{ line: 1, column: 1, visible: false, blinking: false }}
        />
      );

      const cursorRects = Array.from(
        container.querySelectorAll("rect")
      ).filter((r) => r.getAttribute("width") === "2");
      expect(cursorRects).toHaveLength(0);
    });
  });

  describe("highlights", () => {
    it("renders selection highlights", () => {
      const blocks: Block[] = [createBlock("Hello World")];

      const { container } = render(
        <BlockRenderer
          {...defaultProps}
          blocks={blocks}
          highlights={[
            {
              startLine: 1,
              startColumn: 1,
              endLine: 1,
              endColumn: 6,
              type: "selection",
            },
          ]}
        />
      );

      // Selection should be rendered as a rect with highlight color
      const highlightRects = container.querySelectorAll("rect");
      expect(highlightRects.length).toBeGreaterThan(0);
    });

    it("renders composition highlights with underline", () => {
      const blocks: Block[] = [createBlock("Hello World")];

      const { container } = render(
        <BlockRenderer
          {...defaultProps}
          blocks={blocks}
          highlights={[
            {
              startLine: 1,
              startColumn: 1,
              endLine: 1,
              endColumn: 6,
              type: "composition",
            },
          ]}
        />
      );

      // Composition should have a line element for underline
      const lines = container.querySelectorAll("line");
      expect(lines.length).toBeGreaterThan(0);
    });
  });

  describe("font configuration", () => {
    it("uses default font settings", () => {
      const blocks: Block[] = [createBlock("Hello")];

      const { container } = render(
        <BlockRenderer {...defaultProps} blocks={blocks} />
      );

      const textElement = container.querySelector("text");
      expect(textElement?.getAttribute("font-family")).toContain("Consolas");
      expect(textElement?.getAttribute("font-size")).toBe("13");
    });

    it("uses custom font settings", () => {
      const blocks: Block[] = [createBlock("Hello")];

      const { container } = render(
        <BlockRenderer
          {...defaultProps}
          blocks={blocks}
          fontFamily="monospace"
          fontSize={16}
        />
      );

      const textElement = container.querySelector("text");
      expect(textElement?.getAttribute("font-family")).toBe("monospace");
      expect(textElement?.getAttribute("font-size")).toBe("16");
    });
  });

  describe("dimensions", () => {
    it("calculates correct SVG height based on block content", () => {
      const blocks: Block[] = [
        createBlock("Line 1\nLine 2"), // 2 lines
        createBlock("Line 3"), // 1 line
      ];

      const { container } = render(
        <BlockRenderer {...defaultProps} blocks={blocks} lineHeight={21} />
      );

      const svg = container.querySelector("svg");
      // 3 lines * 21px = 63px
      expect(svg?.getAttribute("height")).toBe("63");
    });

    it("uses provided width", () => {
      const blocks: Block[] = [createBlock("Hello")];

      const { container } = render(
        <BlockRenderer {...defaultProps} blocks={blocks} width={500} />
      );

      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("width")).toBe("500");
    });

    it("defaults to 100% width", () => {
      const blocks: Block[] = [createBlock("Hello")];

      const { container } = render(
        <BlockRenderer {...defaultProps} blocks={blocks} />
      );

      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("width")).toBe("100%");
    });
  });
});
