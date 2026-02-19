/**
 * @file FontMetricsSection types
 */

import type { BaseSectionProps } from "../shared/types";

/**
 * Kerning mode options
 */
export type KerningMode = "auto" | "optical" | "metrics" | "none";

/**
 * Font metrics data
 */
export type FontMetricsData = {
  /** Font size (e.g., "12 pt") */
  size: string;
  /** Line height / leading (e.g., "auto", "14 pt") */
  leading: string;
  /** Kerning mode */
  kerning: KerningMode;
  /** Tracking / letter spacing (e.g., "0") */
  tracking: string;
};

/**
 * Props for FontMetricsSection component.
 */
export type FontMetricsSectionProps = BaseSectionProps & {
  /** Current font metrics data */
  data: FontMetricsData;
  /** Called when font metrics data changes */
  onChange: (data: FontMetricsData) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size of controls */
  size?: "sm" | "md";
};
