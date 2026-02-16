/**
 * @file Checkerboard pattern generation for transparency indication
 */

/** Module-level cache for SVG patterns */
const svgCache = new Map<number, string>();

/**
 * Create CSS linear-gradient checkerboard pattern
 * Returns style properties for background, backgroundSize, backgroundPosition
 */
export function createCheckerboardCSS(size = 4): {
  background: string;
  backgroundSize: string;
  backgroundPosition: string;
} {
  const halfSize = size / 2;
  return {
    background: `
      linear-gradient(45deg, #ccc 25%, transparent 25%),
      linear-gradient(-45deg, #ccc 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #ccc 75%),
      linear-gradient(-45deg, transparent 75%, #ccc 75%)
    `,
    backgroundSize: `${size * 2}px ${size * 2}px`,
    backgroundPosition: `0 0, 0 ${halfSize}px, ${halfSize}px -${halfSize}px, -${halfSize}px 0px`,
  };
}

/**
 * Create SVG data URI checkerboard pattern (cached)
 * Returns a CSS url() value for use as background-image
 */
export function createCheckerboardSVG(size = 6): string {
  const cached = svgCache.get(size);
  if (cached) {
    return cached;
  }

  const doubleSize = size * 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${doubleSize}" height="${doubleSize}">
    <rect width="${size}" height="${size}" fill="#fff"/>
    <rect x="${size}" width="${size}" height="${size}" fill="#ccc"/>
    <rect y="${size}" width="${size}" height="${size}" fill="#ccc"/>
    <rect x="${size}" y="${size}" width="${size}" height="${size}" fill="#fff"/>
  </svg>`;

  const result = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  svgCache.set(size, result);
  return result;
}

/**
 * Clear the SVG pattern cache (for testing)
 */
export function clearCheckerboardCache(): void {
  svgCache.clear();
}
