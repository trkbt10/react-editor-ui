/**
 * @file Type definitions for gradient editing
 */

import type { ColorValue } from "../color/types";

export type GradientType = "linear" | "radial" | "angular" | "diamond";

export type GradientStop = {
  id: string;
  position: number; // 0-100
  color: ColorValue;
};

export type GradientValue = {
  type: GradientType;
  angle: number; // degrees (linear/angular)
  stops: GradientStop[];
};
