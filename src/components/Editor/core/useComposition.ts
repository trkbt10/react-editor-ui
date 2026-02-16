/**
 * @file Code composition hook for IME support
 *
 * Manages IME composition lifecycle for the Editor.
 *
 * Key insight: During IME composition, the browser updates textarea.value,
 * but we freeze the "baseValue" at composition start and use that to compute
 * display text. This prevents duplication and ensures consistent rendering.
 */

import {
  useCallback,
  type CompositionEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { INITIAL_COMPOSITION_STATE, type CompositionState } from "./types";

// =============================================================================
// Hook
// =============================================================================

type UseCompositionArgs = {
  readonly setComposition: Dispatch<SetStateAction<CompositionState>>;
  /** Current value (used to capture baseValue at composition start) */
  readonly value: string;
  /** Called when composition ends with the final text value and cursor offset */
  readonly onCompositionConfirm?: (value: string, cursorOffset: number) => void;
};

type UseCompositionResult = {
  readonly handleCompositionStart: (event: CompositionEvent<HTMLTextAreaElement>) => void;
  readonly handleCompositionUpdate: (event: CompositionEvent<HTMLTextAreaElement>) => void;
  readonly handleCompositionEnd: (event: CompositionEvent<HTMLTextAreaElement>) => void;
};

/**
 * Hook for managing IME composition lifecycle in editor.
 *
 * During composition:
 * - `isComposing` is true
 * - `baseValue` holds the frozen value at composition start
 * - `text` contains the current composition text
 * - `startOffset` is where composition started in baseValue
 * - `replacedLength` is how many characters were selected when composition started
 *
 * Display text = baseValue.slice(0, startOffset) + text + baseValue.slice(startOffset + replacedLength)
 */
export function useComposition({
  setComposition,
  value,
  onCompositionConfirm,
}: UseCompositionArgs): UseCompositionResult {
  const handleCompositionStart = useCallback(
    (e: CompositionEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      // Track how many characters were selected (will be replaced by composition)
      const replacedLength = selectionEnd - selectionStart;

      setComposition({
        isComposing: true,
        text: "",
        startOffset: selectionStart,
        replacedLength,
        baseValue: value, // Freeze the current value
      });
    },
    [setComposition, value]
  );

  const handleCompositionUpdate = useCallback(
    (e: CompositionEvent<HTMLTextAreaElement>) => {
      setComposition((prev) => ({
        ...prev,
        text: e.data,
      }));
    },
    [setComposition]
  );

  const handleCompositionEnd = useCallback(
    (e: CompositionEvent<HTMLTextAreaElement>) => {
      // Create history entry with the final composed value
      const textarea = e.currentTarget;
      onCompositionConfirm?.(textarea.value, textarea.selectionEnd);

      setComposition(INITIAL_COMPOSITION_STATE);
    },
    [setComposition, onCompositionConfirm]
  );

  return {
    handleCompositionStart,
    handleCompositionUpdate,
    handleCompositionEnd,
  };
}
