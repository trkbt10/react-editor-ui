/**
 * @file AnimationSection types
 */

import type { BezierControlPoints, EasingPreset } from "../../components/BezierCurveEditor/bezierTypes";
import type { BaseSectionProps } from "../shared/types";

export type AnimationData = {
  duration: string;
  delay: string;
  easing: EasingPreset;
  bezierControlPoints: BezierControlPoints;
};

export type AnimationSectionProps = BaseSectionProps & {
  /** Current animation data */
  data: AnimationData;
  /** Called when animation settings change */
  onChange: (data: AnimationData) => void;
};
