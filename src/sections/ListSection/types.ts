/**
 * @file ListSection types
 */

import type { BaseSectionProps } from "../shared/types";

/**
 * List type options
 */
export type ListType = "none" | "bulleted" | "numbered";

/**
 * List style options for bulleted lists
 */
export type BulletedListStyle = "disc" | "circle" | "square";

/**
 * List style options for numbered lists
 */
export type NumberedListStyle = "decimal" | "lower-alpha" | "upper-alpha" | "lower-roman" | "upper-roman";

/**
 * List data
 */
export type ListData = {
  /** List type */
  type: ListType;
  /** List style (depends on type) */
  style: BulletedListStyle | NumberedListStyle | "";
};

/**
 * Props for ListSection component.
 */
export type ListSectionProps = BaseSectionProps & {
  /** Current list data */
  data: ListData;
  /** Called when list data changes */
  onChange: (data: ListData) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size of controls */
  size?: "sm" | "md";
};
