/**
 * @file TextJustifySection types
 */

import type { BaseSectionProps } from "../shared/types";
import type { TextJustify } from "../../components/TextJustifySelect/TextJustifySelect";

/**
 * Text justify data
 */
export type TextJustifyData = {
  /** Current text alignment */
  align: TextJustify;
};

/**
 * Props for TextJustifySection component.
 */
export type TextJustifySectionProps = BaseSectionProps & {
  /** Current justify data */
  data: TextJustifyData;
  /** Called when justify data changes */
  onChange: (data: TextJustifyData) => void;
  /** Show extended justify options */
  extended?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Size of controls */
  size?: "sm" | "md";
};
