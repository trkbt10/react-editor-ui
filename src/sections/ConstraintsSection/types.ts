/**
 * @file ConstraintsSection types
 */

import type { BaseSectionProps } from "../shared/types";

/**
 * Horizontal constraint type.
 */
export type HorizontalConstraint = "left" | "right" | "left-right" | "center" | "scale";

/**
 * Vertical constraint type.
 */
export type VerticalConstraint = "top" | "bottom" | "top-bottom" | "center" | "scale";

/**
 * Constraints data for the section.
 */
export type ConstraintsData = {
  horizontal: HorizontalConstraint;
  vertical: VerticalConstraint;
};

/**
 * Props for ConstraintsSection component.
 */
export type ConstraintsSectionProps = BaseSectionProps & {
  /** Current constraints data */
  data: ConstraintsData;
  /** Called when constraints change */
  onChange: (data: ConstraintsData) => void;
};
