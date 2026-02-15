/**
 * @file Type definitions for Canvas component
 */

import type { CSSProperties, ReactNode } from "react";

/**
 * Viewport state representing current pan/zoom
 */
export type ViewportState = {
  /** X offset (pan) in canvas coordinates */
  readonly x: number;
  /** Y offset (pan) in canvas coordinates */
  readonly y: number;
  /** Scale factor (1 = 100%) */
  readonly scale: number;
};

/**
 * Viewport constraints
 */
export type ViewportConstraints = {
  /** Minimum scale */
  readonly minScale: number;
  /** Maximum scale */
  readonly maxScale: number;
};

/**
 * Pan trigger types
 * - "middle": Middle mouse button drag
 * - "alt": Alt + left click drag
 * - "space": Space + left click drag
 * - "touch": Single touch drag (mobile)
 */
export type PanTrigger = "middle" | "alt" | "space" | "touch";

/**
 * Gesture configuration
 */
export type GestureConfig = {
  /** Enable wheel zoom */
  readonly wheelZoom: boolean;
  /** Enable pinch-to-zoom */
  readonly pinchZoom: boolean;
  /** Enable pan by drag */
  readonly panEnabled: boolean;
  /** Zoom factor per wheel tick */
  readonly wheelZoomFactor: number;
  /** Enabled pan triggers */
  readonly panTriggers: readonly PanTrigger[];
};

/**
 * Canvas component props
 */
export type CanvasProps = {
  /** Current viewport state (controlled) */
  viewport: ViewportState;
  /** Called when viewport changes */
  onViewportChange: (viewport: ViewportState) => void;

  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;

  /** Content to render on canvas */
  children?: ReactNode;

  /** Viewport constraints */
  constraints?: Partial<ViewportConstraints>;
  /** Gesture configuration */
  gestureConfig?: Partial<GestureConfig>;

  /** Background color/pattern */
  background?: string;
  /** Show grid pattern */
  showGrid?: boolean;
  /** Grid size in canvas units */
  gridSize?: number;

  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;

  /** Accessibility label */
  "aria-label"?: string;
};

/**
 * CanvasContent props for positioning children
 */
export type CanvasContentProps = {
  /** X position in canvas coordinates */
  x: number;
  /** Y position in canvas coordinates */
  y: number;
  /** Content to render */
  children: ReactNode;
};

// ========================================
// DEFAULT VALUES
// ========================================

export const DEFAULT_VIEWPORT: ViewportState = {
  x: 0,
  y: 0,
  scale: 1,
};

export const DEFAULT_CONSTRAINTS: ViewportConstraints = {
  minScale: 0.1,
  maxScale: 10,
};

export const DEFAULT_GESTURE_CONFIG: GestureConfig = {
  wheelZoom: true,
  pinchZoom: true,
  panEnabled: true,
  wheelZoomFactor: 0.1,
  panTriggers: ["middle", "alt", "space", "touch"],
};
