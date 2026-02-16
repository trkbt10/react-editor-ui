/**
 * @file Block Editor Core Tests
 */

import { renderHook, act } from "@testing-library/react";
import { useBlockEditorCore } from "./useBlockEditorCore";
import { createBlockDocument } from "../block/blockDocument";

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

// Mock getOffsetFromPosition
const mockGetOffsetFromPosition = vi.fn((x, y, scrollTop, lineCount, lineHeight) => {
  // Simple mock: calculate line from y, assume fixed char width
  const line = Math.floor((y + scrollTop) / lineHeight);
  const col = Math.floor(x / 8); // Assume 8px char width
  return line * 80 + col; // Assume 80 chars per line
});

const defaultConfig = {
  lineHeight: 21,
  overscan: 5,
  tabSize: 4,
  readOnly: false,
};

describe("useBlockEditorCore", () => {
  describe("initialization", () => {
    it("initializes with document text value", () => {
      const doc = createBlockDocument("Hello World");
      const onDocumentChange = vi.fn();

      const { result } = renderHook(() =>
        useBlockEditorCore(doc, onDocumentChange, defaultConfig, mockGetOffsetFromPosition)
      );

      expect(result.current.textValue).toBe("Hello World");
    });

    it("initializes with empty composition state", () => {
      const doc = createBlockDocument("Hello");
      const onDocumentChange = vi.fn();

      const { result } = renderHook(() =>
        useBlockEditorCore(doc, onDocumentChange, defaultConfig, mockGetOffsetFromPosition)
      );

      expect(result.current.composition.isComposing).toBe(false);
    });

    it("initializes cursor state", () => {
      const doc = createBlockDocument("Hello");
      const onDocumentChange = vi.fn();

      const { result } = renderHook(() =>
        useBlockEditorCore(doc, onDocumentChange, defaultConfig, mockGetOffsetFromPosition)
      );

      expect(result.current.cursorState).toEqual({
        line: 1,
        column: 1,
        visible: false,
        blinking: false,
      });
    });
  });

  describe("refs", () => {
    it("provides container, textarea, and codeArea refs", () => {
      const doc = createBlockDocument("Hello");
      const onDocumentChange = vi.fn();

      const { result } = renderHook(() =>
        useBlockEditorCore(doc, onDocumentChange, defaultConfig, mockGetOffsetFromPosition)
      );

      expect(result.current.containerRef).toBeDefined();
      expect(result.current.textareaRef).toBeDefined();
      expect(result.current.codeAreaRef).toBeDefined();
    });
  });

  describe("visible blocks", () => {
    it("returns all blocks for now", () => {
      const doc = createBlockDocument("Line 1\nLine 2\nLine 3");
      const onDocumentChange = vi.fn();

      const { result } = renderHook(() =>
        useBlockEditorCore(doc, onDocumentChange, defaultConfig, mockGetOffsetFromPosition)
      );

      expect(result.current.visibleBlocks).toHaveLength(3);
      expect(result.current.visibleBlocks[0].content).toBe("Line 1");
      expect(result.current.visibleBlocks[1].content).toBe("Line 2");
      expect(result.current.visibleBlocks[2].content).toBe("Line 3");
    });
  });

  describe("virtual scroll", () => {
    it("provides virtual scroll state", () => {
      const doc = createBlockDocument("Hello\nWorld");
      const onDocumentChange = vi.fn();

      const { result } = renderHook(() =>
        useBlockEditorCore(doc, onDocumentChange, defaultConfig, mockGetOffsetFromPosition)
      );

      expect(result.current.virtualScroll.state).toBeDefined();
      expect(result.current.virtualScroll.state.scrollTop).toBe(0);
    });
  });

  describe("handlers", () => {
    it("provides all required handlers", () => {
      const doc = createBlockDocument("Hello");
      const onDocumentChange = vi.fn();

      const { result } = renderHook(() =>
        useBlockEditorCore(doc, onDocumentChange, defaultConfig, mockGetOffsetFromPosition)
      );

      expect(typeof result.current.handleChange).toBe("function");
      expect(typeof result.current.handleKeyDown).toBe("function");
      expect(typeof result.current.handleCodePointerDown).toBe("function");
      expect(typeof result.current.handleCodePointerMove).toBe("function");
      expect(typeof result.current.handleCodePointerUp).toBe("function");
      expect(typeof result.current.handleScroll).toBe("function");
      expect(typeof result.current.updateCursorPosition).toBe("function");
    });

    it("provides composition handlers", () => {
      const doc = createBlockDocument("Hello");
      const onDocumentChange = vi.fn();

      const { result } = renderHook(() =>
        useBlockEditorCore(doc, onDocumentChange, defaultConfig, mockGetOffsetFromPosition)
      );

      expect(typeof result.current.compositionHandlers.handleCompositionStart).toBe("function");
      expect(typeof result.current.compositionHandlers.handleCompositionUpdate).toBe("function");
      expect(typeof result.current.compositionHandlers.handleCompositionEnd).toBe("function");
    });
  });

  describe("highlights", () => {
    it("provides empty highlights initially", () => {
      const doc = createBlockDocument("Hello");
      const onDocumentChange = vi.fn();

      const { result } = renderHook(() =>
        useBlockEditorCore(doc, onDocumentChange, defaultConfig, mockGetOffsetFromPosition)
      );

      expect(result.current.allHighlights).toEqual([]);
    });
  });

  describe("read-only mode", () => {
    it("respects readOnly config", () => {
      const doc = createBlockDocument("Hello");
      const onDocumentChange = vi.fn();
      const readOnlyConfig = { ...defaultConfig, readOnly: true };

      const { result } = renderHook(() =>
        useBlockEditorCore(doc, onDocumentChange, readOnlyConfig, mockGetOffsetFromPosition)
      );

      // handleChange should not call onDocumentChange when readOnly
      // Create a minimal mock that satisfies the handler's requirements
      const mockTarget = {
        value: "Hello World",
        selectionEnd: 11,
      } as HTMLTextAreaElement;

      const mockEvent: React.ChangeEvent<HTMLTextAreaElement> = {
        target: mockTarget,
        currentTarget: mockTarget,
        nativeEvent: { inputType: "insertText" } as InputEvent,
        bubbles: false,
        cancelable: false,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: true,
        preventDefault: () => {},
        isDefaultPrevented: () => false,
        stopPropagation: () => {},
        isPropagationStopped: () => false,
        persist: () => {},
        timeStamp: Date.now(),
        type: "change",
      };

      act(() => {
        result.current.handleChange(mockEvent);
      });

      expect(onDocumentChange).not.toHaveBeenCalled();
    });
  });

  describe("document updates", () => {
    it("updates text value when document changes", () => {
      const doc1 = createBlockDocument("Hello");
      const doc2 = createBlockDocument("Hello World");
      const onDocumentChange = vi.fn();

      const { result, rerender } = renderHook(
        ({ doc }) =>
          useBlockEditorCore(doc, onDocumentChange, defaultConfig, mockGetOffsetFromPosition),
        { initialProps: { doc: doc1 } }
      );

      expect(result.current.textValue).toBe("Hello");

      rerender({ doc: doc2 });

      expect(result.current.textValue).toBe("Hello World");
    });
  });

  describe("cursor callbacks", () => {
    it("accepts cursor change callback", () => {
      const doc = createBlockDocument("Hello");
      const onDocumentChange = vi.fn();
      const onCursorChange = vi.fn();

      renderHook(() =>
        useBlockEditorCore(
          doc,
          onDocumentChange,
          defaultConfig,
          mockGetOffsetFromPosition,
          onCursorChange
        )
      );

      // Callback is accepted without error
      expect(true).toBe(true);
    });

    it("accepts selection change callback", () => {
      const doc = createBlockDocument("Hello");
      const onDocumentChange = vi.fn();
      const onCursorChange = vi.fn();
      const onSelectionChange = vi.fn();

      renderHook(() =>
        useBlockEditorCore(
          doc,
          onDocumentChange,
          defaultConfig,
          mockGetOffsetFromPosition,
          onCursorChange,
          onSelectionChange
        )
      );

      // Callback is accepted without error
      expect(true).toBe(true);
    });
  });

  describe("visible block info", () => {
    it("provides visibleBlockInfo for virtual scrolling", () => {
      const doc = createBlockDocument("Line1\nLine2\nLine3");
      const onDocumentChange = vi.fn();

      const { result } = renderHook(() =>
        useBlockEditorCore(doc, onDocumentChange, defaultConfig, mockGetOffsetFromPosition)
      );

      // Should have visibleBlockInfo
      expect(result.current.visibleBlockInfo).toBeDefined();
      expect(result.current.visibleBlockInfo.visibleBlocks).toBeDefined();
      expect(result.current.visibleBlockInfo.visibleRange).toBeDefined();
      expect(typeof result.current.visibleBlockInfo.topSpacerHeight).toBe("number");
      expect(typeof result.current.visibleBlockInfo.bottomSpacerHeight).toBe("number");
      expect(typeof result.current.visibleBlockInfo.startLineNumber).toBe("number");
    });

    it("visibleBlocks matches visibleBlockInfo.visibleBlocks", () => {
      const doc = createBlockDocument("Hello\nWorld");
      const onDocumentChange = vi.fn();

      const { result } = renderHook(() =>
        useBlockEditorCore(doc, onDocumentChange, defaultConfig, mockGetOffsetFromPosition)
      );

      expect(result.current.visibleBlocks).toBe(result.current.visibleBlockInfo.visibleBlocks);
    });
  });
});
