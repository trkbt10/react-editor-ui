/**
 * @file Type definitions for FillPanel
 */

import type { ColorValue } from "../../utils/color/types";
import type { GradientValue } from "../../utils/gradient/types";
import type { ImageFillValue } from "../../sections/ImageFillSection/types";
import type { PatternFillValue } from "../../sections/PatternFillSection/types";
import type { VideoFillValue } from "../../sections/VideoFillSection/types";

// FillType is defined in utils/fill/types.ts
// Import directly from there: import type { FillType } from "../../utils/fill/types";
import type { FillType as FillTypeImport } from "../../utils/fill/types";

export type FillType = FillTypeImport;

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
