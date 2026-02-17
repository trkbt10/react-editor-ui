/**
 * @file Type definitions for fill editing
 */

import type { ColorValue } from "../../utils/color/types";
import type { GradientValue } from "../GradientEditor/gradientTypes";

export type FillType = "solid" | "gradient" | "image" | "pattern" | "video";

export type ImageAdjustments = {
  exposure: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  temperature: number; // -100 to 100
  tint: number; // -100 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
};

export type ImageFillMode = "fill" | "fit" | "crop" | "tile";

export type ImageFillValue = {
  url: string;
  mode: ImageFillMode;
  adjustments: ImageAdjustments;
  opacity: number; // 0 to 100
};

export type TileType = "grid" | "brick";

export type AlignmentType =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

export type PatternFillValue = {
  sourceUrl: string;
  tileType: TileType;
  scale: number; // percentage
  spacingX: number; // pixels
  spacingY: number; // pixels
  alignment: AlignmentType;
};

export type VideoFillValue = {
  url: string;
  loop: boolean;
  autoplay: boolean;
  muted: boolean;
  opacity: number; // 0 to 100
};

export type SolidFillValue = {
  type: "solid";
  color: ColorValue;
};

export type GradientFillValue = {
  type: "gradient";
  gradient: GradientValue;
};

export type ImageFill = {
  type: "image";
  image: ImageFillValue;
};

export type PatternFill = {
  type: "pattern";
  pattern: PatternFillValue;
};

export type VideoFill = {
  type: "video";
  video: VideoFillValue;
};

export type FillValue =
  | SolidFillValue
  | GradientFillValue
  | ImageFill
  | PatternFill
  | VideoFill;
