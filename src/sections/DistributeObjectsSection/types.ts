/**
 * @file DistributeObjectsSection types
 */

import type { BaseSectionProps } from "../shared/types";

/**
 * Distribution action types
 */
export type DistributeHorizontal = "left" | "center" | "right";
export type DistributeVertical = "top" | "center" | "bottom";

/**
 * Props for DistributeObjectsSection component.
 */
export type DistributeObjectsSectionProps = BaseSectionProps & {
  /** Callback when horizontal distribution is triggered */
  onDistributeHorizontal: (distribute: DistributeHorizontal) => void;
  /** Callback when vertical distribution is triggered */
  onDistributeVertical: (distribute: DistributeVertical) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size of controls */
  size?: "sm" | "md";
};
