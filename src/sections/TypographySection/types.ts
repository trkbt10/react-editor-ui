/**
 * @file TypographySection types
 */

import type { BaseSectionProps } from "../shared/types";

export type TextAlign = "left" | "center" | "right" | "justify";
export type VerticalAlign = "top" | "middle" | "bottom";

export type TypographyData = {
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: TextAlign;
  verticalAlign: VerticalAlign;
};

export type FontOption = {
  value: string;
  label: string;
};

export type FontWeightOption = {
  value: string;
  label: string;
};

export type FontIconVisibility = "always" | "never" | "missing-only";

export type TypographySectionProps = BaseSectionProps & {
  /** Current typography data */
  data: TypographyData;
  /** Called when typography changes */
  onChange: (data: TypographyData) => void;
  /** Available font options */
  fontOptions?: FontOption[];
  /** Available font weight options */
  weightOptions?: FontWeightOption[];
  /** Handler for opening fonts panel */
  onOpenFontsPanel?: () => void;
  /** Handler for opening settings */
  onOpenSettings?: () => void;
  /** Controls font icon visibility */
  showFontIcon?: FontIconVisibility;
};
