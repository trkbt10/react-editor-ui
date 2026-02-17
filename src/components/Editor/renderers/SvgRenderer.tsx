/**
 * @file SVG Code Renderer
 *
 * Unified renderer that handles:
 * - Line numbers
 * - Syntax-highlighted code
 * - Selection highlights
 * - Search match highlights
 * - Cursor
 *
 * Renders as SVG for high-quality export and print scenarios.
 */

import { useMemo, useRef, memo, type ReactNode, type CSSProperties } from "react";
import type {
  RendererProps,
  Token,
  LineHighlight,
  TokenStyleMap,
} from "./types";
import { DEFAULT_LINE_NUMBER_WIDTH, DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE } from "./types";
import { getLineHighlights, HIGHLIGHT_COLORS } from "./utils";
import {
  EDITOR_LINE_NUMBER_BG,
  EDITOR_LINE_NUMBER_COLOR,
  EDITOR_LINE_NUMBER_BORDER,
  EDITOR_CURSOR_COLOR,
} from "../styles/tokens";

// =============================================================================
// Constants
// =============================================================================

/** Minimum highlight width (for empty selections) */
const MIN_HIGHLIGHT_WIDTH = 8;

/** Empty highlight array constant to avoid creating new arrays */
const EMPTY_HIGHLIGHTS: readonly LineHighlight[] = [];

// =============================================================================
// SVG Components
// =============================================================================

type SvgHighlightProps = {
  readonly highlight: LineHighlight;
  readonly y: number;
  readonly lineHeight: number;
  /** Pre-computed X position for start column */
  readonly startX: number;
  /** Pre-computed X position for end column */
  readonly endX: number;
};

function SvgHighlight({
  highlight,
  y,
  lineHeight,
  startX,
  endX,
}: SvgHighlightProps): ReactNode {
  const width = Math.max(endX - startX, MIN_HIGHLIGHT_WIDTH);

  // Composition highlight: background + underline
  if (highlight.type === "composition") {
    return (
      <g>
        <rect
          x={startX}
          y={y}
          width={width}
          height={lineHeight}
          fill={HIGHLIGHT_COLORS[highlight.type]}
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
      x={startX}
      y={y}
      width={width}
      height={lineHeight}
      fill={HIGHLIGHT_COLORS[highlight.type]}
      rx={2}
    />
  );
}

type SvgCursorProps = {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly blinking: boolean;
};

function SvgCursor({ x, y, height, blinking }: SvgCursorProps): ReactNode {
  return (
    <rect
      x={x}
      y={y}
      width={2}
      height={height}
      fill={EDITOR_CURSOR_COLOR}
      style={{
        animation: blinking ? "rei-editor-cursor-blink 1s step-end infinite" : "none",
      }}
    />
  );
}

type SvgLineNumberProps = {
  readonly lineNumber: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly fontSize: number;
  readonly fontFamily: string;
};

function SvgLineNumber({
  lineNumber,
  x,
  y,
  width,
  fontSize,
  fontFamily,
}: SvgLineNumberProps): ReactNode {
  return (
    <>
      <rect
        x={x}
        y={y - fontSize * 0.75}
        width={width}
        height={fontSize + 8}
        fill={EDITOR_LINE_NUMBER_BG}
      />
      <text
        x={x + width - 8}
        y={y}
        fontFamily={fontFamily}
        fontSize={fontSize}
        fill={EDITOR_LINE_NUMBER_COLOR}
        textAnchor="end"
      >
        {lineNumber}
      </text>
      <line
        x1={x + width}
        y1={y - fontSize * 0.75}
        x2={x + width}
        y2={y + 8}
        stroke={EDITOR_LINE_NUMBER_BORDER}
      />
    </>
  );
}

type SvgTokenProps = {
  readonly token: Token;
  readonly x: number;
  readonly tokenStyles?: TokenStyleMap;
};

function SvgToken({
  token,
  x,
  tokenStyles,
}: SvgTokenProps): ReactNode {
  if (token.type === "whitespace") {
    // Render whitespace to maintain proper spacing
    return <tspan x={x}>{token.text}</tspan>;
  }

  const style = tokenStyles?.[token.type];

  // Extract SVG-compatible style properties
  const fill = (style?.color as string) ?? "inherit";
  const fontWeight = style?.fontWeight as string | undefined;
  const fontStyle = style?.fontStyle as string | undefined;
  const textDecoration = style?.textDecoration as string | undefined;
  const fontSize = style?.fontSize as string | undefined;
  const fontFamily = style?.fontFamily as string | undefined;

  return (
    <tspan
      x={x}
      fill={fill}
      fontWeight={fontWeight}
      fontStyle={fontStyle}
      textDecoration={textDecoration}
      fontSize={fontSize}
      fontFamily={fontFamily}
    >
      {token.text}
    </tspan>
  );
}

/**
 * Parse fontSize string to number (e.g., "16px" -> 16, "1.5em" -> baseSize * 1.5)
 * Mirrors the Canvas renderer's parseFontSize function.
 */
function parseFontSize(size: string | number | undefined, baseSize: number): number {
  if (size === undefined) {
    return baseSize;
  }
  if (typeof size === "number") {
    return size;
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
 * Uses Canvas 2D API for accurate measurement with different font styles.
 * Returns array of X positions for each token.
 */
function calculateTokenPositions(
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

    // Get style for this token type
    const style = tokenStyles?.[token.type];
    const tokenFontWeight = (style?.fontWeight as string) ?? "normal";
    const tokenFontStyle = (style?.fontStyle as string) ?? "normal";
    const tokenFontSize = parseFontSize(style?.fontSize as string | number | undefined, baseFontSize);
    const tokenFontFamily = (style?.fontFamily as string) ?? baseFontFamily;

    // Set font for accurate measurement (handles fontFamily correctly)
    ctx.font = `${tokenFontStyle} ${tokenFontWeight} ${tokenFontSize}px ${tokenFontFamily}`;
    const tokenWidth = ctx.measureText(token.text).width;
    acc.x += tokenWidth;
  }

  // Reset font to default
  ctx.font = `normal normal ${baseFontSize}px ${baseFontFamily}`;

  return positions;
}

type SvgLineProps = {
  readonly lineIndex: number;
  readonly lineNumber: number;
  readonly tokens: readonly Token[];
  readonly highlights: readonly LineHighlight[];
  readonly y: number;
  readonly xOffset: number;
  readonly lineText: string;
  readonly lineHeight: number;
  readonly showLineNumbers: boolean;
  readonly lineNumberWidth: number;
  readonly cursor?: { column: number; blinking: boolean };
  /** Canvas 2D context for style-aware text measurement */
  readonly measureCtx: CanvasRenderingContext2D;
  readonly tokenStyles?: TokenStyleMap;
  readonly fontFamily: string;
  readonly fontSize: number;
};

const SvgLine = memo(function SvgLine({
  lineNumber,
  tokens,
  highlights,
  y,
  xOffset,
  lineText,
  lineHeight,
  showLineNumbers,
  lineNumberWidth,
  cursor,
  measureCtx,
  tokenStyles,
  fontFamily,
  fontSize,
}: SvgLineProps): ReactNode {
  const codeXOffset = showLineNumbers ? xOffset + lineNumberWidth : xOffset;
  const textY = y + lineHeight * 0.75;

  // Calculate token positions using Canvas measurement (considers font styles)
  const tokenPositions = useMemo(
    () => calculateTokenPositions(measureCtx, tokens, tokenStyles, codeXOffset, fontSize, fontFamily),
    [measureCtx, tokens, tokenStyles, codeXOffset, fontSize, fontFamily]
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
        // Position is within this token - measure with token's font style
        const charOffset = col - token.start - 1;
        const textWithinToken = token.text.slice(0, charOffset);

        // Get token style for font configuration
        const style = tokenStyles?.[token.type];
        const tokenFontWeight = (style?.fontWeight as string) ?? "normal";
        const tokenFontStyle = (style?.fontStyle as string) ?? "normal";
        const tokenFontSize = parseFontSize(style?.fontSize as string | number | undefined, fontSize);
        const tokenFontFamily = (style?.fontFamily as string) ?? fontFamily;

        // Set font for accurate measurement
        measureCtx.font = `${tokenFontStyle} ${tokenFontWeight} ${tokenFontSize}px ${tokenFontFamily}`;
        const widthWithinToken = measureCtx.measureText(textWithinToken).width;

        return tokenPositions[i] + widthWithinToken;
      }
    }
    // Position is at or past end of line
    if (tokens.length > 0 && tokenPositions.length > 0) {
      const lastIdx = tokens.length - 1;
      const lastToken = tokens[lastIdx];
      const style = tokenStyles?.[lastToken.type];
      const tokenFontWeight = (style?.fontWeight as string) ?? "normal";
      const tokenFontStyle = (style?.fontStyle as string) ?? "normal";
      const tokenFontSize = parseFontSize(style?.fontSize as string | number | undefined, fontSize);
      const tokenFontFamily = (style?.fontFamily as string) ?? fontFamily;

      measureCtx.font = `${tokenFontStyle} ${tokenFontWeight} ${tokenFontSize}px ${tokenFontFamily}`;
      const lastTokenWidth = measureCtx.measureText(lastToken.text).width;
      return tokenPositions[lastIdx] + lastTokenWidth;
    }
    // Empty line - measure text before cursor
    measureCtx.font = `normal normal ${fontSize}px ${fontFamily}`;
    return codeXOffset + measureCtx.measureText(lineText.slice(0, col - 1)).width;
  };

  const renderTokens = (): ReactNode => {
    if (tokens.length === 0) {
      return <tspan fill="transparent">{"\u00A0"}</tspan>;
    }
    return tokens.map((token, i) => (
      <SvgToken
        key={i}
        token={token}
        x={tokenPositions[i]}
        tokenStyles={tokenStyles}
      />
    ));
  };

  return (
    <g>
      {/* Line number */}
      {showLineNumbers && (
        <SvgLineNumber
          lineNumber={lineNumber}
          x={xOffset}
          y={textY}
          width={lineNumberWidth}
          fontSize={fontSize}
          fontFamily={fontFamily}
        />
      )}

      {/* Highlights - use style-aware X positions */}
      {highlights.map((h, i) => (
        <SvgHighlight
          key={i}
          highlight={h}
          y={y}
          lineHeight={lineHeight}
          startX={getStyledColumnX(h.startColumn)}
          endX={getStyledColumnX(h.endColumn)}
        />
      ))}

      {/* Code tokens */}
      <text x={codeXOffset} y={textY} fontFamily={fontFamily} fontSize={fontSize}>
        {renderTokens()}
      </text>

      {/* Cursor */}
      {cursor && (
        <SvgCursor
          x={getStyledColumnX(cursor.column)}
          y={y}
          height={lineHeight}
          blinking={cursor.blinking}
        />
      )}
    </g>
  );
});

// =============================================================================
// Helpers
// =============================================================================

type CursorData = {
  readonly line: number;
  readonly column: number;
  readonly visible: boolean;
  readonly blinking: boolean;
};

function getLineCursor(
  cursorOnLine: number | undefined,
  lineNumber: number,
  cursor: CursorData | undefined
): { column: number; blinking: boolean } | undefined {
  if (cursorOnLine !== lineNumber || !cursor) {
    return undefined;
  }
  return { column: cursor.column, blinking: cursor.blinking };
}

// =============================================================================
// Main Component
// =============================================================================

const codeDisplayStyle: CSSProperties = {
  position: "relative",
  minHeight: "100%",
};

const viewportSvgStyle: CSSProperties = {
  display: "block",
  overflow: "hidden",
};

/**
 * SVG-based unified code renderer.
 *
 * Features:
 * - Line numbers (optional)
 * - Syntax highlighting
 * - Selection/match highlights
 * - Cursor rendering
 * - Vector-based for crisp text at any scale
 * - Virtual scrolling support
 * - Viewport-based rendering (fixed size canvas with transform)
 */
export const SvgRenderer = memo(function SvgRenderer({
  lines,
  visibleRange,
  topSpacerHeight,
  bottomSpacerHeight,
  tokenCache,
  lineHeight,
  padding,
  width,
  height,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- SVG uses Canvas ctx.measureText for style-aware measurement
  measureText: _measureText,
  showLineNumbers = false,
  lineNumberWidth = DEFAULT_LINE_NUMBER_WIDTH,
  highlights = [],
  cursor,
  tokenStyles,
  fontFamily = DEFAULT_FONT_FAMILY,
  fontSize = DEFAULT_FONT_SIZE,
  // Viewport mode props
  viewportConfig,
  viewport,
  visibleLines,
}: RendererProps): ReactNode {
  // Create Canvas 2D context for style-aware text measurement
  // This matches CanvasRenderer's approach for consistent measurement
  const measureCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const measureCtx = useMemo(() => {
    if (measureCtxRef.current) {
      return measureCtxRef.current;
    }
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.font = `normal normal ${fontSize}px ${fontFamily}`;
      measureCtxRef.current = ctx;
    }
    return ctx;
  }, [fontSize, fontFamily]);

  // Check if viewport mode is enabled
  const isViewportMode = viewportConfig?.fixedViewport && viewport && visibleLines;

  // Helper to get effective start index
  const getEffectiveStartIndex = (): number => {
    if (isViewportMode && visibleLines.length > 0) {
      return visibleLines[0].index;
    }
    if (isViewportMode) {
      return 0;
    }
    return visibleRange.start;
  };

  // Helper to get effective end index
  const getEffectiveEndIndex = (): number => {
    if (isViewportMode && visibleLines.length > 0) {
      return visibleLines[visibleLines.length - 1].index + 1;
    }
    if (isViewportMode) {
      return 0;
    }
    return visibleRange.end;
  };

  // Get effective visible range
  const effectiveStartIndex = getEffectiveStartIndex();
  const effectiveEndIndex = getEffectiveEndIndex();

  // Pre-compute line highlights for visible range
  const lineHighlightsMap = useMemo(() => {
    const map = new Map<number, readonly LineHighlight[]>();
    for (let i = effectiveStartIndex; i < effectiveEndIndex; i++) {
      const lineNumber = i + 1;
      const lineText = lines[i] ?? "";
      const lineHighlights = getLineHighlights(lineNumber, lineText.length, highlights);
      if (lineHighlights.length > 0) {
        map.set(lineNumber, lineHighlights);
      }
    }
    return map;
  }, [effectiveStartIndex, effectiveEndIndex, lines, highlights]);

  // Check if cursor is on a visible line
  const cursorOnLine = useMemo(() => {
    if (!cursor?.visible) {
      return undefined;
    }
    if (cursor.line < effectiveStartIndex + 1 || cursor.line > effectiveEndIndex) {
      return undefined;
    }
    return cursor.line;
  }, [cursor, effectiveStartIndex, effectiveEndIndex]);

  // Viewport mode rendering
  if (isViewportMode) {
    const { size, offset } = viewport;
    const svgWidth = width ?? size.width;
    const svgHeight = height ?? size.height;

    // measureCtx is required for rendering
    if (!measureCtx) {
      return null;
    }

    return (
      <svg
        width={svgWidth}
        height={svgHeight}
        style={viewportSvgStyle}
      >
        {/* Transform group: shifts document coordinates to viewport */}
        <g transform={`translate(${-offset.x}, ${-offset.y})`}>
          {visibleLines.map((item) => {
            const lineIndex = item.index;
            const lineNumber = lineIndex + 1;
            const lineText = lines[lineIndex] ?? "";
            const tokens = tokenCache.getTokens(lineText, lineIndex);
            const lineHighlights = lineHighlightsMap.get(lineNumber) ?? EMPTY_HIGHLIGHTS;
            const lineCursor = getLineCursor(cursorOnLine, lineNumber, cursor);

            return (
              <SvgLine
                key={lineIndex}
                lineIndex={lineIndex}
                lineNumber={lineNumber}
                tokens={tokens}
                highlights={lineHighlights}
                y={item.documentY}
                xOffset={padding}
                lineText={lineText}
                lineHeight={item.height}
                showLineNumbers={showLineNumbers}
                lineNumberWidth={lineNumberWidth}
                cursor={lineCursor}
                measureCtx={measureCtx}
                tokenStyles={tokenStyles}
                fontFamily={fontFamily}
                fontSize={fontSize}
              />
            );
          })}
        </g>
      </svg>
    );
  }

  // Legacy mode rendering (spacer-based virtual scroll)
  const svgHeight = (visibleRange.end - visibleRange.start) * lineHeight;

  // measureCtx is required for rendering
  if (!measureCtx) {
    return null;
  }

  return (
    <div style={codeDisplayStyle}>
      {topSpacerHeight > 0 && <div style={{ height: topSpacerHeight }} />}

      <svg
        width={width ?? "100%"}
        height={svgHeight}
        style={{ display: "block", overflow: "visible" }}
      >
        {Array.from({ length: visibleRange.end - visibleRange.start }, (_, i) => {
          const lineIndex = visibleRange.start + i;
          const lineNumber = lineIndex + 1;
          const lineText = lines[lineIndex] ?? "";
          const tokens = tokenCache.getTokens(lineText, lineIndex);
          const lineHighlights = lineHighlightsMap.get(lineNumber) ?? EMPTY_HIGHLIGHTS;
          const lineCursor = getLineCursor(cursorOnLine, lineNumber, cursor);

          return (
            <SvgLine
              key={lineIndex}
              lineIndex={lineIndex}
              lineNumber={lineNumber}
              tokens={tokens}
              highlights={lineHighlights}
              y={i * lineHeight}
              xOffset={padding}
              lineText={lineText}
              lineHeight={lineHeight}
              showLineNumbers={showLineNumbers}
              lineNumberWidth={lineNumberWidth}
              cursor={lineCursor}
              measureCtx={measureCtx}
              tokenStyles={tokenStyles}
              fontFamily={fontFamily}
              fontSize={fontSize}
            />
          );
        })}
      </svg>

      {bottomSpacerHeight > 0 && <div style={{ height: bottomSpacerHeight }} />}
    </div>
  );
});
