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
import type { TextStyleSegment } from "../core/types";
import { DEFAULT_EDITOR_CONFIG } from "../core/types";
import { useLineIndex } from "../core/useLineIndex";
import {
  getBlockDocumentText,
  toGlobalSegments,
  getTagsAtBlockOffset,
} from "../core/blockDocument";
import { blockPositionToGlobalOffset } from "../core/blockPosition";
import { executeBlockCommand } from "./commands";
import { calculateSelectionRects } from "../core/coordinates";
import { useBlockEditorCore, type GetOffsetFromPositionFn } from "../core/useBlockEditorCore";
import { useFontMetrics } from "../core/useFontMetrics";
import { invariant } from "../core/invariant";
import { useEditorStyles } from "../styles/useEditorStyles";
import { useTextStyles } from "./useTextStyles";
import { useTextTokenCache } from "./useTextTokenCache";
import { useStyledMeasurement, styledCoordinatesToPosition } from "./useStyledMeasurement";
import { SvgRenderer } from "../renderers/SvgRenderer";
import { CanvasRenderer } from "../renderers/CanvasRenderer";
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

  // Adjust styles for IME composition using block-based state
  // During composition, we need to shift global styles based on composition offset
  const adjustedStyles = useMemo((): readonly TextStyleSegment[] => {
    if (!core.composition.isComposing || !core.composition.blockId) {
      return globalStyles;
    }

    // Convert block-local offset to global offset
    const globalOffset = blockPositionToGlobalOffset(blockDocument, {
      blockId: core.composition.blockId,
      offset: core.composition.localOffset,
    });

    if (globalOffset === undefined) {
      return globalStyles;
    }

    const { text, replacedLength } = core.composition;
    const compositionEnd = globalOffset + replacedLength;
    const shift = text.length - replacedLength;

    return globalStyles.map((s) => {
      // Style is entirely before composition - no change
      if (s.end <= globalOffset) {
        return s;
      }

      // Style is entirely inside composition range - skip it
      if (s.start >= globalOffset && s.end <= compositionEnd) {
        return null;
      }

      // Style is entirely after composition - shift it
      if (s.start >= compositionEnd) {
        return { ...s, start: s.start + shift, end: s.end + shift };
      }

      // Style overlaps with composition - truncate or split
      if (s.start < globalOffset && s.end > compositionEnd) {
        // Style spans entire composition - shrink it
        return { ...s, end: s.end + shift };
      } else if (s.start < globalOffset) {
        // Style ends within composition - truncate
        return { ...s, end: globalOffset };
      } else {
        // Style starts within composition - shift start
        return { ...s, start: globalOffset + shift, end: s.end + shift };
      }
    }).filter((s): s is NonNullable<typeof s> => s !== null);
  }, [globalStyles, core.composition, blockDocument]);

  // Text styles management
  const { tokenizer, tokenStyles } = useTextStyles(adjustedStyles);

  // Style version for cache invalidation
  const styleVersion = useMemo(() => {
    const baseStyles = adjustedStyles;
    if (baseStyles.length === 0) {
      return core.composition.isComposing ? -1 : 0;
    }
    const first = baseStyles[0];
    const last = baseStyles[baseStyles.length - 1];
    const computeCompositionHash = (): number => {
      if (!core.composition.isComposing) {
        return 0;
      }
      return core.composition.text.length * 10000;
    };
    return baseStyles.length * 1000 + first.start + last.end + computeCompositionHash();
  }, [adjustedStyles, core.composition.isComposing, core.composition.text.length]);

  // Token cache
  const tokenCache = useTextTokenCache(tokenizer, lineIndex, styleVersion);

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

  // Render
  const Renderer = renderer === "canvas" ? CanvasRenderer : SvgRenderer;
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
        onScroll={core.handleScroll}
      >
        {isReady && (
          <Renderer
            lines={lineIndex.lines}
            visibleRange={core.virtualScroll.state.visibleRange}
            topSpacerHeight={core.virtualScroll.state.topSpacerHeight}
            bottomSpacerHeight={core.virtualScroll.state.bottomSpacerHeight}
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
            lineOffsets={lineIndex.lineOffsets}
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
