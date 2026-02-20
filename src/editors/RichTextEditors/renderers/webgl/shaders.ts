/**
 * @file WebGL Shader Sources
 *
 * GLSL shader source code for text rendering.
 */

// =============================================================================
// Text Shader (Glyph Rendering)
// =============================================================================

/**
 * Vertex shader for text rendering.
 *
 * Attributes:
 * - a_position: vec2 - Vertex position in screen coordinates
 * - a_texCoord: vec2 - Texture coordinates (0-1)
 * - a_color: vec4 - Vertex color (RGBA, 0-1)
 *
 * Uniforms:
 * - u_projection: mat4 - Orthographic projection matrix
 */
export const TEXT_VERTEX_SHADER = `
  precision mediump float;

  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  attribute vec4 a_color;

  uniform mat4 u_projection;

  varying vec2 v_texCoord;
  varying vec4 v_color;

  void main() {
    gl_Position = u_projection * vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
    v_color = a_color;
  }
`;

/**
 * Fragment shader for text rendering.
 *
 * Samples the glyph texture alpha and applies vertex color.
 * Uses alpha from texture for font anti-aliasing.
 *
 * Uniforms:
 * - u_texture: sampler2D - Glyph atlas texture
 */
export const TEXT_FRAGMENT_SHADER = `
  precision mediump float;

  uniform sampler2D u_texture;

  varying vec2 v_texCoord;
  varying vec4 v_color;

  void main() {
    float alpha = texture2D(u_texture, v_texCoord).a;
    gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
  }
`;

// =============================================================================
// Highlight Shader (Selection/Cursor Rendering)
// =============================================================================

/**
 * Vertex shader for highlight rectangles.
 *
 * Simpler than text shader - no texture coordinates.
 */
export const HIGHLIGHT_VERTEX_SHADER = `
  precision mediump float;

  attribute vec2 a_position;
  attribute vec4 a_color;

  uniform mat4 u_projection;

  varying vec4 v_color;

  void main() {
    gl_Position = u_projection * vec4(a_position, 0.0, 1.0);
    v_color = a_color;
  }
`;

/**
 * Fragment shader for highlight rectangles.
 *
 * Simple solid color output.
 */
export const HIGHLIGHT_FRAGMENT_SHADER = `
  precision mediump float;

  varying vec4 v_color;

  void main() {
    gl_FragColor = v_color;
  }
`;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Create an orthographic projection matrix.
 *
 * @param width - Viewport width
 * @param height - Viewport height
 * @returns 4x4 projection matrix as Float32Array (column-major)
 */
export function createOrthographicMatrix(
  width: number,
  height: number
): Float32Array {
  // Orthographic projection: maps (0,0)-(width,height) to (-1,-1)-(1,1)
  // Y is flipped so (0,0) is top-left
  const matrix = new Float32Array(16);

  // Column 0
  matrix[0] = 2 / width;
  matrix[1] = 0;
  matrix[2] = 0;
  matrix[3] = 0;

  // Column 1
  matrix[4] = 0;
  matrix[5] = -2 / height; // Flip Y
  matrix[6] = 0;
  matrix[7] = 0;

  // Column 2
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = 1;
  matrix[11] = 0;

  // Column 3 (translation)
  matrix[12] = -1;
  matrix[13] = 1; // Flip Y
  matrix[14] = 0;
  matrix[15] = 1;

  return matrix;
}
