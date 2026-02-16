/**
 * @file Renderers module exports
 */

// Types
export type {
  CursorState,
  HighlightRange,
  HighlightType,
  LineHighlight,
  RendererComponent,
  RendererProps,
  RendererType,
  Token,
  TokenCache,
  Tokenizer,
  TokenStyleMap,
} from "./types";

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
