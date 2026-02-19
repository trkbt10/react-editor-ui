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

/** Box model data with margin, border, padding, and border-radius */
export type BoxModelData = {
  margin: BoxSpacing;
  border: BoxSpacing;
  padding: BoxSpacing;
  borderRadius: BoxCornerRadius;
  /** Content size (editable) */
  contentSize: { width: number; height: number };
};

/**
 * Display mode for layer thickness:
 * - "proportional": layer thickness proportional to values within fixed editor size
 * - "fixed": constant layer thickness regardless of values
 * - "auto": editor size expands/contracts based on actual values
 */
export type BoxModelDisplayMode = "proportional" | "fixed" | "auto";

/** Editable features configuration */
export type BoxModelEditableFeatures = {
  margin?: boolean;
  border?: boolean;
  padding?: boolean;
  radius?: boolean;
  contentSize?: boolean;
};
