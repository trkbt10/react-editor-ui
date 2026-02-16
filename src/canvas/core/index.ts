/**
 * @file Core exports for Canvas component
 */

export type {
  ViewportState,
  ViewportConstraints,
  PanTrigger,
  GestureConfig,
  CanvasProps,
  GridLayerConfig,
  RulerConfig,
} from "./types";

export {
  DEFAULT_VIEWPORT,
  DEFAULT_CONSTRAINTS,
  DEFAULT_GESTURE_CONFIG,
  DEFAULT_GRID_CONFIG,
  DEFAULT_RULER_CONFIG,
} from "./types";

export type { CanvasContextValue, Point } from "./CanvasContext";
export { CanvasContext, useCanvasContext } from "./CanvasContext";

export type { UseKeyboardPanResult } from "./useKeyboardPan";
export { useKeyboardPan } from "./useKeyboardPan";

export type { UseGesturesConfig, UseGesturesResult } from "./useGestures";
export { useGestures, shouldPan, zoomToPoint } from "./useGestures";
