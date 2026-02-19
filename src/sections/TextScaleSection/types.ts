/**
 * @file TextScaleSection types
 */

import type { BaseSectionProps } from "../shared/types";

/**
 * Text scale data
 */
export type TextScaleData = {
  /** Vertical scale percentage (e.g., "100%") */
  vertical: string;
  /** Horizontal scale percentage (e.g., "100%") */
  horizontal: string;
};

/**
 * Props for TextScaleSection component.
 */
export type TextScaleSectionProps = BaseSectionProps & {
  /** Current text scale data */
  data: TextScaleData;
  /** Called when text scale data changes */
  onChange: (data: TextScaleData) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size of controls */
  size?: "sm" | "md";
};
