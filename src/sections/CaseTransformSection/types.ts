/**
 * @file CaseTransformSection types
 */

import type { BaseSectionProps } from "../shared/types";
import type { CaseTransform, TextStyle } from "../../components/CaseTransformSelect/CaseTransformSelect";

/**
 * Case transform data
 */
export type CaseTransformData = {
  /** Text case transformation */
  case: CaseTransform;
  /** Active text styles (superscript, subscript, underline, strikethrough) */
  styles: TextStyle[];
};

/**
 * Props for CaseTransformSection component.
 */
export type CaseTransformSectionProps = BaseSectionProps & {
  /** Current case transform data */
  data: CaseTransformData;
  /** Called when case transform data changes */
  onChange: (data: CaseTransformData) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size of controls */
  size?: "sm" | "md";
};
