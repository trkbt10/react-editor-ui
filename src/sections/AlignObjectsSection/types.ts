/**
 * @file AlignObjectsSection types
 */

import type { BaseSectionProps } from "../shared/types";

/**
 * Alignment action types for objects
 */
export type HorizontalAlign = "left" | "center" | "right";
export type VerticalAlign = "top" | "middle" | "bottom";

/**
 * Props for AlignObjectsSection component.
 */
export type AlignObjectsSectionProps = BaseSectionProps & {
  /** Callback when horizontal alignment is triggered */
  onAlignHorizontal: (align: HorizontalAlign) => void;
  /** Callback when vertical alignment is triggered */
  onAlignVertical: (align: VerticalAlign) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size of controls */
  size?: "sm" | "md";
};
