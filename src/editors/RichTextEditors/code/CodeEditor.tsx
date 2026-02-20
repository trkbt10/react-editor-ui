/**
 * @file Code Editor Component
 *
 * Code editor with syntax highlighting.
 * Uses block-based architecture for stable IME handling and efficient editing.
 */

import { useMemo, memo, type ReactNode } from "react";
import type { CodeEditorProps } from "./types";
import { DEFAULT_EDITOR_CONFIG } from "../core/types";
import { getBlockDocumentText } from "../block/blockDocument";
import { useBlockEditorCore, type GetOffsetFromPositionFn } from "../core/useBlockEditorCore";
import { useFontMetrics } from "../font/useFontMetrics";
import { useLineIndex } from "../font/useLineIndex";
import { coordinatesToPosition } from "../font/coordinates";
import { assertMeasureText } from "../core/invariant";
import { useEditorStyles } from "../styles/useEditorStyles";
import { useTokenCache } from "./useTokenCache";
import { BlockRenderer } from "../renderers/BlockRenderer";
import { EDITOR_DEFAULTS } from "../styles/tokens";

// =============================================================================
// Component
// =============================================================================

/**
 * Code Editor component with syntax highlighting.
 *
 * Features:
 * - Syntax highlighting via external tokenizer
 * - Undo/redo with debounced history
 * - IME composition support (block-based for stability)
 * - Virtual scrolling for large files
 * - Selection and cursor rendering
 *
 * @example
 * ```tsx
 * import { createBlockDocument } from "react-editor-ui/editors/RichTextEditors";
 *
 * const [doc, setDoc] = useState(() => createBlockDocument(code));
 *
 * const myTokenizer: Tokenizer = {
 *   tokenize: (line) => {
 *     // Your tokenization logic
 *     return [{ type: 'text', text: line, start: 0, end: line.length }];
 *   }
 * };
 *
 * <CodeEditor
 *   document={doc}
 *   onDocumentChange={setDoc}
 *   tokenizer={myTokenizer}
 *   tokenStyles={{
 *     keyword: { color: '#0000ff' },
 *     string: { color: '#a31515' },
 *   }}
 * />
 * ```
 */
export const CodeEditor = memo(function CodeEditor({
  document: blockDocument,
  onDocumentChange,
  tokenizer,
  tokenStyles,
  renderer = "svg",
  config,
  style,
  readOnly = false,
  showLineNumbers = true,
  highlights = [],
  onCursorChange,
  onSelectionChange,
  tabSize = 4,
  viewportConfig,
}: CodeEditorProps): ReactNode {
  // Merge config with defaults
  const editorConfig = { ...DEFAULT_EDITOR_CONFIG, ...config };

  // Font metrics ref (needs containerRef, initialized after useBlockEditorCore)
  const fontMetricsRef = useMemo(() => ({ current: null as ReturnType<typeof useFontMetrics> | null }), []);

  // Get text value for line index
  const textValue = useMemo(() => getBlockDocumentText(blockDocument), [blockDocument]);
  const lineIndex = useLineIndex(textValue);

  // Position calculation function for this editor type
  const getOffsetFromPosition: GetOffsetFromPositionFn = useMemo(() => {
    return (x, y, scrollTop, lineCount, lineHeight) => {
      const metrics = fontMetricsRef.current;

      // Require measureText - throw if not ready
      const measureText = assertMeasureText(metrics?.measureText, "CodeEditor.getOffsetFromPosition");

      const position = coordinatesToPosition({
        x: x - (showLineNumbers ? EDITOR_DEFAULTS.LINE_NUMBER_WIDTH_PX : 0),
        y,
        lines: lineIndex.lines,
        scrollTop,
        lineHeight,
        paddingLeft: EDITOR_DEFAULTS.PADDING_PX,
        paddingTop: EDITOR_DEFAULTS.PADDING_PX,
        measureText,
      });

      return lineIndex.getOffsetAtLineColumn(position.line, position.column);
    };
  }, [editorConfig.lineHeight, showLineNumbers, fontMetricsRef, lineIndex]);

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

  // Initialize font metrics with containerRef
  const fontMetrics = useFontMetrics(core.containerRef);
  fontMetricsRef.current = fontMetrics;

  // Token cache
  const tokenCache = useTokenCache(tokenizer);

  // Editor styles
  const editorStyles = useEditorStyles({
    lineHeight: editorConfig.lineHeight,
    fontSize: editorConfig.fontSize,
    showLineNumbers,
    lineNumberWidth: EDITOR_DEFAULTS.LINE_NUMBER_WIDTH_PX,
    padding: EDITOR_DEFAULTS.PADDING_PX,
  });

  // Combine highlights with external highlights
  const allHighlights = useMemo(() => {
    return [...core.allHighlights, ...highlights];
  }, [core.allHighlights, highlights]);

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
            padding={EDITOR_DEFAULTS.PADDING_PX}
            measureText={fontMetrics.measureText}
            showLineNumbers={showLineNumbers}
            lineNumberWidth={EDITOR_DEFAULTS.LINE_NUMBER_WIDTH_PX}
            highlights={allHighlights}
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
        aria-label="Code editor"
      />
    </div>
  );
});
