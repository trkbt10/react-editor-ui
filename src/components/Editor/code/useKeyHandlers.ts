/**
 * @file Key Handlers Hook
 *
 * Handles keyboard events for the code editor.
 */

import { useCallback, type KeyboardEvent } from "react";
import type { CompositionState } from "./types";

// =============================================================================
// Types
// =============================================================================

type UseKeyHandlersArgs = {
  readonly composition: CompositionState;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly tabSize: number;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onInsert: (value: string, cursorOffset: number) => void;
};

type UseKeyHandlersResult = {
  readonly handleKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for handling keyboard events in code editor.
 *
 * Handles:
 * - Ctrl+Z: Undo
 * - Ctrl+Y / Ctrl+Shift+Z: Redo
 * - Tab: Insert spaces
 */
export function useKeyHandlers({
  composition,
  canUndo,
  canRedo,
  tabSize,
  onUndo,
  onRedo,
  onInsert,
}: UseKeyHandlersArgs): UseKeyHandlersResult {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      // Skip during IME composition
      if (composition.isComposing) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey } = event;
      const isModifierPressed = ctrlKey || metaKey;

      // Undo: Ctrl+Z / Cmd+Z
      if (isModifierPressed && key === "z" && !shiftKey) {
        event.preventDefault();
        if (canUndo) {
          onUndo();
        }
        return;
      }

      // Redo: Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z
      if (
        (isModifierPressed && key === "y") ||
        (isModifierPressed && key === "z" && shiftKey)
      ) {
        event.preventDefault();
        if (canRedo) {
          onRedo();
        }
        return;
      }

      // Tab: Insert spaces
      if (key === "Tab" && !isModifierPressed) {
        event.preventDefault();
        const textarea = event.currentTarget;
        const { selectionStart, selectionEnd, value } = textarea;

        // Create tab spaces
        const spaces = " ".repeat(tabSize);
        const newValue =
          value.substring(0, selectionStart) +
          spaces +
          value.substring(selectionEnd);

        // Calculate new cursor position
        const newPosition = selectionStart + spaces.length;

        onInsert(newValue, newPosition);
        return;
      }

      // Let other keys pass through to textarea
    },
    [composition.isComposing, canUndo, canRedo, tabSize, onUndo, onRedo, onInsert]
  );

  return {
    handleKeyDown,
  };
}
