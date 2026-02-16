/**
 * @file Utility functions for gradient manipulation
 */

import type { GradientStop, GradientValue, GradientType } from "./gradientTypes";
import type { ColorValue } from "../ColorInput/ColorInput";
import { hexToRgb, rgbToHex } from "../ColorPicker/colorUtils";

// eslint-disable-next-line no-restricted-syntax -- Counter requires mutation
let stopIdCounter = 0;

/**
 * Generate a unique ID for gradient stops
 */
export function generateStopId(): string {
  stopIdCounter += 1;
  return `stop-${Date.now()}-${stopIdCounter}`;
}

/**
 * Sort gradient stops by position
 */
export function sortStopsByPosition(stops: GradientStop[]): GradientStop[] {
  return [...stops].sort((a, b) => a.position - b.position);
}

/**
 * Create default gradient value
 */
export function createDefaultGradient(): GradientValue {
  return {
    type: "linear",
    angle: 90,
    stops: [
      {
        id: generateStopId(),
        position: 0,
        color: { hex: "#000000", opacity: 100, visible: true },
      },
      {
        id: generateStopId(),
        position: 100,
        color: { hex: "#ffffff", opacity: 100, visible: true },
      },
    ],
  };
}

/**
 * Convert hex+opacity to CSS rgba
 */
function colorToRgba(color: ColorValue): string {
  const rgb = hexToRgb(color.hex);
  const alpha = color.opacity / 100;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Generate CSS gradient string from GradientValue
 */
export function gradientToCss(gradient: GradientValue): string {
  const sortedStops = sortStopsByPosition(gradient.stops);
  const colorStops = sortedStops
    .map((stop) => `${colorToRgba(stop.color)} ${stop.position}%`)
    .join(", ");

  switch (gradient.type) {
    case "linear": {
      return `linear-gradient(${gradient.angle}deg, ${colorStops})`;
    }
    case "radial": {
      return `radial-gradient(circle, ${colorStops})`;
    }
    case "angular": {
      return `conic-gradient(from ${gradient.angle}deg, ${colorStops})`;
    }
    case "diamond": {
      // Diamond is approximated as radial for CSS
      return `radial-gradient(circle, ${colorStops})`;
    }
  }
}

/**
 * Generate a simple linear gradient for gradient bar display
 */
export function gradientToLinearCss(gradient: GradientValue): string {
  const sortedStops = sortStopsByPosition(gradient.stops);
  const colorStops = sortedStops
    .map((stop) => `${colorToRgba(stop.color)} ${stop.position}%`)
    .join(", ");

  return `linear-gradient(to right, ${colorStops})`;
}

/** Find stops that surround a given position */
function findSurroundingStops(
  sorted: GradientStop[],
  position: number,
): { left: GradientStop; right: GradientStop } {
  const foundIndex = sorted.findIndex(
    (stop, i) =>
      i < sorted.length - 1 &&
      stop.position <= position &&
      sorted[i + 1].position >= position,
  );

  if (foundIndex >= 0) {
    return { left: sorted[foundIndex], right: sorted[foundIndex + 1] };
  }
  return { left: sorted[0], right: sorted[sorted.length - 1] };
}

/**
 * Interpolate color at a given position between stops
 */
export function interpolateColor(
  stops: GradientStop[],
  position: number,
): ColorValue {
  const sorted = sortStopsByPosition(stops);

  if (sorted.length === 0) {
    return { hex: "#000000", opacity: 100, visible: true };
  }

  if (sorted.length === 1) {
    return { ...sorted[0].color };
  }

  const { left: leftStop, right: rightStop } = findSurroundingStops(sorted, position);

  // Handle edge cases
  if (position <= leftStop.position) {
    return { ...leftStop.color };
  }
  if (position >= rightStop.position) {
    return { ...rightStop.color };
  }

  // Interpolate
  const range = rightStop.position - leftStop.position;
  const t = range === 0 ? 0 : (position - leftStop.position) / range;

  const leftRgb = hexToRgb(leftStop.color.hex);
  const rightRgb = hexToRgb(rightStop.color.hex);

  const r = Math.round(leftRgb.r + (rightRgb.r - leftRgb.r) * t);
  const g = Math.round(leftRgb.g + (rightRgb.g - leftRgb.g) * t);
  const b = Math.round(leftRgb.b + (rightRgb.b - leftRgb.b) * t);

  const opacity = Math.round(
    leftStop.color.opacity + (rightStop.color.opacity - leftStop.color.opacity) * t,
  );

  return {
    hex: rgbToHex({ r, g, b }),
    opacity,
    visible: true,
  };
}

/**
 * Get gradient type display name
 */
export function getGradientTypeName(type: GradientType): string {
  switch (type) {
    case "linear": {
      return "Linear";
    }
    case "radial": {
      return "Radial";
    }
    case "angular": {
      return "Angular";
    }
    case "diamond": {
      return "Diamond";
    }
  }
}
