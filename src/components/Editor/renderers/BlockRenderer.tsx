/**
 * @file Block-Based Renderer
 *
 * Renders a BlockDocument with block-level awareness.
 * Each block is rendered as a logical unit, enabling:
 * - Block-level virtual scrolling
 * - Block-scoped highlighting
 * - Block-local style application
 *
 * @example
 * ```tsx
 * <BlockRenderer
 *   blocks={document.blocks}
 *   visibleRange={virtualScroll.visibleBlockRange}
 *   lineHeight={21}
 *   padding={8}
 *   highlights={allHighlights}
 *   cursor={cursorState}
 * />
 * ```
 */

import { useMemo, memo, type ReactNode, type CSSProperties } from "react";
import type { Block, LocalStyleSegment } from "../block/blockDocument";
import type { BlockCompositionState } from "../block/useBlockComposition";
import type {
  CursorState,
  HighlightRange,
  MeasureTextFn,
} from "../core/types";
import type { Token, TokenCache, TokenStyleMap, LineHighlight } from "./types";
import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE, DEFAULT_LINE_NUMBER_WIDTH } from "./types";
import { getLineHighlights, HIGHLIGHT_COLORS } from "./utils";
import { assertMeasureText } from "../core/invariant";
import {
  EDITOR_CURSOR_COLOR,
  EDITOR_LINE_NUMBER_BG,
  EDITOR_LINE_NUMBER_COLOR,
  EDITOR_LINE_NUMBER_BORDER,
} from "../styles/tokens";

// =============================================================================
// Types
// =============================================================================

export type BlockRendererProps = {
  /** Blocks to render */
  readonly blocks: readonly Block[];
  /** Range of blocks to render (0-based, end is exclusive) */
  readonly visibleRange: { readonly start: number; readonly end: number };
  /** Height of spacer above visible blocks */
  readonly topSpacerHeight: number;
  /** Height of spacer below visible blocks */
  readonly bottomSpacerHeight: number;
  /** Token cache for syntax highlighting */
  readonly tokenCache: TokenCache;
  /** Line height in pixels */
  readonly lineHeight: number;
  /** Padding in pixels */
  readonly padding: number;
  /** Container width */
  readonly width?: number;
  /** Function to measure text width */
  readonly measureText?: MeasureTextFn;
  /** Show line numbers */
  readonly showLineNumbers?: boolean;
  /** Line number gutter width in pixels */
  readonly lineNumberWidth?: number;
  /** Highlight ranges (selection, composition, search matches) */
  readonly highlights?: readonly HighlightRange[];
  /** Cursor state */
  readonly cursor?: CursorState;
  /** Token style map for syntax highlighting */
  readonly tokenStyles?: TokenStyleMap;
  /** Font family */
  readonly fontFamily?: string;
  /** Font size in pixels */
  readonly fontSize?: number;
  /** Block composition state */
  readonly composition?: BlockCompositionState;
  /** Starting line number for first visible block */
  readonly startLineNumber?: number;
};

/**
 * Block render info with computed properties.
 */
type BlockRenderInfo = {
  readonly block: Block;
  readonly blockIndex: number;
  readonly startLine: number;
  readonly lineCount: number;
  readonly y: number;
  readonly height: number;
};

// =============================================================================
// Constants
// =============================================================================

const MIN_HIGHLIGHT_WIDTH = 8;

// =============================================================================
// Style-Aware Position Calculation
// =============================================================================

/**
 * Parse font size to ratio relative to base size.
 * Handles both string ("16px", "1.2em", "120%") and number (16) values.
 */
function parseFontSizeRatio(size: string | number, baseSize: number): number {
  if (typeof size === "number") {
    return size / baseSize;
  }
  if (size.endsWith("px")) {
    return parseFloat(size) / baseSize;
  }
  if (size.endsWith("em")) {
    return parseFloat(size);
  }
  if (size.endsWith("%")) {
    return parseFloat(size) / 100;
  }
  const num = parseFloat(size);
  return Number.isNaN(num) ? 1 : num / baseSize;
}

/**
 * Calculate token X positions considering individual token styles.
 * Returns array of X positions for each token.
 */
function calculateTokenPositions(
  tokens: readonly Token[],
  tokenStyles: TokenStyleMap | undefined,
  baseXOffset: number,
  baseFontSize: number,
  measureText: (text: string) => number
): readonly number[] {
  const positions: number[] = [];
  const acc = { x: baseXOffset };

  for (const token of tokens) {
    positions.push(acc.x);

    // Calculate token width using actual text measurement
    const style = tokenStyles?.[token.type];
    const tokenFontSize = style?.fontSize;

    // If token has custom font size, apply font size ratio
    const fontSizeRatio = tokenFontSize ? parseFontSizeRatio(tokenFontSize, baseFontSize) : 1;

    // Measure actual text width (handles CJK correctly)
    const baseWidth = measureText(token.text);
    const tokenWidth = baseWidth * fontSizeRatio;
    acc.x += tokenWidth;
  }

  return positions;
}

// =============================================================================
// Styles
// =============================================================================

const blockContainerStyle: CSSProperties = {
  position: "relative",
  minHeight: "100%",
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Compute block render info for visible blocks.
 */
function computeBlockRenderInfo(
  blocks: readonly Block[],
  visibleRange: { start: number; end: number },
  lineHeight: number,
  startLineNumber: number
): readonly BlockRenderInfo[] {
  const result: BlockRenderInfo[] = [];
  const state = { currentLine: startLineNumber, y: 0 };

  // Calculate starting position by accumulating heights of blocks before visible range
  for (let i = 0; i < visibleRange.start; i++) {
    const block = blocks[i];
    const lineCount = block.content.split("\n").length;
    state.currentLine += lineCount;
    state.y += lineCount * lineHeight;
  }

  // Compute info for visible blocks
  for (let i = visibleRange.start; i < visibleRange.end && i < blocks.length; i++) {
    const block = blocks[i];
    const lineCount = block.content.split("\n").length;
    const height = lineCount * lineHeight;

    result.push({
      block,
      blockIndex: i,
      startLine: state.currentLine,
      lineCount,
      y: state.y,
      height,
    });

    state.currentLine += lineCount;
    state.y += height;
  }

  return result;
}

/**
 * Get highlights that apply to a specific block.
 */
function getBlockHighlights(
  blockStartLine: number,
  blockLineCount: number,
  highlights: readonly HighlightRange[]
): readonly HighlightRange[] {
  const blockEndLine = blockStartLine + blockLineCount - 1;

  return highlights.filter((h) => {
    // Highlight overlaps with this block
    return h.startLine <= blockEndLine && h.endLine >= blockStartLine;
  });
}

// =============================================================================
// Block Line Component
// =============================================================================

type BlockLineProps = {
  readonly lineText: string;
  readonly lineNumber: number;
  readonly lineIndex: number;
  readonly y: number;
  readonly xOffset: number;
  readonly lineHeight: number;
  readonly showLineNumbers: boolean;
  readonly lineNumberWidth: number;
  readonly highlights: readonly LineHighlight[];
  readonly cursor?: { column: number; blinking: boolean };
  readonly measureText: MeasureTextFn;
  readonly tokenCache: TokenCache;
  readonly tokenStyles?: TokenStyleMap;
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly localStyles: readonly LocalStyleSegment[];
  readonly localOffset: number;
};

const BlockLine = memo(function BlockLine(props: BlockLineProps): ReactNode {
  const {
    lineText,
    lineNumber,
    lineIndex,
    y,
    xOffset,
    lineHeight,
    showLineNumbers,
    lineNumberWidth,
    highlights,
    cursor,
    measureText,
    tokenCache,
    tokenStyles,
    fontFamily,
    fontSize,
    // localStyles and localOffset are passed for future styled text rendering
  } = props;

  // Calculate code X offset (after line numbers if shown)
  const codeXOffset = showLineNumbers ? xOffset + lineNumberWidth : xOffset;
  const textY = y + lineHeight * 0.75;

  // Get tokens for this line
  const tokens = tokenCache.getTokens(lineText, lineIndex);

  // Calculate token positions using style-aware measurement
  const tokenPositions = useMemo(
    () => calculateTokenPositions(tokens, tokenStyles, codeXOffset, fontSize, measureText),
    [tokens, tokenStyles, codeXOffset, fontSize, measureText]
  );

  // Get X position for any column using style-aware calculation
  const getStyledColumnX = (col: number): number => {
    // Use token positions for accurate positioning with variable font styles
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (col <= token.start + 1) {
        return tokenPositions[i];
      }
      if (col <= token.end + 1) {
        // Position is within this token - measure actual text width
        const charOffset = col - token.start - 1;
        const textWithinToken = token.text.slice(0, charOffset);

        // Measure actual text width (handles CJK characters correctly)
        const widthWithinToken = measureText(textWithinToken);

        // Apply font size ratio if token has custom font size
        const style = tokenStyles?.[token.type];
        const tokenFontSize = style?.fontSize;
        const fontSizeRatio = tokenFontSize ? parseFontSizeRatio(tokenFontSize, fontSize) : 1;

        return tokenPositions[i] + widthWithinToken * fontSizeRatio;
      }
    }
    // Position is at or past end of line
    if (tokens.length > 0) {
      const lastIdx = tokens.length - 1;
      const lastToken = tokens[lastIdx];
      const style = tokenStyles?.[lastToken.type];
      const tokenFontSize = style?.fontSize;
      const fontSizeRatio = tokenFontSize ? parseFontSizeRatio(tokenFontSize, fontSize) : 1;
      const baseWidth = measureText(lastToken.text);
      return tokenPositions[lastIdx] + baseWidth * fontSizeRatio;
    }
    // Empty line - use measureText for cursor position
    return codeXOffset + measureText(lineText.slice(0, col - 1));
  };

  // Render line number
  const renderLineNumber = (): ReactNode => {
    if (!showLineNumbers) {
      return null;
    }
    return (
      <>
        <rect
          x={xOffset}
          y={y}
          width={lineNumberWidth}
          height={lineHeight}
          fill={EDITOR_LINE_NUMBER_BG}
        />
        <text
          x={xOffset + lineNumberWidth - 8}
          y={textY}
          fontFamily={fontFamily}
          fontSize={fontSize}
          fill={EDITOR_LINE_NUMBER_COLOR}
          textAnchor="end"
        >
          {lineNumber}
        </text>
        <line
          x1={xOffset + lineNumberWidth}
          y1={y}
          x2={xOffset + lineNumberWidth}
          y2={y + lineHeight}
          stroke={EDITOR_LINE_NUMBER_BORDER}
        />
      </>
    );
  };

  // Render highlights
  const renderHighlights = (): ReactNode => {
    return highlights.map((h, i) => {
      const startX = getStyledColumnX(h.startColumn);
      const endX = getStyledColumnX(h.endColumn);
      const width = Math.max(endX - startX, MIN_HIGHLIGHT_WIDTH);

      if (h.type === "composition") {
        return (
          <g key={i}>
            <rect
              x={startX}
              y={y}
              width={width}
              height={lineHeight}
              fill={HIGHLIGHT_COLORS[h.type]}
              rx={2}
            />
            <line
              x1={startX}
              y1={y + lineHeight - 2}
              x2={startX + width}
              y2={y + lineHeight - 2}
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray="2,2"
            />
          </g>
        );
      }

      return (
        <rect
          key={i}
          x={startX}
          y={y}
          width={width}
          height={lineHeight}
          fill={HIGHLIGHT_COLORS[h.type]}
          rx={2}
        />
      );
    });
  };

  // Render tokens with styles
  const renderTokens = (): ReactNode => {
    if (tokens.length === 0) {
      return <tspan fill="transparent">{"\u00A0"}</tspan>;
    }

    return tokens.map((token, i) => {
      const style = tokenStyles?.[token.type];
      const fill = (style?.color as string) ?? "inherit";
      const fontWeight = style?.fontWeight as string | undefined;
      const fontStyle = style?.fontStyle as string | undefined;
      const textDecoration = style?.textDecoration as string | undefined;
      const tokenFontSize = style?.fontSize as string | undefined;
      const tokenFontFamily = style?.fontFamily as string | undefined;

      return (
        <tspan
          key={i}
          x={tokenPositions[i]}
          fill={fill}
          fontWeight={fontWeight}
          fontStyle={fontStyle}
          textDecoration={textDecoration}
          fontSize={tokenFontSize}
          fontFamily={tokenFontFamily}
        >
          {token.text}
        </tspan>
      );
    });
  };

  // Render cursor
  const renderCursor = (): ReactNode => {
    if (!cursor) {
      return null;
    }

    const cursorX = getStyledColumnX(cursor.column);

    return (
      <rect
        x={cursorX}
        y={y}
        width={2}
        height={lineHeight}
        fill={EDITOR_CURSOR_COLOR}
        style={{
          animation: cursor.blinking ? "rei-editor-cursor-blink 1s step-end infinite" : "none",
        }}
      />
    );
  };

  return (
    <g>
      {renderLineNumber()}
      {renderHighlights()}
      <text x={codeXOffset} y={textY} fontFamily={fontFamily} fontSize={fontSize}>
        {renderTokens()}
      </text>
      {renderCursor()}
    </g>
  );
});

// =============================================================================
// Single Block Component
// =============================================================================

type SingleBlockProps = {
  readonly info: BlockRenderInfo;
  readonly padding: number;
  readonly lineHeight: number;
  readonly showLineNumbers: boolean;
  readonly lineNumberWidth: number;
  readonly highlights: readonly HighlightRange[];
  readonly cursor?: CursorState;
  readonly measureText: MeasureTextFn;
  readonly tokenCache: TokenCache;
  readonly tokenStyles?: TokenStyleMap;
  readonly fontFamily: string;
  readonly fontSize: number;
};

const SingleBlock = memo(function SingleBlock({
  info,
  padding,
  lineHeight,
  showLineNumbers,
  lineNumberWidth,
  highlights,
  cursor,
  measureText,
  tokenCache,
  tokenStyles,
  fontFamily,
  fontSize,
}: SingleBlockProps): ReactNode {
  const { block, startLine, lineCount, y } = info;

  // Split block content into lines
  const lines = useMemo(() => block.content.split("\n"), [block.content]);

  // Get block-specific highlights
  const blockHighlights = useMemo(
    () => getBlockHighlights(startLine, lineCount, highlights),
    [startLine, lineCount, highlights]
  );

  // Calculate local offsets for each line within the block
  const lineLocalOffsets = useMemo(() => {
    const offsets: number[] = [0];
    for (let i = 0; i < lines.length - 1; i++) {
      offsets.push(offsets[i] + lines[i].length + 1);
    }
    return offsets;
  }, [lines]);

  // Render lines within this block
  const renderLines = (): ReactNode => {
    return lines.map((lineText, i) => {
      const lineNumber = startLine + i;
      const lineY = y + i * lineHeight;
      const localOffset = lineLocalOffsets[i];

      // Get highlights for this line
      const lineHighlights = getLineHighlights(lineNumber, lineText.length, blockHighlights);

      // Check if cursor is on this line
      const getLineCursor = (): { column: number; blinking: boolean } | undefined => {
        if (!cursor?.visible || cursor.line !== lineNumber) {
          return undefined;
        }
        return { column: cursor.column, blinking: cursor.blinking };
      };
      const lineCursor = getLineCursor();

      // Get styles that apply to this line
      const lineStyles = block.styles.filter((s) => {
        const lineEnd = localOffset + lineText.length;
        return s.start < lineEnd && s.end > localOffset;
      });

      return (
        <BlockLine
          key={i}
          lineText={lineText}
          lineNumber={lineNumber}
          lineIndex={startLine + i - 1}
          y={lineY}
          xOffset={padding}
          lineHeight={lineHeight}
          showLineNumbers={showLineNumbers}
          lineNumberWidth={lineNumberWidth}
          highlights={lineHighlights}
          cursor={lineCursor}
          measureText={measureText}
          tokenCache={tokenCache}
          tokenStyles={tokenStyles}
          fontFamily={fontFamily}
          fontSize={fontSize}
          localStyles={lineStyles}
          localOffset={localOffset}
        />
      );
    });
  };

  return <g data-block-id={block.id}>{renderLines()}</g>;
});

// =============================================================================
// Main Component
// =============================================================================

/**
 * Block-based renderer for BlockDocument.
 *
 * Renders blocks as logical units, enabling block-level operations
 * and optimizations while maintaining compatibility with existing
 * line-based virtual scrolling.
 */
export const BlockRenderer = memo(function BlockRenderer({
  blocks,
  visibleRange,
  topSpacerHeight,
  bottomSpacerHeight,
  tokenCache,
  lineHeight,
  padding,
  width,
  measureText: measureTextProp,
  showLineNumbers = false,
  lineNumberWidth = DEFAULT_LINE_NUMBER_WIDTH,
  highlights = [],
  cursor,
  tokenStyles,
  fontFamily = DEFAULT_FONT_FAMILY,
  fontSize = DEFAULT_FONT_SIZE,
  startLineNumber = 1,
}: BlockRendererProps): ReactNode {
  // Require measureText
  const measureText = assertMeasureText(measureTextProp, "BlockRenderer");

  // Compute render info for visible blocks
  const blockInfos = useMemo(
    () => computeBlockRenderInfo(blocks, visibleRange, lineHeight, startLineNumber),
    [blocks, visibleRange, lineHeight, startLineNumber]
  );

  // Calculate total height of visible area
  const totalHeight = useMemo(() => {
    return blockInfos.reduce((sum, info) => sum + info.height, 0);
  }, [blockInfos]);

  return (
    <div style={blockContainerStyle}>
      {topSpacerHeight > 0 && <div style={{ height: topSpacerHeight }} />}

      <svg
        width={width ?? "100%"}
        height={totalHeight}
        style={{ display: "block", overflow: "visible" }}
      >
        {blockInfos.map((info) => (
          <SingleBlock
            key={info.block.id}
            info={info}
            padding={padding}
            lineHeight={lineHeight}
            showLineNumbers={showLineNumbers}
            lineNumberWidth={lineNumberWidth}
            highlights={highlights}
            cursor={cursor}
            measureText={measureText}
            tokenCache={tokenCache}
            tokenStyles={tokenStyles}
            fontFamily={fontFamily}
            fontSize={fontSize}
          />
        ))}
      </svg>

      {bottomSpacerHeight > 0 && <div style={{ height: bottomSpacerHeight }} />}
    </div>
  );
});

// =============================================================================
// Exports
// =============================================================================

export type { BlockRenderInfo };
