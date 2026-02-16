/**
 * @file Type definitions for BezierCurveEditor
 */

/**
 * Control point coordinates for cubic bezier curve.
 * Format: [x1, y1, x2, y2] where points are normalized 0-1.
 * P0 is always (0, 0) and P3 is always (1, 1).
 */
export type BezierControlPoints = [number, number, number, number];

/**
 * Predefined easing presets
 */
export type EasingPreset =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "custom";

/**
 * Animation settings including easing, duration, and delay
 */
export type AnimationSettings = {
  easing: EasingPreset;
  bezierControlPoints: BezierControlPoints;
  duration: string;
  delay: string;
};
