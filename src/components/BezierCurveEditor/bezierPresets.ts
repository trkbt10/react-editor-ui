/**
 * @file Easing preset definitions and utilities
 */

import type { BezierControlPoints, EasingPreset, AnimationSettings } from "./bezierTypes";

/**
 * Standard CSS easing presets as cubic-bezier control points
 */
export const EASING_PRESETS: Record<
  Exclude<EasingPreset, "custom">,
  BezierControlPoints
> = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  "ease-in": [0.42, 0, 1, 1],
  "ease-out": [0, 0, 0.58, 1],
  "ease-in-out": [0.42, 0, 0.58, 1],
};

/**
 * Display labels for easing presets
 */
export const PRESET_LABELS: Record<EasingPreset, string> = {
  linear: "Linear",
  ease: "Ease",
  "ease-in": "Ease In",
  "ease-out": "Ease Out",
  "ease-in-out": "Ease In Out",
  custom: "Custom",
};

/**
 * Match control points to a preset (if within tolerance)
 */
export function matchPreset(points: BezierControlPoints): EasingPreset {
  const tolerance = 0.01;
  for (const [preset, presetPoints] of Object.entries(EASING_PRESETS)) {
    const isMatch = points.every(
      (p, i) => Math.abs(p - presetPoints[i]) < tolerance
    );
    if (isMatch) {
      return preset as EasingPreset;
    }
  }
  return "custom";
}

/**
 * Format bezier control points as CSS cubic-bezier() string
 */
export function toCubicBezierCss(points: BezierControlPoints): string {
  return `cubic-bezier(${points.map((p) => p.toFixed(2)).join(", ")})`;
}

/**
 * Create default animation settings
 */
export function createDefaultAnimationSettings(): AnimationSettings {
  return {
    easing: "ease",
    bezierControlPoints: EASING_PRESETS.ease,
    duration: "0.3",
    delay: "0",
  };
}
