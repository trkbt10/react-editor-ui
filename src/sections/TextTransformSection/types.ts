/**
 * @file TextTransformSection types
 */

import type { BaseSectionProps } from "../shared/types";

/**
 * Text transform data (baseline shift and rotation)
 */
export type TextTransformData = {
  /** Baseline shift (e.g., "0 pt") */
  baselineShift: string;
  /** Character rotation (e.g., "0°") */
  rotation: string;
};

/**
 * Props for TextTransformSection component.
 */
export type TextTransformSectionProps = BaseSectionProps & {
  /** Current text transform data */
  data: TextTransformData;
  /** Called when text transform data changes */
  onChange: (data: TextTransformData) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size of controls */
  size?: "sm" | "md";
};
