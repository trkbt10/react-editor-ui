/**
 * @file DistributeSpacingSection types
 */

import type { BaseSectionProps } from "../shared/types";
import type { AlignTo } from "../../components/AlignmentSelect/AlignmentSelect";

/**
 * Distribute spacing data
 */
export type DistributeSpacingData = {
  /** Apply horizontal spacing */
  horizontal: boolean;
  /** Apply vertical spacing */
  vertical: boolean;
  /** Spacing value (e.g., "0 pt", "10 px") */
  spacing: string;
  /** Align target */
  alignTo: AlignTo;
};

/**
 * Props for DistributeSpacingSection component.
 */
export type DistributeSpacingSectionProps = BaseSectionProps & {
  /** Current spacing data */
  data: DistributeSpacingData;
  /** Called when spacing data changes */
  onChange: (data: DistributeSpacingData) => void;
  /** Callback when horizontal spacing is applied */
  onApplyHorizontal?: () => void;
  /** Callback when vertical spacing is applied */
  onApplyVertical?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size of controls */
  size?: "sm" | "md";
};
