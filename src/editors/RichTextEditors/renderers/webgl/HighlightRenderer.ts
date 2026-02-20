/**
 * @file Highlight Renderer
 *
 * WebGL rendering for selection, cursor, and search highlights.
 */

import type { ShaderProgramInfo, Color } from "./types";

// =============================================================================
// Highlight Batch Configuration
// =============================================================================

/** Maximum highlights per batch */
const MAX_HIGHLIGHTS = 1000;

/** Floats per vertex: x, y, r, g, b, a */
const FLOATS_PER_VERTEX = 6;

/** Vertices per quad (2 triangles) */
const VERTICES_PER_QUAD = 6;

// =============================================================================
// Highlight Renderer Class
// =============================================================================

/**
 * Renders highlight rectangles (selections, cursor, search matches).
 *
 * Uses a separate shader without texture coordinates for solid color rendering.
 */
export class HighlightRenderer {
  private readonly gl: WebGLRenderingContext;
  private readonly shaderProgram: ShaderProgramInfo;

  /** Vertex buffer */
  private readonly buffer: WebGLBuffer;

  /** Vertex data array */
  private readonly vertices: Float32Array;

  /** Current quad count */
  private quadCount = 0;

  constructor(gl: WebGLRenderingContext, shaderProgram: ShaderProgramInfo) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;

    // Create vertex buffer
    const buffer = gl.createBuffer();
    if (!buffer) {
      throw new Error("Failed to create highlight vertex buffer");
    }
    this.buffer = buffer;

    // Allocate vertex array
    const totalFloats = MAX_HIGHLIGHTS * VERTICES_PER_QUAD * FLOATS_PER_VERTEX;
    this.vertices = new Float32Array(totalFloats);
  }

  /**
   * Begin a new batch.
   */
  begin(): void {
    this.quadCount = 0;
  }

  /**
   * Add a highlight rectangle.
   *
   * @param x - Left edge
   * @param y - Top edge
   * @param width - Rectangle width
   * @param height - Rectangle height
   * @param color - Fill color
   */
  addRect(x: number, y: number, width: number, height: number, color: Color): void {
    if (this.quadCount >= MAX_HIGHLIGHTS) {
      this.flush();
    }

    const x0 = x;
    const y0 = y;
    const x1 = x + width;
    const y1 = y + height;

    const { r, g, b, a } = color;

    // Vertex offset in array
    const floatsPerQuad = VERTICES_PER_QUAD * FLOATS_PER_VERTEX;
    const offset = this.quadCount * floatsPerQuad;

    // Triangle 1: top-left, top-right, bottom-left
    // Vertex 0: top-left
    this.vertices[offset + 0] = x0;
    this.vertices[offset + 1] = y0;
    this.vertices[offset + 2] = r;
    this.vertices[offset + 3] = g;
    this.vertices[offset + 4] = b;
    this.vertices[offset + 5] = a;

    // Vertex 1: top-right
    this.vertices[offset + 6] = x1;
    this.vertices[offset + 7] = y0;
    this.vertices[offset + 8] = r;
    this.vertices[offset + 9] = g;
    this.vertices[offset + 10] = b;
    this.vertices[offset + 11] = a;

    // Vertex 2: bottom-left
    this.vertices[offset + 12] = x0;
    this.vertices[offset + 13] = y1;
    this.vertices[offset + 14] = r;
    this.vertices[offset + 15] = g;
    this.vertices[offset + 16] = b;
    this.vertices[offset + 17] = a;

    // Triangle 2: top-right, bottom-right, bottom-left
    // Vertex 3: top-right
    this.vertices[offset + 18] = x1;
    this.vertices[offset + 19] = y0;
    this.vertices[offset + 20] = r;
    this.vertices[offset + 21] = g;
    this.vertices[offset + 22] = b;
    this.vertices[offset + 23] = a;

    // Vertex 4: bottom-right
    this.vertices[offset + 24] = x1;
    this.vertices[offset + 25] = y1;
    this.vertices[offset + 26] = r;
    this.vertices[offset + 27] = g;
    this.vertices[offset + 28] = b;
    this.vertices[offset + 29] = a;

    // Vertex 5: bottom-left
    this.vertices[offset + 30] = x0;
    this.vertices[offset + 31] = y1;
    this.vertices[offset + 32] = r;
    this.vertices[offset + 33] = g;
    this.vertices[offset + 34] = b;
    this.vertices[offset + 35] = a;

    this.quadCount++;
  }

  /**
   * Add a cursor (thin vertical rectangle).
   *
   * @param x - X position
   * @param y - Top edge
   * @param height - Cursor height
   * @param color - Cursor color
   * @param width - Cursor width (default 2px)
   */
  addCursor(x: number, y: number, height: number, color: Color, width = 2): void {
    this.addRect(x, y, width, height, color);
  }

  /**
   * Flush the current batch to the GPU.
   */
  flush(): void {
    if (this.quadCount === 0) {
      return;
    }

    const gl = this.gl;
    const { attributes } = this.shaderProgram;

    // Bind buffer and upload data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    const vertexCount = this.quadCount * VERTICES_PER_QUAD;

    gl.bufferData(
      gl.ARRAY_BUFFER,
      this.vertices.subarray(0, vertexCount * FLOATS_PER_VERTEX),
      gl.STREAM_DRAW
    );

    // Set up vertex attributes
    const stride = FLOATS_PER_VERTEX * 4;

    // Position (vec2)
    gl.enableVertexAttribArray(attributes.position);
    gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, stride, 0);

    // Color (vec4)
    gl.enableVertexAttribArray(attributes.color);
    gl.vertexAttribPointer(attributes.color, 4, gl.FLOAT, false, stride, 8);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

    // Reset batch
    this.quadCount = 0;
  }

  /**
   * Dispose resources.
   */
  dispose(): void {
    this.gl.deleteBuffer(this.buffer);
  }
}

// =============================================================================
// Highlight Colors (Raw RGBA values for WebGL)
// =============================================================================

/**
 * Parse an RGBA color string to Color object.
 */
export function parseRgbaColor(rgba: string): Color {
  // Match rgba(r, g, b, a) or rgb(r, g, b)
  const rgbaMatch = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10) / 255,
      g: parseInt(rgbaMatch[2], 10) / 255,
      b: parseInt(rgbaMatch[3], 10) / 255,
      a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
    };
  }

  // Match hex color #RRGGBB or #RGB
  const hexMatch = rgba.match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return {
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
      a: 1,
    };
  }

  // Default to black
  return { r: 0, g: 0, b: 0, a: 1 };
}

/** Selection highlight color */
export const SELECTION_COLOR: Color = { r: 0.2, g: 0.565, b: 1, a: 0.3 };

/** Search match color */
export const MATCH_COLOR: Color = { r: 1, g: 0.835, b: 0, a: 0.4 };

/** Current search match color */
export const CURRENT_MATCH_COLOR: Color = { r: 1, g: 0.549, b: 0, a: 0.6 };

/** IME composition color */
export const COMPOSITION_COLOR: Color = { r: 0.392, g: 0.392, b: 1, a: 0.2 };

/** Cursor color (black) */
export const CURSOR_COLOR: Color = { r: 0, g: 0, b: 0, a: 1 };
