/**
 * @file useBoundingBoxHandlers - Hook for correct BoundingBox drag handling
 *
 * @description
 * BoundingBox provides cumulative deltas from the drag start position, NOT incremental
 * deltas between frames. This hook encapsulates the correct pattern:
 * - Store original position/bounds when drag starts
 * - Apply cumulative delta to the original, not current position
 *
 * This prevents the common bug where cumulative deltas are treated as incremental,
 * causing acceleration (e.g., 100px drag → 1000px+ movement).
 *
 * @example
 * ```tsx
 * const [transform, setTransform] = useState({ x: 0, y: 0, width: 100, height: 100 });
 * const handlers = useBoundingBoxHandlers(transform, setTransform);
 *
 * <BoundingBox
 *   {...transform}
 *   onMoveStart={handlers.onMoveStart}
 *   onMove={handlers.onMove}
 *   onMoveEnd={handlers.onMoveEnd}
 *   onResizeStart={handlers.onResizeStart}
 *   onResize={handlers.onResize}
 *   onResizeEnd={handlers.onResizeEnd}
 * />
 * ```
 */

import { useRef, useCallback, useMemo } from "react";
import type { HandlePosition } from "../BoundingBox/BoundingBox";

/**
 * Transform state for BoundingBox
 */
export type BoundingBoxTransform = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

/**
 * Resize function type - receives original state, handle, and cumulative delta
 */
export type ResizeFunction<T extends BoundingBoxTransform> = (
  original: T,
  handle: HandlePosition,
  deltaX: number,
  deltaY: number,
) => T;

/**
 * Options for useBoundingBoxHandlers
 */
export type UseBoundingBoxHandlersOptions<T extends BoundingBoxTransform> = {
  /** Custom resize logic (default: basic resize without rotation support) */
  applyResize?: ResizeFunction<T>;
  /** Called when move starts */
  onMoveStart?: () => void;
  /** Called when move ends */
  onMoveEnd?: () => void;
  /** Called when resize starts */
  onResizeStart?: (handle: HandlePosition) => void;
  /** Called when resize ends */
  onResizeEnd?: (handle: HandlePosition) => void;
};

/**
 * Default resize implementation (no rotation support)
 */
function defaultApplyResize<T extends BoundingBoxTransform>(
  original: T,
  handle: HandlePosition,
  deltaX: number,
  deltaY: number,
): T {
  const MIN_SIZE = 20;
  const { x, y, width, height } = original;

  switch (handle) {
    case "top-left":
      return {
        ...original,
        x: x + deltaX,
        y: y + deltaY,
        width: Math.max(MIN_SIZE, width - deltaX),
        height: Math.max(MIN_SIZE, height - deltaY),
      };
    case "top":
      return {
        ...original,
        y: y + deltaY,
        height: Math.max(MIN_SIZE, height - deltaY),
      };
    case "top-right":
      return {
        ...original,
        y: y + deltaY,
        width: Math.max(MIN_SIZE, width + deltaX),
        height: Math.max(MIN_SIZE, height - deltaY),
      };
    case "right":
      return {
        ...original,
        width: Math.max(MIN_SIZE, width + deltaX),
      };
    case "bottom-right":
      return {
        ...original,
        width: Math.max(MIN_SIZE, width + deltaX),
        height: Math.max(MIN_SIZE, height + deltaY),
      };
    case "bottom":
      return {
        ...original,
        height: Math.max(MIN_SIZE, height + deltaY),
      };
    case "bottom-left":
      return {
        ...original,
        x: x + deltaX,
        width: Math.max(MIN_SIZE, width - deltaX),
        height: Math.max(MIN_SIZE, height + deltaY),
      };
    case "left":
      return {
        ...original,
        x: x + deltaX,
        width: Math.max(MIN_SIZE, width - deltaX),
      };
    default:
      return original;
  }
}

/**
 * Hook for correct BoundingBox move/resize handling.
 *
 * Encapsulates the pattern of storing original position on drag start
 * and applying cumulative deltas to the original position.
 *
 * @param transform Current transform state
 * @param setTransform State setter
 * @param options Optional callbacks and custom resize logic
 * @returns Handlers to pass to BoundingBox
 */
export function useBoundingBoxHandlers<T extends BoundingBoxTransform>(
  transform: T,
  setTransform: (value: T) => void,
  options: UseBoundingBoxHandlersOptions<T> = {},
) {
  const {
    applyResize = defaultApplyResize,
    onMoveStart: onMoveStartCallback,
    onMoveEnd: onMoveEndCallback,
    onResizeStart: onResizeStartCallback,
    onResizeEnd: onResizeEndCallback,
  } = options;

  // Store original transform when drag starts
  const dragStartRef = useRef<T | null>(null);

  // Move handlers
  const onMoveStart = useCallback(() => {
    dragStartRef.current = transform;
    onMoveStartCallback?.();
  }, [transform, onMoveStartCallback]);

  const onMove = useCallback(
    (deltaX: number, deltaY: number) => {
      const start = dragStartRef.current;
      if (!start) {
        return;
      }
      setTransform({
        ...start,
        x: start.x + deltaX,
        y: start.y + deltaY,
      });
    },
    [setTransform],
  );

  const onMoveEnd = useCallback(() => {
    dragStartRef.current = null;
    onMoveEndCallback?.();
  }, [onMoveEndCallback]);

  // Resize handlers
  const onResizeStart = useCallback(
    (handle: HandlePosition) => {
      dragStartRef.current = transform;
      onResizeStartCallback?.(handle);
    },
    [transform, onResizeStartCallback],
  );

  const onResize = useCallback(
    (handle: HandlePosition, deltaX: number, deltaY: number) => {
      const start = dragStartRef.current;
      if (!start) {
        return;
      }
      setTransform(applyResize(start, handle, deltaX, deltaY));
    },
    [setTransform, applyResize],
  );

  const onResizeEnd = useCallback(
    (handle: HandlePosition) => {
      dragStartRef.current = null;
      onResizeEndCallback?.(handle);
    },
    [onResizeEndCallback],
  );

  return useMemo(
    () => ({
      onMoveStart,
      onMove,
      onMoveEnd,
      onResizeStart,
      onResize,
      onResizeEnd,
    }),
    [onMoveStart, onMove, onMoveEnd, onResizeStart, onResize, onResizeEnd],
  );
}
