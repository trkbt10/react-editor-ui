/**
 * @file StrokeSection types
 */

import type { BaseSectionProps } from "../shared/types";
import type { StrokeStyle } from "../../components/StrokeStyleSelect/StrokeStyleSelect";
import type { JoinType } from "../../components/StrokeJoinControl/StrokeJoinControl";
import type { WidthProfile } from "../../components/StrokeWidthProfileSelect/StrokeWidthProfileSelect";

export type BrushDirection = "left" | "right";
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
