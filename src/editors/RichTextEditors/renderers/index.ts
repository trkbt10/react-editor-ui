/**
 * @file Renderers module exports
 */

// Types from renderer layer
export type {
  LineHighlight,
  RendererComponent,
  RendererProps,
  RendererType,
  Token,
  TokenCache,
  Tokenizer,
  TokenStyleMap,
} from "./types";

// Note: Core types should be imported directly from ../core/types

export {
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_LINE_NUMBER_WIDTH,
} from "./types";

// Utilities
export {
  getColumnX,
  getLineHighlights,
  getVisibleLineIndices,
  HIGHLIGHT_COLORS,
  HIGHLIGHT_COLORS_RAW,
} from "./utils";

// Renderers
export { SvgRenderer } from "./SvgRenderer";
export { CanvasRenderer } from "./CanvasRenderer";
export { BlockRenderer } from "./BlockRenderer";
export type { BlockRendererProps, BlockRenderInfo } from "./BlockRenderer";

// WebGL Renderer
export { WebGLBlockRenderer } from "./webgl";
export type { WebGLBlockRendererProps } from "./webgl";
