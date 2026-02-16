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

import { useMemo, memo, type ReactNode, type CSSProperties } from "react";
import type {
  RendererProps,
  Token,
  LineHighlight,
  TokenStyleMap,
} from "./types";
import { DEFAULT_LINE_NUMBER_WIDTH, DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE } from "./types";
import { getLineHighlights, HIGHLIGHT_COLORS } from "./utils";
import { assertMeasureText } from "../core/invariant";
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
 * Calculate token X positions considering individual token styles.
 * Returns array of X positions for each token.
 *
 * @throws Error if measureText is not provided (no silent fallback)
 */
function calculateTokenPositions(
  tokens: readonly Token[],
  tokenStyles: TokenStyleMap | undefined,
  baseXOffset: number,
  baseFontSize: number,
  measureText: (text: string) => number
): readonly number[] {
  const positions: number[] = [];
  // eslint-disable-next-line no-restricted-syntax -- Accumulator pattern for position calculation
  let currentX = baseXOffset;

  for (const token of tokens) {
    positions.push(currentX);

    // Calculate token width using actual text measurement
    const style = tokenStyles?.[token.type];
    const tokenFontSize = style?.fontSize;

    // If token has custom font size, apply font size ratio
    const fontSizeRatio = tokenFontSize ? parseFontSizeRatio(tokenFontSize, baseFontSize) : 1;

    // Measure actual text width (handles CJK correctly)
    const baseWidth = measureText(token.text);
    const tokenWidth = baseWidth * fontSizeRatio;
    currentX += tokenWidth;
  }

  return positions;
}

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
  /** Required: Text measurement function for accurate CJK positioning */
  readonly measureText: (text: string) => number;
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
  measureText,
  tokenStyles,
  fontFamily,
  fontSize,
}: SvgLineProps): ReactNode {
  const codeXOffset = showLineNumbers ? xOffset + lineNumberWidth : xOffset;
  const textY = y + lineHeight * 0.75;

  // Calculate token positions using actual text measurement
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
 */
export const SvgRenderer = memo(function SvgRenderer({
  lines,
  visibleRange,
  topSpacerHeight,
  bottomSpacerHeight,
  tokenCache,
  lineHeight,
  padding,
  width = 800,
  measureText: measureTextProp,
  showLineNumbers = false,
  lineNumberWidth = DEFAULT_LINE_NUMBER_WIDTH,
  highlights = [],
  cursor,
  tokenStyles,
  fontFamily = DEFAULT_FONT_FAMILY,
  fontSize = DEFAULT_FONT_SIZE,
}: RendererProps): ReactNode {
  // Require measureText - no silent fallback to fixed width
  const measureText = assertMeasureText(measureTextProp, "SvgRenderer");

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

  const svgHeight = (visibleRange.end - visibleRange.start) * lineHeight;

  return (
    <div style={codeDisplayStyle}>
      {topSpacerHeight > 0 && <div style={{ height: topSpacerHeight }} />}

      <svg
        width={width}
        height={svgHeight}
        style={{ display: "block", overflow: "visible" }}
      >
        {Array.from({ length: visibleRange.end - visibleRange.start }, (_, i) => {
          const lineIndex = visibleRange.start + i;
          const lineNumber = lineIndex + 1;
          const lineText = lines[lineIndex] ?? "";
          const tokens = tokenCache.getTokens(lineText, lineIndex);
          const lineHighlights = lineHighlightsMap.get(lineNumber) ?? [];
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
              measureText={measureText}
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
