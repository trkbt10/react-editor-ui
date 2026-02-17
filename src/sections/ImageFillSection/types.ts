/**
 * @file Type definitions for ImageFillSection
 */

import type { ImageAdjustmentsData } from "../../components/ImageAdjustments/types";

export type ImageFillMode = "fill" | "fit" | "crop" | "tile";

export type ImageFillValue = {
  url: string;
  mode: ImageFillMode;
  adjustments: ImageAdjustmentsData;
  opacity: number; // 0 to 100
};
