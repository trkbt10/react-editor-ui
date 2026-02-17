/**
 * @file AlignmentSection types
 */

import type { ObjectHorizontalAlign, ObjectVerticalAlign } from "../../components/AlignmentSelect/AlignmentSelect";
import type { BaseSectionProps } from "../shared/types";

/**
 * Alignment data for the section.
 */
export type AlignmentData = {
  horizontal: ObjectHorizontalAlign;
  vertical: ObjectVerticalAlign;
};

/**
 * Props for AlignmentSection component.
 */
export type AlignmentSectionProps = BaseSectionProps & {
  /** Current alignment data */
  data: AlignmentData;
  /** Called when alignment changes */
  onChange: (data: AlignmentData) => void;
  /** Size of select controls */
  size?: "sm" | "md";
};
