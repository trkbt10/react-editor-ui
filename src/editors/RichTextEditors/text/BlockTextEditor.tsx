/**
 * @file Block-Based Text Editor Component
 *
 * Rich text editor using the block-based document model.
 * Each block is an independent unit with its own content and styles.
 *
 * Key differences from TextEditor:
 * - Uses BlockDocument instead of StyledDocument
 * - Uses useBlockEditorCore instead of useEditorCore
 * - Block-scoped IME composition
 * - Block-level rendering with BlockRenderer
 *
 * @example
 * ```tsx
 * const [doc, setDoc] = useState(() => createBlockDocument("Hello"));
 * <BlockTextEditor document={doc} onDocumentChange={setDoc} />
 * ```
 */

import { useMemo, useCallback, useState, useRef, memo, type ReactNode, type CSSProperties } from "react";
import type { CursorPosition } from "../core/types";
import { DEFAULT_EDITOR_CONFIG } from "../core/types";
import type { BlockDocument } from "../block/blockDocument";
import { getBlockDocumentText } from "../block/blockDocument";
import { useBlockEditorCore } from "../core/useBlockEditorCore";
import { useFontMetrics } from "../font/useFontMetrics";
import { useLineIndex } from "../font/useLineIndex";
import { useEditorStyles } from "../styles/useEditorStyles";
import { useTextTokenCache } from "./useTextTokenCache";
import { BlockRenderer } from "../renderers/BlockRenderer";
import { EDITOR_DEFAULTS } from "../styles/tokens";
import type { WrapMode } from "../wrap/types";
import { DEFAULT_WRAP_MODE } from "../wrap/types";
import { useWrapLayoutIndex, useContainerWidth } from "../wrap/useWrapLayoutIndex";
import { createLayoutConfig } from "../layout/types";
import { findVisualLineAtY, visualToLogical, logicalToVisual } from "../wrap/WrapLayoutIndex";

// =============================================================================
// Types
// =============================================================================

type BlockTextEditorProps = {
  /** The block document to edit */
  readonly document: BlockDocument;
  /** Called when document changes */
  readonly onDocumentChange: (doc: BlockDocument) => void;
  /** Renderer type: svg (default), canvas, or webgl */
  readonly renderer?: "svg" | "canvas" | "webgl";
  /** Editor configuration overrides */
  readonly config?: Partial<{
    lineHeight: number;
    fontSize: number;
    fontFamily: string;
    overscan: number;
  }>;
  /** Custom container style */
  readonly style?: CSSProperties;
  /** Whether editor is read-only */
  readonly readOnly?: boolean;
  /** Called when cursor position changes */
  readonly onCursorChange?: (pos: CursorPosition) => void;
  /** Called when selection changes */
  readonly onSelectionChange?: (selection: { start: CursorPosition; end: CursorPosition } | undefined) => void;
  /** Tab size in spaces */
  readonly tabSize?: number;
  /** Enable soft wrap (automatic wrapping at container width) */
  readonly softWrap?: boolean;
  /** Enable word wrap (break at word boundaries vs character) - only applies when softWrap=true */
  readonly wordWrap?: boolean;
  /** Column width for wrapping (0 = container width, >0 = fixed column count) */
  readonly wrapColumn?: number;
};

// =============================================================================
// Default tokenizer for plain text
// =============================================================================

const createPlainTokenizer = () => ({
  tokenize: (line: string) => [
    { type: "text", text: line, start: 0, end: line.length },
  ],
});

// =============================================================================
// Component
// =============================================================================

/**
 * Block-Based Text Editor component.
 *
 * Features:
 * - Block-based document model for efficient editing
 * - Block-scoped IME composition
 * - Undo/redo with debounced history
 * - Virtual scrolling for large files
 * - Selection and cursor rendering
 *
 * @example
 * ```tsx
 * const [doc, setDoc] = useState(() => createBlockDocument("Hello"));
 * <BlockTextEditor document={doc} onDocumentChange={setDoc} />
 * ```
 */
export const BlockTextEditor = memo(function BlockTextEditor(
  props: BlockTextEditorProps
): ReactNode {
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
    softWrap = false,
    wordWrap = true,
    wrapColumn = 0,
  } = props;

  // Merge config with defaults
  const editorConfig = { ...DEFAULT_EDITOR_CONFIG, ...config };

  // Build wrap mode
  const wrapMode: WrapMode = useMemo(() => ({
    softWrap,
    wordWrap,
    wrapColumn,
  }), [softWrap, wordWrap, wrapColumn]);

  // Track container width for wrapping
  const [containerWidth, setContainerRef] = useContainerWidth();

  // Ref to store current wrapLayoutIndex for use in callbacks
  const wrapLayoutIndexRef = useRef<ReturnType<typeof useWrapLayoutIndex>>(null);

  // Extract text for display
  const textValue = useMemo(() => getBlockDocumentText(document), [document]);

  // Line index for rendering
  const lineIndex = useLineIndex(textValue);

  // Position calculation function (with wrap support)
  const getOffsetFromPosition = useCallback(
    (
      x: number,
      y: number,
      scrollTop: number,
      lineCount: number,
      lineHeight: number
    ): number => {
      const wrapIndex = wrapLayoutIndexRef.current;

      // When wrap is enabled and wrapLayoutIndex is available, use visual line mapping
      if (wrapIndex && wrapIndex.visualLines.length > 0) {
        // Find visual line at Y position
        const adjustedY = y + scrollTop - EDITOR_DEFAULTS.PADDING_PX;
        const visualLineIdx = findVisualLineAtY(wrapIndex, adjustedY);
        const visualLine = wrapIndex.visualLines[visualLineIdx];

        if (visualLine) {
          // Get the logical line content
          const logicalLineContent = lineIndex.lines[visualLine.logicalLineIndex] ?? "";
          // Get the segment of text for this visual line
          const segmentText = logicalLineContent.slice(visualLine.startOffset, visualLine.endOffset);

          // Estimate column within the segment
          const charWidth = editorConfig.fontSize * 0.6;
          const colFromX = Math.round((x - EDITOR_DEFAULTS.PADDING_PX) / charWidth);
          const segmentColumn = Math.max(0, Math.min(colFromX, segmentText.length));

          // Convert visual position to logical position
          const logicalColumn = visualLine.startOffset + segmentColumn;

          // Convert to offset
          return lineIndex.getOffsetAtLineColumn(
            visualLine.logicalLineIndex + 1,
            logicalColumn + 1
          );
        }
      }

      // Fallback: standard calculation without wrapping
      const lineFromY = Math.floor((y + scrollTop) / lineHeight);
      const line = Math.max(0, Math.min(lineFromY, lineCount - 1));

      // Get line content
      const lineContent = lineIndex.lines[line] ?? "";

      // Estimate column from X position (simplified for now)
      // A proper implementation would use measureText
      const charWidth = editorConfig.fontSize * 0.6;
      const colFromX = Math.round((x - EDITOR_DEFAULTS.PADDING_PX) / charWidth);
      const column = Math.max(0, Math.min(colFromX, lineContent.length));

      // Convert to offset
      return lineIndex.getOffsetAtLineColumn(line + 1, column + 1);
    },
    [lineIndex, editorConfig.fontSize]
  );

  // Core editor logic (wrapLayoutIndex is passed as null initially, updated via ref)
  const core = useBlockEditorCore(
    document,
    onDocumentChange,
    {
      lineHeight: editorConfig.lineHeight,
      overscan: editorConfig.overscan,
      tabSize,
      readOnly,
      // wrapLayoutIndex is managed via ref due to circular dependency with fontMetrics
      wrapLayoutIndex: null,
    },
    getOffsetFromPosition,
    onCursorChange,
    onSelectionChange
  );

  // Font metrics
  const fontMetrics = useFontMetrics(core.containerRef);

  // Layout config for wrap calculation
  const layoutConfig = useMemo(
    () => createLayoutConfig(editorConfig.lineHeight, EDITOR_DEFAULTS.PADDING_PX),
    [editorConfig.lineHeight]
  );

  // Build wrap layout index when soft wrap is enabled
  const wrapLayoutIndex = useWrapLayoutIndex({
    document,
    containerWidth,
    measureText: fontMetrics.isReady ? fontMetrics.measureText : null,
    wrapMode,
    layoutConfig,
    enabled: softWrap,
  });

  // Keep refs updated for use in callbacks and cursor positioning
  wrapLayoutIndexRef.current = wrapLayoutIndex;
  // Also update the ref in useBlockEditorCore for keyboard navigation
  core.wrapLayoutIndexRef.current = wrapLayoutIndex;

  // Token cache (plain text tokenizer for now)
  const tokenizer = useMemo(() => createPlainTokenizer(), []);
  const tokenCache = useTextTokenCache(tokenizer, lineIndex, 0);

  // Editor styles
  const editorStyles = useEditorStyles({
    lineHeight: editorConfig.lineHeight,
    fontSize: editorConfig.fontSize,
    showLineNumbers: false,
    padding: EDITOR_DEFAULTS.PADDING_PX,
  });

  // Only render content when font metrics are ready
  const isReady = fontMetrics.isReady;

  return (
    <div ref={core.containerRef} style={{ ...editorStyles.container, ...style }}>
      <div
        ref={(node) => {
          (core.codeAreaRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          core.virtualScroll.containerRef(node);
          setContainerRef(node);
        }}
        style={editorStyles.codeArea}
        onPointerDown={core.handleCodePointerDown}
        onPointerMove={core.handleCodePointerMove}
        onPointerUp={core.handleCodePointerUp}
        onPointerLeave={core.handleCodePointerUp}
        onScroll={core.handleScroll}
      >
        {isReady && (
          <BlockRenderer
            blocks={document.blocks}
            visibleRange={core.visibleBlockInfo.visibleRange}
            topSpacerHeight={core.visibleBlockInfo.topSpacerHeight}
            bottomSpacerHeight={core.visibleBlockInfo.bottomSpacerHeight}
            tokenCache={tokenCache}
            lineHeight={editorConfig.lineHeight}
            padding={EDITOR_DEFAULTS.PADDING_PX}
            measureText={fontMetrics.measureText}
            showLineNumbers={false}
            highlights={core.allHighlights}
            cursor={core.cursorState}
            fontFamily={editorConfig.fontFamily}
            fontSize={editorConfig.fontSize}
            startLineNumber={core.visibleBlockInfo.startLineNumber}
            renderer={renderer}
            wrapLayoutIndex={wrapLayoutIndex ?? undefined}
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
        aria-label="Block text editor"
      />
    </div>
  );
});

// =============================================================================
// Exports
// =============================================================================

export type { BlockTextEditorProps };
