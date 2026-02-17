/**
 * @file Grid snapping utilities
 */

/**
 * Snap a value to the nearest grid line
 */
export function snapToGrid(value: number, gridSize: number, enabled: boolean): number {
  if (!enabled) return value;
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snap a point to the grid
 */
export function snapPointToGrid(
  x: number,
  y: number,
  gridSize: number,
  enabled: boolean,
): { x: number; y: number } {
  return {
    x: snapToGrid(x, gridSize, enabled),
    y: snapToGrid(y, gridSize, enabled),
  };
}

/**
 * Snap bounds to grid (position and size)
 */
export function snapBoundsToGrid(
  x: number,
  y: number,
  width: number,
  height: number,
  gridSize: number,
  enabled: boolean,
): { x: number; y: number; width: number; height: number } {
  return {
    x: snapToGrid(x, gridSize, enabled),
    y: snapToGrid(y, gridSize, enabled),
    width: snapToGrid(width, gridSize, enabled),
    height: snapToGrid(height, gridSize, enabled),
  };
}
