/**
 * @file Text Batch Manager
 *
 * Efficient quad batching for WebGL text rendering.
 */

import type {
  ShaderProgramInfo,
  GlyphInfo,
  Color,
  BatchConfig,
} from "./types";
import { DEFAULT_BATCH_CONFIG } from "./types";

// =============================================================================
// Text Batch Class
// =============================================================================

/**
 * Batches text quads for efficient GPU rendering.
 *
 * Each glyph is rendered as a textured quad (2 triangles, 6 vertices).
 * Batching reduces draw calls by combining multiple glyphs into a single buffer.
 */
export class TextBatch {
  private readonly gl: WebGLRenderingContext;
  private readonly config: BatchConfig;
  private readonly shaderProgram: ShaderProgramInfo;

  /** Vertex buffer */
  private readonly buffer: WebGLBuffer;

  /** Vertex data array */
  private readonly vertices: Float32Array;

  /** Current quad count in batch */
  private quadCount = 0;

  /** Atlas dimensions for texture coordinate calculation */
  private atlasWidth = 1024;
  private atlasHeight = 1024;

  constructor(
    gl: WebGLRenderingContext,
    shaderProgram: ShaderProgramInfo,
    config: BatchConfig = DEFAULT_BATCH_CONFIG
  ) {
    this.gl = gl;
    this.config = config;
    this.shaderProgram = shaderProgram;

    // Create vertex buffer
    const buffer = gl.createBuffer();
    if (!buffer) {
      throw new Error("Failed to create vertex buffer");
    }
    this.buffer = buffer;

    // Allocate vertex array
    const totalFloats =
      config.maxQuads * config.verticesPerQuad * config.floatsPerVertex;
    this.vertices = new Float32Array(totalFloats);
  }

  /**
   * Set atlas dimensions for texture coordinate calculation.
   */
  setAtlasDimensions(width: number, height: number): void {
    this.atlasWidth = width;
    this.atlasHeight = height;
  }

  /**
   * Begin a new batch.
   */
  begin(): void {
    this.quadCount = 0;
  }

  /**
   * Add a glyph quad to the batch.
   *
   * @param x - Screen X position (left edge of character cell)
   * @param baselineY - Screen Y position of the text baseline
   * @param glyph - Glyph information from atlas
   * @param color - Text color
   */
  addGlyph(x: number, baselineY: number, glyph: GlyphInfo, color: Color): void {
    if (this.quadCount >= this.config.maxQuads) {
      this.flush();
    }

    const { atlasX, atlasY, atlasWidth, atlasHeight, metrics } = glyph;

    // Calculate screen positions
    // bearingX: horizontal offset from the origin to the left edge of the glyph
    // bearingY: distance from baseline to top of glyph (ascent)
    // The glyph's top-left corner is at (x - bearingX, baselineY - bearingY)
    const x0 = x - metrics.bearingX;
    const y0 = baselineY - metrics.bearingY;
    const x1 = x0 + atlasWidth;
    const y1 = y0 + atlasHeight;

    // Calculate texture coordinates (normalized 0-1)
    const u0 = atlasX / this.atlasWidth;
    const v0 = atlasY / this.atlasHeight;
    const u1 = (atlasX + atlasWidth) / this.atlasWidth;
    const v1 = (atlasY + atlasHeight) / this.atlasHeight;

    // Color components
    const { r, g, b, a } = color;

    // Vertex offset in array
    const floatsPerQuad = this.config.verticesPerQuad * this.config.floatsPerVertex;
    const offset = this.quadCount * floatsPerQuad;

    // Triangle 1: top-left, top-right, bottom-left
    // Vertex 0: top-left
    this.vertices[offset + 0] = x0;
    this.vertices[offset + 1] = y0;
    this.vertices[offset + 2] = u0;
    this.vertices[offset + 3] = v0;
    this.vertices[offset + 4] = r;
    this.vertices[offset + 5] = g;
    this.vertices[offset + 6] = b;
    this.vertices[offset + 7] = a;

    // Vertex 1: top-right
    this.vertices[offset + 8] = x1;
    this.vertices[offset + 9] = y0;
    this.vertices[offset + 10] = u1;
    this.vertices[offset + 11] = v0;
    this.vertices[offset + 12] = r;
    this.vertices[offset + 13] = g;
    this.vertices[offset + 14] = b;
    this.vertices[offset + 15] = a;

    // Vertex 2: bottom-left
    this.vertices[offset + 16] = x0;
    this.vertices[offset + 17] = y1;
    this.vertices[offset + 18] = u0;
    this.vertices[offset + 19] = v1;
    this.vertices[offset + 20] = r;
    this.vertices[offset + 21] = g;
    this.vertices[offset + 22] = b;
    this.vertices[offset + 23] = a;

    // Triangle 2: top-right, bottom-right, bottom-left
    // Vertex 3: top-right
    this.vertices[offset + 24] = x1;
    this.vertices[offset + 25] = y0;
    this.vertices[offset + 26] = u1;
    this.vertices[offset + 27] = v0;
    this.vertices[offset + 28] = r;
    this.vertices[offset + 29] = g;
    this.vertices[offset + 30] = b;
    this.vertices[offset + 31] = a;

    // Vertex 4: bottom-right
    this.vertices[offset + 32] = x1;
    this.vertices[offset + 33] = y1;
    this.vertices[offset + 34] = u1;
    this.vertices[offset + 35] = v1;
    this.vertices[offset + 36] = r;
    this.vertices[offset + 37] = g;
    this.vertices[offset + 38] = b;
    this.vertices[offset + 39] = a;

    // Vertex 5: bottom-left
    this.vertices[offset + 40] = x0;
    this.vertices[offset + 41] = y1;
    this.vertices[offset + 42] = u0;
    this.vertices[offset + 43] = v1;
    this.vertices[offset + 44] = r;
    this.vertices[offset + 45] = g;
    this.vertices[offset + 46] = b;
    this.vertices[offset + 47] = a;

    this.quadCount++;
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
    const { floatsPerVertex, verticesPerQuad } = this.config;

    // Bind buffer and upload data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    const vertexCount = this.quadCount * verticesPerQuad;
    const byteLength = vertexCount * floatsPerVertex * 4;

    gl.bufferData(
      gl.ARRAY_BUFFER,
      this.vertices.subarray(0, vertexCount * floatsPerVertex),
      gl.STREAM_DRAW
    );

    // Set up vertex attributes
    const stride = floatsPerVertex * 4;

    // Position (vec2)
    gl.enableVertexAttribArray(attributes.position);
    gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, stride, 0);

    // Texture coordinates (vec2)
    gl.enableVertexAttribArray(attributes.texCoord);
    gl.vertexAttribPointer(attributes.texCoord, 2, gl.FLOAT, false, stride, 8);

    // Color (vec4)
    gl.enableVertexAttribArray(attributes.color);
    gl.vertexAttribPointer(attributes.color, 4, gl.FLOAT, false, stride, 16);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

    // Reset batch
    this.quadCount = 0;
  }

  /**
   * Get current quad count.
   */
  getQuadCount(): number {
    return this.quadCount;
  }

  /**
   * Dispose resources.
   */
  dispose(): void {
    this.gl.deleteBuffer(this.buffer);
  }
}
