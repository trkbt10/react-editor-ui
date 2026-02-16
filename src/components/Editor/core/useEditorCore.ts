/**
 * @file Editor Core Hook
 *
 * Unified editor logic for IME, cursor, selection, and history management.
 * Both TextEditor and CodeEditor use this hook, differing only in tokenization/measurement.
 */

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  type RefObject,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  INITIAL_COMPOSITION_STATE,
  type CompositionState,
  type CursorState,
  type HighlightRange,
  type CursorPosition,
  type LineIndex,
} from "./types";
import { useLineIndex } from "./useLineIndex";
import { useComposition } from "./useComposition";
import { useSelectionChange } from "./useSelectionChange";
import { useVirtualScroll, type UseVirtualScrollResult } from "./useVirtualScroll";
import { useHistory } from "./useHistory";
import { useKeyHandlers } from "../user-actions/useKeyHandlers";
import { injectCursorAnimation } from "../styles/useEditorStyles";
import {
  createCursorState,
  createSelectionHighlight,
  createCompositionHighlight,
  combineHighlights,
} from "./editorState";

// =============================================================================
// Types
// =============================================================================

export type UseEditorCoreConfig = {
  /** Line height in pixels */
  readonly lineHeight: number;
  /** Number of extra lines to render above/below viewport */
  readonly overscan: number;
  /** Tab size in spaces */
  readonly tabSize: number;
  /** Whether editor is read-only */
  readonly readOnly: boolean;
};

export type UseEditorCoreResult = {
  // Refs
  readonly containerRef: RefObject<HTMLDivElement | null>;
  readonly textareaRef: RefObject<HTMLTextAreaElement | null>;
  readonly codeAreaRef: RefObject<HTMLDivElement | null>;

  // State
  readonly composition: CompositionState;
  readonly cursorState: CursorState;
  readonly selectionHighlight: HighlightRange | null;
  readonly compositionHighlight: HighlightRange | null;

  // Computed
  readonly lineIndex: LineIndex;
  readonly virtualScroll: UseVirtualScrollResult;
  readonly allHighlights: readonly HighlightRange[];

  // Handlers
  readonly handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  readonly handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  readonly handleCodePointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  readonly handleCodePointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  readonly handleCodePointerUp: () => void;
  readonly handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  readonly updateCursorPosition: () => void;

  // Composition handlers (for textarea)
  readonly compositionHandlers: {
    readonly handleCompositionStart: (e: React.CompositionEvent<HTMLTextAreaElement>) => void;
    readonly handleCompositionUpdate: (e: React.CompositionEvent<HTMLTextAreaElement>) => void;
    readonly handleCompositionEnd: (e: React.CompositionEvent<HTMLTextAreaElement>) => void;
  };
};

export type GetOffsetFromPositionFn = (
  x: number,
  y: number,
  scrollTop: number,
  lineIndex: LineIndex
) => number;

// =============================================================================
// Constants
// =============================================================================

const HISTORY_DEBOUNCE_MS = 300;

// =============================================================================
// Re-exports for Backwards Compatibility
// =============================================================================

export {
  createCursorState,
  createSelectionHighlight,
  createCompositionHighlight,
  combineHighlights,
} from "./editorState";

// =============================================================================
// Sub-hooks
// =============================================================================

type UseCursorAndSelectionArgs = {
  readonly textareaRef: RefObject<HTMLTextAreaElement | null>;
  readonly lineIndex: LineIndex;
  readonly composition: CompositionState;
  readonly onCursorChange?: (pos: CursorPosition) => void;
  readonly onSelectionChange?: (selection: { start: CursorPosition; end: CursorPosition } | undefined) => void;
};

type UseCursorAndSelectionResult = {
  readonly cursorState: CursorState;
  readonly selectionHighlight: HighlightRange | null;
  readonly updateCursorPosition: () => void;
};

/**
 * Hook for managing cursor and selection state.
 */
function useCursorAndSelection({
  textareaRef,
  lineIndex,
  composition,
  onCursorChange,
  onSelectionChange,
}: UseCursorAndSelectionArgs): UseCursorAndSelectionResult {
  const [cursorState, setCursorState] = useState<CursorState>({
    line: 1,
    column: 1,
    visible: false,
    blinking: false,
  });

  const [selectionHighlight, setSelectionHighlight] = useState<HighlightRange | null>(null);

  const updateCursorPosition = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const hasFocus = document.activeElement === textarea;
    const { selectionStart, selectionEnd } = textarea;
    const hasSelection = selectionStart !== selectionEnd;

    const cursorPos = lineIndex.getLineAtOffset(selectionEnd);
    const newCursorState = createCursorState(cursorPos, hasFocus, hasSelection, composition.isComposing);
    setCursorState(newCursorState);

    // During IME composition, don't update selection highlight
    if (composition.isComposing) {
      setSelectionHighlight(null);
      return;
    }

    // Notify cursor change
    onCursorChange?.(cursorPos);

    // Update selection highlight
    if (hasSelection) {
      const startPos = lineIndex.getLineAtOffset(selectionStart);
      const endPos = lineIndex.getLineAtOffset(selectionEnd);
      setSelectionHighlight(createSelectionHighlight(startPos, endPos));
      onSelectionChange?.({ start: startPos, end: endPos });
    } else {
      setSelectionHighlight(null);
      onSelectionChange?.(undefined);
    }
  }, [textareaRef, lineIndex, composition.isComposing, onCursorChange, onSelectionChange]);

  // Update cursor during IME composition
  useEffect(() => {
    if (composition.isComposing) {
      updateCursorPosition();
    }
  }, [composition.isComposing, composition.text, updateCursorPosition]);

  return {
    cursorState,
    selectionHighlight,
    updateCursorPosition,
  };
}

type UsePointerHandlersArgs = {
  readonly codeAreaRef: RefObject<HTMLDivElement | null>;
  readonly textareaRef: RefObject<HTMLTextAreaElement | null>;
  readonly lineIndex: LineIndex;
  readonly scrollTop: number;
  readonly getOffsetFromPosition: GetOffsetFromPositionFn;
  readonly updateCursorPosition: () => void;
};

type UsePointerHandlersResult = {
  readonly handleCodePointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  readonly handleCodePointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  readonly handleCodePointerUp: () => void;
};

/**
 * Hook for managing pointer event handlers.
 */
function usePointerHandlers({
  codeAreaRef,
  textareaRef,
  lineIndex,
  scrollTop,
  getOffsetFromPosition,
  updateCursorPosition,
}: UsePointerHandlersArgs): UsePointerHandlersResult {
  const dragStartOffsetRef = useRef<number | null>(null);

  const getOffsetFromPointerEvent = useCallback(
    (e: ReactPointerEvent<HTMLDivElement> | PointerEvent): number => {
      const codeArea = codeAreaRef.current;
      if (!codeArea) {
        return 0;
      }

      const rect = codeArea.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      return getOffsetFromPosition(x, y, scrollTop, lineIndex);
    },
    [codeAreaRef, getOffsetFromPosition, scrollTop, lineIndex]
  );

  const handleCodePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();

      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      const offset = getOffsetFromPointerEvent(e);
      dragStartOffsetRef.current = offset;

      textarea.focus();
      textarea.setSelectionRange(offset, offset);
      requestAnimationFrame(updateCursorPosition);
    },
    [textareaRef, getOffsetFromPointerEvent, updateCursorPosition]
  );

  const handleCodePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const startOffset = dragStartOffsetRef.current;
      if (startOffset === null) {
        return;
      }

      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      const currentOffset = getOffsetFromPointerEvent(e);

      if (currentOffset < startOffset) {
        textarea.setSelectionRange(currentOffset, startOffset);
      } else {
        textarea.setSelectionRange(startOffset, currentOffset);
      }

      requestAnimationFrame(updateCursorPosition);
    },
    [textareaRef, getOffsetFromPointerEvent, updateCursorPosition]
  );

  const handleCodePointerUp = useCallback(() => {
    dragStartOffsetRef.current = null;
  }, []);

  return {
    handleCodePointerDown,
    handleCodePointerMove,
    handleCodePointerUp,
  };
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Core editor hook providing unified IME, cursor, selection, and history management.
 *
 * @param value - Current text value
 * @param onChange - Callback when value changes
 * @param config - Editor configuration
 * @param getOffsetFromPosition - Function to convert screen coordinates to text offset
 * @param onCursorChange - Optional callback when cursor position changes
 * @param onSelectionChange - Optional callback when selection changes
 */
export function useEditorCore(
  value: string,
  onChange: (value: string) => void,
  config: UseEditorCoreConfig,
  getOffsetFromPosition: GetOffsetFromPositionFn,
  onCursorChange?: (pos: CursorPosition) => void,
  onSelectionChange?: (selection: { start: CursorPosition; end: CursorPosition } | undefined) => void
): UseEditorCoreResult {
  const { lineHeight, overscan, tabSize, readOnly } = config;

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const codeAreaRef = useRef<HTMLDivElement>(null);
  const pendingCursorRef = useRef<number | null>(null);

  // Stable ref for onChange to avoid re-creating callbacks on every onChange change
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Inject cursor animation on mount
  useEffect(() => {
    injectCursorAnimation();
  }, []);

  // Restore cursor position after undo/redo
  useEffect(() => {
    if (pendingCursorRef.current !== null) {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.setSelectionRange(pendingCursorRef.current, pendingCursorRef.current);
      }
      pendingCursorRef.current = null;
    }
  }, [value]);

  // Composition state (IME)
  const [composition, setComposition] = useState<CompositionState>(INITIAL_COMPOSITION_STATE);

  // Line index
  const lineIndex = useLineIndex(value);

  // Virtual scroll
  const virtualScroll = useVirtualScroll(lineIndex.lines.length, {
    lineHeight,
    overscan,
  });

  // History management
  const history = useHistory(value, 0, { debounceMs: HISTORY_DEBOUNCE_MS });

  // Composition handlers
  const handleCompositionConfirm = useCallback(
    (finalValue: string, cursorOffset: number) => {
      history.push(finalValue, cursorOffset);
      onChangeRef.current(finalValue);
    },
    [history]
  );

  const compositionHandlers = useComposition({
    setComposition,
    value,
    onCompositionConfirm: handleCompositionConfirm,
  });

  // Cursor and selection
  const { cursorState, selectionHighlight, updateCursorPosition } = useCursorAndSelection({
    textareaRef,
    lineIndex,
    composition,
    onCursorChange,
    onSelectionChange,
  });

  // Selection change listener
  useSelectionChange(textareaRef, updateCursorPosition);

  // Value change handler
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (readOnly) {
        return;
      }

      const newValue = e.target.value;
      const cursorOffset = e.target.selectionEnd;

      // Skip history during IME composition
      if (!composition.isComposing) {
        history.push(newValue, cursorOffset);
      }

      onChangeRef.current(newValue);
      requestAnimationFrame(updateCursorPosition);
    },
    [readOnly, composition.isComposing, history, updateCursorPosition]
  );

  // Undo handler
  const handleUndo = useCallback(() => {
    if (readOnly) {
      return;
    }
    const restored = history.undo();
    if (restored) {
      pendingCursorRef.current = restored.cursorOffset;
      onChangeRef.current(restored.state);
      requestAnimationFrame(updateCursorPosition);
    }
  }, [readOnly, history, updateCursorPosition]);

  // Redo handler
  const handleRedo = useCallback(() => {
    if (readOnly) {
      return;
    }
    const restored = history.redo();
    if (restored) {
      pendingCursorRef.current = restored.cursorOffset;
      onChangeRef.current(restored.state);
      requestAnimationFrame(updateCursorPosition);
    }
  }, [readOnly, history, updateCursorPosition]);

  // Insert handler (tab, etc.)
  const handleInsert = useCallback(
    (newValue: string, cursorOffset: number) => {
      if (readOnly) {
        return;
      }
      history.push(newValue, cursorOffset);
      onChangeRef.current(newValue);
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.value = newValue;
        textarea.setSelectionRange(cursorOffset, cursorOffset);
      }
      requestAnimationFrame(updateCursorPosition);
    },
    [readOnly, history, updateCursorPosition]
  );

  // Key handlers
  const { handleKeyDown } = useKeyHandlers({
    composition,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    tabSize,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onInsert: handleInsert,
  });

  // Pointer handlers
  const pointerHandlers = usePointerHandlers({
    codeAreaRef,
    textareaRef,
    lineIndex,
    scrollTop: virtualScroll.state.scrollTop,
    getOffsetFromPosition,
    updateCursorPosition,
  });

  // Scroll handler
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      virtualScroll.setScrollTop(e.currentTarget.scrollTop);
    },
    [virtualScroll]
  );

  // Composition highlight
  const compositionHighlight = useMemo(
    () => createCompositionHighlight(composition, lineIndex),
    [composition, lineIndex]
  );

  // Combined highlights
  const allHighlights = useMemo(
    () => combineHighlights(selectionHighlight, compositionHighlight),
    [selectionHighlight, compositionHighlight]
  );

  return {
    containerRef,
    textareaRef,
    codeAreaRef,
    composition,
    cursorState,
    selectionHighlight,
    compositionHighlight,
    lineIndex,
    virtualScroll,
    allHighlights,
    handleChange,
    handleKeyDown,
    handleCodePointerDown: pointerHandlers.handleCodePointerDown,
    handleCodePointerMove: pointerHandlers.handleCodePointerMove,
    handleCodePointerUp: pointerHandlers.handleCodePointerUp,
    handleScroll,
    updateCursorPosition,
    compositionHandlers,
  };
}
