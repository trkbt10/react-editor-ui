/**
 * @file WebGL Shader Program Management
 *
 * Utilities for compiling and managing WebGL shaders.
 */

import type { ShaderProgramInfo, ShaderAttributes, ShaderUniforms } from "./types";

// =============================================================================
// Shader Compilation
// =============================================================================

/**
 * Compile a single shader.
 *
 * @param gl - WebGL context
 * @param type - Shader type (VERTEX_SHADER or FRAGMENT_SHADER)
 * @param source - GLSL source code
 * @returns Compiled shader
 * @throws Error if compilation fails
 */
export function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Failed to create shader");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed: ${info}`);
  }

  return shader;
}

/**
 * Link vertex and fragment shaders into a program.
 *
 * @param gl - WebGL context
 * @param vertexShader - Compiled vertex shader
 * @param fragmentShader - Compiled fragment shader
 * @returns Linked program
 * @throws Error if linking fails
 */
export function linkProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram {
  const program = gl.createProgram();
  if (!program) {
    throw new Error("Failed to create program");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program linking failed: ${info}`);
  }

  return program;
}

// =============================================================================
// Program Creation
// =============================================================================

/**
 * Create a shader program from source code.
 *
 * @param gl - WebGL context
 * @param vertexSource - Vertex shader GLSL source
 * @param fragmentSource - Fragment shader GLSL source
 * @returns Compiled and linked program
 */
export function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  try {
    return linkProgram(gl, vertexShader, fragmentShader);
  } finally {
    // Clean up shaders after linking (they're no longer needed)
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  }
}

/**
 * Create a text shader program with attribute and uniform locations.
 *
 * @param gl - WebGL context
 * @param vertexSource - Vertex shader source
 * @param fragmentSource - Fragment shader source
 * @returns Shader program info with locations
 */
export function createTextShaderProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string
): ShaderProgramInfo {
  const program = createProgram(gl, vertexSource, fragmentSource);

  const attributes: ShaderAttributes = {
    position: gl.getAttribLocation(program, "a_position"),
    texCoord: gl.getAttribLocation(program, "a_texCoord"),
    color: gl.getAttribLocation(program, "a_color"),
  };

  const uniforms: ShaderUniforms = {
    projection: gl.getUniformLocation(program, "u_projection"),
    texture: gl.getUniformLocation(program, "u_texture"),
  };

  return { program, attributes, uniforms };
}

/**
 * Create a highlight shader program (no texture coordinates).
 *
 * @param gl - WebGL context
 * @param vertexSource - Vertex shader source
 * @param fragmentSource - Fragment shader source
 * @returns Shader program info
 */
export function createHighlightShaderProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string
): ShaderProgramInfo {
  const program = createProgram(gl, vertexSource, fragmentSource);

  const attributes: ShaderAttributes = {
    position: gl.getAttribLocation(program, "a_position"),
    texCoord: -1, // Not used
    color: gl.getAttribLocation(program, "a_color"),
  };

  const uniforms: ShaderUniforms = {
    projection: gl.getUniformLocation(program, "u_projection"),
    texture: null, // Not used
  };

  return { program, attributes, uniforms };
}

// =============================================================================
// Program Cleanup
// =============================================================================

/**
 * Delete a shader program and release resources.
 *
 * @param gl - WebGL context
 * @param programInfo - Program info to delete
 */
export function deleteShaderProgram(
  gl: WebGLRenderingContext,
  programInfo: ShaderProgramInfo
): void {
  gl.deleteProgram(programInfo.program);
}
