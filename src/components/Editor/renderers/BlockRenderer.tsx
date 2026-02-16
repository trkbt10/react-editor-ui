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
import type { Block, LocalStyleSegment } from "../core/blockDocument";
import type { BlockCompositionState } from "../core/useBlockComposition";
import type {
  CursorState,
  HighlightRange,
  MeasureTextFn,
} from "../core/types";
import type { TokenCache, TokenStyleMap, LineHighlight } from "./types";
import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE } from "./types";
import { getLineHighlights, HIGHLIGHT_COLORS } from "./utils";
import { assertMeasureText } from "../core/invariant";
import { EDITOR_CURSOR_COLOR } from "../styles/tokens";

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
    // lineNumber is passed for future use (e.g., line number gutter)
    lineIndex,
    y,
    xOffset,
    lineHeight,
    highlights,
    cursor,
    measureText,
    tokenCache,
    tokenStyles,
    fontFamily,
    fontSize,
    // localStyles and localOffset are passed for future styled text rendering
  } = props;
  const textY = y + lineHeight * 0.75;

  // Get tokens for this line
  const tokens = tokenCache.getTokens(lineText, lineIndex);

  // Calculate column X position
  const getColumnX = (col: number): number => {
    const textBeforeCol = lineText.slice(0, col - 1);
    return xOffset + measureText(textBeforeCol);
  };

  // Render highlights
  const renderHighlights = (): ReactNode => {
    return highlights.map((h, i) => {
      const startX = getColumnX(h.startColumn);
      const endX = getColumnX(h.endColumn);
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

    const state = { x: xOffset };

    return tokens.map((token, i) => {
      const tokenX = state.x;
      const tokenWidth = measureText(token.text);
      state.x += tokenWidth;

      const style = tokenStyles?.[token.type];
      const fill = (style?.color as string) ?? "inherit";
      const fontWeight = style?.fontWeight as string | undefined;
      const fontStyle = style?.fontStyle as string | undefined;

      return (
        <tspan
          key={i}
          x={tokenX}
          fill={fill}
          fontWeight={fontWeight}
          fontStyle={fontStyle}
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

    const cursorX = getColumnX(cursor.column);

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
      {renderHighlights()}
      <text x={xOffset} y={textY} fontFamily={fontFamily} fontSize={fontSize}>
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
