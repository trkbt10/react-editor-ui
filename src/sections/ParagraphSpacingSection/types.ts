/**
 * @file ParagraphSpacingSection types
 */

import type { BaseSectionProps } from "../shared/types";

/**
 * Paragraph spacing data
 */
export type ParagraphSpacingData = {
  /** Space before paragraph (e.g., "0 pt") */
  before: string;
  /** Space after paragraph (e.g., "0 pt") */
  after: string;
  /** Enable hyphenation */
  hyphenate: boolean;
};

/**
 * Props for ParagraphSpacingSection component.
 */
export type ParagraphSpacingSectionProps = BaseSectionProps & {
  /** Current paragraph spacing data */
  data: ParagraphSpacingData;
  /** Called when paragraph spacing data changes */
  onChange: (data: ParagraphSpacingData) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size of controls */
  size?: "sm" | "md";
};
