/**
 * @file WebGL Renderer Module Exports
 */

// Main renderer component
export { WebGLBlockRenderer } from "./WebGLRenderer";
export type { WebGLBlockRendererProps } from "./WebGLRenderer";

// Core types
export type {
  FontKey,
  GlyphMetrics,
  GlyphInfo,
  AtlasRow,
  AtlasConfig,
  ShaderAttributes,
  ShaderUniforms,
  ShaderProgramInfo,
  QuadVertex,
  BatchConfig,
  WebGLState,
  Color,
} from "./types";

export {
  DEFAULT_ATLAS_CONFIG,
  DEFAULT_BATCH_CONFIG,
  ASCII_PRINTABLE,
} from "./types";

// Glyph system
export { GlyphRasterizer, createFontKey, buildFontString } from "./GlyphRasterizer";
export { GlyphAtlas } from "./GlyphAtlas";

// Batching
export { TextBatch } from "./TextBatch";
export {
  HighlightRenderer,
  parseRgbaColor,
  SELECTION_COLOR,
  MATCH_COLOR,
  CURRENT_MATCH_COLOR,
  COMPOSITION_COLOR,
  CURSOR_COLOR,
} from "./HighlightRenderer";

// Shaders
export {
  TEXT_VERTEX_SHADER,
  TEXT_FRAGMENT_SHADER,
  HIGHLIGHT_VERTEX_SHADER,
  HIGHLIGHT_FRAGMENT_SHADER,
  createOrthographicMatrix,
} from "./shaders";
export {
  compileShader,
  linkProgram,
  createProgram,
  createTextShaderProgram,
  createHighlightShaderProgram,
  deleteShaderProgram,
} from "./ShaderProgram";
