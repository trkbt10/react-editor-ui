/**
 * @file Cursor Restoration Hook
 *
 * Manages cursor position restoration after undo/redo operations.
 * Centralizes cursor restoration logic with validation and IME handling.
 */

import { useCallback, useEffect, useRef, type RefObject } from "react";

// =============================================================================
// Types
// =============================================================================

export type UseCursorRestorationResult = {
  /**
   * Queue a cursor position to be restored after the next value change.
   * Use this for undo/redo where value changes via React state.
   * The offset will be clamped to valid range [0, value.length].
   * Does nothing if IME composition is active.
   */
  readonly queueCursorRestoration: (offset: number) => void;
  /**
   * Set cursor position immediately without waiting for value change.
   * Use this for programmatic insertions (Tab key, etc.) where you
   * directly manipulate textarea.value.
   * The offset will be clamped to valid range.
   * Does nothing if IME composition is active.
   */
  readonly setCursorNow: (offset: number) => void;
  /**
   * Whether there's a pending cursor restoration (for debugging/testing).
   */
  readonly hasPendingRestoration: boolean;
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for managing cursor restoration after undo/redo operations.
 *
 * This hook centralizes cursor restoration logic that was previously
 * scattered across useEditorCore. It provides:
 * - Validation: Clamps cursor offset to valid range
 * - IME safety: Skips restoration during IME composition
 * - Single responsibility: All cursor restoration goes through this hook
 *
 * @param textareaRef - Reference to the textarea element
 * @param value - Current text value (used for offset validation)
 * @param isComposing - Whether IME composition is active
 * @returns Cursor restoration controls
 *
 * @example
 * ```tsx
 * const { queueCursorRestoration } = useCursorRestoration(
 *   textareaRef,
 *   value,
 *   composition.isComposing
 * );
 *
 * const handleUndo = () => {
 *   const restored = history.undo();
 *   if (restored) {
 *     queueCursorRestoration(restored.cursorOffset);
 *     onChange(restored.state);
 *   }
 * };
 * ```
 */
export function useCursorRestoration(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  isComposing: boolean
): UseCursorRestorationResult {
  const pendingOffsetRef = useRef<number | null>(null);

  // Stable reference to avoid stale closure issues
  const valueLengthRef = useRef(value.length);
  valueLengthRef.current = value.length;

  const isComposingRef = useRef(isComposing);
  isComposingRef.current = isComposing;

  const queueCursorRestoration = useCallback((offset: number) => {
    // Skip restoration during IME composition to avoid interfering with IME
    if (isComposingRef.current) {
      return;
    }

    // Clamp offset to valid range
    // Note: We use the current value length, but the offset may be intended
    // for a different value (after undo/redo). The useEffect will handle this.
    const validOffset = Math.max(0, offset);
    pendingOffsetRef.current = validOffset;
  }, []);

  const setCursorNow = useCallback((offset: number) => {
    // Skip during IME composition to avoid interfering with IME
    if (isComposingRef.current) {
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    // Clamp to valid range using textarea's current value
    const validOffset = Math.max(0, Math.min(offset, textarea.value.length));
    textarea.setSelectionRange(validOffset, validOffset);
  }, [textareaRef]);

  // Restore cursor position when value changes
  useEffect(() => {
    if (pendingOffsetRef.current === null) {
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      pendingOffsetRef.current = null;
      return;
    }

    // Clamp to actual value length (important for undo to shorter text)
    const offset = Math.min(pendingOffsetRef.current, value.length);
    textarea.setSelectionRange(offset, offset);
    pendingOffsetRef.current = null;
  }, [value, textareaRef]);

  return {
    queueCursorRestoration,
    setCursorNow,
    get hasPendingRestoration() {
      return pendingOffsetRef.current !== null;
    },
  };
}
