/**
 * @file Key Handlers Hook Tests
 *
 * Tests for keyboard event handling, including IME composition blocking.
 */

import { renderHook, act } from "@testing-library/react";
import { useKeyHandlers } from "./useKeyHandlers";
import type { KeyboardEvent } from "react";

// =============================================================================
// Test Utilities
// =============================================================================

function createMockKeyboardEvent(
  key: string,
  options: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    value?: string;
    selectionStart?: number;
    selectionEnd?: number;
  } = {}
): KeyboardEvent<HTMLTextAreaElement> {
  const { ctrlKey = false, metaKey = false, shiftKey = false } = options;
  const { value = "test", selectionStart = 0, selectionEnd = 0 } = options;

  const mockTextarea = {
    value,
    selectionStart,
    selectionEnd,
  } as HTMLTextAreaElement;

  return {
    key,
    ctrlKey,
    metaKey,
    shiftKey,
    currentTarget: mockTextarea,
    preventDefault: vi.fn(),
  } as unknown as KeyboardEvent<HTMLTextAreaElement>;
}

function createDefaultArgs(overrides: Partial<Parameters<typeof useKeyHandlers>[0]> = {}) {
  return {
    isComposing: false,
    canUndo: true,
    canRedo: true,
    tabSize: 2,
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onInsert: vi.fn(),
    ...overrides,
  };
}

// =============================================================================
// Tests: IME Composition Blocking
// =============================================================================

describe("useKeyHandlers - IME Composition", () => {
  it("blocks all key handling during IME composition", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    const onInsert = vi.fn();

    const { result } = renderHook(() =>
      useKeyHandlers(
        createDefaultArgs({
          isComposing: true,
          onUndo,
          onRedo,
          onInsert,
        })
      )
    );

    // Try various keys during composition
    act(() => {
      result.current.handleKeyDown(createMockKeyboardEvent("z", { ctrlKey: true }));
      result.current.handleKeyDown(createMockKeyboardEvent("y", { ctrlKey: true }));
      result.current.handleKeyDown(createMockKeyboardEvent("Tab"));
      result.current.handleKeyDown(createMockKeyboardEvent("ArrowUp"));
      result.current.handleKeyDown(createMockKeyboardEvent("ArrowDown"));
      result.current.handleKeyDown(createMockKeyboardEvent("Home"));
      result.current.handleKeyDown(createMockKeyboardEvent("End"));
    });

    // None of the handlers should have been called
    expect(onUndo).not.toHaveBeenCalled();
    expect(onRedo).not.toHaveBeenCalled();
    expect(onInsert).not.toHaveBeenCalled();
  });

  it("does not call preventDefault during IME composition", () => {
    const { result } = renderHook(() =>
      useKeyHandlers(createDefaultArgs({ isComposing: true }))
    );

    const event = createMockKeyboardEvent("z", { ctrlKey: true });

    act(() => {
      result.current.handleKeyDown(event);
    });

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("allows key handling when not composing", () => {
    const onUndo = vi.fn();

    const { result } = renderHook(() =>
      useKeyHandlers(createDefaultArgs({ isComposing: false, onUndo }))
    );

    const event = createMockKeyboardEvent("z", { ctrlKey: true });

    act(() => {
      result.current.handleKeyDown(event);
    });

    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("switches behavior when isComposing changes", () => {
    const onUndo = vi.fn();
    let isComposing = true;

    const { result, rerender } = renderHook(() =>
      useKeyHandlers(createDefaultArgs({ isComposing, onUndo }))
    );

    // During composition - should not call onUndo
    act(() => {
      result.current.handleKeyDown(createMockKeyboardEvent("z", { ctrlKey: true }));
    });
    expect(onUndo).not.toHaveBeenCalled();

    // End composition
    isComposing = false;
    rerender();

    // After composition - should call onUndo
    act(() => {
      result.current.handleKeyDown(createMockKeyboardEvent("z", { ctrlKey: true }));
    });
    expect(onUndo).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// Tests: Undo/Redo
// =============================================================================

describe("useKeyHandlers - Undo/Redo", () => {
  it("calls onUndo for Ctrl+Z", () => {
    const onUndo = vi.fn();
    const { result } = renderHook(() =>
      useKeyHandlers(createDefaultArgs({ onUndo }))
    );

    const event = createMockKeyboardEvent("z", { ctrlKey: true });

    act(() => {
      result.current.handleKeyDown(event);
    });

    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("calls onUndo for Cmd+Z (macOS)", () => {
    const onUndo = vi.fn();
    const { result } = renderHook(() =>
      useKeyHandlers(createDefaultArgs({ onUndo }))
    );

    const event = createMockKeyboardEvent("z", { metaKey: true });

    act(() => {
      result.current.handleKeyDown(event);
    });

    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("does not call onUndo if canUndo is false", () => {
    const onUndo = vi.fn();
    const { result } = renderHook(() =>
      useKeyHandlers(createDefaultArgs({ onUndo, canUndo: false }))
    );

    act(() => {
      result.current.handleKeyDown(createMockKeyboardEvent("z", { ctrlKey: true }));
    });

    expect(onUndo).not.toHaveBeenCalled();
  });

  it("calls onRedo for Ctrl+Y", () => {
    const onRedo = vi.fn();
    const { result } = renderHook(() =>
      useKeyHandlers(createDefaultArgs({ onRedo }))
    );

    const event = createMockKeyboardEvent("y", { ctrlKey: true });

    act(() => {
      result.current.handleKeyDown(event);
    });

    expect(onRedo).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("calls onRedo for Ctrl+Shift+Z", () => {
    const onRedo = vi.fn();
    const { result } = renderHook(() =>
      useKeyHandlers(createDefaultArgs({ onRedo }))
    );

    const event = createMockKeyboardEvent("z", { ctrlKey: true, shiftKey: true });

    act(() => {
      result.current.handleKeyDown(event);
    });

    expect(onRedo).toHaveBeenCalledTimes(1);
  });

  it("does not call onRedo if canRedo is false", () => {
    const onRedo = vi.fn();
    const { result } = renderHook(() =>
      useKeyHandlers(createDefaultArgs({ onRedo, canRedo: false }))
    );

    act(() => {
      result.current.handleKeyDown(createMockKeyboardEvent("y", { ctrlKey: true }));
    });

    expect(onRedo).not.toHaveBeenCalled();
  });
});

// =============================================================================
// Tests: Tab Insertion
// =============================================================================

describe("useKeyHandlers - Tab Insertion", () => {
  it("inserts tab spaces on Tab key", () => {
    const onInsert = vi.fn();
    const { result } = renderHook(() =>
      useKeyHandlers(createDefaultArgs({ onInsert, tabSize: 2 }))
    );

    const event = createMockKeyboardEvent("Tab", {
      value: "hello",
      selectionStart: 2,
      selectionEnd: 2,
    });

    act(() => {
      result.current.handleKeyDown(event);
    });

    expect(onInsert).toHaveBeenCalledWith("he  llo", 4);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("replaces selected text with tab", () => {
    const onInsert = vi.fn();
    const { result } = renderHook(() =>
      useKeyHandlers(createDefaultArgs({ onInsert, tabSize: 4 }))
    );

    const event = createMockKeyboardEvent("Tab", {
      value: "hello world",
      selectionStart: 2,
      selectionEnd: 7,
    });

    act(() => {
      result.current.handleKeyDown(event);
    });

    // "he" + "    " + "orld" = "he    orld"
    expect(onInsert).toHaveBeenCalledWith("he    orld", 6);
  });

  it("does not insert tab with modifier key", () => {
    const onInsert = vi.fn();
    const { result } = renderHook(() =>
      useKeyHandlers(createDefaultArgs({ onInsert }))
    );

    act(() => {
      result.current.handleKeyDown(createMockKeyboardEvent("Tab", { ctrlKey: true }));
    });

    expect(onInsert).not.toHaveBeenCalled();
  });
});
