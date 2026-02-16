/**
 * @file RGBA conversion utilities
 */

import type { ColorValue } from "./types";
import { hexToRgb } from "./conversion";

/**
 * Convert hex+opacity to CSS rgba string
 */
export function colorToRgba(color: ColorValue): string {
  const rgb = hexToRgb(color.hex);
  const alpha = color.opacity / 100;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
