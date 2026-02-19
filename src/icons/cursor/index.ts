/**
 * @file Cursor icon exports as raw SVG strings
 *
 * These are SVG strings for use as CSS cursor values, not React components.
 * Use with: `cursor: url("data:image/svg+xml,${encodeURIComponent(svg)}") x y, fallback`
 */

import rotationSvg from "../svg/cursor/rotation.svg?raw";

/** Rotation cursor - arc with arrows suggesting corner rotation */
export const rotationCursorSvg = rotationSvg;

/**
 * Create a CSS cursor value from an SVG string
 * @param svg - Raw SVG string
 * @param hotspotX - X coordinate of cursor hotspot (default: 10)
 * @param hotspotY - Y coordinate of cursor hotspot (default: 10)
 * @param fallback - Fallback cursor (default: "crosshair")
 */
export function createCursorFromSvg(
  svg: string,
  hotspotX = 10,
  hotspotY = 10,
  fallback = "crosshair",
): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hotspotX} ${hotspotY}, ${fallback}`;
}

/** Pre-built rotation cursor CSS value */
export const ROTATION_CURSOR = createCursorFromSvg(rotationSvg);
