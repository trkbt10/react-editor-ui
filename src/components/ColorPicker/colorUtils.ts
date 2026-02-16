/**
 * @file Color utility functions for HSV/RGB/Hex conversions
 */

export type RGB = { r: number; g: number; b: number };
export type HSV = { h: number; s: number; v: number };

function expandShortHex(hex: string): string {
  if (hex.length === 3) {
    return hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return hex;
}

/**
 * Parse hex color to RGB
 * @param hex - Hex color string (with or without #)
 */
export function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace(/^#/, "");
  const fullHex = expandShortHex(cleanHex);

  const num = parseInt(fullHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/** Compute hue from RGB components */
function computeHue(r: number, g: number, b: number, max: number, diff: number): number {
  if (diff === 0) {
    return 0;
  }
  if (max === r) {
    return 60 * (((g - b) / diff) % 6);
  }
  if (max === g) {
    return 60 * ((b - r) / diff + 2);
  }
  return 60 * ((r - g) / diff + 4);
}

/**
 * Convert RGB to HSV
 * h: 0-360, s: 0-100, v: 0-100
 */
export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  const rawHue = computeHue(r, g, b, max, diff);
  const h = rawHue < 0 ? rawHue + 360 : rawHue;
  const s = max === 0 ? 0 : (diff / max) * 100;
  const v = max * 100;

  return { h, s, v };
}

/** Get RGB components based on hue sector */
function rgbComponentsFromHue(h: number, c: number, x: number): { r: number; g: number; b: number } {
  if (h >= 0 && h < 60) {
    return { r: c, g: x, b: 0 };
  }
  if (h >= 60 && h < 120) {
    return { r: x, g: c, b: 0 };
  }
  if (h >= 120 && h < 180) {
    return { r: 0, g: c, b: x };
  }
  if (h >= 180 && h < 240) {
    return { r: 0, g: x, b: c };
  }
  if (h >= 240 && h < 300) {
    return { r: x, g: 0, b: c };
  }
  return { r: c, g: 0, b: x };
}

/**
 * Convert HSV to RGB
 * h: 0-360, s: 0-100, v: 0-100
 */
export function hsvToRgb(hsv: HSV): RGB {
  const h = hsv.h;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  const { r, g, b } = rgbComponentsFromHue(h, c, x);

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Convert hex to HSV
 */
export function hexToHsv(hex: string): HSV {
  return rgbToHsv(hexToRgb(hex));
}

/**
 * Convert HSV to hex
 */
export function hsvToHex(hsv: HSV): string {
  return rgbToHex(hsvToRgb(hsv));
}

/**
 * Validate hex color string
 */
export function isValidHex(hex: string): boolean {
  const cleanHex = hex.replace(/^#/, "");
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex);
}

/**
 * Normalize hex to 6 characters with #
 */
export function normalizeHex(hex: string): string {
  const cleanHex = hex.replace(/^#/, "");
  const fullHex = expandShortHex(cleanHex);
  return `#${fullHex.toLowerCase()}`;
}
