/**
 * @file WebGL Renderer Types
 *
 * Type definitions specific to WebGL text rendering.
 */

// =============================================================================
// Glyph Types
// =============================================================================

/**
 * Font style key for glyph atlas lookup.
 * Format: "{fontSize}px-{fontWeight}-{fontStyle}-{fontFamily}"
 */
export type FontKey = string;

/**
 * Metrics for a single glyph.
 */
export type GlyphMetrics = {
  /** Character width in pixels */
  readonly width: number;
  /** Character height in pixels */
  readonly height: number;
  /** Horizontal bearing (offset from origin to left edge) */
  readonly bearingX: number;
  /** Vertical bearing (offset from baseline to top edge) */
  readonly bearingY: number;
  /** Advance width (horizontal distance to next glyph) */
  readonly advance: number;
};

/**
 * Information about a glyph in the texture atlas.
 */
export type GlyphInfo = {
  /** The character this glyph represents */
  readonly char: string;
  /** Font style key */
  readonly fontKey: FontKey;
  /** Glyph metrics */
  readonly metrics: GlyphMetrics;
  /** X position in atlas texture (pixels) */
  readonly atlasX: number;
  /** Y position in atlas texture (pixels) */
  readonly atlasY: number;
  /** Width in atlas texture (pixels) */
  readonly atlasWidth: number;
  /** Height in atlas texture (pixels) */
  readonly atlasHeight: number;
};

// =============================================================================
// Atlas Types
// =============================================================================

/**
 * Row in the glyph atlas for bin packing.
 */
export type AtlasRow = {
  /** Y position of the row */
  y: number;
  /** Height of the row */
  height: number;
  /** Current X cursor position */
  x: number;
};

/**
 * Configuration for the glyph atlas.
 */
export type AtlasConfig = {
  /** Initial atlas width */
  readonly initialWidth: number;
  /** Initial atlas height */
  readonly initialHeight: number;
  /** Maximum atlas width */
  readonly maxWidth: number;
  /** Maximum atlas height */
  readonly maxHeight: number;
  /** Padding between glyphs */
  readonly padding: number;
};

// =============================================================================
// Shader Types
// =============================================================================

/**
 * Shader attribute locations.
 */
export type ShaderAttributes = {
  /** Vertex position attribute */
  readonly position: number;
  /** Texture coordinate attribute */
  readonly texCoord: number;
  /** Color attribute */
  readonly color: number;
};

/**
 * Shader uniform locations.
 */
export type ShaderUniforms = {
  /** Projection matrix */
  readonly projection: WebGLUniformLocation | null;
  /** Glyph texture sampler */
  readonly texture: WebGLUniformLocation | null;
};

/**
 * Compiled shader program with attribute and uniform locations.
 */
export type ShaderProgramInfo = {
  /** WebGL program */
  readonly program: WebGLProgram;
  /** Attribute locations */
  readonly attributes: ShaderAttributes;
  /** Uniform locations */
  readonly uniforms: ShaderUniforms;
};

// =============================================================================
// Batch Types
// =============================================================================

/**
 * Single quad vertex data (6 vertices per quad for 2 triangles).
 * Each vertex: [x, y, u, v, r, g, b, a]
 */
export type QuadVertex = {
  readonly x: number;
  readonly y: number;
  readonly u: number;
  readonly v: number;
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
};

/**
 * Batch configuration.
 */
export type BatchConfig = {
  /** Maximum quads per batch */
  readonly maxQuads: number;
  /** Floats per vertex */
  readonly floatsPerVertex: number;
  /** Vertices per quad (6 for 2 triangles) */
  readonly verticesPerQuad: number;
};

// =============================================================================
// Renderer Types
// =============================================================================

/**
 * WebGL context state.
 */
export type WebGLState = {
  /** WebGL rendering context */
  readonly gl: WebGLRenderingContext;
  /** Shader program info */
  readonly shaderProgram: ShaderProgramInfo;
  /** Glyph atlas texture */
  readonly atlasTexture: WebGLTexture;
  /** Vertex buffer */
  readonly vertexBuffer: WebGLBuffer;
};

/**
 * Color in RGBA format (0-1 range).
 */
export type Color = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
};

// =============================================================================
// Constants
// =============================================================================

/** Default atlas configuration */
export const DEFAULT_ATLAS_CONFIG: AtlasConfig = {
  initialWidth: 1024,
  initialHeight: 1024,
  maxWidth: 4096,
  maxHeight: 4096,
  padding: 2,
};

/** Default batch configuration */
export const DEFAULT_BATCH_CONFIG: BatchConfig = {
  maxQuads: 10000,
  floatsPerVertex: 8, // x, y, u, v, r, g, b, a
  verticesPerQuad: 6, // 2 triangles
};

/** ASCII printable characters for warm-up */
export const ASCII_PRINTABLE = Array.from({ length: 95 }, (_, i) =>
  String.fromCharCode(32 + i)
).join("");
