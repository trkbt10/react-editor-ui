/**
 * @file useCursorRestoration Hook Tests
 *
 * Tests for cursor restoration functionality after undo/redo operations.
 */

import { renderHook, act } from "@testing-library/react";
import { useCursorRestoration } from "../history/useCursorRestoration";

// =============================================================================
// Mock Setup
// =============================================================================

function createMockTextarea(): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  textarea.value = "test content";
  vi.spyOn(textarea, "setSelectionRange");
  return textarea;
}

// =============================================================================
// Tests
// =============================================================================

describe("useCursorRestoration", () => {
  const refs = { textarea: null as HTMLTextAreaElement | null };

  beforeEach(() => {
    refs.textarea = createMockTextarea();
  });

  describe("queueCursorRestoration", () => {
    it("queues cursor restoration", () => {
      const textareaRef = { current: refs.textarea };
      const { result, rerender } = renderHook(
        ({ value }) => useCursorRestoration(textareaRef, value, false),
        { initialProps: { value: "initial" } }
      );

      // Queue restoration
      act(() => {
        result.current.queueCursorRestoration(5);
      });

      // Should have pending restoration before value changes
      expect(result.current.hasPendingRestoration).toBe(true);

      // Trigger value change to apply restoration
      rerender({ value: "changed" });

      // Should have applied restoration
      expect(refs.textarea!.setSelectionRange).toHaveBeenCalledWith(5, 5);
    });

    it("clamps offset to valid range when value is shorter", () => {
      const textareaRef = { current: refs.textarea };
      const { result, rerender } = renderHook(
        ({ value }) => useCursorRestoration(textareaRef, value, false),
        { initialProps: { value: "long content here" } }
      );

      // Queue restoration with offset beyond new value length
      act(() => {
        result.current.queueCursorRestoration(100);
      });

      // Trigger value change to shorter text
      rerender({ value: "short" }); // length = 5

      // Should clamp to value length
      expect(refs.textarea!.setSelectionRange).toHaveBeenCalledWith(5, 5);
    });

    it("clamps negative offset to 0", () => {
      const textareaRef = { current: refs.textarea };
      const { result, rerender } = renderHook(
        ({ value }) => useCursorRestoration(textareaRef, value, false),
        { initialProps: { value: "content" } }
      );

      // Queue restoration with negative offset
      act(() => {
        result.current.queueCursorRestoration(-5);
      });

      // Trigger value change
      rerender({ value: "new content" });

      // Should clamp to 0
      expect(refs.textarea!.setSelectionRange).toHaveBeenCalledWith(0, 0);
    });

    it("skips restoration during IME composition", () => {
      const textareaRef = { current: refs.textarea };
      const { result, rerender } = renderHook(
        ({ value, isComposing }) =>
          useCursorRestoration(textareaRef, value, isComposing),
        { initialProps: { value: "initial", isComposing: true } }
      );

      // Queue restoration during IME
      act(() => {
        result.current.queueCursorRestoration(5);
      });

      // Should not have pending restoration
      expect(result.current.hasPendingRestoration).toBe(false);

      // Trigger value change
      rerender({ value: "changed", isComposing: true });

      // Should not have called setSelectionRange
      expect(refs.textarea!.setSelectionRange).not.toHaveBeenCalled();
    });

    it("allows restoration after IME composition ends", () => {
      const textareaRef = { current: refs.textarea };
      const { result, rerender } = renderHook(
        ({ value, isComposing }) =>
          useCursorRestoration(textareaRef, value, isComposing),
        { initialProps: { value: "initial", isComposing: true } }
      );

      // First, try during IME (should be skipped)
      act(() => {
        result.current.queueCursorRestoration(3);
      });
      expect(result.current.hasPendingRestoration).toBe(false);

      // End IME composition
      rerender({ value: "initial", isComposing: false });

      // Now queue restoration
      act(() => {
        result.current.queueCursorRestoration(5);
      });
      expect(result.current.hasPendingRestoration).toBe(true);

      // Trigger value change
      rerender({ value: "changed", isComposing: false });

      expect(refs.textarea!.setSelectionRange).toHaveBeenCalledWith(5, 5);
    });
  });

  describe("hasPendingRestoration", () => {
    it("returns false initially", () => {
      const textareaRef = { current: refs.textarea };
      const { result } = renderHook(() =>
        useCursorRestoration(textareaRef, "content", false)
      );

      expect(result.current.hasPendingRestoration).toBe(false);
    });

    it("returns true after queueing", () => {
      const textareaRef = { current: refs.textarea };
      const { result } = renderHook(() =>
        useCursorRestoration(textareaRef, "content", false)
      );

      act(() => {
        result.current.queueCursorRestoration(5);
      });

      expect(result.current.hasPendingRestoration).toBe(true);
    });

    it("returns false after restoration is applied", () => {
      const textareaRef = { current: refs.textarea };
      const { result, rerender } = renderHook(
        ({ value }) => useCursorRestoration(textareaRef, value, false),
        { initialProps: { value: "initial" } }
      );

      act(() => {
        result.current.queueCursorRestoration(5);
      });

      // Apply restoration
      rerender({ value: "changed" });

      expect(result.current.hasPendingRestoration).toBe(false);
    });
  });

  describe("setCursorNow", () => {
    it("sets cursor position immediately", () => {
      const textareaRef = { current: refs.textarea };
      const { result } = renderHook(() =>
        useCursorRestoration(textareaRef, "content", false)
      );

      act(() => {
        result.current.setCursorNow(3);
      });

      expect(refs.textarea!.setSelectionRange).toHaveBeenCalledWith(3, 3);
    });

    it("clamps offset to textarea value length", () => {
      refs.textarea!.value = "short";
      const textareaRef = { current: refs.textarea };
      const { result } = renderHook(() =>
        useCursorRestoration(textareaRef, "content", false)
      );

      act(() => {
        result.current.setCursorNow(100);
      });

      // Should clamp to textarea.value.length (5)
      expect(refs.textarea!.setSelectionRange).toHaveBeenCalledWith(5, 5);
    });

    it("clamps negative offset to 0", () => {
      const textareaRef = { current: refs.textarea };
      const { result } = renderHook(() =>
        useCursorRestoration(textareaRef, "content", false)
      );

      act(() => {
        result.current.setCursorNow(-5);
      });

      expect(refs.textarea!.setSelectionRange).toHaveBeenCalledWith(0, 0);
    });

    it("skips during IME composition", () => {
      const textareaRef = { current: refs.textarea };
      const { result } = renderHook(() =>
        useCursorRestoration(textareaRef, "content", true)
      );

      act(() => {
        result.current.setCursorNow(5);
      });

      expect(refs.textarea!.setSelectionRange).not.toHaveBeenCalled();
    });

    it("handles null textarea ref", () => {
      const textareaRef = { current: null };
      const { result } = renderHook(() =>
        useCursorRestoration(textareaRef, "content", false)
      );

      // Should not throw
      expect(() => {
        act(() => {
          result.current.setCursorNow(5);
        });
      }).not.toThrow();
    });

    it("does not affect pending restoration", () => {
      const textareaRef = { current: refs.textarea };
      const { result, rerender } = renderHook(
        ({ value }) => useCursorRestoration(textareaRef, value, false),
        { initialProps: { value: "initial" } }
      );

      // Queue a restoration
      act(() => {
        result.current.queueCursorRestoration(10);
      });

      // Set cursor immediately (different position)
      act(() => {
        result.current.setCursorNow(3);
      });

      // Pending restoration should still be there
      expect(result.current.hasPendingRestoration).toBe(true);

      // Trigger value change
      rerender({ value: "changed" });

      // Both should have been called
      expect(refs.textarea!.setSelectionRange).toHaveBeenCalledWith(3, 3);
      expect(refs.textarea!.setSelectionRange).toHaveBeenCalledWith(7, 7); // clamped to "changed".length
    });
  });

  describe("edge cases", () => {
    it("handles null textarea ref", () => {
      const textareaRef = { current: null };
      const { result, rerender } = renderHook(
        ({ value }) => useCursorRestoration(textareaRef, value, false),
        { initialProps: { value: "initial" } }
      );

      act(() => {
        result.current.queueCursorRestoration(5);
      });

      // Should not throw when textarea is null
      expect(() => rerender({ value: "changed" })).not.toThrow();
    });

    it("handles empty value", () => {
      const textareaRef = { current: refs.textarea };
      const { result, rerender } = renderHook(
        ({ value }) => useCursorRestoration(textareaRef, value, false),
        { initialProps: { value: "content" } }
      );

      act(() => {
        result.current.queueCursorRestoration(5);
      });

      // Change to empty value
      rerender({ value: "" });

      // Should clamp to 0
      expect(refs.textarea!.setSelectionRange).toHaveBeenCalledWith(0, 0);
    });

    it("handles multiple queued restorations (last one wins)", () => {
      const textareaRef = { current: refs.textarea };
      const { result, rerender } = renderHook(
        ({ value }) => useCursorRestoration(textareaRef, value, false),
        { initialProps: { value: "initial" } }
      );

      // Queue multiple restorations
      act(() => {
        result.current.queueCursorRestoration(1);
        result.current.queueCursorRestoration(2);
        result.current.queueCursorRestoration(3);
      });

      rerender({ value: "changed" });

      // Last queued value should be used
      expect(refs.textarea!.setSelectionRange).toHaveBeenCalledTimes(1);
      expect(refs.textarea!.setSelectionRange).toHaveBeenCalledWith(3, 3);
    });

    it("does not restore if no queue happened", () => {
      const textareaRef = { current: refs.textarea };
      const { rerender } = renderHook(
        ({ value }) => useCursorRestoration(textareaRef, value, false),
        { initialProps: { value: "initial" } }
      );

      // Change value without queuing
      rerender({ value: "changed" });

      expect(refs.textarea!.setSelectionRange).not.toHaveBeenCalled();
    });

    it("handles rapid value changes", () => {
      const textareaRef = { current: refs.textarea };
      const { result, rerender } = renderHook(
        ({ value }) => useCursorRestoration(textareaRef, value, false),
        { initialProps: { value: "initial" } }
      );

      act(() => {
        result.current.queueCursorRestoration(5);
      });

      // Multiple rapid value changes
      rerender({ value: "change1" });
      rerender({ value: "change2" });
      rerender({ value: "change3" });

      // Should only apply once (on first value change)
      expect(refs.textarea!.setSelectionRange).toHaveBeenCalledTimes(1);
    });
  });
});
