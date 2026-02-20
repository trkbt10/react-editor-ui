/**
 * @file Key Handlers Hook
 *
 * Handles keyboard events for the code editor.
 * Supports visual line navigation when text wrapping is enabled.
 */

import { useCallback, useRef, type KeyboardEvent, type RefObject } from "react";
import type { WrapLayoutIndex } from "../wrap/types";
import {
  moveUpVisualLine,
  moveDownVisualLine,
  moveToVisualLineStart,
  moveToVisualLineEnd,
  moveToLogicalLineStart,
  moveToLogicalLineEnd,
  getVisualColumn,
  logicalToOffset,
  offsetToLogical,
} from "../wrap/visualLineNavigation";

// =============================================================================
// Types
// =============================================================================

type UseKeyHandlersArgs = {
  /** Whether IME composition is active */
  readonly isComposing: boolean;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly tabSize: number;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onInsert: (value: string, cursorOffset: number) => void;
  /** Ref to wrap layout index for visual line navigation (optional) */
  readonly wrapLayoutIndexRef?: RefObject<WrapLayoutIndex | null | undefined>;
  /** Line contents for navigation (required when wrapLayoutIndex is provided) */
  readonly lineContents?: readonly string[];
  /** Callback when cursor moves via navigation (sets textarea selection) */
  readonly onCursorMove?: (offset: number, extendSelection?: boolean) => void;
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
 * - Arrow Up/Down: Move by visual line (when wrapping enabled)
 * - Home/End: Move to visual line start/end (when wrapping enabled)
 */
export function useKeyHandlers({
  isComposing,
  canUndo,
  canRedo,
  tabSize,
  onUndo,
  onRedo,
  onInsert,
  wrapLayoutIndexRef,
  lineContents,
  onCursorMove,
}: UseKeyHandlersArgs): UseKeyHandlersResult {
  // Track preferred column for vertical navigation
  const preferredColumnRef = useRef<number | null>(null);

  // Use refs for wrap data to avoid stale closures
  // (wrapLayoutIndex may not be available on first render due to circular dependencies)
  const lineContentsRef = useRef(lineContents);
  const onCursorMoveRef = useRef(onCursorMove);

  // Keep refs updated
  lineContentsRef.current = lineContents;
  onCursorMoveRef.current = onCursorMove;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      // Skip during IME composition
      if (isComposing) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey } = event;
      const isModifierPressed = ctrlKey || metaKey;
      const textarea = event.currentTarget;

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

      // Visual line navigation (only when wrap is enabled)
      // Read from refs to get latest values (avoids stale closures)
      const currentWrapLayoutIndex = wrapLayoutIndexRef?.current;
      const currentLineContents = lineContentsRef.current;
      const currentOnCursorMove = onCursorMoveRef.current;

      if (currentWrapLayoutIndex && currentLineContents && currentOnCursorMove) {
        const { selectionStart, selectionEnd } = textarea;
        const currentOffset = selectionEnd; // Use focus position
        const currentLogical = offsetToLogical(currentLineContents, currentOffset);

        // Arrow Up: Move up by visual line
        if (key === "ArrowUp" && !isModifierPressed) {
          event.preventDefault();

          // Use preferred column, or calculate from current position
          if (preferredColumnRef.current === null) {
            preferredColumnRef.current = getVisualColumn(currentWrapLayoutIndex, currentLogical);
          }

          const result = moveUpVisualLine(
            currentWrapLayoutIndex,
            currentLogical,
            preferredColumnRef.current,
            currentLineContents
          );

          if (result.moved) {
            const newOffset = logicalToOffset(currentLineContents, result.logical);
            currentOnCursorMove(newOffset, shiftKey);
          }
          return;
        }

        // Arrow Down: Move down by visual line
        if (key === "ArrowDown" && !isModifierPressed) {
          event.preventDefault();

          // Use preferred column, or calculate from current position
          if (preferredColumnRef.current === null) {
            preferredColumnRef.current = getVisualColumn(currentWrapLayoutIndex, currentLogical);
          }

          const result = moveDownVisualLine(
            currentWrapLayoutIndex,
            currentLogical,
            preferredColumnRef.current,
            currentLineContents
          );

          if (result.moved) {
            const newOffset = logicalToOffset(currentLineContents, result.logical);
            currentOnCursorMove(newOffset, shiftKey);
          }
          return;
        }

        // Home: Move to start of visual line (let native Cmd+Home handle document start)
        if (key === "Home" && !isModifierPressed) {
          event.preventDefault();
          preferredColumnRef.current = null; // Reset preferred column

          const result = moveToVisualLineStart(currentWrapLayoutIndex, currentLogical);
          const newOffset = logicalToOffset(currentLineContents, result.logical);
          currentOnCursorMove(newOffset, shiftKey);
          return;
        }

        // End: Move to end of visual line (let native Cmd+End handle document end)
        if (key === "End" && !isModifierPressed) {
          event.preventDefault();
          preferredColumnRef.current = null; // Reset preferred column

          const result = moveToVisualLineEnd(currentWrapLayoutIndex, currentLogical);
          const newOffset = logicalToOffset(currentLineContents, result.logical);
          currentOnCursorMove(newOffset, shiftKey);
          return;
        }

        // Arrow Left/Right: Reset preferred column
        if (key === "ArrowLeft" || key === "ArrowRight") {
          preferredColumnRef.current = null;
          // Let default behavior handle horizontal movement
          return;
        }
      }

      // Let other keys pass through to textarea
    },
    [
      isComposing,
      canUndo,
      canRedo,
      tabSize,
      onUndo,
      onRedo,
      onInsert,
      // Note: wrapLayoutIndex, lineContents, onCursorMove accessed via refs
    ]
  );

  return {
    handleKeyDown,
  };
}
