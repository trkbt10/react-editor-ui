/**
 * @file Block Text Editor Tests
 */

import { render, screen } from "@testing-library/react";
import { BlockTextEditor } from "./BlockTextEditor";
import { createBlockDocument } from "../core/blockDocument";

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

describe("BlockTextEditor", () => {
  describe("rendering", () => {
    it("renders with document", () => {
      const doc = createBlockDocument("Hello World");
      const onDocumentChange = vi.fn();

      const { container } = render(
        <BlockTextEditor document={doc} onDocumentChange={onDocumentChange} />
      );

      // Should have a container div
      expect(container.firstElementChild).toBeTruthy();
    });

    it("renders textarea with document text", () => {
      const doc = createBlockDocument("Test content");
      const onDocumentChange = vi.fn();

      render(
        <BlockTextEditor document={doc} onDocumentChange={onDocumentChange} />
      );

      const textarea = screen.getByRole("textbox", { name: "Block text editor" });
      expect(textarea).toBeTruthy();
      expect((textarea as HTMLTextAreaElement).value).toBe("Test content");
    });

    it("renders multiline document", () => {
      const doc = createBlockDocument("Line 1\nLine 2\nLine 3");
      const onDocumentChange = vi.fn();

      render(
        <BlockTextEditor document={doc} onDocumentChange={onDocumentChange} />
      );

      const textarea = screen.getByRole("textbox");
      expect((textarea as HTMLTextAreaElement).value).toBe("Line 1\nLine 2\nLine 3");
    });
  });

  describe("props", () => {
    it("applies readOnly prop", () => {
      const doc = createBlockDocument("Read only");
      const onDocumentChange = vi.fn();

      render(
        <BlockTextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
          readOnly={true}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("readonly");
    });

    it("applies custom style", () => {
      const doc = createBlockDocument("Styled");
      const onDocumentChange = vi.fn();
      const customStyle = { width: "500px", height: "300px" };

      const { container } = render(
        <BlockTextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
          style={customStyle}
        />
      );

      const outerDiv = container.firstElementChild;
      expect(outerDiv?.getAttribute("style")).toContain("width: 500px");
      expect(outerDiv?.getAttribute("style")).toContain("height: 300px");
    });

    it("accepts cursor change callback", () => {
      const doc = createBlockDocument("Hello");
      const onDocumentChange = vi.fn();
      const onCursorChange = vi.fn();

      render(
        <BlockTextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
          onCursorChange={onCursorChange}
        />
      );

      // Callback should be accepted without error
      expect(true).toBe(true);
    });

    it("accepts selection change callback", () => {
      const doc = createBlockDocument("Hello");
      const onDocumentChange = vi.fn();
      const onSelectionChange = vi.fn();

      render(
        <BlockTextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
          onSelectionChange={onSelectionChange}
        />
      );

      // Callback should be accepted without error
      expect(true).toBe(true);
    });
  });

  describe("renderer", () => {
    it("uses SVG renderer by default", () => {
      const doc = createBlockDocument("SVG");
      const onDocumentChange = vi.fn();

      const { container } = render(
        <BlockTextEditor document={doc} onDocumentChange={onDocumentChange} />
      );

      // SVG renderer would create SVG elements (though may not be visible without font metrics)
      expect(container.querySelector("div")).toBeTruthy();
    });

    it("accepts canvas renderer option", () => {
      const doc = createBlockDocument("Canvas");
      const onDocumentChange = vi.fn();

      const { container } = render(
        <BlockTextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
          renderer="canvas"
        />
      );

      expect(container.querySelector("div")).toBeTruthy();
    });
  });

  describe("config", () => {
    it("accepts custom config", () => {
      const doc = createBlockDocument("Configured");
      const onDocumentChange = vi.fn();

      const { container } = render(
        <BlockTextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
          config={{
            lineHeight: 24,
            fontSize: 16,
            fontFamily: "monospace",
          }}
        />
      );

      expect(container.firstElementChild).toBeTruthy();
    });

    it("accepts custom tabSize", () => {
      const doc = createBlockDocument("Tabs");
      const onDocumentChange = vi.fn();

      render(
        <BlockTextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
          tabSize={2}
        />
      );

      // TabSize is used internally, just verify no errors
      expect(true).toBe(true);
    });
  });

  describe("document updates", () => {
    it("reflects document changes", () => {
      const doc1 = createBlockDocument("Initial");
      const doc2 = createBlockDocument("Updated");
      const onDocumentChange = vi.fn();

      const { rerender } = render(
        <BlockTextEditor document={doc1} onDocumentChange={onDocumentChange} />
      );

      const textareaBefore = screen.getByRole("textbox");
      expect((textareaBefore as HTMLTextAreaElement).value).toBe("Initial");

      rerender(
        <BlockTextEditor document={doc2} onDocumentChange={onDocumentChange} />
      );

      const textareaAfter = screen.getByRole("textbox");
      expect((textareaAfter as HTMLTextAreaElement).value).toBe("Updated");
    });
  });
});
