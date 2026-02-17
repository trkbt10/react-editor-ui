/**
 * @file PositionSection types
 */

import type { BaseSectionProps } from "../shared/types";

/**
 * Position data for the section.
 */
export type PositionData = {
  x: string;
  y: string;
};

/**
 * Props for PositionSection component.
 */
export type PositionSectionProps = BaseSectionProps & {
  /** Current position data */
  data: PositionData;
  /** Called when position changes */
  onChange: (data: PositionData) => void;
};
