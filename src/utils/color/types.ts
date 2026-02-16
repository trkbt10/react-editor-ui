/**
 * @file Shared color type definitions
 */

/** RGB color representation (0-255 for each channel) */
export type RGB = { r: number; g: number; b: number };

/** HSV color representation (h: 0-360, s: 0-100, v: 0-100) */
export type HSV = { h: number; s: number; v: number };

/** Color value with hex, opacity, and visibility */
export type ColorValue = {
  hex: string;
  opacity: number;
  visible: boolean;
};
