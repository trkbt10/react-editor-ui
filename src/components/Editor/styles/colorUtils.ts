/**
 * @file Color Utilities for Editor
 *
 * Functions for color manipulation, contrast calculation, and
 * automatic cursor color selection based on background.
 */

// =============================================================================
// Types
// =============================================================================

type RGB = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
};

// =============================================================================
// Color Parsing
// =============================================================================

/**
 * Parse hex color string to RGB values.
 * Supports both 3-digit (#fff) and 6-digit (#ffffff) formats.
 */
function parseHexColor(hex: string): RGB | null {
  const cleanHex = hex.replace("#", "");

  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }

  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return { r, g, b };
  }

  return null;
}

/**
 * Parse rgb() or rgba() color string to RGB values.
 */
function parseRgbColor(rgb: string): RGB | null {
  const match = rgb.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }
  return null;
}

/**
 * Parse any CSS color string to RGB values.
 * Supports hex (#fff, #ffffff), rgb(), and rgba() formats.
 */
export function parseColor(color: string): RGB | null {
  const trimmed = color.trim().toLowerCase();

  if (trimmed.startsWith("#")) {
    return parseHexColor(trimmed);
  }

  if (trimmed.startsWith("rgb")) {
    return parseRgbColor(trimmed);
  }

  // Named colors could be added here if needed
  return null;
}

// =============================================================================
// Luminance Calculation
// =============================================================================

/**
 * Calculate relative luminance of a color.
 * Based on WCAG 2.0 formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 *
 * @param rgb - RGB color values (0-255)
 * @returns Relative luminance (0-1)
 */
export function getRelativeLuminance(rgb: RGB): number {
  const { r, g, b } = rgb;

  // Convert to sRGB
  const rsrgb = r / 255;
  const gsrgb = g / 255;
  const bsrgb = b / 255;

  // Apply gamma correction
  const rlin = rsrgb <= 0.03928 ? rsrgb / 12.92 : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
  const glin = gsrgb <= 0.03928 ? gsrgb / 12.92 : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
  const blin = bsrgb <= 0.03928 ? bsrgb / 12.92 : Math.pow((bsrgb + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * rlin + 0.7152 * glin + 0.0722 * blin;
}

/**
 * Check if a color is considered "dark" based on luminance.
 * Uses a threshold of 0.5 (middle of the luminance scale).
 *
 * @param color - CSS color string
 * @returns true if the color is dark, false otherwise
 */
export function isDarkColor(color: string): boolean {
  const rgb = parseColor(color);
  if (!rgb) {
    // Default to assuming light background if parsing fails
    return false;
  }
  return getRelativeLuminance(rgb) < 0.5;
}

// =============================================================================
// Contrast Color Selection
// =============================================================================

/** Default light cursor color (for dark backgrounds) */
export const CURSOR_COLOR_LIGHT = "#ffffff";

/** Default dark cursor color (for light backgrounds) */
export const CURSOR_COLOR_DARK = "#000000";

/**
 * Get a contrasting cursor color based on the background color.
 * Returns white for dark backgrounds, black for light backgrounds.
 *
 * @param backgroundColor - CSS color string of the background
 * @returns Cursor color that contrasts with the background
 */
export function getContrastCursorColor(backgroundColor: string): string {
  return isDarkColor(backgroundColor) ? CURSOR_COLOR_LIGHT : CURSOR_COLOR_DARK;
}

/**
 * Get cursor color from an HTML element's computed background.
 * Traverses up the DOM tree to find a non-transparent background.
 *
 * @param element - HTML element to get background from
 * @returns Contrasting cursor color
 */
export function getCursorColorFromElement(element: HTMLElement | null): string {
  if (!element) {
    return CURSOR_COLOR_DARK;
  }

  // Walk up the DOM tree to find a background color
  const currentElement = { el: element as HTMLElement | null };

  while (currentElement.el) {
    const style = window.getComputedStyle(currentElement.el);
    const bg = style.backgroundColor;

    // Check if background is not transparent
    if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
      return getContrastCursorColor(bg);
    }

    currentElement.el = currentElement.el.parentElement;
  }

  // Default to dark cursor if no background found
  return CURSOR_COLOR_DARK;
}
