/**
 * @file Canvas Code Renderer
 *
 * Unified renderer that handles:
 * - Line numbers
 * - Syntax-highlighted code
 * - Selection highlights
 * - Search match highlights
 * - Cursor
 *
 * Renders using Canvas 2D API for high-performance scenarios.
 */

import { useRef, useEffect, useMemo, memo, type ReactNode, type CSSProperties } from "react";
import type {
  RendererProps,
  Token,
  LineHighlight,
  TokenStyleMap,
} from "./types";
import { DEFAULT_LINE_NUMBER_WIDTH, DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE } from "./types";
import { getLineHighlights, HIGHLIGHT_COLORS_RAW } from "./utils";

// =============================================================================
// Constants
// =============================================================================

/** Line number background color (raw value for canvas) */
const LINE_NUMBER_BG = "#f8f9fa";

/** Line number text color (raw value for canvas) */
const LINE_NUMBER_COLOR = "#9aa0a6";

/** Line number border color (raw value for canvas) */
const LINE_NUMBER_BORDER = "rgba(0, 0, 0, 0.08)";

/** Cursor color (raw value for canvas) */
const CURSOR_COLOR = "#000000";

/** Minimum highlight width (for empty selections) */
const MIN_HIGHLIGHT_WIDTH = 8;

// =============================================================================
// Canvas Drawing Context
// =============================================================================

type DrawContext = {
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
// Canvas Drawing Utilities
// =============================================================================

/**
 * Draw line number background and text.
 */
function drawLineNumber(
  context: DrawContext,
  lineNumber: number,
  lineIndex: number
): void {
  const { ctx, padding, lineHeight, lineNumberWidth, fontFamily, fontSize } = context;
  const y = lineIndex * lineHeight;
  const textY = y + lineHeight * 0.75;

  // Background
  ctx.fillStyle = LINE_NUMBER_BG;
  ctx.fillRect(padding, y, lineNumberWidth, lineHeight);

  // Border
  ctx.strokeStyle = LINE_NUMBER_BORDER;
  ctx.beginPath();
  ctx.moveTo(padding + lineNumberWidth, y);
  ctx.lineTo(padding + lineNumberWidth, y + lineHeight);
  ctx.stroke();

  // Number text
  ctx.fillStyle = LINE_NUMBER_COLOR;
  ctx.textAlign = "right";
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillText(String(lineNumber), padding + lineNumberWidth - 8, textY);
  ctx.textAlign = "left"; // Reset
}

/**
 * Draw a highlight rect using pre-computed X positions.
 */
function drawHighlight(
  context: DrawContext,
  highlight: LineHighlight,
  lineIndex: number,
  startX: number,
  endX: number
): void {
  const { ctx, lineHeight } = context;
  const y = lineIndex * lineHeight;

  const width = Math.max(endX - startX, MIN_HIGHLIGHT_WIDTH);

  ctx.fillStyle = HIGHLIGHT_COLORS_RAW[highlight.type];

  // Draw rounded rect
  const radius = 2;
  ctx.beginPath();
  ctx.roundRect(startX, y, width, lineHeight, radius);
  ctx.fill();
}

/**
 * Draw cursor at pre-computed X position.
 */
function drawCursor(
  context: DrawContext,
  x: number,
  lineIndex: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Reserved for future animation
  _blinking: boolean
): void {
  const { ctx, lineHeight } = context;
  const y = lineIndex * lineHeight;

  // Note: Canvas doesn't support CSS animations, so blinking must be handled
  // via JavaScript intervals. For now, we draw the cursor statically.
  // The blinking parameter is reserved for future animation implementation.

  ctx.fillStyle = CURSOR_COLOR;
  ctx.fillRect(x, y, 2, lineHeight);
}

/**
 * Get X position for a column using token positions (style-aware).
 * Uses actual text measurement for accurate CJK character positioning.
 *
 * @throws Error if ctx or fontFamily is not provided (no silent fallback)
 */
function getStyledColumnX(
  column: number,
  tokens: readonly Token[],
  tokenPositions: readonly number[],
  tokenStyles: TokenStyleMap | undefined,
  fontSize: number,
  codeXOffset: number,
  ctx: CanvasRenderingContext2D,
  fontFamily: string,
  lineText: string
): number {
  // Use token positions for accurate positioning with variable font styles
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (column <= token.start + 1) {
      return tokenPositions[i];
    }
    if (column <= token.end + 1) {
      // Position is within this token - measure actual text width
      const charOffset = column - token.start - 1;
      const textWithinToken = token.text.slice(0, charOffset);

      // Get token style for font configuration
      const style = tokenStyles?.[token.type];
      const tokenFontSize = parseFontSize(style?.fontSize as string | undefined, fontSize);

      // Set font for accurate measurement
      const tokenFontWeight = (style?.fontWeight as string) ?? "normal";
      const tokenFontStyle = (style?.fontStyle as string) ?? "normal";
      const tokenFontFamily = (style?.fontFamily as string) ?? fontFamily;
      ctx.font = `${tokenFontStyle} ${tokenFontWeight} ${tokenFontSize}px ${tokenFontFamily}`;
      const widthWithinToken = ctx.measureText(textWithinToken).width;

      return tokenPositions[i] + widthWithinToken;
    }
  }
  // Position is at or past end of line
  if (tokens.length > 0 && tokenPositions.length > 0) {
    const lastIdx = tokens.length - 1;
    const lastToken = tokens[lastIdx];
    const style = tokenStyles?.[lastToken.type];
    const tokenFontSize = parseFontSize(style?.fontSize as string | undefined, fontSize);
    const tokenFontWeight = (style?.fontWeight as string) ?? "normal";
    const tokenFontStyle = (style?.fontStyle as string) ?? "normal";
    const tokenFontFamily = (style?.fontFamily as string) ?? fontFamily;
    ctx.font = `${tokenFontStyle} ${tokenFontWeight} ${tokenFontSize}px ${tokenFontFamily}`;
    const lastTokenWidth = ctx.measureText(lastToken.text).width;
    return tokenPositions[lastIdx] + lastTokenWidth;
  }
  // Empty line - measure text before cursor
  ctx.font = `normal normal ${fontSize}px ${fontFamily}`;
  return codeXOffset + ctx.measureText(lineText.slice(0, column - 1)).width;
}

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
  // Try parsing as number
  const num = parseFloat(size);
  return Number.isNaN(num) ? baseSize : num;
}

/**
 * Calculate token X positions considering individual token styles.
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

    // Set font for this token to measure width correctly
    const style = tokenStyles?.[token.type];
    const tokenFontWeight = (style?.fontWeight as string) ?? "normal";
    const tokenFontStyle = (style?.fontStyle as string) ?? "normal";
    const tokenFontSize = parseFontSize(style?.fontSize as string | undefined, baseFontSize);
    const tokenFontFamily = (style?.fontFamily as string) ?? baseFontFamily;

    ctx.font = `${tokenFontStyle} ${tokenFontWeight} ${tokenFontSize}px ${tokenFontFamily}`;
    const tokenWidth = ctx.measureText(token.text).width;
    acc.x += tokenWidth;
  }

  // Reset font
  ctx.font = `normal normal ${baseFontSize}px ${baseFontFamily}`;

  return positions;
}

/**
 * Draw a single token on the canvas at a specific X position.
 */
function drawToken(
  context: DrawContext,
  token: Token,
  lineIndex: number,
  x: number
): void {
  const { ctx, lineHeight, tokenStyles, fontFamily, fontSize } = context;
  const y = lineIndex * lineHeight + lineHeight * 0.75;

  // Get style from token styles
  const style = tokenStyles?.[token.type];
  const color = (style?.color as string) ?? "#000000";
  const tokenFontWeight = (style?.fontWeight as string) ?? "normal";
  const tokenFontStyle = (style?.fontStyle as string) ?? "normal";
  const tokenFontSize = parseFontSize(style?.fontSize as string | undefined, fontSize);
  const tokenFontFamily = (style?.fontFamily as string) ?? fontFamily;

  // Build font string: [font-style] [font-weight] font-size font-family
  ctx.font = `${tokenFontStyle} ${tokenFontWeight} ${tokenFontSize}px ${tokenFontFamily}`;
  ctx.fillStyle = color;
  ctx.fillText(token.text, x, y);

  // Handle text decoration (underline/line-through)
  const textDecoration = style?.textDecoration as string | undefined;
  if (textDecoration === "underline" || textDecoration === "line-through") {
    const textWidth = ctx.measureText(token.text).width;
    const decorationY = textDecoration === "underline" ? y + 2 : y - tokenFontSize * 0.3;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, decorationY);
    ctx.lineTo(x + textWidth, decorationY);
    ctx.stroke();
  }

  // Reset font to default for next token
  ctx.font = `normal normal ${fontSize}px ${fontFamily}`;
}

// =============================================================================
// Main Component
// =============================================================================

const codeDisplayStyle: CSSProperties = {
  position: "relative",
  minHeight: "100%",
};

/**
 * Canvas-based unified code renderer.
 *
 * Features:
 * - Line numbers (optional)
 * - Syntax highlighting
 * - Selection/match highlights
 * - Cursor rendering
 * - High performance for large files
 * - Virtual scrolling support
 *
 * Note: Canvas uses ctx.measureText directly for CJK support.
 * The measureText prop is not used - Canvas has its own measurement.
 */
export const CanvasRenderer = memo(function CanvasRenderer({
  lines,
  visibleRange,
  topSpacerHeight,
  bottomSpacerHeight,
  tokenCache,
  lineHeight,
  padding,
  width = 800,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Canvas uses ctx.measureText directly
  measureText: _measureText,
  showLineNumbers = false,
  lineNumberWidth = DEFAULT_LINE_NUMBER_WIDTH,
  highlights = [],
  cursor,
  tokenStyles,
  fontFamily = DEFAULT_FONT_FAMILY,
  fontSize = DEFAULT_FONT_SIZE,
}: RendererProps): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pre-compute line highlights for visible range
  const lineHighlightsMap = useMemo(() => {
    const map = new Map<number, readonly LineHighlight[]>();
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      const lineNumber = i + 1;
      const lineText = lines[i] ?? "";
      const lineHighlights = getLineHighlights(lineNumber, lineText.length, highlights);
      if (lineHighlights.length > 0) {
        map.set(lineNumber, lineHighlights);
      }
    }
    return map;
  }, [visibleRange.start, visibleRange.end, lines, highlights]);

  // Check if cursor is on a visible line
  const cursorOnLine = useMemo(() => {
    if (!cursor?.visible) {
      return undefined;
    }
    if (cursor.line < visibleRange.start + 1 || cursor.line > visibleRange.end) {
      return undefined;
    }
    return cursor.line;
  }, [cursor, visibleRange]);

  // Calculate canvas dimensions
  const canvasHeight = (visibleRange.end - visibleRange.start) * lineHeight;

  // Draw on canvas when content changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // Set up high DPI rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, canvasHeight);

    // Set font
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "alphabetic";

    const drawContext: DrawContext = {
      ctx,
      lineHeight,
      padding,
      showLineNumbers,
      lineNumberWidth,
      tokenStyles,
      fontFamily,
      fontSize,
    };

    // Draw visible lines
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      const lineIndex = i - visibleRange.start;
      const lineNumber = i + 1;
      const lineText = lines[i] ?? "";
      const tokens = tokenCache.getTokens(lineText, i);
      const codeXOffset = showLineNumbers ? padding + lineNumberWidth : padding;

      // Calculate token positions for style-aware rendering
      const tokenPositions = calculateCanvasTokenPositions(
        ctx,
        tokens,
        tokenStyles,
        codeXOffset,
        fontSize,
        fontFamily
      );

      // 1. Draw line number
      if (showLineNumbers) {
        drawLineNumber(drawContext, lineNumber, lineIndex);
      }

      // 2. Draw highlights using style-aware positions
      const lineHighlights = lineHighlightsMap.get(lineNumber) ?? [];
      for (const highlight of lineHighlights) {
        const startX = getStyledColumnX(
          highlight.startColumn,
          tokens,
          tokenPositions,
          tokenStyles,
          fontSize,
          codeXOffset,
          ctx,
          fontFamily,
          lineText
        );
        const endX = getStyledColumnX(
          highlight.endColumn,
          tokens,
          tokenPositions,
          tokenStyles,
          fontSize,
          codeXOffset,
          ctx,
          fontFamily,
          lineText
        );
        drawHighlight(drawContext, highlight, lineIndex, startX, endX);
      }

      // 3. Draw tokens at calculated positions
      for (let j = 0; j < tokens.length; j++) {
        drawToken(drawContext, tokens[j], lineIndex, tokenPositions[j]);
      }

      // 4. Draw cursor using style-aware position
      if (cursorOnLine === lineNumber && cursor) {
        const cursorX = getStyledColumnX(
          cursor.column,
          tokens,
          tokenPositions,
          tokenStyles,
          fontSize,
          codeXOffset,
          ctx,
          fontFamily,
          lineText
        );
        drawCursor(drawContext, cursorX, lineIndex, cursor.blinking);
      }
    }
  }, [
    lines,
    visibleRange.start,
    visibleRange.end,
    tokenCache,
    width,
    canvasHeight,
    lineHeight,
    padding,
    showLineNumbers,
    lineNumberWidth,
    lineHighlightsMap,
    cursor,
    cursorOnLine,
    tokenStyles,
    fontFamily,
    fontSize,
  ]);

  return (
    <div style={codeDisplayStyle}>
      {topSpacerHeight > 0 && <div style={{ height: topSpacerHeight }} />}

      <canvas
        ref={canvasRef}
        style={{
          width,
          height: canvasHeight,
          display: "block",
        }}
      />

      {bottomSpacerHeight > 0 && <div style={{ height: bottomSpacerHeight }} />}
    </div>
  );
});
