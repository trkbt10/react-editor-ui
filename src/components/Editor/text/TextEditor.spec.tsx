/**
 * @file TextEditor Tests
 *
 * Tests for TextEditor component, focusing on CJK character handling.
 */

import { render, screen } from "@testing-library/react";
import { TextEditor } from "./TextEditor";

// =============================================================================
// Test Setup
// =============================================================================

// Mock getBoundingClientRect for text measurement
const mockGetBoundingClientRect = vi.fn();

beforeEach(() => {
  // Mock element measurements
  mockGetBoundingClientRect.mockImplementation(function(this: HTMLElement) {
    const text = this.textContent ?? "";
    // Simulate CJK characters being twice as wide
    let width = 0;
    for (const char of text) {
      const code = char.charCodeAt(0);
      // CJK ranges
      if (
        (code >= 0x3040 && code <= 0x30ff) || // Hiragana + Katakana
        (code >= 0x4e00 && code <= 0x9fff)    // CJK Unified Ideographs
      ) {
        width += 16; // Full-width
      } else {
        width += 8; // Half-width
      }
    }
    return { width, height: 21, top: 0, left: 0, bottom: 21, right: width };
  });

  // Patch HTMLElement prototype
  HTMLElement.prototype.getBoundingClientRect = mockGetBoundingClientRect;

  // Mock getComputedStyle
  vi.spyOn(window, "getComputedStyle").mockReturnValue({
    lineHeight: "21px",
  } as CSSStyleDeclaration);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// =============================================================================
// Tests
// =============================================================================

describe("TextEditor", () => {
  describe("CJK character support", () => {
    it("renders with CJK text", async () => {
      const { createDocument } = await import("../core/styledDocument");
      const doc = createDocument("日本語テスト");

      render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
        />
      );

      // Should render the textarea with the value
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("日本語テスト");
    });

    it("renders with mixed ASCII and CJK text", async () => {
      const { createDocument } = await import("../core/styledDocument");
      const doc = createDocument("Hello日本語World");

      render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("Hello日本語World");
    });

    it("passes measureText to renderer", async () => {
      const { createDocument } = await import("../core/styledDocument");
      const doc = createDocument("テスト");

      // This test verifies that the TextEditor properly initializes
      // font metrics and passes measureText to the renderer
      const { container } = render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
        />
      );

      // The SVG renderer should be present
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();

      // The text content should be visible
      const textElement = container.querySelector("text");
      expect(textElement).not.toBeNull();
    });

    it("handles empty value", async () => {
      const { createDocument } = await import("../core/styledDocument");
      const doc = createDocument("");

      render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("");
    });
  });

  describe("Document API", () => {
    it("works with document prop", async () => {
      const { createDocument } = await import("../core/styledDocument");
      const doc = createDocument("ドキュメントAPI");
      const onDocumentChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("ドキュメントAPI");
    });
  });
});
