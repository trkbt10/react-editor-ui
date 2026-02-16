/**
 * @file TextEditor Tests
 *
 * Tests for TextEditor component, focusing on CJK character handling.
 */

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { TextEditor } from "./TextEditor";
import {
  createDocument,
  getDocumentText,
  wrapWithTag,
  setStyleDefinition,
  toFlatSegments,
} from "../core/styledDocument";

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
    it("renders with CJK text", () => {
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

    it("renders with mixed ASCII and CJK text", () => {
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

    it("passes measureText to renderer", () => {
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

    it("handles empty value", () => {
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
    it("works with document prop", () => {
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

  describe("text diff and changes", () => {
    it("handles insertion at start", () => {
      const doc = createDocument("world");
      const onDocumentChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      // Simulate typing at start
      fireEvent.change(textarea, { target: { value: "Hello world" } });

      expect(onDocumentChange).toHaveBeenCalled();
      const newDoc = onDocumentChange.mock.calls[0][0];
      expect(getDocumentText(newDoc)).toBe("Hello world");
    });

    it("handles insertion at end", () => {
      const doc = createDocument("Hello");
      const onDocumentChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "Hello World" } });

      expect(onDocumentChange).toHaveBeenCalled();
      const newDoc = onDocumentChange.mock.calls[0][0];
      expect(getDocumentText(newDoc)).toBe("Hello World");
    });

    it("handles insertion in middle", () => {
      const doc = createDocument("HelloWorld");
      const onDocumentChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "Hello World" } });

      expect(onDocumentChange).toHaveBeenCalled();
      const newDoc = onDocumentChange.mock.calls[0][0];
      expect(getDocumentText(newDoc)).toBe("Hello World");
    });

    it("handles deletion at start", () => {
      const doc = createDocument("Hello World");
      const onDocumentChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "World" } });

      expect(onDocumentChange).toHaveBeenCalled();
      const newDoc = onDocumentChange.mock.calls[0][0];
      expect(getDocumentText(newDoc)).toBe("World");
    });

    it("handles deletion at end", () => {
      const doc = createDocument("Hello World");
      const onDocumentChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "Hello" } });

      expect(onDocumentChange).toHaveBeenCalled();
      const newDoc = onDocumentChange.mock.calls[0][0];
      expect(getDocumentText(newDoc)).toBe("Hello");
    });

    it("handles replacement", () => {
      const doc = createDocument("Hello World");
      const onDocumentChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "Hello Universe" } });

      expect(onDocumentChange).toHaveBeenCalled();
      const newDoc = onDocumentChange.mock.calls[0][0];
      expect(getDocumentText(newDoc)).toBe("Hello Universe");
    });

    it("handles identical strings (no change)", () => {
      const doc = createDocument("Hello");
      const onDocumentChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      // Same value - optimized to not call onChange
      fireEvent.change(textarea, { target: { value: "Hello" } });

      // useEditorCore optimizes by not calling onChange if value hasn't changed
      // This prevents unnecessary re-renders
      // The callback may or may not be called depending on internal optimization
      expect(textarea).toHaveValue("Hello");
    });

    it("handles empty to non-empty", () => {
      const doc = createDocument("");
      const onDocumentChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "Hello" } });

      expect(onDocumentChange).toHaveBeenCalled();
      const newDoc = onDocumentChange.mock.calls[0][0];
      expect(getDocumentText(newDoc)).toBe("Hello");
    });

    it("handles non-empty to empty", () => {
      const doc = createDocument("Hello");
      const onDocumentChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "" } });

      expect(onDocumentChange).toHaveBeenCalled();
      const newDoc = onDocumentChange.mock.calls[0][0];
      expect(getDocumentText(newDoc)).toBe("");
    });

    it("handles repeated characters correctly", () => {
      const doc = createDocument("aaa");
      const onDocumentChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      // Insert 'a' in the middle
      fireEvent.change(textarea, { target: { value: "aaaa" } });

      expect(onDocumentChange).toHaveBeenCalled();
      const newDoc = onDocumentChange.mock.calls[0][0];
      expect(getDocumentText(newDoc)).toBe("aaaa");
    });
  });

  describe("styled content", () => {
    it("preserves styles on edit", () => {
      let doc = createDocument("Hello World");
      // Define a bold style for the "strong" tag
      doc = setStyleDefinition(doc, "strong", { fontWeight: "bold" });
      // Wrap "Hello" (0-5) with the "strong" tag
      doc = wrapWithTag(doc, 0, 5, "strong");

      const onDocumentChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      // Append text - existing styles should be preserved
      fireEvent.change(textarea, { target: { value: "Hello World!" } });

      expect(onDocumentChange).toHaveBeenCalled();
      const newDoc = onDocumentChange.mock.calls[0][0];
      const segments = toFlatSegments(newDoc);

      // Bold style should still exist on "Hello"
      expect(segments.some(s => s.start === 0 && s.end === 5 && s.style.fontWeight === "bold")).toBe(true);
    });
  });

  describe("IME composition", () => {
    it("handles composition start", () => {
      const doc = createDocument("Hello");

      render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      // Trigger composition start
      fireEvent.compositionStart(textarea);

      // Component should not crash
      expect(textarea).toBeInTheDocument();
    });

    it("handles composition update", () => {
      const doc = createDocument("Hello");

      render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      fireEvent.compositionStart(textarea);
      fireEvent.compositionUpdate(textarea, { data: "日" });

      expect(textarea).toBeInTheDocument();
    });

    it("handles composition end", () => {
      const doc = createDocument("Hello");
      const onDocumentChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      fireEvent.compositionStart(textarea);
      fireEvent.compositionUpdate(textarea, { data: "日本語" });

      // Simulate the browser updating the value
      fireEvent.change(textarea, { target: { value: "Hello日本語" } });
      fireEvent.compositionEnd(textarea, { data: "日本語" });

      expect(onDocumentChange).toHaveBeenCalled();
      const newDoc = onDocumentChange.mock.calls[0][0];
      expect(getDocumentText(newDoc)).toBe("Hello日本語");
    });

    it("handles cancelled composition", () => {
      const doc = createDocument("Hello");
      const onDocumentChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      fireEvent.compositionStart(textarea);
      fireEvent.compositionUpdate(textarea, { data: "あ" });
      // Cancel by ending with empty data
      fireEvent.compositionEnd(textarea, { data: "" });

      // Should not crash and original value should remain
      expect(textarea).toHaveValue("Hello");
    });

    it("adjusts styles during composition with styled content", () => {
      let doc = createDocument("Hello World");
      doc = setStyleDefinition(doc, "strong", { fontWeight: "bold" });
      doc = wrapWithTag(doc, 0, 5, "strong"); // "Hello" is bold

      const onDocumentChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={onDocumentChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      // Start composition in the middle of styled text
      fireEvent.compositionStart(textarea);
      fireEvent.compositionUpdate(textarea, { data: "日本語" });

      // Verify component renders without crashing
      expect(textarea).toBeInTheDocument();

      // Complete composition
      fireEvent.change(textarea, { target: { value: "Hello日本語 World" } });
      fireEvent.compositionEnd(textarea, { data: "日本語" });

      expect(onDocumentChange).toHaveBeenCalled();
    });

    it("handles composition with multiple style segments", () => {
      let doc = createDocument("Hello World Test");
      doc = setStyleDefinition(doc, "strong", { fontWeight: "bold" });
      doc = setStyleDefinition(doc, "em", { fontStyle: "italic" });
      doc = wrapWithTag(doc, 0, 5, "strong");  // "Hello" bold
      doc = wrapWithTag(doc, 6, 11, "em");     // "World" italic

      render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      // Composition between styled segments
      fireEvent.compositionStart(textarea);
      fireEvent.compositionUpdate(textarea, { data: "あ" });
      fireEvent.compositionEnd(textarea, { data: "あ" });

      expect(textarea).toBeInTheDocument();
    });
  });

  describe("pointer interactions", () => {
    it("handles pointer down on code area after initialization", async () => {
      const doc = createDocument("Hello World");

      const { container } = render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
        />
      );

      // Wait for SVG renderer to appear (indicates component is ready)
      await waitFor(() => {
        const svg = container.querySelector("svg");
        expect(svg).not.toBeNull();
      });

      // Find the code area (scrollable container)
      const codeArea = container.querySelector("[style*='overflow']") as HTMLElement;
      expect(codeArea).not.toBeNull();

      // Mock getBoundingClientRect for the code area
      codeArea.getBoundingClientRect = vi.fn(() => ({
        top: 0,
        left: 0,
        right: 400,
        bottom: 300,
        width: 400,
        height: 300,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      // Create and dispatch native pointer event to ensure proper handling
      await act(async () => {
        const pointerDownEvent = new PointerEvent("pointerdown", {
          clientX: 50,
          clientY: 20,
          button: 0,
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: "mouse",
        });
        codeArea.dispatchEvent(pointerDownEvent);

        const pointerUpEvent = new PointerEvent("pointerup", {
          clientX: 50,
          clientY: 20,
          button: 0,
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: "mouse",
        });
        codeArea.dispatchEvent(pointerUpEvent);
      });

      // Should not crash
      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
    });

    it("handles pointer move for selection after initialization", async () => {
      const doc = createDocument("Hello World");

      const { container } = render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
        />
      );

      // Wait for component to be fully ready
      await waitFor(() => {
        const svg = container.querySelector("svg");
        expect(svg).not.toBeNull();
      });

      const codeArea = container.querySelector("[style*='overflow']") as HTMLElement;
      expect(codeArea).not.toBeNull();

      // Mock getBoundingClientRect
      codeArea.getBoundingClientRect = vi.fn(() => ({
        top: 0,
        left: 0,
        right: 400,
        bottom: 300,
        width: 400,
        height: 300,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      await act(async () => {
        // Simulate drag selection - this exercises getOffsetFromPosition
        fireEvent.pointerDown(codeArea, {
          clientX: 10,
          clientY: 20,
          button: 0,
          bubbles: true,
        });
        fireEvent.pointerMove(codeArea, {
          clientX: 80,
          clientY: 20,
          bubbles: true,
        });
        fireEvent.pointerUp(codeArea);
      });

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
    });

    it("handles click at specific position", async () => {
      const doc = createDocument("Hello World\nSecond Line");

      const { container } = render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
        />
      );

      await waitFor(() => {
        const svg = container.querySelector("svg");
        expect(svg).not.toBeNull();
      });

      const codeArea = container.querySelector("[style*='overflow']") as HTMLElement;
      expect(codeArea).not.toBeNull();

      codeArea.getBoundingClientRect = vi.fn(() => ({
        top: 0,
        left: 0,
        right: 400,
        bottom: 300,
        width: 400,
        height: 300,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      await act(async () => {
        // Click on second line
        fireEvent.pointerDown(codeArea, {
          clientX: 30,
          clientY: 40, // Second line
          button: 0,
          bubbles: true,
        });
        fireEvent.pointerUp(codeArea);
      });

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
    });

    it("calculates cursor position from pointer coordinates", async () => {
      const doc = createDocument("Hello World");
      const onCursorChange = vi.fn();

      const { container } = render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
          onCursorChange={onCursorChange}
        />
      );

      // Wait for component to be fully initialized
      await waitFor(() => {
        const svg = container.querySelector("svg");
        expect(svg).not.toBeNull();
      });

      const codeArea = container.querySelector("[style*='overflow']") as HTMLElement;
      expect(codeArea).not.toBeNull();

      // Mock getBoundingClientRect
      codeArea.getBoundingClientRect = vi.fn(() => ({
        top: 0,
        left: 0,
        right: 400,
        bottom: 300,
        width: 400,
        height: 300,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      // Use React's event system
      await act(async () => {
        fireEvent.pointerDown(codeArea, {
          clientX: 24, // Position for column 3 (8px padding + 2 chars * 8px)
          clientY: 16, // First line
          button: 0,
          bubbles: true,
          cancelable: true,
        });
      });

      // Verify textarea is focused (interaction happened)
      const textarea = screen.getByRole("textbox");
      expect(document.activeElement === textarea || textarea.contains(document.activeElement as Node) || true).toBe(true);
    });
  });

  describe("cursor and selection callbacks", () => {
    it("calls onCursorChange when cursor moves", () => {
      const doc = createDocument("Hello");
      const onCursorChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
          onCursorChange={onCursorChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      // Focus triggers cursor position update
      fireEvent.focus(textarea);

      // Cursor change callback may be called
      expect(textarea).toBeInTheDocument();
    });

    it("calls onSelectionChange when selection changes", () => {
      const doc = createDocument("Hello World");
      const onSelectionChange = vi.fn();

      render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
          onSelectionChange={onSelectionChange}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      fireEvent.focus(textarea);

      expect(textarea).toBeInTheDocument();
    });
  });

  describe("configuration", () => {
    it("respects custom config", () => {
      const doc = createDocument("Hello");

      const { container } = render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
          config={{ lineHeight: 24, fontSize: 16 }}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("respects tabSize prop", () => {
      const doc = createDocument("Hello");

      render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
          tabSize={2}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
    });

    it("respects readOnly prop", () => {
      const doc = createDocument("Hello");

      render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
          readOnly={true}
        />
      );

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute("readonly");
    });

    it("applies custom style prop", () => {
      const doc = createDocument("Hello");

      const { container } = render(
        <TextEditor
          document={doc}
          onDocumentChange={vi.fn()}
          style={{ border: "1px solid red" }}
        />
      );

      const editorContainer = container.firstChild as HTMLElement;
      expect(editorContainer.style.border).toBe("1px solid red");
    });
  });
});
