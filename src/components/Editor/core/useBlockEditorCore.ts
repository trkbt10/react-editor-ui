/**
 * @file Block-Based Editor Core Hook
 *
 * Unified editor logic for block-based documents.
 * Replaces useEditorCore with a block-centric architecture.
 *
 * Key differences from useEditorCore:
 * - Document is BlockDocument instead of string
 * - Positions are BlockPosition instead of global offsets
 * - IME composition is block-local
 * - Styles are managed per-block
 *
 * @example
 * ```typescript
 * function MyEditor() {
 *   const [document, setDocument] = useState(createBlockDocument("Hello"));
 *   const editor = useBlockEditorCore(document, setDocument, config);
 *
 *   return (
 *     <div ref={editor.containerRef}>
 *       <textarea ref={editor.textareaRef} {...editor.textareaProps} />
 *       <div ref={editor.codeAreaRef}>
 *         {editor.visibleBlocks.map(block => (
 *           <BlockRenderer key={block.id} block={block} />
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
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
import type { CursorPosition, CursorState, HighlightRange } from "./types";
import type {
  BlockDocument,
  Block,
  BlockId,
} from "../block/blockDocument";
import {
  getBlockDocumentText,
  createBlockDocument,
  replaceRangeInDocument,
} from "../block/blockDocument";
import { computeTextDiff } from "../text/textDiff";
import type { BlockPosition, BlockSelection } from "../block/blockPosition";
import {
  globalOffsetToBlockPosition,
  blockPositionToGlobalOffset,
  getGlobalLineColumn,
  createBlockCursor,
  createBlockSelection,
  isSelectionCollapsed,
  getSelectionBounds,
} from "../block/blockPosition";
import {
  type BlockCompositionState,
  INITIAL_BLOCK_COMPOSITION_STATE,
  useBlockComposition,
  getCompositionRange,
} from "../block/useBlockComposition";
import { useVirtualScroll, type UseVirtualScrollResult } from "../renderers/useVirtualScroll";
import type { ViewportConfig, ViewportState, VisibleLineItem } from "../renderers/viewport/types";
import { useHistory } from "../history/useHistory";
import { useCursorRestoration } from "../history/useCursorRestoration";
import { useKeyHandlers } from "../user-actions/useKeyHandlers";
import { injectCursorAnimation } from "../styles/useEditorStyles";
import { useSelectionChange } from "../user-actions/useSelectionChange";
import { useClickCount } from "../user-actions/useClickCount";
import {
  findWordBoundaries,
  findLineBoundaries,
} from "../user-actions/wordBoundaries";

// =============================================================================
// Types
// =============================================================================

export type UseBlockEditorCoreConfig = {
  /** Line height in pixels */
  readonly lineHeight: number;
  /** Number of extra lines to render above/below viewport */
  readonly overscan: number;
  /** Tab size in spaces */
  readonly tabSize: number;
  /** Whether editor is read-only */
  readonly readOnly: boolean;
  /** Viewport configuration for fixed viewport mode */
  readonly viewportConfig?: ViewportConfig;
};

export type UseBlockEditorCoreResult = {
  // Refs
  readonly containerRef: RefObject<HTMLDivElement | null>;
  readonly textareaRef: RefObject<HTMLTextAreaElement | null>;
  readonly codeAreaRef: RefObject<HTMLDivElement | null>;

  // State
  readonly composition: BlockCompositionState;
  readonly cursorState: CursorState;
  readonly selection: BlockSelection | null;

  // Block-based computed values
  readonly visibleBlocks: readonly Block[];
  readonly visibleBlockInfo: {
    readonly visibleBlocks: readonly Block[];
    readonly visibleRange: { readonly start: number; readonly end: number };
    readonly topSpacerHeight: number;
    readonly bottomSpacerHeight: number;
    readonly startLineNumber: number;
  };
  readonly cursorPosition: BlockPosition | null;
  readonly virtualScroll: UseVirtualScrollResult;

  // Viewport-based rendering (optional)
  readonly viewportConfig?: ViewportConfig;
  readonly viewport?: ViewportState;
  readonly visibleLines?: readonly VisibleLineItem[];
  readonly documentHeight?: number;
  readonly documentWidth?: number;

  // Legacy compatibility (for gradual migration)
  readonly textValue: string;
  readonly allHighlights: readonly HighlightRange[];

  // Handlers
  readonly handleChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  readonly handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  readonly handleCodePointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  readonly handleCodePointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  readonly handleCodePointerUp: () => void;
  readonly handleCodeContextMenu: () => void;
  readonly handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  readonly updateCursorPosition: () => void;

  // Composition handlers
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
  lineCount: number,
  lineHeight: number
) => number;

// =============================================================================
// Constants
// =============================================================================

const HISTORY_DEBOUNCE_MS = 300;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create cursor state from block position.
 */
function createBlockCursorState(
  doc: BlockDocument,
  position: BlockPosition | null,
  hasFocus: boolean,
  hasSelection: boolean,
  isComposing: boolean
): CursorState {
  if (!position) {
    return {
      line: 1,
      column: 1,
      visible: false,
      blinking: false,
    };
  }

  const { line, column } = getGlobalLineColumn(doc, position);

  return {
    line,
    column,
    visible: hasFocus && !hasSelection,
    blinking: hasFocus && !hasSelection && !isComposing,
  };
}

/**
 * Create selection highlight from block selection.
 */
function createBlockSelectionHighlight(
  doc: BlockDocument,
  selection: BlockSelection
): HighlightRange | null {
  if (isSelectionCollapsed(selection)) {
    return null;
  }

  const { start, end } = getSelectionBounds(doc, selection);
  const startPos = getGlobalLineColumn(doc, start);
  const endPos = getGlobalLineColumn(doc, end);

  return {
    startLine: startPos.line,
    startColumn: startPos.column,
    endLine: endPos.line,
    endColumn: endPos.column,
    type: "selection",
  };
}

/**
 * Create composition highlight from block composition state.
 */
function createBlockCompositionHighlight(
  doc: BlockDocument,
  composition: BlockCompositionState
): HighlightRange | null {
  const range = getCompositionRange(composition);
  if (!range) {
    return null;
  }

  const startPos = getGlobalLineColumn(doc, range.start);
  const endPos = getGlobalLineColumn(doc, range.end);

  return {
    startLine: startPos.line,
    startColumn: startPos.column,
    endLine: endPos.line,
    endColumn: endPos.column,
    type: "composition",
  };
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Core editor hook for block-based documents.
 */
export function useBlockEditorCore(
  document: BlockDocument,
  onDocumentChange: (doc: BlockDocument) => void,
  config: UseBlockEditorCoreConfig,
  getOffsetFromPosition: GetOffsetFromPositionFn,
  onCursorChange?: (pos: CursorPosition) => void,
  onSelectionChange?: (selection: { start: CursorPosition; end: CursorPosition } | undefined) => void
): UseBlockEditorCoreResult {
  const { lineHeight, overscan, tabSize, readOnly, viewportConfig } = config;

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const codeAreaRef = useRef<HTMLDivElement>(null);

  // Stable ref for onChange
  const onDocumentChangeRef = useRef(onDocumentChange);
  onDocumentChangeRef.current = onDocumentChange;

  // Track cursor position before changes for better undo UX
  const lastCursorOffsetRef = useRef(getBlockDocumentText(document).length);

  // Track cursor position at composition start for undo
  const compositionStartCursorRef = useRef<number | null>(null);

  // Text value (for textarea synchronization)
  const textValue = useMemo(() => getBlockDocumentText(document), [document]);

  // Inject cursor animation on mount
  useEffect(() => {
    injectCursorAnimation();
  }, []);

  // Composition state (block-based)
  const [composition, setComposition] = useState<BlockCompositionState>(
    INITIAL_BLOCK_COMPOSITION_STATE
  );

  // Selection state (block-based)
  const [selection, setSelection] = useState<BlockSelection | null>(null);

  // Count lines for virtual scroll
  const lineCount = useMemo(() => textValue.split("\n").length, [textValue]);

  // Virtual scroll
  const virtualScroll = useVirtualScroll(lineCount, {
    lineHeight,
    overscan,
  });

  // Cursor restoration
  const { queueCursorRestoration, setCursorNow } = useCursorRestoration(
    textareaRef,
    textValue,
    composition.isComposing
  );

  // History management (using BlockDocument to preserve styles)
  const history = useHistory<BlockDocument>(document, textValue.length, {
    debounceMs: HISTORY_DEBOUNCE_MS,
  });

  // Composition handlers
  const handleCompositionConfirm = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature required by useBlockComposition
    (blockId: BlockId, localOffset: number, text: string, replacedLength: number) => {
      // Get global offset for history (cursor position AFTER composition)
      const globalOffset = blockPositionToGlobalOffset(document, {
        blockId,
        offset: localOffset + text.length,
      });
      // Use the cursor position captured at composition start for proper undo
      const beforeCursor = compositionStartCursorRef.current ?? lastCursorOffsetRef.current;
      compositionStartCursorRef.current = null;

      // Only push to history if we can calculate the offset
      if (globalOffset !== undefined) {
        history.push(document, globalOffset, beforeCursor);
      }
    },
    [document, history]
  );

  const baseCompositionHandlers = useBlockComposition({
    document,
    setComposition,
    onCompositionConfirm: handleCompositionConfirm,
  });

  // Wrap composition handlers to capture cursor position at start
  const compositionHandlers = useMemo(() => ({
    handleCompositionStart: (e: React.CompositionEvent<HTMLTextAreaElement>) => {
      // Capture cursor position before composition starts
      compositionStartCursorRef.current = e.currentTarget.selectionStart;
      baseCompositionHandlers.handleCompositionStart(e);
    },
    handleCompositionUpdate: baseCompositionHandlers.handleCompositionUpdate,
    handleCompositionEnd: baseCompositionHandlers.handleCompositionEnd,
  }), [baseCompositionHandlers]);

  // Cursor position (block-based)
  const cursorPosition = useMemo((): BlockPosition | null => {
    if (selection) {
      return selection.focus;
    }
    return null;
  }, [selection]);

  // Cursor state (for rendering)
  const [cursorState, setCursorState] = useState<CursorState>({
    line: 1,
    column: 1,
    visible: false,
    blinking: false,
  });

  // Update cursor and selection from textarea
  const updateCursorPosition = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const hasFocus = window.document.activeElement === textarea;
    const { selectionStart, selectionEnd } = textarea;
    const hasSelection = selectionStart !== selectionEnd;

    // Convert to block positions
    const anchorPos = globalOffsetToBlockPosition(document, selectionStart);
    const focusPos = globalOffsetToBlockPosition(document, selectionEnd);

    if (anchorPos && focusPos) {
      if (hasSelection) {
        setSelection(createBlockSelection(anchorPos, focusPos));
      } else {
        setSelection(createBlockCursor(anchorPos));
      }

      const newCursorState = createBlockCursorState(
        document,
        focusPos,
        hasFocus,
        hasSelection,
        composition.isComposing
      );
      setCursorState(newCursorState);

      // Notify cursor change
      if (!composition.isComposing) {
        const { line, column } = getGlobalLineColumn(document, focusPos);
        onCursorChange?.({ line, column });

        if (hasSelection) {
          const startPos = getGlobalLineColumn(document, anchorPos);
          const endPos = getGlobalLineColumn(document, focusPos);
          onSelectionChange?.({ start: startPos, end: endPos });
        } else {
          onSelectionChange?.(undefined);
        }
      }
    }

    lastCursorOffsetRef.current = selectionEnd;
  }, [document, composition.isComposing, onCursorChange, onSelectionChange]);

  // Selection change listener
  useSelectionChange(textareaRef, updateCursorPosition);

  // Update cursor during IME composition
  useEffect(() => {
    if (composition.isComposing) {
      updateCursorPosition();
    }
  }, [composition.isComposing, composition.text, updateCursorPosition]);

  // Value change handler
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (readOnly) {
        return;
      }

      const newValue = e.target.value;
      const cursorOffset = e.target.selectionEnd;
      const oldValue = getBlockDocumentText(document);

      // Use text diff to find minimal change (preserves styles outside edit range)
      const diff = computeTextDiff(oldValue, newValue);
      const insertedText = newValue.slice(diff.start, diff.newEnd);
      const newDoc = replaceRangeInDocument(
        document,
        diff.start,
        diff.oldEnd,
        insertedText
      );

      // Skip history during IME composition
      const inputEvent = e.nativeEvent as InputEvent;
      const nativeIsComposing = inputEvent.isComposing ?? false;
      const isComposing = composition.isComposing || nativeIsComposing;

      if (!isComposing) {
        const inputType = inputEvent.inputType ?? "";
        const isClipboardOperation =
          inputType === "insertFromPaste" ||
          inputType === "insertFromPasteAsQuotation" ||
          inputType === "deleteByCut";

        if (isClipboardOperation) {
          history.flush();
        }

        history.push(newDoc, cursorOffset, lastCursorOffsetRef.current);
      }

      onDocumentChangeRef.current(newDoc);
      requestAnimationFrame(updateCursorPosition);
    },
    [readOnly, document, composition.isComposing, history, updateCursorPosition]
  );

  // Undo handler
  const handleUndo = useCallback(() => {
    if (readOnly) {
      return;
    }
    const restored = history.undo();
    if (restored) {
      // restored.state is a BlockDocument, use it directly to preserve styles
      queueCursorRestoration(restored.cursorOffset);
      onDocumentChangeRef.current(restored.state);
      requestAnimationFrame(updateCursorPosition);
    }
  }, [readOnly, history, queueCursorRestoration, updateCursorPosition]);

  // Redo handler
  const handleRedo = useCallback(() => {
    if (readOnly) {
      return;
    }
    const restored = history.redo();
    if (restored) {
      // restored.state is a BlockDocument, use it directly to preserve styles
      queueCursorRestoration(restored.cursorOffset);
      onDocumentChangeRef.current(restored.state);
      requestAnimationFrame(updateCursorPosition);
    }
  }, [readOnly, history, queueCursorRestoration, updateCursorPosition]);

  // Insert handler (tab, etc.)
  const handleInsert = useCallback(
    (newValue: string, cursorOffset: number) => {
      if (readOnly) {
        return;
      }
      // Note: tab insertion currently loses styles on the inserted line
      // This is acceptable for now since tabs are typically at line start
      const newDoc = createBlockDocument(newValue, document.styleDefinitions);
      history.push(newDoc, cursorOffset, lastCursorOffsetRef.current);
      onDocumentChangeRef.current(newDoc);
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.value = newValue;
        setCursorNow(cursorOffset);
      }
      requestAnimationFrame(updateCursorPosition);
    },
    [readOnly, document.styleDefinitions, history, setCursorNow, updateCursorPosition]
  );

  // Key handlers
  const { handleKeyDown } = useKeyHandlers({
    isComposing: composition.isComposing,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    tabSize,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onInsert: handleInsert,
  });

  // Pointer handlers
  const dragStartOffsetRef = useRef<number | null>(null);

  // Click count tracking for multi-click detection (double/triple-click)
  const clickCount = useClickCount();

  const getOffsetFromPointerEvent = useCallback(
    (e: ReactPointerEvent<HTMLDivElement> | PointerEvent): number => {
      const codeArea = codeAreaRef.current;
      if (!codeArea) {
        return 0;
      }

      const rect = codeArea.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      return getOffsetFromPosition(
        x,
        y,
        virtualScroll.state.scrollTop,
        lineCount,
        lineHeight
      );
    },
    [getOffsetFromPosition, virtualScroll.state.scrollTop, lineCount, lineHeight]
  );

  const handleCodePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();

      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      const offset = getOffsetFromPointerEvent(e);
      const isRightClick = e.button === 2;

      // Right-click: preserve selection if click is within it
      if (isRightClick) {
        const { selectionStart, selectionEnd } = textarea;
        const hasSelection = selectionStart !== selectionEnd;
        const isWithinSelection =
          hasSelection && offset >= selectionStart && offset <= selectionEnd;

        if (isWithinSelection) {
          // Save selection to restore in contextmenu handler
          // (browser may clear it between pointerdown and contextmenu)
          preservedSelectionRef.current = { start: selectionStart, end: selectionEnd };
          textarea.focus();
          // Re-apply selection immediately to fight browser clearing it
          textarea.setSelectionRange(selectionStart, selectionEnd);
          return; // Preserve selection for context menu
        }
        // Right-click outside selection: set cursor position
        preservedSelectionRef.current = null;
        textarea.focus();
        textarea.setSelectionRange(offset, offset);
        requestAnimationFrame(updateCursorPosition);
        return;
      }

      // Get click count for multi-click detection
      const count = clickCount.getClickCount(e.clientX, e.clientY);

      if (count === 3) {
        // Triple-click: select line
        const { start, end } = findLineBoundaries(textValue, offset);
        textarea.focus();
        textarea.setSelectionRange(start, end);
        dragStartOffsetRef.current = null; // Disable drag selection after triple-click
        requestAnimationFrame(updateCursorPosition);
        return;
      }

      if (count === 2) {
        // Double-click: select word
        const { start, end } = findWordBoundaries(textValue, offset);
        textarea.focus();
        textarea.setSelectionRange(start, end);
        dragStartOffsetRef.current = null; // Disable drag selection after double-click
        requestAnimationFrame(updateCursorPosition);
        return;
      }

      // Single click: normal cursor positioning
      dragStartOffsetRef.current = offset;
      textarea.focus();
      textarea.setSelectionRange(offset, offset);
      requestAnimationFrame(updateCursorPosition);
    },
    [getOffsetFromPointerEvent, updateCursorPosition, clickCount, textValue]
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
    [getOffsetFromPointerEvent, updateCursorPosition]
  );

  const handleCodePointerUp = useCallback(() => {
    dragStartOffsetRef.current = null;
  }, []);

  // Track selection to preserve on right-click
  const preservedSelectionRef = useRef<{ start: number; end: number } | null>(null);

  // Context menu handler - preserves selection when right-clicking
  const handleCodeContextMenu = useCallback(
    () => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      // If we preserved a selection in pointerdown, restore it immediately
      // and schedule additional restoration to fight browser clearing it
      if (preservedSelectionRef.current) {
        const { start, end } = preservedSelectionRef.current;

        // Restore now
        textarea.setSelectionRange(start, end);

        // Also restore after a microtask (handles some browser behaviors)
        queueMicrotask(() => {
          textarea.setSelectionRange(start, end);
        });

        // And after next frame (handles React state updates)
        requestAnimationFrame(() => {
          textarea.setSelectionRange(start, end);
          preservedSelectionRef.current = null;
        });
      }

      // Don't prevent default - allow native context menu for copy/paste
    },
    []
  );

  // Horizontal scroll state
  const [scrollLeft, setScrollLeft] = useState(0);

  // Scroll handler - tracks both vertical and horizontal scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      virtualScroll.setScrollTop(e.currentTarget.scrollTop);
      setScrollLeft(e.currentTarget.scrollLeft);
    },
    [virtualScroll]
  );

  // Visible blocks (based on virtual scroll)
  // Calculate which blocks are visible based on the line-based virtual scroll
  const visibleBlockInfo = useMemo(() => {
    const { visibleRange } = virtualScroll.state;
    const blocks = document.blocks;

    // Calculate cumulative line counts for each block
    const blockLineInfo: Array<{ startLine: number; lineCount: number }> = [];
    // eslint-disable-next-line no-restricted-syntax -- accumulator in loop
    let currentLine = 0;

    for (const block of blocks) {
      const blockLineCount = block.content.split("\n").length;
      blockLineInfo.push({
        startLine: currentLine,
        lineCount: blockLineCount,
      });
      currentLine += blockLineCount;
    }

    // Find first visible block
    // eslint-disable-next-line no-restricted-syntax -- search index
    let startBlockIndex = 0;
    for (let i = 0; i < blockLineInfo.length; i++) {
      const info = blockLineInfo[i];
      if (info.startLine + info.lineCount > visibleRange.start) {
        startBlockIndex = i;
        break;
      }
    }

    // Find last visible block
    // eslint-disable-next-line no-restricted-syntax -- search index
    let endBlockIndex = blocks.length;
    for (let i = startBlockIndex; i < blockLineInfo.length; i++) {
      const info = blockLineInfo[i];
      if (info.startLine >= visibleRange.end) {
        endBlockIndex = i;
        break;
      }
    }

    // Calculate top spacer height (lines before first visible block)
    const topSpacerLines =
      startBlockIndex > 0 ? blockLineInfo[startBlockIndex].startLine : 0;
    const topSpacerHeight = topSpacerLines * lineHeight;

    // Calculate bottom spacer height (lines after last visible block)
    const computeLastVisibleBlockEnd = (): number => {
      if (endBlockIndex <= 0) {
        return 0;
      }
      const lastBlockInfo = blockLineInfo[endBlockIndex - 1];
      return lastBlockInfo.startLine + lastBlockInfo.lineCount;
    };
    const lastVisibleBlockEnd = computeLastVisibleBlockEnd();
    const totalLines = currentLine;
    const bottomSpacerLines = totalLines - lastVisibleBlockEnd;
    const bottomSpacerHeight = bottomSpacerLines * lineHeight;

    return {
      visibleBlocks: blocks.slice(startBlockIndex, endBlockIndex),
      visibleRange: { start: startBlockIndex, end: endBlockIndex },
      topSpacerHeight,
      bottomSpacerHeight,
      startLineNumber: startBlockIndex > 0 ? blockLineInfo[startBlockIndex].startLine + 1 : 1,
    };
  }, [document.blocks, virtualScroll.state, lineHeight]);

  const visibleBlocks = visibleBlockInfo.visibleBlocks;

  // Selection highlight (for legacy compatibility)
  const selectionHighlight = useMemo(() => {
    if (!selection || isSelectionCollapsed(selection)) {
      return null;
    }
    return createBlockSelectionHighlight(document, selection);
  }, [document, selection]);

  // Composition highlight (for legacy compatibility)
  const compositionHighlight = useMemo(
    () => createBlockCompositionHighlight(document, composition),
    [document, composition]
  );

  // Combined highlights (for legacy compatibility)
  const allHighlights = useMemo(() => {
    const highlights: HighlightRange[] = [];
    if (selectionHighlight) {
      highlights.push(selectionHighlight);
    }
    if (compositionHighlight) {
      highlights.push(compositionHighlight);
    }
    return highlights;
  }, [selectionHighlight, compositionHighlight]);

  // Viewport mode values
  // Tracks both horizontal and vertical scroll for smooth viewport rendering
  const computeViewport = (): ViewportState | undefined => {
    if (!viewportConfig?.fixedViewport) {
      return undefined;
    }
    return {
      offset: { x: scrollLeft, y: virtualScroll.state.scrollTop },
      size: { width: 800, height: virtualScroll.state.viewportHeight },
    };
  };
  const viewport = computeViewport();

  const computeVisibleLines = (): VisibleLineItem[] | undefined => {
    if (!viewportConfig?.fixedViewport) {
      return undefined;
    }
    return document.blocks.slice(
      visibleBlockInfo.visibleRange.start,
      visibleBlockInfo.visibleRange.end
    ).flatMap((block, blockIdx) => {
      const blockInfo = visibleBlockInfo.visibleBlocks[blockIdx];
      if (!blockInfo) {
        return [];
      }
      const lines = block.content.split("\n");
      return lines.map((_, lineIdx) => {
        const lineNumber = visibleBlockInfo.startLineNumber - 1 + blockIdx + lineIdx;
        const docY = lineNumber * lineHeight;
        return {
          index: lineNumber,
          documentX: 0,
          documentY: docY,
          viewportX: 0,
          viewportY: docY - virtualScroll.state.scrollTop,
          width: 0, // Will be measured
          height: lineHeight,
          visibility: "full" as const,
        };
      });
    });
  };
  const visibleLines = computeVisibleLines();

  const computeDocumentHeight = (): number | undefined => {
    if (!viewportConfig?.fixedViewport) {
      return undefined;
    }
    return lineCount * lineHeight;
  };
  const documentHeight = computeDocumentHeight();

  return {
    containerRef,
    textareaRef,
    codeAreaRef,
    composition,
    cursorState,
    selection,
    visibleBlocks,
    visibleBlockInfo,
    cursorPosition,
    virtualScroll,
    // Viewport mode
    viewportConfig,
    viewport,
    visibleLines,
    documentHeight,
    documentWidth: undefined, // Will be measured
    // Legacy
    textValue,
    allHighlights,
    handleChange,
    handleKeyDown,
    handleCodePointerDown,
    handleCodePointerMove,
    handleCodePointerUp,
    handleCodeContextMenu,
    handleScroll,
    updateCursorPosition,
    compositionHandlers,
  };
}
