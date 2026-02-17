/**
 * @file Textarea Input Hook
 *
 * Manages hidden textarea for capturing native input events.
 * The textarea is visually hidden but remains functional for:
 * - Native copy/paste
 * - IME composition
 * - Keyboard navigation
 * - Accessibility
 */

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";

// =============================================================================
// Types
// =============================================================================

export type UseTextareaInputConfig = {
  /** Initial value */
  readonly initialValue?: string;
  /** Called when value changes */
  readonly onChange?: (value: string) => void;
};

export type UseTextareaInputResult = {
  /** Reference to the textarea element */
  readonly textareaRef: RefObject<HTMLTextAreaElement | null>;
  /** Current value */
  readonly value: string;
  /** Current selection range */
  readonly selection: { readonly start: number; readonly end: number };
  /** Handle change event */
  readonly handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  /** Focus the textarea */
  readonly focus: () => void;
  /** Set selection range */
  readonly setSelection: (start: number, end: number) => void;
  /** Set value programmatically */
  readonly setValue: (value: string) => void;
  /** Get current selection start */
  readonly getSelectionStart: () => number;
  /** Get current selection end */
  readonly getSelectionEnd: () => number;
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for managing hidden textarea input.
 *
 * The textarea captures all native input events while being visually hidden.
 * This provides native IME support, copy/paste, and accessibility.
 *
 * @example
 * ```tsx
 * const {
 *   textareaRef,
 *   value,
 *   handleChange,
 *   focus,
 *   setSelection,
 * } = useTextareaInput({
 *   initialValue: '',
 *   onChange: (newValue) => console.log(newValue),
 * });
 *
 * <textarea
 *   ref={textareaRef}
 *   value={value}
 *   onChange={handleChange}
 *   style={{ ...hiddenTextareaStyle }}
 * />
 * ```
 */
export function useTextareaInput(
  config: UseTextareaInputConfig = {}
): UseTextareaInputResult {
  const { initialValue = "", onChange } = config;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValueState] = useState(initialValue);
  const [selection, setSelectionState] = useState({ start: 0, end: 0 });

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValueState(newValue);

      // Update selection state
      setSelectionState({
        start: e.target.selectionStart,
        end: e.target.selectionEnd,
      });

      onChange?.(newValue);
    },
    [onChange]
  );

  const focus = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  const setSelection = useCallback((start: number, end: number) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.setSelectionRange(start, end);
      setSelectionState({ start, end });
    }
  }, []);

  const setValue = useCallback(
    (newValue: string) => {
      setValueState(newValue);
      onChange?.(newValue);
    },
    [onChange]
  );

  const getSelectionStart = useCallback(() => {
    return textareaRef.current?.selectionStart ?? 0;
  }, []);

  const getSelectionEnd = useCallback(() => {
    return textareaRef.current?.selectionEnd ?? 0;
  }, []);

  return {
    textareaRef,
    value,
    selection,
    handleChange,
    focus,
    setSelection,
    setValue,
    getSelectionStart,
    getSelectionEnd,
  };
}
