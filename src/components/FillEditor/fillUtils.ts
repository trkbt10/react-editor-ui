/**
 * @file Utility functions for fill editing
 */

import type { ColorValue } from "../ColorInput/ColorInput";
import { createDefaultGradient } from "../GradientEditor/gradientUtils";
import type {
  FillValue,
  FillType,
  ImageAdjustments,
  ImageFillValue,
  PatternFillValue,
  VideoFillValue,
  SolidFillValue,
  GradientFillValue,
  ImageFill,
  PatternFill,
  VideoFill,
} from "./fillTypes";

/**
 * Create default image adjustments (all at 0)
 */
export function createDefaultImageAdjustments(): ImageAdjustments {
  return {
    exposure: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0,
  };
}

/**
 * Create default image fill value
 */
export function createDefaultImageFill(): ImageFillValue {
  return {
    url: "",
    mode: "fill",
    adjustments: createDefaultImageAdjustments(),
    opacity: 100,
  };
}

/**
 * Create default pattern fill value
 */
export function createDefaultPatternFill(): PatternFillValue {
  return {
    sourceUrl: "",
    tileType: "grid",
    scale: 100,
    spacingX: 0,
    spacingY: 0,
    alignment: "center",
  };
}

/**
 * Create default video fill value
 */
export function createDefaultVideoFill(): VideoFillValue {
  return {
    url: "",
    loop: true,
    autoplay: true,
    muted: true,
    opacity: 100,
  };
}

/**
 * Create default solid color
 */
export function createDefaultSolidColor(): ColorValue {
  return { hex: "#000000", opacity: 100, visible: true };
}

/**
 * Create default fill value for a given fill type
 */
export function createDefaultFill(type: FillType): FillValue {
  switch (type) {
    case "solid": {
      return { type: "solid", color: createDefaultSolidColor() };
    }
    case "gradient": {
      return { type: "gradient", gradient: createDefaultGradient() };
    }
    case "image": {
      return { type: "image", image: createDefaultImageFill() };
    }
    case "pattern": {
      return { type: "pattern", pattern: createDefaultPatternFill() };
    }
    case "video": {
      return { type: "video", video: createDefaultVideoFill() };
    }
  }
}

/**
 * Extract primary color from any fill type
 * Used when switching fill types to preserve color intent
 */
export function extractPrimaryColor(fill: FillValue): ColorValue {
  switch (fill.type) {
    case "solid": {
      return { ...fill.color };
    }
    case "gradient": {
      if (fill.gradient.stops.length > 0) {
        return { ...fill.gradient.stops[0].color };
      }
      return createDefaultSolidColor();
    }
    case "image":
    case "pattern":
    case "video": {
      return createDefaultSolidColor();
    }
  }
}

/**
 * Convert fill type to display label
 */
export function getFillTypeLabel(type: FillType): string {
  switch (type) {
    case "solid": {
      return "Solid";
    }
    case "gradient": {
      return "Gradient";
    }
    case "image": {
      return "Image";
    }
    case "pattern": {
      return "Pattern";
    }
    case "video": {
      return "Video";
    }
  }
}

/**
 * Type guard for solid fill
 */
export function isSolidFill(fill: FillValue): fill is SolidFillValue {
  return fill.type === "solid";
}

/**
 * Type guard for gradient fill
 */
export function isGradientFill(fill: FillValue): fill is GradientFillValue {
  return fill.type === "gradient";
}

/**
 * Type guard for image fill
 */
export function isImageFill(fill: FillValue): fill is ImageFill {
  return fill.type === "image";
}

/**
 * Type guard for pattern fill
 */
export function isPatternFill(fill: FillValue): fill is PatternFill {
  return fill.type === "pattern";
}

/**
 * Type guard for video fill
 */
export function isVideoFill(fill: FillValue): fill is VideoFill {
  return fill.type === "video";
}
