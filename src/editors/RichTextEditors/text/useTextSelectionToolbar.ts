/**
 * @file useTextSelectionToolbar hook
 *
 * Integrates TextEditor with SelectionToolbar.
 * Manages selection state and provides toolbar props.
 */

import { useState, useCallback, useMemo, useEffect, useRef, type RefObject } from "react";
import type { TextEditorHandle, TextSelectionEvent, CommandParams } from "./types";
import type {
  SelectionToolbarOperation,
  SelectionToolbarAnchor,
} from "../../../components/SelectionToolbar/types";
import {
  createConfiguredOperations,
  hasColorOperation,
  DEFAULT_ENABLED_OPERATIONS,
} from "./defaultOperations";

// =============================================================================
// Constants
// =============================================================================

/** Delay before showing toolbar after scroll ends (ms) */
const SCROLL_DEBOUNCE_MS = 150;

// =============================================================================
// Types
// =============================================================================

export type UseTextSelectionToolbarOptions = {
  /** Ref to the TextEditor handle */
  readonly editorRef: RefObject<TextEditorHandle | null>;
  /** Operation IDs to enable (default: bold, italic, underline) */
  readonly enabledOperations?: readonly string[];
  /**
   * Whether to show toolbar during mouse drag selection.
   * When false, toolbar only appears after mouse up.
   * @default false
   */
  readonly showDuringDrag?: boolean;
  /**
   * Whether to hide toolbar during scroll.
   * When true, toolbar hides while scrolling and reappears after scroll ends.
   * @default true
   */
  readonly hideOnScroll?: boolean;
};

export type UseTextSelectionToolbarReturn = {
  /** Current selection event (null when no selection) */
  readonly selectionEvent: TextSelectionEvent | null;
  /** Set selection event (connect to TextEditor.onTextSelectionChange) */
  readonly setSelectionEvent: (event: TextSelectionEvent | null) => void;
  /** Props for SelectionToolbar (null when toolbar should be hidden) */
  readonly toolbarProps: {
    readonly anchor: SelectionToolbarAnchor;
    readonly operations: readonly SelectionToolbarOperation[];
    readonly onOperationSelect: (id: string) => void;
  } | null;
  /** Whether color operation is enabled */
  readonly hasColorOperation: boolean;
  /** Current text color from selection (for ColorOperationButton) */
  readonly currentColor: string | undefined;
  /** Handle color selection (for ColorOperationButton) */
  readonly handleColorSelect: (color: string) => void;
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to integrate TextEditor with SelectionToolbar.
 *
 * @example
 * ```tsx
 * const editorRef = useRef<TextEditorHandle>(null);
 * const {
 *   selectionEvent,
 *   setSelectionEvent,
 *   toolbarProps,
 *   hasColorOperation,
 *   currentColor,
 *   handleColorSelect,
 * } = useTextSelectionToolbar({
 *   editorRef,
 *   enabledOperations: ["bold", "italic", "textColor"],
 * });
 *
 * <TextEditor
 *   ref={editorRef}
 *   onTextSelectionChange={setSelectionEvent}
 * />
 * {toolbarProps && (
 *   <SelectionToolbar {...toolbarProps}>
 *     {hasColorOperation && (
 *       <ColorOperationButton
 *         currentColor={currentColor}
 *         onColorSelect={handleColorSelect}
 *       />
 *     )}
 *   </SelectionToolbar>
 * )}
 * ```
 */
export function useTextSelectionToolbar({
  editorRef,
  enabledOperations = DEFAULT_ENABLED_OPERATIONS,
  showDuringDrag = false,
  hideOnScroll = true,
}: UseTextSelectionToolbarOptions): UseTextSelectionToolbarReturn {
  const [selectionEvent, setSelectionEvent] = useState<TextSelectionEvent | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track mouse drag state
  // Skip if clicking on the selection toolbar to allow button clicks
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      // Check if click is inside a SelectionToolbar
      const target = e.target as Element | null;
      const isOnToolbar = target?.closest('[aria-label="Selection toolbar"]');
      if (!isOnToolbar) {
        setIsDragging(true);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  // Track scroll state - hide toolbar during scroll
  useEffect(() => {
    if (!hideOnScroll) {
      return;
    }

    const handleScroll = () => {
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set timeout to clear scrolling state after scroll ends
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        scrollTimeoutRef.current = null;
      }, SCROLL_DEBOUNCE_MS);
    };

    // Listen to both window scroll and capture phase for inner scrolls
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [hideOnScroll]);

  // Handle operation selection (toggle commands)
  const handleOperationSelect = useCallback(
    (id: string) => {
      editorRef.current?.executeCommand(id);
    },
    [editorRef],
  );

  // Handle color selection
  const handleColorSelect = useCallback(
    (color: string) => {
      const params: CommandParams = { color };
      editorRef.current?.executeCommand("textColor", params);
    },
    [editorRef],
  );

  // Check if color operation is enabled
  const colorEnabled = useMemo(
    () => hasColorOperation(enabledOperations),
    [enabledOperations],
  );

  // Extract current color from selection (if available)
  // Note: This is a simplified implementation. For full support,
  // we'd need to extract color from the document styles.
  const currentColor = useMemo(() => {
    // Currently we don't have direct access to the color at selection.
    // This could be enhanced by extending TextSelectionEvent with color info.
    return undefined;
  }, []);

  // Build toolbar props
  const toolbarProps = useMemo(() => {
    if (!selectionEvent) {
      return null;
    }

    // Hide toolbar during drag unless showDuringDrag is true
    if (isDragging && !showDuringDrag) {
      return null;
    }

    // Hide toolbar during scroll
    if (isScrolling && hideOnScroll) {
      return null;
    }

    const anchor: SelectionToolbarAnchor = {
      x: selectionEvent.anchorRect.x,
      y: selectionEvent.anchorRect.y,
      width: selectionEvent.anchorRect.width,
      height: selectionEvent.anchorRect.height,
    };

    const operations = createConfiguredOperations(
      enabledOperations,
      selectionEvent.activeTags,
    );

    return {
      anchor,
      operations,
      onOperationSelect: handleOperationSelect,
    };
  }, [selectionEvent, enabledOperations, handleOperationSelect, isDragging, showDuringDrag, isScrolling, hideOnScroll]);

  return {
    selectionEvent,
    setSelectionEvent,
    toolbarProps,
    hasColorOperation: colorEnabled,
    currentColor,
    handleColorSelect,
  };
}
