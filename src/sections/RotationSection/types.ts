/**
 * @file RotationSection types
 */

import type { BaseSectionProps } from "../shared/types";

/**
 * Rotation data for the section.
 */
export type RotationData = {
  rotation: string;
};

/**
 * Props for RotationSection component.
 */
export type RotationSectionProps = BaseSectionProps & {
  /** Current rotation data */
  data: RotationData;
  /** Called when rotation changes */
  onChange: (data: RotationData) => void;
  /** Called when a transform action is triggered (reset, flip, etc.) */
  onTransformAction?: (actionId: string) => void;
  /** Show transform action buttons (reset, flip horizontal/vertical) */
  showTransformButtons?: boolean;
};
