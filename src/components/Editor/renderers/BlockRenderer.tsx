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

import { useMemo, useRef, useEffect, useEffectEvent, memo, type ReactNode, type CSSProperties } from "react";
import type { Block, LocalStyleSegment } from "../block/blockDocument";
import type { BlockCompositionState } from "../block/useBlockComposition";
import type {
  CursorState,
  HighlightRange,
  MeasureTextFn,
} from "../core/types";
import type { Token, TokenCache, TokenStyleMap, LineHighlight, RendererType } from "./types";
import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE, DEFAULT_LINE_NUMBER_WIDTH } from "./types";
import { getLineHighlights, HIGHLIGHT_COLORS, HIGHLIGHT_COLORS_RAW } from "./utils";
import { assertMeasureText } from "../core/invariant";
import {
  EDITOR_CURSOR_COLOR,
  EDITOR_LINE_NUMBER_BG,
  EDITOR_LINE_NUMBER_COLOR,
  EDITOR_LINE_NUMBER_BORDER,
  EDITOR_LINE_NUMBER_BG_RAW,
  EDITOR_LINE_NUMBER_COLOR_RAW,
  EDITOR_LINE_NUMBER_BORDER_RAW,
  EDITOR_CURSOR_COLOR_RAW,
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
  /** Renderer type: svg (default) or canvas */
  readonly renderer?: RendererType;
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
// Canvas Drawing Context
// =============================================================================

type CanvasDrawContext = {
  readonly ctx: CanvasRenderingContext2D;
  readonly lineHeight: number;
  readonly padding: number;
  readonly showLineNumbers: boolean;
  readonly lineNumberWidth: number;
  readonly tokenStyles?: TokenStyleMap;
  readonly fontFamily: string;
  readonly fontSize: number;
};

// =============================================================================
// Canvas Drawing Functions
// =============================================================================

/**
 * Parse fontSize string to number (e.g., "16px" -> 16, "1.5em" -> baseSize * 1.5)
 */
function parseFontSize(size: string | undefined, baseSize: number): number {
  if (!size) {
    return baseSize;
  }
  if (size.endsWith("px")) {
    return parseFloat(size);
  }
  if (size.endsWith("em")) {
    return parseFloat(size) * baseSize;
  }
  if (size.endsWith("%")) {
    return (parseFloat(size) / 100) * baseSize;
  }
  const num = parseFloat(size);
  return Number.isNaN(num) ? baseSize : num;
}

/**
 * Draw line number background and text.
 */
function drawCanvasLineNumber(
  context: CanvasDrawContext,
  lineNumber: number,
  y: number
): void {
  const { ctx, padding, lineHeight, lineNumberWidth, fontFamily, fontSize } = context;
  const textY = y + lineHeight * 0.75;

  // Background
  ctx.fillStyle = EDITOR_LINE_NUMBER_BG_RAW;
  ctx.fillRect(padding, y, lineNumberWidth, lineHeight);

  // Border
  ctx.strokeStyle = EDITOR_LINE_NUMBER_BORDER_RAW;
  ctx.beginPath();
  ctx.moveTo(padding + lineNumberWidth, y);
  ctx.lineTo(padding + lineNumberWidth, y + lineHeight);
  ctx.stroke();

  // Number text
  ctx.fillStyle = EDITOR_LINE_NUMBER_COLOR_RAW;
  ctx.textAlign = "right";
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillText(String(lineNumber), padding + lineNumberWidth - 8, textY);
  ctx.textAlign = "left";
}

/**
 * Draw a highlight rect.
 */
function drawCanvasHighlight(
  context: CanvasDrawContext,
  highlight: LineHighlight,
  y: number,
  startX: number,
  endX: number
): void {
  const { ctx, lineHeight } = context;
  const width = Math.max(endX - startX, MIN_HIGHLIGHT_WIDTH);

  ctx.fillStyle = HIGHLIGHT_COLORS_RAW[highlight.type];
  ctx.beginPath();
  ctx.roundRect(startX, y, width, lineHeight, 2);
  ctx.fill();

  // Draw composition underline
  if (highlight.type === "composition") {
    ctx.strokeStyle = EDITOR_CURSOR_COLOR_RAW;
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(startX, y + lineHeight - 2);
    ctx.lineTo(startX + width, y + lineHeight - 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

/**
 * Draw cursor.
 */
function drawCanvasCursor(
  context: CanvasDrawContext,
  x: number,
  y: number
): void {
  const { ctx, lineHeight } = context;
  ctx.fillStyle = EDITOR_CURSOR_COLOR_RAW;
  ctx.fillRect(x, y, 2, lineHeight);
}

/**
 * Draw a token on canvas.
 */
function drawCanvasToken(
  context: CanvasDrawContext,
  token: Token,
  x: number,
  y: number
): void {
  const { ctx, lineHeight, tokenStyles, fontFamily, fontSize } = context;
  const textY = y + lineHeight * 0.75;

  const style = tokenStyles?.[token.type];
  const color = (style?.color as string) ?? "#000000";
  const fontWeight = (style?.fontWeight as string) ?? "normal";
  const fontStyle = (style?.fontStyle as string) ?? "normal";
  const tokenFontSize = parseFontSize(style?.fontSize as string | undefined, fontSize);
  const tokenFontFamily = (style?.fontFamily as string) ?? fontFamily;

  ctx.font = `${fontStyle} ${fontWeight} ${tokenFontSize}px ${tokenFontFamily}`;
  ctx.fillStyle = color;
  ctx.fillText(token.text, x, textY);

  // Handle text decoration
  const textDecoration = style?.textDecoration as string | undefined;
  if (textDecoration === "underline" || textDecoration === "line-through") {
    const textWidth = ctx.measureText(token.text).width;
    const decorationY = textDecoration === "underline" ? textY + 2 : textY - tokenFontSize * 0.3;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, decorationY);
    ctx.lineTo(x + textWidth, decorationY);
    ctx.stroke();
  }

  // Reset font
  ctx.font = `normal normal ${fontSize}px ${fontFamily}`;
}

/**
 * Calculate token X positions for canvas.
 */
function calculateCanvasTokenPositions(
  ctx: CanvasRenderingContext2D,
  tokens: readonly Token[],
  tokenStyles: TokenStyleMap | undefined,
  baseXOffset: number,
  baseFontSize: number,
  baseFontFamily: string
): readonly number[] {
  const positions: number[] = [];
  const acc = { x: baseXOffset };

  for (const token of tokens) {
    positions.push(acc.x);

    const style = tokenStyles?.[token.type];
    const fontWeight = (style?.fontWeight as string) ?? "normal";
    const fontStyle = (style?.fontStyle as string) ?? "normal";
    const tokenFontSize = parseFontSize(style?.fontSize as string | undefined, baseFontSize);
    const tokenFontFamily = (style?.fontFamily as string) ?? baseFontFamily;

    ctx.font = `${fontStyle} ${fontWeight} ${tokenFontSize}px ${tokenFontFamily}`;
    acc.x += ctx.measureText(token.text).width;
  }

  ctx.font = `normal normal ${baseFontSize}px ${baseFontFamily}`;
  return positions;
}

/**
 * Calculate per-character cumulative positions for a token.
 * Returns array where positions[i] is the X position at the start of character i.
 */
function calculateCharacterPositions(
  ctx: CanvasRenderingContext2D,
  text: string,
  startX: number
): readonly number[] {
  const positions: number[] = [startX];
  let currentX = startX;

  for (let i = 0; i < text.length; i++) {
    const charWidth = ctx.measureText(text[i]).width;
    currentX += charWidth;
    positions.push(currentX);
  }

  return positions;
}

/**
 * Token character positions cache type.
 * charPositions[i] = X position at start of character i within the token.
 * charPositions[charPositions.length - 1] = X position at end of token.
 */
type TokenCharPositions = {
  readonly tokenStart: number; // token.start (0-based column in line)
  readonly charPositions: readonly number[]; // Per-character cumulative X positions
};

/**
 * Line token cache with per-character positions for fast column lookup.
 */
type LineTokenCacheEntry = {
  tokens: readonly Token[];
  positions: readonly number[]; // Token start X positions
  charPositionsPerToken: readonly TokenCharPositions[]; // Per-character positions
  lineText: string;
  lineEndX: number; // X position at end of line
};

/**
 * Get X position for a column using cached character positions.
 * This is O(tokens) + O(1) instead of requiring measureText calls.
 */
function getColumnXFromCachedPositions(
  cached: LineTokenCacheEntry,
  column: number,
  codeXOffset: number
): number {
  const { tokens, charPositionsPerToken, lineEndX, lineText } = cached;

  // Column is 1-based, token.start/end are 0-based
  const targetCol = column - 1;

  // Empty line
  if (tokens.length === 0 || charPositionsPerToken.length === 0) {
    // For empty lines, just return the base offset
    return codeXOffset;
  }

  // Find which token contains this column
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const charPos = charPositionsPerToken[i];

    // Before this token
    if (targetCol < token.start) {
      return charPos.charPositions[0];
    }

    // Within this token
    if (targetCol <= token.end) {
      const offsetInToken = targetCol - token.start;
      // charPositions has length = text.length + 1 (includes end position)
      if (offsetInToken < charPos.charPositions.length) {
        return charPos.charPositions[offsetInToken];
      }
      // Fallback to end of token
      return charPos.charPositions[charPos.charPositions.length - 1];
    }
  }

  // Past end of line - return end position
  return lineEndX;
}

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

/**
 * Custom comparison for BlockLine memo.
 * Compares highlights by value since they're computed per line.
 */
function blockLinePropsAreEqual(
  prev: BlockLineProps,
  next: BlockLineProps
): boolean {
  // Text content changed
  if (prev.lineText !== next.lineText) {
    return false;
  }

  // Position/style props changed
  if (
    prev.lineNumber !== next.lineNumber ||
    prev.lineIndex !== next.lineIndex ||
    prev.y !== next.y ||
    prev.xOffset !== next.xOffset ||
    prev.lineHeight !== next.lineHeight ||
    prev.showLineNumbers !== next.showLineNumbers ||
    prev.lineNumberWidth !== next.lineNumberWidth ||
    prev.fontFamily !== next.fontFamily ||
    prev.fontSize !== next.fontSize ||
    prev.localOffset !== next.localOffset
  ) {
    return false;
  }

  // Reference-based comparison for stable objects
  if (
    prev.measureText !== next.measureText ||
    prev.tokenCache !== next.tokenCache ||
    prev.tokenStyles !== next.tokenStyles
  ) {
    return false;
  }

  // Compare cursor
  if (prev.cursor !== next.cursor) {
    if (!prev.cursor || !next.cursor) {
      return false; // One is undefined
    }
    if (prev.cursor.column !== next.cursor.column ||
        prev.cursor.blinking !== next.cursor.blinking) {
      return false;
    }
  }

  // Compare highlights by value
  if (prev.highlights.length !== next.highlights.length) {
    return false;
  }
  for (let i = 0; i < prev.highlights.length; i++) {
    const ph = prev.highlights[i];
    const nh = next.highlights[i];
    if (ph.type !== nh.type ||
        ph.startColumn !== nh.startColumn ||
        ph.endColumn !== nh.endColumn) {
      return false;
    }
  }

  // Compare localStyles
  if (prev.localStyles.length !== next.localStyles.length) {
    return false;
  }
  for (let i = 0; i < prev.localStyles.length; i++) {
    const ps = prev.localStyles[i];
    const ns = next.localStyles[i];
    if (ps.start !== ns.start || ps.end !== ns.end || ps.style !== ns.style) {
      return false;
    }
  }

  return true;
}

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
}, blockLinePropsAreEqual);

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

/**
 * Check if cursor is within a block's line range.
 */
function cursorInBlock(cursor: CursorState | undefined, startLine: number, lineCount: number): boolean {
  if (!cursor?.visible) return false;
  return cursor.line >= startLine && cursor.line < startLine + lineCount;
}

/**
 * Check if any highlights overlap with a block's line range.
 */
function highlightsOverlapBlock(
  highlights: readonly HighlightRange[],
  startLine: number,
  lineCount: number
): boolean {
  const endLine = startLine + lineCount - 1;
  return highlights.some((h) => h.startLine <= endLine && h.endLine >= startLine);
}

/**
 * Custom comparison for SingleBlock memo.
 * Only re-render if:
 * - Block content or position changed
 * - Cursor moved into/out of this block, or moved within this block
 * - Highlights that overlap this block changed
 */
function singleBlockPropsAreEqual(
  prev: SingleBlockProps,
  next: SingleBlockProps
): boolean {
  // Block info changed (content, position, etc.)
  // Compare by value since info objects may be recreated
  const prevInfo = prev.info;
  const nextInfo = next.info;
  if (prevInfo.block.id !== nextInfo.block.id ||
      prevInfo.block.content !== nextInfo.block.content ||
      prevInfo.startLine !== nextInfo.startLine ||
      prevInfo.lineCount !== nextInfo.lineCount ||
      prevInfo.y !== nextInfo.y ||
      prevInfo.height !== nextInfo.height) {
    return false;
  }

  // Styling props changed
  if (
    prev.padding !== next.padding ||
    prev.lineHeight !== next.lineHeight ||
    prev.showLineNumbers !== next.showLineNumbers ||
    prev.lineNumberWidth !== next.lineNumberWidth ||
    prev.fontFamily !== next.fontFamily ||
    prev.fontSize !== next.fontSize
  ) {
    return false;
  }

  // Reference-based comparison for stable objects
  if (prev.measureText !== next.measureText ||
      prev.tokenCache !== next.tokenCache ||
      prev.tokenStyles !== next.tokenStyles) {
    return false;
  }

  const { startLine, lineCount } = prevInfo;

  // Check if cursor affects this block
  const prevCursorInBlock = cursorInBlock(prev.cursor, startLine, lineCount);
  const nextCursorInBlock = cursorInBlock(next.cursor, startLine, lineCount);

  if (prevCursorInBlock !== nextCursorInBlock) {
    // Cursor moved into or out of this block
    return false;
  }

  if (prevCursorInBlock && nextCursorInBlock) {
    // Cursor is in this block - check if position changed
    if (prev.cursor?.line !== next.cursor?.line ||
        prev.cursor?.column !== next.cursor?.column ||
        prev.cursor?.blinking !== next.cursor?.blinking) {
      return false;
    }
  }

  // Check if highlights affecting this block changed
  const prevHasHighlights = highlightsOverlapBlock(prev.highlights, startLine, lineCount);
  const nextHasHighlights = highlightsOverlapBlock(next.highlights, startLine, lineCount);

  if (prevHasHighlights !== nextHasHighlights) {
    return false;
  }

  if (prevHasHighlights && nextHasHighlights) {
    // Both have highlights - compare the actual highlights for this block
    const prevBlockHighlights = getBlockHighlights(startLine, lineCount, prev.highlights);
    const nextBlockHighlights = getBlockHighlights(startLine, lineCount, next.highlights);

    if (prevBlockHighlights.length !== nextBlockHighlights.length) {
      return false;
    }

    // Compare each highlight
    for (let i = 0; i < prevBlockHighlights.length; i++) {
      const ph = prevBlockHighlights[i];
      const nh = nextBlockHighlights[i];
      if (ph.type !== nh.type ||
          ph.startLine !== nh.startLine ||
          ph.startColumn !== nh.startColumn ||
          ph.endLine !== nh.endLine ||
          ph.endColumn !== nh.endColumn) {
        return false;
      }
    }
  }

  return true;
}

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
}, singleBlockPropsAreEqual);

// =============================================================================
// Canvas Block Renderer
// =============================================================================

type CanvasBlockRendererProps = {
  readonly blockInfos: readonly BlockRenderInfo[];
  readonly padding: number;
  readonly lineHeight: number;
  readonly showLineNumbers: boolean;
  readonly lineNumberWidth: number;
  readonly highlights: readonly HighlightRange[];
  readonly cursor?: CursorState;
  readonly tokenCache: TokenCache;
  readonly tokenStyles?: TokenStyleMap;
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly width: number;
  readonly totalHeight: number;
};

/**
 * Custom comparison for CanvasBlockRenderer memo.
 * Optimized for performance - avoids deep comparison of arrays.
 * The useEffect with requestAnimationFrame handles actual change detection.
 */
function canvasBlockRendererPropsAreEqual(
  prev: CanvasBlockRendererProps,
  next: CanvasBlockRendererProps
): boolean {
  // Compare primitive props
  if (
    prev.padding !== next.padding ||
    prev.lineHeight !== next.lineHeight ||
    prev.showLineNumbers !== next.showLineNumbers ||
    prev.lineNumberWidth !== next.lineNumberWidth ||
    prev.fontFamily !== next.fontFamily ||
    prev.fontSize !== next.fontSize ||
    prev.width !== next.width ||
    prev.totalHeight !== next.totalHeight
  ) {
    return false;
  }

  // Compare cursor by reference (cursor object is recreated on change)
  if (prev.cursor !== next.cursor) {
    return false;
  }

  // Compare highlights by reference (array is recreated on change)
  if (prev.highlights !== next.highlights) {
    return false;
  }

  // Compare blockInfos by reference
  if (prev.blockInfos !== next.blockInfos) {
    return false;
  }

  // tokenCache and tokenStyles are typically stable references
  if (prev.tokenCache !== next.tokenCache) {
    return false;
  }
  if (prev.tokenStyles !== next.tokenStyles) {
    return false;
  }

  return true;
}

const CanvasBlockRenderer = memo(function CanvasBlockRenderer({
  blockInfos,
  padding,
  lineHeight,
  showLineNumbers,
  lineNumberWidth,
  highlights,
  cursor,
  tokenCache,
  tokenStyles,
  fontFamily,
  fontSize,
  width,
  totalHeight,
}: CanvasBlockRendererProps): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafIdRef = useRef<number | null>(null);

  // Offscreen canvas for text layer (cached)
  const textCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const textCacheKeyRef = useRef<string>("");

  // Cached token positions per line (lineNumber -> LineTokenCacheEntry)
  // Includes per-character positions for fast column X lookup without measureText
  const lineTokenCacheRef = useRef<Map<number, LineTokenCacheEntry>>(new Map());

  // Generate cache key for text layer (changes when text content changes)
  const textCacheKey = useMemo(() => {
    return blockInfos.map((info) => `${info.block.id}:${info.block.content}`).join("|");
  }, [blockInfos]);

  // Draw text layer to offscreen canvas (only when text changes)
  const drawTextLayer = useEffectEvent((dpr: number) => {
    // Check if we need to redraw text layer
    if (textCacheKeyRef.current === textCacheKey && textCanvasRef.current) {
      return textCanvasRef.current;
    }

    // Clear line token cache when text changes
    lineTokenCacheRef.current.clear();

    // Create or resize offscreen canvas
    if (!textCanvasRef.current) {
      textCanvasRef.current = document.createElement("canvas");
    }
    const textCanvas = textCanvasRef.current;
    textCanvas.width = width * dpr;
    textCanvas.height = totalHeight * dpr;

    const ctx = textCanvas.getContext("2d");
    if (!ctx) {
      return null;
    }

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, totalHeight);

    const drawContext: CanvasDrawContext = {
      ctx,
      lineHeight,
      padding,
      showLineNumbers,
      lineNumberWidth,
      tokenStyles,
      fontFamily,
      fontSize,
    };

    const codeXOffset = showLineNumbers ? padding + lineNumberWidth : padding;

    // Draw each block (text and line numbers only)
    for (const info of blockInfos) {
      const { block, startLine, y: blockY } = info;
      const lines = block.content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const lineText = lines[i];
        const lineNumber = startLine + i;
        const lineY = blockY + i * lineHeight;
        const lineIndex = startLine + i - 1;

        // Draw line number
        if (showLineNumbers) {
          drawCanvasLineNumber(drawContext, lineNumber, lineY);
        }

        // Get tokens for this line
        const tokens = tokenCache.getTokens(lineText, lineIndex);

        // Calculate token positions and per-character positions
        const tokenPositions: number[] = [];
        const charPositionsPerToken: TokenCharPositions[] = [];
        let currentX = codeXOffset;

        for (const token of tokens) {
          tokenPositions.push(currentX);

          // Set font for this token
          const style = tokenStyles?.[token.type];
          const fontWeight = (style?.fontWeight as string) ?? "normal";
          const fontStyle = (style?.fontStyle as string) ?? "normal";
          const tokenFontSize = parseFontSize(style?.fontSize as string | undefined, fontSize);
          const tokenFontFamily = (style?.fontFamily as string) ?? fontFamily;
          ctx.font = `${fontStyle} ${fontWeight} ${tokenFontSize}px ${tokenFontFamily}`;

          // Calculate per-character positions for this token
          const charPositions = calculateCharacterPositions(ctx, token.text, currentX);
          charPositionsPerToken.push({
            tokenStart: token.start,
            charPositions,
          });

          // Update currentX to end of token
          currentX = charPositions[charPositions.length - 1];
        }

        // Calculate line end X (for cursor at end of line)
        const lineEndX = tokens.length > 0 ? currentX : codeXOffset;

        // Cache tokens and positions for overlay drawing
        lineTokenCacheRef.current.set(lineNumber, {
          tokens,
          positions: tokenPositions,
          charPositionsPerToken,
          lineText,
          lineEndX,
        });

        // Draw tokens
        for (let j = 0; j < tokens.length; j++) {
          drawCanvasToken(drawContext, tokens[j], tokenPositions[j], lineY);
        }
      }
    }

    // Reset scale for future use
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    textCacheKeyRef.current = textCacheKey;

    return textCanvas;
  });

  // Helper to get column X position using cached per-character positions
  // This is now O(tokens) instead of requiring measureText calls
  const getColumnXFromCache = (
    lineNumber: number,
    column: number,
    codeXOffset: number
  ): number => {
    const cached = lineTokenCacheRef.current.get(lineNumber);
    if (!cached) {
      // Fallback: rough estimate based on font size
      return codeXOffset + (column - 1) * fontSize * 0.6;
    }

    return getColumnXFromCachedPositions(cached, column, codeXOffset);
  };

  // Draw overlay (highlights and cursor) - runs every frame when needed
  const drawOverlay = useEffectEvent((
    ctx: CanvasRenderingContext2D,
    textCanvas: HTMLCanvasElement,
    dpr: number
  ) => {
    // Clear canvas
    ctx.clearRect(0, 0, width * dpr, totalHeight * dpr);

    // Scale for drawing
    ctx.save();
    ctx.scale(dpr, dpr);

    const drawContext: CanvasDrawContext = {
      ctx,
      lineHeight,
      padding,
      showLineNumbers,
      lineNumberWidth,
      tokenStyles,
      fontFamily,
      fontSize,
    };

    const codeXOffset = showLineNumbers ? padding + lineNumberWidth : padding;

    // First pass: Draw highlights (behind text) - uses cached token positions
    for (const info of blockInfos) {
      const { block, startLine, y: blockY } = info;
      const lines = block.content.split("\n");
      const blockHighlights = getBlockHighlights(startLine, lines.length, highlights);

      for (let i = 0; i < lines.length; i++) {
        const lineNumber = startLine + i;
        const lineY = blockY + i * lineHeight;
        const lineText = lines[i];

        const lineHighlights = getLineHighlights(lineNumber, lineText.length, blockHighlights);
        for (const h of lineHighlights) {
          const startX = getColumnXFromCache(lineNumber, h.startColumn, codeXOffset);
          const endX = getColumnXFromCache(lineNumber, h.endColumn, codeXOffset);
          drawCanvasHighlight(drawContext, h, lineY, startX, endX);
        }
      }
    }

    ctx.restore();

    // Draw text layer on top of highlights
    ctx.drawImage(textCanvas, 0, 0);

    // Second pass: Draw cursor (on top of text) - uses cached token positions
    if (cursor?.visible) {
      ctx.save();
      ctx.scale(dpr, dpr);

      // Find cursor line Y position
      for (const info of blockInfos) {
        const { startLine, y: blockY, lineCount } = info;
        if (cursor.line >= startLine && cursor.line < startLine + lineCount) {
          const lineOffset = cursor.line - startLine;
          const lineY = blockY + lineOffset * lineHeight;
          const cursorX = getColumnXFromCache(cursor.line, cursor.column, codeXOffset);
          drawCanvasCursor(drawContext, cursorX, lineY);
          break;
        }
      }

      ctx.restore();
    }
  });

  // Main draw function
  const draw = useEffectEvent(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;

    // Resize canvas if needed
    if (canvas.width !== width * dpr || canvas.height !== totalHeight * dpr) {
      canvas.width = width * dpr;
      canvas.height = totalHeight * dpr;
    }

    // Draw text layer (cached)
    const textCanvas = drawTextLayer(dpr);
    if (!textCanvas) {
      return;
    }

    // Draw overlay (highlights + cursor)
    drawOverlay(ctx, textCanvas, dpr);
  });

  // Redraw when dependencies change, throttled via requestAnimationFrame
  useEffect(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      draw();
    });

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [
    blockInfos,
    highlights,
    cursor,
    tokenCache,
    tokenStyles,
    width,
    totalHeight,
    textCacheKey,
  ]);

  // Cleanup offscreen canvas on unmount
  useEffect(() => {
    return () => {
      textCanvasRef.current = null;
      textCacheKeyRef.current = "";
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width,
        height: totalHeight,
      }}
    />
  );
}, canvasBlockRendererPropsAreEqual);

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
  renderer = "svg",
}: BlockRendererProps): ReactNode {
  // Require measureText (for SVG; Canvas uses ctx.measureText)
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

  // Default width for canvas
  const canvasWidth = width ?? 800;

  const renderContent = (): ReactNode => {
    if (renderer === "canvas") {
      return (
        <CanvasBlockRenderer
          blockInfos={blockInfos}
          padding={padding}
          lineHeight={lineHeight}
          showLineNumbers={showLineNumbers}
          lineNumberWidth={lineNumberWidth}
          highlights={highlights}
          cursor={cursor}
          tokenCache={tokenCache}
          tokenStyles={tokenStyles}
          fontFamily={fontFamily}
          fontSize={fontSize}
          width={canvasWidth}
          totalHeight={totalHeight}
        />
      );
    }
    return (
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
    );
  };

  return (
    <div style={blockContainerStyle}>
      {topSpacerHeight > 0 && <div style={{ height: topSpacerHeight }} />}
      {renderContent()}
      {bottomSpacerHeight > 0 && <div style={{ height: bottomSpacerHeight }} />}
    </div>
  );
});

// =============================================================================
// Exports
// =============================================================================

export type { BlockRenderInfo };
