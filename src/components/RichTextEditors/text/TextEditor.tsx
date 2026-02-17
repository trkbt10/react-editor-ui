/**
 * @file Text Editor Component
 *
 * Rich text editor supporting different styles for different parts of the text.
 * Uses block-based architecture for stable IME handling and efficient editing.
 *
 * External and internal API both use BlockDocument.
 */

import {
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
  type ReactNode,
  type Ref,
} from "react";
import type { TextEditorProps, TextEditorHandle, TextSelectionEvent } from "./types";
import { DEFAULT_EDITOR_CONFIG } from "../core/types";
import { useLineIndex } from "../font/useLineIndex";
import {
  getBlockDocumentText,
  toGlobalSegments,
  getTagsAtBlockOffset,
} from "../block/blockDocument";
import { executeBlockCommand } from "./commands";
import { calculateSelectionRects } from "../font/coordinates";
import { useBlockEditorCore, type GetOffsetFromPositionFn } from "../core/useBlockEditorCore";
import { useFontMetrics } from "../font/useFontMetrics";
import { invariant } from "../core/invariant";
import { useEditorStyles } from "../styles/useEditorStyles";
import { useTextStyles } from "./useTextStyles";
import { useTextTokenCache } from "./useTextTokenCache";
import { useStyledMeasurement, styledCoordinatesToPosition } from "./useStyledMeasurement";
import { BlockRenderer } from "../renderers/BlockRenderer";
import { DEFAULT_PADDING_PX } from "../styles/tokens";

// =============================================================================
// Component
// =============================================================================

/**
 * Text Editor component with rich text support.
 *
 * Features:
 * - Per-character/segment styling
 * - Undo/redo with debounced history
 * - IME composition support (block-based for stability)
 * - Virtual scrolling for large files
 * - Selection and cursor rendering
 * - Exposes TextEditorHandle via ref for programmatic control
 *
 * @example
 * ```tsx
 * const editorRef = useRef<TextEditorHandle>(null);
 * const [doc, setDoc] = useState(() => createBlockDocument("Hello"));
 *
 * <TextEditor
 *   ref={editorRef}
 *   document={doc}
 *   onDocumentChange={setDoc}
 *   onTextSelectionChange={(event) => console.log(event)}
 * />
 *
 * // Execute commands programmatically
 * editorRef.current?.executeCommand("bold");
 * ```
 */
export const TextEditor = forwardRef(function TextEditor(
  props: TextEditorProps,
  ref: Ref<TextEditorHandle>
): ReactNode {
  const {
    document: blockDocument,
    onDocumentChange,
    renderer = "svg",
    config,
    style,
    readOnly = false,
    onCursorChange,
    onSelectionChange,
    onTextSelectionChange,
    tabSize = 4,
    viewportConfig,
  } = props;

  // Extract styles from BlockDocument (converted to global offsets for rendering)
  const globalStyles = useMemo(
    () => toGlobalSegments(blockDocument),
    [blockDocument]
  );

  // Store the BlockDocument reference for commands
  const blockDocumentRef = useMemo(
    () => ({ current: blockDocument }),
    []
  );
  blockDocumentRef.current = blockDocument;

  // Extract stable callback reference
  const onDocumentChangeRef = useMemo(
    () => ({ current: onDocumentChange }),
    []
  );
  onDocumentChangeRef.current = onDocumentChange;

  // Merge config with defaults
  const editorConfig = { ...DEFAULT_EDITOR_CONFIG, ...config };

  // Style-aware font measurement ref
  const styledMeasurementRef = useMemo(
    () => ({ current: null as ReturnType<typeof useStyledMeasurement> | null }),
    []
  );

  // Line index from block document text
  const textValue = useMemo(() => getBlockDocumentText(blockDocument), [blockDocument]);
  const lineIndex = useLineIndex(textValue);

  // Position calculation function
  const getOffsetFromPosition: GetOffsetFromPositionFn = useMemo(() => {
    return (x, y, scrollTop, lineCount, lineHeight) => {
      const measurement = styledMeasurementRef.current;

      invariant(
        measurement !== null,
        "Styled measurement not available in TextEditor.getOffsetFromPosition."
      );

      const position = styledCoordinatesToPosition({
        x,
        y,
        lines: lineIndex.lines,
        lineOffsets: lineIndex.lineOffsets,
        scrollTop,
        lineHeight,
        paddingLeft: DEFAULT_PADDING_PX,
        paddingTop: DEFAULT_PADDING_PX,
        findColumnAtStyledX: measurement.findColumnAtStyledX,
      });

      return lineIndex.getOffsetAtLineColumn(position.line, position.column);
    };
  }, [lineIndex, styledMeasurementRef]);

  // Core editor logic using block-based architecture
  const core = useBlockEditorCore(
    blockDocument,
    onDocumentChange,
    {
      lineHeight: editorConfig.lineHeight,
      overscan: editorConfig.overscan,
      tabSize,
      readOnly,
      viewportConfig,
    },
    getOffsetFromPosition,
    onCursorChange,
    onSelectionChange
  );

  // Initialize styled measurement with containerRef
  const styledMeasurement = useStyledMeasurement(core.containerRef, {
    styles: globalStyles,
    fontSize: editorConfig.fontSize,
    fontFamily: editorConfig.fontFamily,
  });
  styledMeasurementRef.current = styledMeasurement;

  // Font metrics for CJK character measurement
  const fontMetrics = useFontMetrics(core.containerRef);

  // During IME composition, the renderer still shows the base document text
  // (not the display text with composition). Therefore, styles should NOT be
  // shifted - they remain aligned with the base document coordinates.
  // The composition text is rendered separately via the composition highlight.
  const adjustedStyles = globalStyles;

  // Text styles management
  const { tokenizer, tokenStyles } = useTextStyles(adjustedStyles);

  // Token cache - use document version for cache invalidation
  const tokenCache = useTextTokenCache(tokenizer, lineIndex, blockDocument.version);

  // Editor styles
  const editorStyles = useEditorStyles({
    lineHeight: editorConfig.lineHeight,
    fontSize: editorConfig.fontSize,
    showLineNumbers: false,
    padding: DEFAULT_PADDING_PX,
  });

  // =============================================================================
  // Enhanced Selection Handling
  // =============================================================================

  useEffect(() => {
    if (!onTextSelectionChange) {
      return;
    }

    const selectionHighlight = core.allHighlights.find((h) => h.type === "selection");

    if (!selectionHighlight) {
      onTextSelectionChange(null);
      return;
    }

    const textarea = core.textareaRef.current;
    const container = core.containerRef.current;

    if (!textarea || !container || !fontMetrics.isReady) {
      return;
    }

    const startOffset = textarea.selectionStart;
    const endOffset = textarea.selectionEnd;

    if (startOffset === endOffset) {
      onTextSelectionChange(null);
      return;
    }

    const lines = lineIndex.lines;
    const selectionRects = calculateSelectionRects({
      startLine: selectionHighlight.startLine,
      startColumn: selectionHighlight.startColumn,
      endLine: selectionHighlight.endLine,
      endColumn: selectionHighlight.endColumn,
      lines,
      lineHeight: editorConfig.lineHeight,
      paddingLeft: DEFAULT_PADDING_PX,
      paddingTop: DEFAULT_PADDING_PX,
      measureText: fontMetrics.measureText,
    });

    if (selectionRects.length === 0) {
      onTextSelectionChange(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const firstRect = selectionRects[0];
    const lastRect = selectionRects[selectionRects.length - 1];

    const minX = Math.min(...selectionRects.map((r) => r.x));
    const maxX = Math.max(...selectionRects.map((r) => r.x + r.width));
    const minY = firstRect.y;
    const maxY = lastRect.y + lastRect.height;

    const anchorRect = {
      x: containerRect.left + minX,
      y: containerRect.top + minY - core.virtualScroll.state.scrollTop,
      width: maxX - minX,
      height: maxY - minY,
    };

    const selectedText = textValue.slice(startOffset, endOffset);
    const activeTags = getTagsAtBlockOffset(blockDocumentRef.current, startOffset);

    const selection = {
      start: { line: selectionHighlight.startLine, column: selectionHighlight.startColumn },
      end: { line: selectionHighlight.endLine, column: selectionHighlight.endColumn },
    };

    const event: TextSelectionEvent = {
      range: selection,
      startOffset,
      endOffset,
      anchorRect,
      selectedText,
      activeTags,
    };

    onTextSelectionChange(event);
  }, [
    onTextSelectionChange,
    core.allHighlights,
    core.textareaRef,
    core.containerRef,
    core.virtualScroll.state.scrollTop,
    fontMetrics.isReady,
    fontMetrics.measureText,
    lineIndex.lines,
    editorConfig.lineHeight,
    textValue,
    blockDocumentRef,
  ]);

  // =============================================================================
  // Imperative Handle
  // =============================================================================

  // Handle command execution with BlockDocument
  const handleExecuteCommand = useCallback(
    (commandId: string) => {
      const textarea = core.textareaRef.current;
      if (!textarea || readOnly) {
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (start === end) {
        return;
      }

      const newDoc = executeBlockCommand(blockDocumentRef.current, commandId, start, end);
      if (newDoc !== blockDocumentRef.current) {
        onDocumentChangeRef.current(newDoc);
      }
    },
    [core.textareaRef, readOnly, blockDocumentRef, onDocumentChangeRef]
  );

  useImperativeHandle(
    ref,
    () => ({
      executeCommand: handleExecuteCommand,
      focus: () => {
        core.textareaRef.current?.focus();
      },
      getSelection: () => {
        const textarea = core.textareaRef.current;
        if (!textarea) {
          return null;
        }
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        if (start === end) {
          return null;
        }
        return { start, end };
      },
    }),
    [handleExecuteCommand, core.textareaRef]
  );

  const isReady = fontMetrics.isReady;

  return (
    <div ref={core.containerRef} style={{ ...editorStyles.container, ...style }}>
      <div
        ref={(node) => {
          (core.codeAreaRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          core.virtualScroll.containerRef(node);
        }}
        style={editorStyles.codeArea}
        onPointerDown={core.handleCodePointerDown}
        onPointerMove={core.handleCodePointerMove}
        onPointerUp={core.handleCodePointerUp}
        onPointerLeave={core.handleCodePointerUp}
        onContextMenu={core.handleCodeContextMenu}
        onScroll={core.handleScroll}
      >
        {isReady && (
          <BlockRenderer
            blocks={blockDocument.blocks}
            visibleRange={core.visibleBlockInfo.visibleRange}
            topSpacerHeight={core.visibleBlockInfo.topSpacerHeight}
            bottomSpacerHeight={core.visibleBlockInfo.bottomSpacerHeight}
            tokenCache={tokenCache}
            lineHeight={editorConfig.lineHeight}
            padding={DEFAULT_PADDING_PX}
            measureText={fontMetrics.measureText}
            showLineNumbers={false}
            highlights={core.allHighlights}
            cursor={core.cursorState}
            tokenStyles={tokenStyles}
            fontFamily={editorConfig.fontFamily}
            fontSize={editorConfig.fontSize}
            startLineNumber={core.visibleBlockInfo.startLineNumber}
            renderer={renderer}
            // Viewport mode props
            viewportConfig={core.viewportConfig}
            viewport={core.viewport}
            visibleLines={core.visibleLines}
            documentHeight={core.documentHeight}
            documentWidth={core.documentWidth}
            // Cursor color auto-contrast
            backgroundColor={style?.backgroundColor as string | undefined}
          />
        )}
      </div>

      <textarea
        ref={core.textareaRef}
        value={textValue}
        onChange={core.handleChange}
        onKeyDown={core.handleKeyDown}
        onFocus={core.updateCursorPosition}
        onBlur={core.updateCursorPosition}
        onCompositionStart={core.compositionHandlers.handleCompositionStart}
        onCompositionUpdate={core.compositionHandlers.handleCompositionUpdate}
        onCompositionEnd={core.compositionHandlers.handleCompositionEnd}
        style={editorStyles.hiddenTextarea}
        readOnly={readOnly}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Text editor"
      />
    </div>
  );
});
