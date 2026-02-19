/**
 * @file BoxModelEditor types
 */

/** Four-directional spacing values (top, right, bottom, left) */
export type BoxSpacing = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/** Four-corner radius values (topLeft, topRight, bottomRight, bottomLeft) */
export type BoxCornerRadius = {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
};

/** Box model data with margin, padding, and border-radius */
export type BoxModelData = {
  margin: BoxSpacing;
  padding: BoxSpacing;
  borderRadius: BoxCornerRadius;
  /** Content size display (optional, read-only) */
  contentSize?: { width: number; height: number };
};
