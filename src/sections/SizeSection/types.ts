/**
 * @file SizeSection types
 */

import type { BaseSectionProps } from "../shared/types";

/**
 * Size data for the section.
 */
export type SizeData = {
  width: string;
  height: string;
};

/**
 * Props for SizeSection component.
 */
export type SizeSectionProps = BaseSectionProps & {
  /** Current size data */
  data: SizeData;
  /** Called when size changes */
  onChange: (data: SizeData) => void;
};
