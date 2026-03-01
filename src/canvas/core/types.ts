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
  /** Callback to determine if pan should be allowed for a given event */
  readonly shouldAllowPan?: (e: PointerEvent) => boolean;
};

/**
 * Grid layer configuration
 */
export type GridLayerConfig = {
  /** Minor grid size in canvas units */
  readonly minorSize: number;
  /** Major grid size in canvas units (typically 5x or 10x minor) */
  readonly majorSize: number;
  /** Show origin lines (X=0, Y=0) */
  readonly showOrigin: boolean;
};

/**
 * Ruler configuration
 */
export type RulerConfig = {
  /** Ruler size in pixels */
  readonly size: number;
  /** Tick interval in canvas units */
  readonly tickInterval: number;
  /** Label interval in canvas units (typically 5x or 10x tick) */
  readonly labelInterval: number;
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

  /** SVG layers to render (grid, guides, etc.) */
  svgLayers?: ReactNode;

  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;

  /** Accessibility label */
  "aria-label"?: string;

  /** Called when clicking on the canvas background (not on content/SVG layers) */
  onBackgroundPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
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

export const DEFAULT_GRID_CONFIG: GridLayerConfig = {
  minorSize: 10,
  majorSize: 100,
  showOrigin: true,
};

export const DEFAULT_RULER_CONFIG: RulerConfig = {
  size: 20,
  tickInterval: 10,
  labelInterval: 100,
};

// ========================================
// CANVAS GUIDE TYPES
// ========================================

/**
 * Guide line orientation
 */
export type GuideOrientation = "horizontal" | "vertical";

/**
 * A single guide line
 */
export type CanvasGuide = {
  /** Unique identifier */
  readonly id: string;
  /** Orientation of the guide */
  readonly orientation: GuideOrientation;
  /** Position in canvas coordinates */
  readonly position: number;
  /** Whether the guide is locked (cannot be moved/deleted) */
  readonly locked: boolean;
};

/**
 * Guide state managed by parent component
 */
export type CanvasGuideState = {
  /** List of guides */
  readonly guides: readonly CanvasGuide[];
};

/**
 * Guide event handlers
 */
export type CanvasGuideHandlers = {
  /** Called when a new guide should be added */
  onAddGuide?: (guide: CanvasGuide) => void;
  /** Called when a guide is moved */
  onMoveGuide?: (id: string, position: number) => void;
  /** Called when a guide should be deleted */
  onDeleteGuide?: (id: string) => void;
  /** Called when a guide's locked state changes */
  onToggleLock?: (id: string) => void;
};
