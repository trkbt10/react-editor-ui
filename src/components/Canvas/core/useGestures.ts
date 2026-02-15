/**
 * @file Hook for handling canvas gestures (pan, zoom, pinch)
 */

import { useRef, useCallback, useState, type PointerEvent, type WheelEvent } from "react";
import type { ViewportState, ViewportConstraints, GestureConfig } from "./types";
import { DEFAULT_CONSTRAINTS, DEFAULT_GESTURE_CONFIG } from "./types";
import { useKeyboardPan } from "./useKeyboardPan";

export type UseGesturesConfig = {
  /** Current viewport state */
  viewport: ViewportState;
  /** Called when viewport changes */
  onViewportChange: (viewport: ViewportState) => void;
  /** Gesture configuration */
  gestureConfig?: Partial<GestureConfig>;
  /** Viewport constraints */
  constraints?: Partial<ViewportConstraints>;
  /** Container ref for coordinate calculations */
  containerRef: React.RefObject<HTMLDivElement | null>;
};

export type UseGesturesResult = {
  /** Handlers to attach to the container element */
  readonly handlers: {
    readonly onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
    readonly onPointerMove: (e: PointerEvent<HTMLDivElement>) => void;
    readonly onPointerUp: (e: PointerEvent<HTMLDivElement>) => void;
    readonly onPointerCancel: (e: PointerEvent<HTMLDivElement>) => void;
    readonly onWheel: (e: WheelEvent<HTMLDivElement>) => void;
  };
  /** Whether currently panning */
  readonly isPanning: boolean;
  /** Whether Space key is pressed for pan mode */
  readonly isSpacePanning: boolean;
};

type PointerState = {
  isPanning: boolean;
  pointerId: number;
  startX: number;
  startY: number;
  startViewportX: number;
  startViewportY: number;
};

type PinchState = {
  active: boolean;
  initialDistance: number;
  initialScale: number;
  centerX: number;
  centerY: number;
};

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate distance between two points
 */
function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a pan should be triggered based on the event and config
 */
export function shouldPan(
  e: PointerEvent<HTMLDivElement>,
  config: GestureConfig,
  isSpacePanning: boolean,
): boolean {
  if (!config.panEnabled) {
    return false;
  }

  const triggers = config.panTriggers;

  // Middle mouse button
  if (triggers.includes("middle") && e.button === 1) {
    return true;
  }

  // Alt + left click
  if (triggers.includes("alt") && e.altKey && e.button === 0) {
    return true;
  }

  // Space + left click
  if (triggers.includes("space") && isSpacePanning && e.button === 0) {
    return true;
  }

  // Touch pan (single finger on touch device)
  if (triggers.includes("touch") && e.pointerType === "touch" && e.button === 0) {
    return true;
  }

  return false;
}

/**
 * Calculate new viewport after zoom to point
 *
 * Keeps the canvas coordinate under cursor fixed during zoom.
 * canvasX = screenX / scale + viewportX
 *
 * Before zoom: canvasX = cursorX / oldScale + oldViewportX
 * After zoom:  canvasX = cursorX / newScale + newViewportX
 *
 * Solving for newViewportX:
 * newViewportX = oldViewportX + cursorX * (1/oldScale - 1/newScale)
 */
export function zoomToPoint(
  viewport: ViewportState,
  cursorX: number,
  cursorY: number,
  newScale: number,
): ViewportState {
  // Keep the point under cursor fixed during zoom
  const newX = viewport.x + cursorX * (1 / viewport.scale - 1 / newScale);
  const newY = viewport.y + cursorY * (1 / viewport.scale - 1 / newScale);

  return {
    x: newX,
    y: newY,
    scale: newScale,
  };
}

/**
 * Hook for handling canvas gestures
 */
export function useGestures(config: UseGesturesConfig): UseGesturesResult {
  const {
    viewport,
    onViewportChange,
    containerRef,
    gestureConfig: partialGestureConfig,
    constraints: partialConstraints,
  } = config;

  const gestureConfig: GestureConfig = {
    ...DEFAULT_GESTURE_CONFIG,
    ...partialGestureConfig,
  };

  const constraints: ViewportConstraints = {
    ...DEFAULT_CONSTRAINTS,
    ...partialConstraints,
  };

  const { isSpacePanning } = useKeyboardPan();

  // Panning state (reactive for cursor updates)
  const [isPanning, setIsPanning] = useState(false);

  // Pointer state for single-pointer pan (non-reactive for performance)
  const pointerState = useRef<PointerState>({
    isPanning: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startViewportX: 0,
    startViewportY: 0,
  });

  // Multi-pointer tracking for pinch
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchState = useRef<PinchState>({
    active: false,
    initialDistance: 0,
    initialScale: 1,
    centerX: 0,
    centerY: 0,
  });

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      // Track pointer for pinch
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // Check for pinch start (2 pointers)
      if (pointers.current.size === 2 && gestureConfig.pinchZoom) {
        // Cancel any ongoing pan when switching to pinch
        if (pointerState.current.isPanning) {
          pointerState.current.isPanning = false;
          pointerState.current.pointerId = -1;
          setIsPanning(false);
        }

        const pts = Array.from(pointers.current.values());
        const distance = getDistance(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
        const rect = containerRef.current?.getBoundingClientRect();

        if (rect) {
          pinchState.current = {
            active: true,
            initialDistance: distance,
            initialScale: viewport.scale,
            centerX: (pts[0].x + pts[1].x) / 2 - rect.left,
            centerY: (pts[0].y + pts[1].y) / 2 - rect.top,
          };
        }
        return;
      }

      // Check for pan
      if (shouldPan(e, gestureConfig, isSpacePanning)) {
        e.currentTarget.setPointerCapture(e.pointerId);
        pointerState.current = {
          isPanning: true,
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          startViewportX: viewport.x,
          startViewportY: viewport.y,
        };
        setIsPanning(true);
      }
    },
    [viewport, gestureConfig, isSpacePanning, containerRef],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      // Update pointer position for pinch
      if (pointers.current.has(e.pointerId)) {
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // Handle pinch
      if (pinchState.current.active && pointers.current.size === 2) {
        const pts = Array.from(pointers.current.values());
        const newDistance = getDistance(pts[0].x, pts[1].y, pts[1].x, pts[1].y);
        const scale = pinchState.current.initialScale * (newDistance / pinchState.current.initialDistance);
        const clampedScale = clamp(scale, constraints.minScale, constraints.maxScale);

        const newViewport = zoomToPoint(
          { ...viewport, scale: pinchState.current.initialScale },
          pinchState.current.centerX,
          pinchState.current.centerY,
          clampedScale,
        );

        onViewportChange(newViewport);
        return;
      }

      // Handle pan
      if (pointerState.current.isPanning && pointerState.current.pointerId === e.pointerId) {
        const dx = (e.clientX - pointerState.current.startX) / viewport.scale;
        const dy = (e.clientY - pointerState.current.startY) / viewport.scale;

        onViewportChange({
          ...viewport,
          x: pointerState.current.startViewportX - dx,
          y: pointerState.current.startViewportY - dy,
        });
      }
    },
    [viewport, onViewportChange, constraints],
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      pointers.current.delete(e.pointerId);

      // End pinch if less than 2 pointers
      if (pointers.current.size < 2) {
        pinchState.current.active = false;
      }

      // End pan
      if (pointerState.current.pointerId === e.pointerId) {
        pointerState.current.isPanning = false;
        pointerState.current.pointerId = -1;
        setIsPanning(false);
      }
    },
    [],
  );

  const handlePointerCancel = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      handlePointerUp(e);
    },
    [handlePointerUp],
  );

  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      if (!gestureConfig.wheelZoom) {
        return;
      }

      e.preventDefault();

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      // Determine if this is a pinch gesture (trackpad) and calculate scale delta
      const isPinch = e.ctrlKey;
      const pinchFactor = 0.01;
      const wheelFactor = gestureConfig.wheelZoomFactor * 0.01;
      const scaleDelta = -e.deltaY * (isPinch ? pinchFactor : wheelFactor);

      const newScale = clamp(
        viewport.scale * (1 + scaleDelta),
        constraints.minScale,
        constraints.maxScale,
      );

      const newViewport = zoomToPoint(viewport, cursorX, cursorY, newScale);
      onViewportChange(newViewport);
    },
    [viewport, onViewportChange, gestureConfig, constraints, containerRef],
  );

  return {
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onWheel: handleWheel,
    },
    isPanning,
    isSpacePanning,
  };
}
