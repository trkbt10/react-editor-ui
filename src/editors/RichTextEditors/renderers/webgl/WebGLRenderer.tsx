/**
 * @file WebGL Block Renderer
 *
 * High-performance WebGL-based text renderer for BlockDocument.
 * Uses dynamic glyph atlas with bitmap font rendering.
 */

import {
  useRef,
  useEffect,
  useMemo,
  useState,
  memo,
  type ReactNode,
  type CSSProperties,
} from "react";
import type { Block, BlockTypeStyleMap, BlockTypeStyle } from "../../block/blockDocument";
import { getBlockTypeStyle } from "../../block/blockDocument";
import type { CursorState, HighlightRange } from "../../core/types";
import type { TokenCache, TokenStyleMap, Token } from "../types";
import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE, DEFAULT_LINE_NUMBER_WIDTH } from "../types";
import { getLineHighlights } from "../utils";
import type { ViewportState } from "../viewport/types";
import type { BlockLayoutIndex } from "../../layout/types";
import type { Color, ShaderProgramInfo } from "./types";
import { GlyphAtlas } from "./GlyphAtlas";
import { GlyphRasterizer } from "./GlyphRasterizer";
import { TextBatch } from "./TextBatch";
import {
  HighlightRenderer,
  parseRgbaColor,
  SELECTION_COLOR,
  MATCH_COLOR,
  CURRENT_MATCH_COLOR,
  COMPOSITION_COLOR,
  CURSOR_COLOR,
} from "./HighlightRenderer";
import {
  createTextShaderProgram,
  createHighlightShaderProgram,
  deleteShaderProgram,
} from "./ShaderProgram";
import {
  TEXT_VERTEX_SHADER,
  TEXT_FRAGMENT_SHADER,
  HIGHLIGHT_VERTEX_SHADER,
  HIGHLIGHT_FRAGMENT_SHADER,
  createOrthographicMatrix,
} from "./shaders";
import {
  EDITOR_LINE_NUMBER_BG_RAW,
  EDITOR_LINE_NUMBER_COLOR_RAW,
} from "../../styles/tokens";

// =============================================================================
// Types
// =============================================================================

export type WebGLBlockRendererProps = {
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
  /** Container height */
  readonly height?: number;
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
  /** Starting line number for first visible block */
  readonly startLineNumber?: number;
  /** Block type styles (overrides defaults) */
  readonly blockTypeStyles?: BlockTypeStyleMap;
  /** Precomputed block layout index for consistent Y positioning (Single Source of Truth) */
  readonly blockLayoutIndex?: BlockLayoutIndex;
  /** Viewport state */
  readonly viewport?: ViewportState;
  /** Cursor color */
  readonly cursorColor?: string;
};

// =============================================================================
// WebGL State Management
// =============================================================================

type WebGLResources = {
  gl: WebGLRenderingContext;
  textShader: ShaderProgramInfo;
  highlightShader: ShaderProgramInfo;
  glyphAtlas: GlyphAtlas;
  textBatch: TextBatch;
  highlightRenderer: HighlightRenderer;
  rasterizer: GlyphRasterizer;
};

// =============================================================================
// Styles
// =============================================================================

const canvasStyle: CSSProperties = {
  display: "block",
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get highlights for a specific block.
 */
function getBlockHighlights(
  blockStartLine: number,
  blockLineCount: number,
  highlights: readonly HighlightRange[]
): readonly HighlightRange[] {
  const blockEndLine = blockStartLine + blockLineCount - 1;
  return highlights.filter((h) => {
    return h.startLine <= blockEndLine && h.endLine >= blockStartLine;
  });
}

/**
 * Parse font size string to number.
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
 * Convert highlight type to Color.
 */
function getHighlightColor(type: string): Color {
  switch (type) {
    case "selection":
      return SELECTION_COLOR;
    case "match":
      return MATCH_COLOR;
    case "currentMatch":
      return CURRENT_MATCH_COLOR;
    case "composition":
      return COMPOSITION_COLOR;
    default:
      return SELECTION_COLOR;
  }
}

// =============================================================================
// Unified Position Calculation (Single Source of Truth)
// =============================================================================

/**
 * Character position information for unified rendering.
 */
type CharPosition = {
  /** X position (pen position / origin) */
  x: number;
  /** Character */
  char: string;
  /** Font size in pixels */
  fontSize: number;
  /** Font weight */
  fontWeight: string;
  /** Font style */
  fontStyle: string;
  /** Font family */
  fontFamily: string;
  /** Text color */
  color: Color;
};

/**
 * Line position data calculated once and used for highlights, text, and cursor.
 */
type LinePositionData = {
  /** X positions for each character (index = column - 1) */
  charPositions: CharPosition[];
  /** X position at end of line (after last character) */
  endX: number;
};

/**
 * Calculate character positions for a line using cumulative measurement.
 * This is the Single Source of Truth for all position calculations.
 *
 * @param lineText - The line text
 * @param tokens - Tokens for the line
 * @param startX - Starting X position
 * @param effectiveFontSize - Base font size for the block
 * @param styleProps - Block style properties
 * @param tokenStyles - Token style map
 * @param rasterizer - GlyphRasterizer for measurement
 * @returns Line position data
 */
function calculateLinePositions(
  lineText: string,
  tokens: readonly Token[],
  startX: number,
  effectiveFontSize: number,
  styleProps: {
    fontWeight: string;
    fontFamily: string;
    color: string | undefined;
  },
  tokenStyles: TokenStyleMap | undefined,
  rasterizer: GlyphRasterizer
): LinePositionData {
  const charPositions: CharPosition[] = [];
  let currentX = startX;

  for (const token of tokens) {
    const style = tokenStyles?.[token.type];
    const tokenFontSize = parseFontSize(style?.fontSize as string | undefined, effectiveFontSize);
    const fontWeight = styleProps.fontWeight ?? (style?.fontWeight as string) ?? "normal";
    const fontStyle = (style?.fontStyle as string) ?? "normal";
    const fontFamily = (style?.fontFamily as string) ?? styleProps.fontFamily;
    const colorStr = styleProps.color ?? (style?.color as string) ?? "#000000";
    const color = parseRgbaColor(colorStr);

    // Calculate positions for each character in token using cumulative measurement
    const tokenCharPositions = rasterizer.measureCharacterPositions(
      token.text,
      currentX,
      tokenFontSize,
      fontWeight,
      fontStyle,
      fontFamily
    );

    // Add each character's position
    for (let i = 0; i < token.text.length; i++) {
      charPositions.push({
        x: tokenCharPositions[i],
        char: token.text[i],
        fontSize: tokenFontSize,
        fontWeight,
        fontStyle,
        fontFamily,
        color,
      });
    }

    // Move to end of token
    currentX += rasterizer.measureText(token.text, tokenFontSize, fontWeight, fontStyle, fontFamily);
  }

  return {
    charPositions,
    endX: currentX,
  };
}

/**
 * Get X position for a column using precomputed line positions.
 * Column is 1-indexed (column 1 = first character).
 */
function getColumnX(col: number, lineData: LinePositionData, defaultX: number): number {
  const charIndex = col - 1;
  if (charIndex < 0) {
    return defaultX;
  }
  if (charIndex < lineData.charPositions.length) {
    return lineData.charPositions[charIndex].x;
  }
  return lineData.endX;
}

/**
 * Calculate baseline Y position for vertically centered text.
 *
 * Uses measured font metrics for accurate positioning:
 * - Measures actual ascent and descent from the font
 * - Centers the text bounding box within the line height
 * - Returns the baseline Y coordinate
 *
 * @param lineTop - Y coordinate of the line's top edge
 * @param lineHeight - Height of the line
 * @param fontSize - Font size in pixels
 * @param fontWeight - Font weight
 * @param fontStyle - Font style
 * @param fontFamily - Font family
 * @param rasterizer - GlyphRasterizer for font metric measurement
 * @returns Baseline Y coordinate
 */
function calculateBaselineY(
  lineTop: number,
  lineHeight: number,
  fontSize: number,
  fontWeight: string,
  fontStyle: string,
  fontFamily: string,
  rasterizer: GlyphRasterizer
): number {
  const metrics = rasterizer.getFontMetrics(fontSize, fontWeight, fontStyle, fontFamily);
  const textHeight = metrics.ascent + metrics.descent;
  // Center text vertically: (lineHeight - textHeight) / 2 gives top margin
  // Add ascent to get baseline position
  return lineTop + (lineHeight - textHeight) / 2 + metrics.ascent;
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * WebGL-based block renderer.
 *
 * Uses dynamic glyph atlas with bitmap font rendering for high performance.
 */
export const WebGLBlockRenderer = memo(function WebGLBlockRenderer({
  blocks,
  visibleRange,
  topSpacerHeight: _topSpacerHeight,
  bottomSpacerHeight: _bottomSpacerHeight,
  tokenCache,
  lineHeight,
  padding,
  width: widthProp,
  height: heightProp,
  showLineNumbers = false,
  lineNumberWidth = DEFAULT_LINE_NUMBER_WIDTH,
  highlights = [],
  cursor,
  tokenStyles,
  fontFamily = DEFAULT_FONT_FAMILY,
  fontSize = DEFAULT_FONT_SIZE,
  startLineNumber = 1,
  blockTypeStyles,
  blockLayoutIndex,
  viewport,
  cursorColor: cursorColorProp,
}: WebGLBlockRendererProps): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resourcesRef = useRef<WebGLResources | null>(null);
  const [measuredWidth, setMeasuredWidth] = useState(0);

  // Calculate effective cursor color
  const cursorColorParsed = useMemo(() => {
    if (cursorColorProp) {
      return parseRgbaColor(cursorColorProp);
    }
    return CURSOR_COLOR;
  }, [cursorColorProp]);

  // Parse line number colors
  const lineNumberBgColor = useMemo(() => parseRgbaColor(EDITOR_LINE_NUMBER_BG_RAW), []);
  const lineNumberTextColor = useMemo(() => parseRgbaColor(EDITOR_LINE_NUMBER_COLOR_RAW), []);

  // Use provided width or measured width
  const width = widthProp ?? measuredWidth;

  // Calculate total visible height
  const totalHeight = useMemo(() => {
    if (blockLayoutIndex && blockLayoutIndex.lines.length > 0) {
      let height = 0;
      for (let i = visibleRange.start; i < visibleRange.end && i < blocks.length; i++) {
        if (i < blockLayoutIndex.lines.length) {
          height += blockLayoutIndex.lines[i].height;
        }
      }
      return height;
    }
    // Fallback: count lines
    let lineCount = 0;
    for (let i = visibleRange.start; i < visibleRange.end && i < blocks.length; i++) {
      lineCount += blocks[i].content.split("\n").length;
    }
    return lineCount * lineHeight;
  }, [blocks, visibleRange, lineHeight, blockLayoutIndex]);

  const canvasHeight = heightProp ?? totalHeight;

  // Initialize WebGL resources
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // Try to get WebGL context
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    try {
      // Create shader programs
      const textShader = createTextShaderProgram(
        gl,
        TEXT_VERTEX_SHADER,
        TEXT_FRAGMENT_SHADER
      );
      const highlightShader = createHighlightShaderProgram(
        gl,
        HIGHLIGHT_VERTEX_SHADER,
        HIGHLIGHT_FRAGMENT_SHADER
      );

      // Create glyph atlas
      const glyphAtlas = new GlyphAtlas(gl);

      // Warm up atlas with common ASCII characters
      glyphAtlas.warmUpAscii(fontSize, "normal", "normal", fontFamily);

      // Create text batch
      const textBatch = new TextBatch(gl, textShader);

      // Create highlight renderer
      const highlightRenderer = new HighlightRenderer(gl, highlightShader);

      // Create rasterizer for text measurement
      const rasterizer = new GlyphRasterizer();

      resourcesRef.current = {
        gl,
        textShader,
        highlightShader,
        glyphAtlas,
        textBatch,
        highlightRenderer,
        rasterizer,
      };
    } catch (error) {
      console.error("Failed to initialize WebGL resources:", error);
    }

    return () => {
      const resources = resourcesRef.current;
      if (resources) {
        resources.textBatch.dispose();
        resources.highlightRenderer.dispose();
        resources.glyphAtlas.dispose();
        deleteShaderProgram(resources.gl, resources.textShader);
        deleteShaderProgram(resources.gl, resources.highlightShader);
        resourcesRef.current = null;
      }
    };
  }, [fontFamily, fontSize]);

  // Measure canvas width
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMeasuredWidth(entry.contentRect.width);
      }
    });

    observer.observe(canvas.parentElement ?? canvas);
    setMeasuredWidth(canvas.parentElement?.clientWidth ?? canvas.clientWidth);

    return () => observer.disconnect();
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const resources = resourcesRef.current;

    if (!canvas || !resources || width <= 0 || canvasHeight <= 0) {
      return;
    }

    const { gl, textShader, highlightShader, glyphAtlas, textBatch, highlightRenderer, rasterizer } = resources;

    // Set up canvas size with DPR
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = canvasHeight * dpr;

    // Set viewport
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Clear
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Enable blending for text anti-aliasing and highlights
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Create projection matrix (with DPR scaling)
    const projection = createOrthographicMatrix(width, canvasHeight);

    // Viewport offset for scrolling
    const viewportOffsetY = viewport?.offset.y ?? 0;
    const viewportOffsetX = viewport?.offset.x ?? 0;

    // Base X offset for code
    const baseCodeX = showLineNumbers ? padding + lineNumberWidth : padding;

    // Helper to get block line height
    const getBlockLineHeight = (blockIdx: number, lineCount: number): number => {
      if (blockLayoutIndex && blockIdx < blockLayoutIndex.lines.length) {
        return blockLayoutIndex.lines[blockIdx].height / lineCount;
      }
      return lineHeight;
    };

    // Helper to get effective style properties for a block
    const getBlockStyleProps = (blockTypeStyle: BlockTypeStyle | undefined) => {
      const blockFontSizeMultiplier = blockTypeStyle?.fontSizeMultiplier ?? 1;
      const blockFontWeight = blockTypeStyle?.fontWeight ?? "normal";
      const blockFontFamily = blockTypeStyle?.fontFamily ?? fontFamily;
      const blockIndent = blockTypeStyle?.indentation ?? 0;
      const blockColor = blockTypeStyle?.color;
      const leftBorderWidth = blockTypeStyle?.leftBorder?.width ?? 0;
      const leftBorderColor = blockTypeStyle?.leftBorder?.color;
      const bgColor = blockTypeStyle?.backgroundColor;

      return {
        fontSizeMultiplier: blockFontSizeMultiplier,
        fontWeight: blockFontWeight,
        fontFamily: blockFontFamily,
        indent: blockIndent,
        color: blockColor,
        leftBorderWidth,
        leftBorderColor,
        bgColor,
      };
    };

    // =================================
    // Pass 1: Render block backgrounds and decorations
    // =================================
    gl.useProgram(highlightShader.program);
    gl.uniformMatrix4fv(highlightShader.uniforms.projection, false, projection);

    highlightRenderer.begin();

    // Draw block backgrounds and left borders
    let currentLine = startLineNumber;
    let currentY = -viewportOffsetY;

    for (let blockIdx = visibleRange.start; blockIdx < visibleRange.end && blockIdx < blocks.length; blockIdx++) {
      const block = blocks[blockIdx];
      const lines = block.content.split("\n");
      const blockTypeStyle = getBlockTypeStyle(block.type, blockTypeStyles);
      const styleProps = getBlockStyleProps(blockTypeStyle);

      const blockLineHeight = getBlockLineHeight(blockIdx, lines.length);

      const blockHeight = lines.length * blockLineHeight;
      const codeXOffset = baseCodeX + styleProps.indent + styleProps.leftBorderWidth + (styleProps.leftBorderWidth > 0 ? 4 : 0);

      // Draw block background
      if (styleProps.bgColor) {
        const bgParsed = parseRgbaColor(styleProps.bgColor);
        highlightRenderer.addRect(
          codeXOffset - viewportOffsetX - 4,
          currentY,
          width - codeXOffset + 4,
          blockHeight,
          bgParsed
        );
      }

      // Draw left border
      if (styleProps.leftBorderWidth > 0 && styleProps.leftBorderColor) {
        const borderColor = parseRgbaColor(styleProps.leftBorderColor);
        highlightRenderer.addRect(
          baseCodeX + styleProps.indent - viewportOffsetX,
          currentY,
          styleProps.leftBorderWidth,
          blockHeight,
          borderColor
        );
      }

      currentY += blockHeight;
      currentLine += lines.length;
    }

    highlightRenderer.flush();

    // =================================
    // Pass 2: Render line number backgrounds
    // =================================
    if (showLineNumbers) {
      highlightRenderer.begin();

      currentY = -viewportOffsetY;
      for (let blockIdx = visibleRange.start; blockIdx < visibleRange.end && blockIdx < blocks.length; blockIdx++) {
        const block = blocks[blockIdx];
        const lines = block.content.split("\n");
        const blockLineHeight = blockLayoutIndex && blockIdx < blockLayoutIndex.lines.length
          ? blockLayoutIndex.lines[blockIdx].height / lines.length
          : lineHeight;

        for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
          highlightRenderer.addRect(
            padding - viewportOffsetX,
            currentY,
            lineNumberWidth,
            blockLineHeight,
            lineNumberBgColor
          );
          currentY += blockLineHeight;
        }
      }

      highlightRenderer.flush();
    }

    // =================================
    // Pre-calculate all line positions (Single Source of Truth)
    // =================================
    type LineRenderData = {
      lineNumber: number;
      lineText: string;
      y: number;
      blockLineHeight: number;
      codeXOffset: number;
      effectiveFontSize: number;
      styleProps: ReturnType<typeof getBlockStyleProps>;
      positionData: LinePositionData;
    };

    const lineDataCache: Map<number, LineRenderData> = new Map();

    currentLine = startLineNumber;
    currentY = -viewportOffsetY;

    for (let blockIdx = visibleRange.start; blockIdx < visibleRange.end && blockIdx < blocks.length; blockIdx++) {
      const block = blocks[blockIdx];
      const lines = block.content.split("\n");
      const blockTypeStyle = getBlockTypeStyle(block.type, blockTypeStyles);
      const styleProps = getBlockStyleProps(blockTypeStyle);

      const blockLineHeight = getBlockLineHeight(blockIdx, lines.length);

      const effectiveFontSize = fontSize * styleProps.fontSizeMultiplier;
      const codeXOffset = baseCodeX + styleProps.indent + styleProps.leftBorderWidth + (styleProps.leftBorderWidth > 0 ? 4 : 0);

      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const lineText = lines[lineIdx];
        const lineNumber = currentLine + lineIdx;
        const tokens = tokenCache.getTokens(lineText, lineNumber - 1);

        // Calculate positions using unified function
        const positionData = calculateLinePositions(
          lineText,
          tokens,
          codeXOffset - viewportOffsetX,
          effectiveFontSize,
          {
            fontWeight: styleProps.fontWeight,
            fontFamily: styleProps.fontFamily,
            color: styleProps.color,
          },
          tokenStyles,
          rasterizer
        );

        lineDataCache.set(lineNumber, {
          lineNumber,
          lineText,
          y: currentY,
          blockLineHeight,
          codeXOffset,
          effectiveFontSize,
          styleProps,
          positionData,
        });

        currentY += blockLineHeight;
      }
      currentLine += lines.length;
    }

    // =================================
    // Pass 3: Render selection and other highlights (using cached positions)
    // =================================
    highlightRenderer.begin();

    currentLine = startLineNumber;

    for (let blockIdx = visibleRange.start; blockIdx < visibleRange.end && blockIdx < blocks.length; blockIdx++) {
      const block = blocks[blockIdx];
      const lines = block.content.split("\n");
      const blockHighlights = getBlockHighlights(currentLine, lines.length, highlights);

      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const lineNumber = currentLine + lineIdx;
        const lineData = lineDataCache.get(lineNumber);
        if (!lineData) {
          continue;
        }

        const lineHighlights = getLineHighlights(lineNumber, lineData.lineText.length, blockHighlights);

        for (const h of lineHighlights) {
          const startX = getColumnX(h.startColumn, lineData.positionData, lineData.codeXOffset - viewportOffsetX);
          const endX = getColumnX(h.endColumn, lineData.positionData, lineData.codeXOffset - viewportOffsetX);
          const highlightWidth = Math.max(endX - startX, 8);
          highlightRenderer.addRect(startX, lineData.y, highlightWidth, lineData.blockLineHeight, getHighlightColor(h.type));
        }
      }
      currentLine += lines.length;
    }

    highlightRenderer.flush();

    // =================================
    // Pass 4: Render text (using cached positions)
    // =================================
    gl.useProgram(textShader.program);
    gl.uniformMatrix4fv(textShader.uniforms.projection, false, projection);

    // Bind atlas texture
    const atlasDims = glyphAtlas.getDimensions();
    textBatch.setAtlasDimensions(atlasDims.width, atlasDims.height);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, glyphAtlas.getTexture());
    gl.uniform1i(textShader.uniforms.texture, 0);

    textBatch.begin();

    currentLine = startLineNumber;

    for (let blockIdx = visibleRange.start; blockIdx < visibleRange.end && blockIdx < blocks.length; blockIdx++) {
      const block = blocks[blockIdx];
      const lines = block.content.split("\n");

      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const lineNumber = currentLine + lineIdx;
        const lineData = lineDataCache.get(lineNumber);
        if (!lineData) {
          continue;
        }

        // Draw line number
        if (showLineNumbers) {
          const lineNumStr = String(lineNumber);
          const lineNumX = padding + lineNumberWidth - 8 - viewportOffsetX;
          // Right-align line number using measureText
          const numWidth = rasterizer.measureText(lineNumStr, fontSize, "normal", "normal", fontFamily);
          const charPositions = rasterizer.measureCharacterPositions(
            lineNumStr,
            lineNumX - numWidth,
            fontSize,
            "normal",
            "normal",
            fontFamily
          );
          // Calculate baseline Y using measured font metrics
          const baselineY = calculateBaselineY(
            lineData.y, lineData.blockLineHeight, fontSize, "normal", "normal", fontFamily, rasterizer
          );
          for (let i = 0; i < lineNumStr.length; i++) {
            const char = lineNumStr[i];
            const glyph = glyphAtlas.getGlyph(char, fontSize, "normal", "normal", fontFamily);
            textBatch.addGlyph(charPositions[i], baselineY, glyph, lineNumberTextColor);
          }
        }

        // Draw characters using cached positions
        for (const charPos of lineData.positionData.charPositions) {
          const baselineY = calculateBaselineY(
            lineData.y, lineData.blockLineHeight, charPos.fontSize, charPos.fontWeight, charPos.fontStyle, charPos.fontFamily, rasterizer
          );
          const glyph = glyphAtlas.getGlyph(charPos.char, charPos.fontSize, charPos.fontWeight, charPos.fontStyle, charPos.fontFamily);
          textBatch.addGlyph(charPos.x, baselineY, glyph, charPos.color);
        }
      }
      currentLine += lines.length;
    }

    // Upload any new glyphs
    glyphAtlas.uploadTexture();

    textBatch.flush();

    // =================================
    // Pass 5: Render cursor (using cached positions)
    // =================================
    if (cursor?.visible) {
      gl.useProgram(highlightShader.program);
      gl.uniformMatrix4fv(highlightShader.uniforms.projection, false, projection);

      highlightRenderer.begin();

      const lineData = lineDataCache.get(cursor.line);
      if (lineData) {
        const cursorX = getColumnX(cursor.column, lineData.positionData, lineData.codeXOffset - viewportOffsetX);
        highlightRenderer.addCursor(cursorX, lineData.y, lineData.blockLineHeight, cursorColorParsed);
      }

      highlightRenderer.flush();
    }
  }, [
    blocks,
    visibleRange,
    tokenCache,
    lineHeight,
    padding,
    width,
    canvasHeight,
    showLineNumbers,
    lineNumberWidth,
    highlights,
    cursor,
    tokenStyles,
    fontFamily,
    fontSize,
    startLineNumber,
    blockTypeStyles,
    blockLayoutIndex,
    viewport,
    cursorColorParsed,
    lineNumberBgColor,
    lineNumberTextColor,
  ]);

  // Return just the canvas - BlockRenderer handles spacers
  return (
    <canvas
      ref={canvasRef}
      style={{
        ...canvasStyle,
        width: width || "100%",
        height: canvasHeight,
      }}
    />
  );
});
