/**
 * @file Text Editor Component
 *
 * Rich text editor supporting different styles for different parts of the text.
 * Uses the shared useEditorCore hook for IME, cursor, selection, and history.
 */

import { useMemo, useCallback, memo, type ReactNode } from "react";
import type { TextEditorProps } from "./types";
import type { TextStyleSegment } from "../core/types";
import {
  DEFAULT_EDITOR_CONFIG,
  adjustStyleForComposition,
} from "../core/types";
import {
  getDocumentText,
  toFlatSegments,
  replaceRange,
} from "../core/styledDocument";
import { useEditorCore, type GetOffsetFromPositionFn } from "../core/useEditorCore";
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
// Helpers
// =============================================================================

/**
 * Compute text diff and return the change range.
 */
function computeTextDiff(
  oldText: string,
  newText: string
): { start: number; oldEnd: number; newEnd: number } {
  // Find common prefix
  let start = 0;
  while (start < oldText.length && start < newText.length && oldText[start] === newText[start]) {
    start++;
  }

  // Find common suffix
  let oldEnd = oldText.length;
  let newEnd = newText.length;
  while (
    oldEnd > start &&
    newEnd > start &&
    oldText[oldEnd - 1] === newText[newEnd - 1]
  ) {
    oldEnd--;
    newEnd--;
  }

  return { start, oldEnd, newEnd };
}

// =============================================================================
// Component
// =============================================================================

/**
 * Text Editor component with rich text support.
 *
 * Features:
 * - Per-character/segment styling
 * - Undo/redo with debounced history
 * - IME composition support
 * - Virtual scrolling for large files
 * - Selection and cursor rendering
 *
 * @example
 * ```tsx
 * const [doc, setDoc] = useState(() => createDocument("Hello"));
 * <TextEditor document={doc} onDocumentChange={setDoc} />
 * ```
 */
export const TextEditor = memo(function TextEditor(props: TextEditorProps): ReactNode {
  const {
    document,
    onDocumentChange,
    renderer = "svg",
    config,
    style,
    readOnly = false,
    onCursorChange,
    onSelectionChange,
    tabSize = 4,
  } = props;

  // Extract value and styles from document
  const value = getDocumentText(document);
  const styles = toFlatSegments(document);

  // Store the document reference
  const documentRef = useMemo(
    () => ({ current: document }),
    // Intentionally empty deps - captures reference only once
    []
  );
  documentRef.current = document;

  // Extract stable callback reference to avoid re-creating handleChange on every render
  const onDocumentChangeRef = useMemo(
    () => ({ current: onDocumentChange }),
    // Intentionally empty deps - capture initial callback only
    []
  );
  onDocumentChangeRef.current = onDocumentChange;

  // Create onChange handler
  const handleChange = useCallback(
    (newValue: string) => {
      if (documentRef.current && onDocumentChangeRef.current) {
        const oldText = getDocumentText(documentRef.current);
        const diff = computeTextDiff(oldText, newValue);
        const newText = newValue.slice(diff.start, diff.newEnd);
        const newDoc = replaceRange(documentRef.current, diff.start, diff.oldEnd, newText);
        onDocumentChangeRef.current(newDoc);
      }
    },
    [documentRef, onDocumentChangeRef]
  );

  // Merge config with defaults
  const editorConfig = { ...DEFAULT_EDITOR_CONFIG, ...config };

  // Style-aware font measurement (needs containerRef, so we create it first)
  // This will be initialized after useEditorCore provides containerRef
  const styledMeasurementRef = useMemo(() => ({ current: null as ReturnType<typeof useStyledMeasurement> | null }), []);

  // Position calculation function for this editor type
  const getOffsetFromPosition: GetOffsetFromPositionFn = useMemo(() => {
    return (x, y, scrollTop, lineIndex) => {
      const measurement = styledMeasurementRef.current;

      // Require measurement - no fallback
      invariant(
        measurement !== null,
        "Styled measurement not available in TextEditor.getOffsetFromPosition. " +
        "Ensure component is mounted before handling pointer events."
      );

      const position = styledCoordinatesToPosition({
        x,
        y,
        lines: lineIndex.lines,
        lineOffsets: lineIndex.lineOffsets,
        scrollTop,
        lineHeight: editorConfig.lineHeight,
        paddingLeft: DEFAULT_PADDING_PX,
        paddingTop: DEFAULT_PADDING_PX,
        findColumnAtStyledX: measurement.findColumnAtStyledX,
      });

      return lineIndex.getOffsetAtLineColumn(position.line, position.column);
    };
  }, [editorConfig.lineHeight, styledMeasurementRef]);

  // Core editor logic (IME, cursor, selection, history)
  const core = useEditorCore(
    value,
    handleChange,
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
    styles,
    fontSize: editorConfig.fontSize,
    fontFamily: editorConfig.fontFamily,
  });
  styledMeasurementRef.current = styledMeasurement;

  // Font metrics for CJK character measurement
  const fontMetrics = useFontMetrics(core.containerRef);

  // Adjust styles for IME composition
  const adjustedStyles = useMemo(() => {
    if (!core.composition.isComposing) {
      return styles;
    }

    const result: TextStyleSegment[] = [];
    for (const s of styles) {
      const adjusted = adjustStyleForComposition(s, core.composition);
      if (adjusted) {
        result.push(adjusted);
      }
    }
    return result;
  }, [styles, core.composition]);

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
    const compositionHash = core.composition.isComposing ? core.composition.text.length * 10000 : 0;
    return baseStyles.length * 1000 + first.start + last.end + compositionHash;
  }, [adjustedStyles, core.composition.isComposing, core.composition.text.length]);

  // Token cache
  const tokenCache = useTextTokenCache(tokenizer, core.lineIndex, styleVersion);

  // Editor styles
  const editorStyles = useEditorStyles({
    lineHeight: editorConfig.lineHeight,
    fontSize: editorConfig.fontSize,
    showLineNumbers: false,
    padding: DEFAULT_PADDING_PX,
  });

  // Render
  const Renderer = renderer === "canvas" ? CanvasRenderer : SvgRenderer;

  // Only render content when font metrics are ready (no fallbacks)
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
            lines={core.lineIndex.lines}
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
            lineOffsets={core.lineIndex.lineOffsets}
          />
        )}
      </div>

      <textarea
        ref={core.textareaRef}
        value={value}
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
