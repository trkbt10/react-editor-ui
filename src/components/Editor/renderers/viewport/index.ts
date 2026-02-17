/**
 * @file Viewport Module Exports
 *
 * Viewport-based rendering system for Editor component.
 */

// Types
export type {
  ViewportMode,
  ViewportConfig,
  Offset2D,
  Size2D,
  ViewportState,
  LineVisibility,
  VisibleLineItem,
  VisibleLineRange,
  DocumentDimensions,
} from "./types";

export { DEFAULT_VIEWPORT_CONFIG, createViewportState } from "./types";

// Line Height Tree
export type { LineHeightTree } from "./LineHeightTree";
export { createLineHeightTree } from "./LineHeightTree";

// Viewport Scroll Engine
export type {
  ViewportEngineConfig,
  ViewportScrollCalculator,
} from "./ViewportScrollEngine";

export {
  createViewportScrollEngine,
  DEFAULT_VIEWPORT_ENGINE_CONFIG,
} from "./ViewportScrollEngine";

// React Hook
export type {
  UseViewportScrollOptions,
  UseViewportScrollResult,
} from "./useViewportScroll";

export { useViewportScroll } from "./useViewportScroll";
