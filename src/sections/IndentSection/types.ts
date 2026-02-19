/**
 * @file IndentSection types
 */

import type { BaseSectionProps } from "../shared/types";

/**
 * Indent data
 */
export type IndentData = {
  /** Left indent (e.g., "0 pt") */
  left: string;
  /** Right indent (e.g., "0 pt") */
  right: string;
  /** First line indent (e.g., "0 pt") */
  firstLine: string;
};

/**
 * Props for IndentSection component.
 */
export type IndentSectionProps = BaseSectionProps & {
  /** Current indent data */
  data: IndentData;
  /** Called when indent data changes */
  onChange: (data: IndentData) => void;
  /** Callback when indent is increased */
  onIncrease?: () => void;
  /** Callback when indent is decreased */
  onDecrease?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size of controls */
  size?: "sm" | "md";
};
