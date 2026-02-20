/**
 * @file Glyph Atlas Manager
 *
 * Dynamic texture atlas for glyph storage using row-based bin packing.
 */

import type {
  GlyphInfo,
  FontKey,
  AtlasRow,
  AtlasConfig,
} from "./types";
import { DEFAULT_ATLAS_CONFIG, ASCII_PRINTABLE } from "./types";
import { GlyphRasterizer, createFontKey } from "./GlyphRasterizer";

// =============================================================================
// Glyph Atlas Class
// =============================================================================

/**
 * Dynamic glyph texture atlas.
 *
 * Uses row-based bin packing to efficiently store glyphs of varying sizes.
 * Supports multiple font styles via font keys.
 */
export class GlyphAtlas {
  private readonly config: AtlasConfig;
  private readonly rasterizer: GlyphRasterizer;

  /** WebGL context */
  private readonly gl: WebGLRenderingContext;

  /** Atlas texture */
  private texture: WebGLTexture;

  /** Current atlas dimensions */
  private width: number;
  private height: number;

  /** Canvas for texture updates */
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  /** Row-based bin packing state */
  private rows: AtlasRow[] = [];

  /** Glyph cache: fontKey -> (char -> GlyphInfo) */
  private readonly glyphCache = new Map<FontKey, Map<string, GlyphInfo>>();

  /** Flag indicating texture needs upload */
  private needsUpload = false;

  constructor(gl: WebGLRenderingContext, config: AtlasConfig = DEFAULT_ATLAS_CONFIG) {
    this.gl = gl;
    this.config = config;
    this.rasterizer = new GlyphRasterizer();

    // Initialize dimensions
    this.width = config.initialWidth;
    this.height = config.initialHeight;

    // Create canvas for texture data
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context for atlas canvas");
    }
    this.ctx = ctx;

    // Create WebGL texture
    const texture = gl.createTexture();
    if (!texture) {
      throw new Error("Failed to create WebGL texture");
    }
    this.texture = texture;

    // Initialize texture
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Initialize with empty texture
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.width,
      this.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
  }

  /**
   * Get the atlas texture for binding.
   */
  getTexture(): WebGLTexture {
    return this.texture;
  }

  /**
   * Get current atlas dimensions.
   */
  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  /**
   * Get a glyph from the atlas, adding it if not present.
   */
  getGlyph(
    char: string,
    fontSize: number,
    fontWeight: string,
    fontStyle: string,
    fontFamily: string
  ): GlyphInfo {
    const fontKey = createFontKey(fontSize, fontWeight, fontStyle, fontFamily);

    // Check cache
    let fontGlyphs = this.glyphCache.get(fontKey);
    if (!fontGlyphs) {
      fontGlyphs = new Map();
      this.glyphCache.set(fontKey, fontGlyphs);
    }

    let glyphInfo = fontGlyphs.get(char);
    if (glyphInfo) {
      return glyphInfo;
    }

    // Rasterize and add to atlas
    glyphInfo = this.addGlyph(char, fontSize, fontWeight, fontStyle, fontFamily, fontKey);
    fontGlyphs.set(char, glyphInfo);

    return glyphInfo;
  }

  /**
   * Ensure all characters in a string are in the atlas.
   */
  ensureGlyphs(
    chars: string,
    fontSize: number,
    fontWeight: string,
    fontStyle: string,
    fontFamily: string
  ): void {
    for (const char of chars) {
      this.getGlyph(char, fontSize, fontWeight, fontStyle, fontFamily);
    }
  }

  /**
   * Warm up the atlas with ASCII printable characters.
   */
  warmUpAscii(
    fontSize: number,
    fontWeight: string,
    fontStyle: string,
    fontFamily: string
  ): void {
    this.ensureGlyphs(ASCII_PRINTABLE, fontSize, fontWeight, fontStyle, fontFamily);
    this.uploadTexture();
  }

  /**
   * Upload pending changes to the GPU texture.
   */
  uploadTexture(): void {
    if (!this.needsUpload) {
      return;
    }

    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.canvas
    );

    this.needsUpload = false;
  }

  /**
   * Add a glyph to the atlas.
   */
  private addGlyph(
    char: string,
    fontSize: number,
    fontWeight: string,
    fontStyle: string,
    fontFamily: string,
    fontKey: FontKey
  ): GlyphInfo {
    const { imageData, metrics } = this.rasterizer.rasterize(
      char,
      fontSize,
      fontWeight,
      fontStyle,
      fontFamily
    );

    const glyphWidth = imageData.width;
    const glyphHeight = imageData.height;

    // Find space for the glyph
    const position = this.findSpace(glyphWidth, glyphHeight);

    // Copy glyph to canvas
    this.ctx.putImageData(imageData, position.x, position.y);
    this.needsUpload = true;

    return {
      char,
      fontKey,
      metrics,
      atlasX: position.x,
      atlasY: position.y,
      atlasWidth: glyphWidth,
      atlasHeight: glyphHeight,
    };
  }

  /**
   * Find space for a glyph using row-based bin packing.
   */
  private findSpace(width: number, height: number): { x: number; y: number } {
    const padding = this.config.padding;
    const paddedWidth = width + padding;
    const paddedHeight = height + padding;

    // Try to fit in existing rows
    for (const row of this.rows) {
      if (row.height >= paddedHeight && row.x + paddedWidth <= this.width) {
        const position = { x: row.x, y: row.y };
        row.x += paddedWidth;
        return position;
      }
    }

    // Need a new row
    const lastRow = this.rows[this.rows.length - 1];
    const newRowY = lastRow ? lastRow.y + lastRow.height : 0;

    // Check if we need to expand the atlas
    if (newRowY + paddedHeight > this.height) {
      this.expandAtlas();
    }

    // Create new row
    const newRow: AtlasRow = {
      y: newRowY,
      height: paddedHeight,
      x: paddedWidth,
    };
    this.rows.push(newRow);

    return { x: 0, y: newRowY };
  }

  /**
   * Expand the atlas texture.
   */
  private expandAtlas(): void {
    const newHeight = Math.min(this.height * 2, this.config.maxHeight);
    if (newHeight === this.height) {
      // Try expanding width instead
      const newWidth = Math.min(this.width * 2, this.config.maxWidth);
      if (newWidth === this.width) {
        console.warn("GlyphAtlas: Cannot expand further, at maximum size");
        return;
      }
      this.width = newWidth;
    } else {
      this.height = newHeight;
    }

    // Create new canvas with larger size
    const oldImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx.putImageData(oldImageData, 0, 0);

    // Recreate texture with new size
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.width,
      this.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );

    this.needsUpload = true;
  }

  /**
   * Clear the atlas and release resources.
   */
  dispose(): void {
    this.gl.deleteTexture(this.texture);
    this.glyphCache.clear();
    this.rows = [];
  }
}
