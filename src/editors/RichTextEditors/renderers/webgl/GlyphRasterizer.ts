/**
 * @file Glyph Rasterizer
 *
 * Canvas 2D-based glyph rasterization for WebGL texture atlas.
 * Uses the same measurement approach as Canvas renderer for consistency.
 */

import type { GlyphMetrics, FontKey } from "./types";

// =============================================================================
// Font Key Generation
// =============================================================================

/**
 * Generate a unique font key for atlas lookup.
 *
 * @param fontSize - Font size in pixels
 * @param fontWeight - Font weight (e.g., "normal", "bold", "700")
 * @param fontStyle - Font style (e.g., "normal", "italic")
 * @param fontFamily - Font family
 * @returns Font key string
 */
export function createFontKey(
  fontSize: number,
  fontWeight: string,
  fontStyle: string,
  fontFamily: string
): FontKey {
  return `${fontSize}px-${fontWeight}-${fontStyle}-${fontFamily}`;
}

/**
 * Build CSS font string from components.
 */
export function buildFontString(
  fontSize: number,
  fontWeight: string,
  fontStyle: string,
  fontFamily: string
): string {
  return `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
}

// =============================================================================
// Glyph Rasterizer Class
// =============================================================================

/**
 * Rasterized glyph data with pixel information.
 */
export type RasterizedGlyph = {
  /** Raw pixel data (RGBA) */
  readonly imageData: ImageData;
  /** Glyph metrics */
  readonly metrics: GlyphMetrics;
};

/**
 * Glyph rasterizer using Canvas 2D.
 *
 * Shares the same text measurement logic as Canvas renderer for consistency.
 */
export class GlyphRasterizer {
  private readonly canvas: OffscreenCanvas | HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  /** Padding around each glyph to prevent clipping */
  private readonly glyphPadding = 4;

  constructor() {
    // Use OffscreenCanvas if available for better performance
    if (typeof OffscreenCanvas !== "undefined") {
      this.canvas = new OffscreenCanvas(256, 256);
      const ctx = this.canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context from OffscreenCanvas");
      }
      this.ctx = ctx;
    } else {
      this.canvas = document.createElement("canvas");
      this.canvas.width = 256;
      this.canvas.height = 256;
      const ctx = this.canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context from canvas");
      }
      this.ctx = ctx;
    }
  }

  /**
   * Measure a single character.
   *
   * Uses Canvas 2D measureText() for consistent results with CanvasRenderer.
   * Returns float values for sub-pixel accurate positioning.
   */
  measure(
    char: string,
    fontSize: number,
    fontWeight: string,
    fontStyle: string,
    fontFamily: string
  ): GlyphMetrics {
    const ctx = this.ctx;
    ctx.font = buildFontString(fontSize, fontWeight, fontStyle, fontFamily);
    ctx.textBaseline = "alphabetic";

    const metrics = ctx.measureText(char);

    // Get bounding box metrics (available in modern browsers)
    // Keep as floats for sub-pixel accurate positioning
    const ascent = metrics.actualBoundingBoxAscent ?? fontSize * 0.8;
    const descent = metrics.actualBoundingBoxDescent ?? fontSize * 0.2;
    const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
    const actualRight = metrics.actualBoundingBoxRight ?? metrics.width;
    const width = actualRight - actualLeft;

    return {
      // Width/height are integers for atlas sizing (ceiled to ensure we have enough space)
      width: Math.ceil(width) || Math.ceil(metrics.width),
      height: Math.ceil(ascent + descent),
      // Keep bearingX/Y as floats for sub-pixel accurate screen positioning
      bearingX: actualLeft,
      bearingY: ascent,
      advance: metrics.width,
    };
  }

  /**
   * Rasterize a single character to ImageData.
   *
   * @param char - Character to rasterize
   * @param fontSize - Font size in pixels
   * @param fontWeight - Font weight
   * @param fontStyle - Font style
   * @param fontFamily - Font family
   * @returns Rasterized glyph data
   */
  rasterize(
    char: string,
    fontSize: number,
    fontWeight: string,
    fontStyle: string,
    fontFamily: string
  ): RasterizedGlyph {
    const metrics = this.measure(char, fontSize, fontWeight, fontStyle, fontFamily);
    const ctx = this.ctx;
    const canvas = this.canvas;

    // Calculate canvas size with padding
    // Use ceil() for canvas sizing to ensure enough space
    const canvasWidth = Math.max(
      Math.ceil(metrics.width) + this.glyphPadding * 2,
      Math.ceil(metrics.advance) + this.glyphPadding * 2,
      1
    );
    const canvasHeight = Math.max(metrics.height + this.glyphPadding * 2, 1);

    // Resize canvas if needed
    if (canvas.width < canvasWidth || canvas.height < canvasHeight) {
      canvas.width = Math.max(canvas.width, canvasWidth);
      canvas.height = Math.max(canvas.height, canvasHeight);
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Set up font
    ctx.font = buildFontString(fontSize, fontWeight, fontStyle, fontFamily);
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "white"; // White text on transparent background

    // Draw character with float position for sub-pixel accurate rendering
    // The origin is placed at (padding - bearingX, padding + bearingY)
    // This positions the glyph's left edge at exactly 'padding' in the atlas
    const x = this.glyphPadding - metrics.bearingX;
    const y = this.glyphPadding + metrics.bearingY;
    ctx.fillText(char, x, y);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

    return { imageData, metrics };
  }

  /**
   * Measure text width (for cursor/highlight positioning).
   *
   * This provides the same measurement as CanvasRenderer's ctx.measureText().
   */
  measureText(
    text: string,
    fontSize: number,
    fontWeight: string,
    fontStyle: string,
    fontFamily: string
  ): number {
    const ctx = this.ctx;
    ctx.font = buildFontString(fontSize, fontWeight, fontStyle, fontFamily);
    return ctx.measureText(text).width;
  }

  /**
   * Measure character X positions for a string using cumulative measurement.
   * This properly accounts for kerning by measuring each prefix substring.
   *
   * @param text - Text to measure
   * @param startX - Starting X position
   * @param fontSize - Font size in pixels
   * @param fontWeight - Font weight
   * @param fontStyle - Font style
   * @param fontFamily - Font family
   * @returns Array of X positions for each character
   */
  measureCharacterPositions(
    text: string,
    startX: number,
    fontSize: number,
    fontWeight: string,
    fontStyle: string,
    fontFamily: string
  ): number[] {
    const ctx = this.ctx;
    ctx.font = buildFontString(fontSize, fontWeight, fontStyle, fontFamily);

    const positions: number[] = [];
    for (let i = 0; i < text.length; i++) {
      // Measure text up to this character to get cumulative width with kerning
      const textBefore = text.slice(0, i);
      const widthBefore = textBefore.length > 0 ? ctx.measureText(textBefore).width : 0;
      positions.push(startX + widthBefore);
    }
    return positions;
  }

  /**
   * Get font metrics (ascent, descent) for accurate baseline calculation.
   *
   * Uses fontBoundingBoxAscent/Descent for consistent metrics across characters.
   * Falls back to actualBoundingBox metrics or estimates if not available.
   */
  getFontMetrics(
    fontSize: number,
    fontWeight: string,
    fontStyle: string,
    fontFamily: string
  ): { ascent: number; descent: number } {
    const ctx = this.ctx;
    ctx.font = buildFontString(fontSize, fontWeight, fontStyle, fontFamily);

    // Measure a representative character to get font metrics
    const metrics = ctx.measureText("M");

    // Prefer fontBoundingBox metrics (consistent across all characters in the font)
    // Fall back to actualBoundingBox (character-specific) or estimates
    const ascent =
      metrics.fontBoundingBoxAscent ??
      metrics.actualBoundingBoxAscent ??
      fontSize * 0.8;
    const descent =
      metrics.fontBoundingBoxDescent ??
      metrics.actualBoundingBoxDescent ??
      fontSize * 0.2;

    return { ascent, descent };
  }
}
