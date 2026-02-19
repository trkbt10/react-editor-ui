/**
 * @file FontSection types
 */

import type { BaseSectionProps } from "../shared/types";

/**
 * Font option for the font family select
 */
export type FontOption = {
  value: string;
  label: string;
};

/**
 * Font weight option
 */
export type WeightOption = {
  value: string;
  label: string;
};

/**
 * Font data
 */
export type FontData = {
  /** Font family name */
  family: string;
  /** Font weight */
  weight: string;
};

/**
 * Props for FontSection component.
 */
export type FontSectionProps = BaseSectionProps & {
  /** Current font data */
  data: FontData;
  /** Called when font data changes */
  onChange: (data: FontData) => void;
  /** Available font options */
  fontOptions?: FontOption[];
  /** Available weight options */
  weightOptions?: WeightOption[];
  /** Callback to open fonts panel */
  onOpenFontsPanel?: () => void;
  /** Disabled state */
  disabled?: boolean;
};
