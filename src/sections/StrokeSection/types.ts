/**
 * @file StrokeSection types
 */

import type { BaseSectionProps } from "../shared/types";

export type StrokeStyle = "solid" | "dashed" | "dotted";
export type JoinType = "miter" | "round" | "bevel";
export type BrushDirection = "left" | "right";
export type WidthProfile = "uniform" | "taper-end" | "taper-both";
export type BrushType = "smooth" | "rough" | "spray";
export type StrokeTab = "basic" | "dynamic" | "brush";

export type StrokeData = {
  tab: StrokeTab;
  // Basic
  style: StrokeStyle;
  widthProfile: WidthProfile;
  join: JoinType;
  miterAngle: string;
  // Dynamic
  frequency: string;
  wiggle: string;
  smoothen: string;
  // Brush
  brushType: BrushType;
  brushDirection: BrushDirection;
  brushWidthProfile: WidthProfile;
};

export type StrokeSectionProps = BaseSectionProps & {
  /** Current stroke data */
  data: StrokeData;
  /** Called when stroke settings change */
  onChange: (data: StrokeData) => void;
};
