/**
 * @file Type definitions for PatternFillSection
 */

import type { AlignmentType } from "../../components/AlignmentGrid/types";

export type TileType = "grid" | "brick";

export type PatternFillValue = {
  sourceUrl: string;
  tileType: TileType;
  scale: number; // percentage
  spacingX: number; // pixels
  spacingY: number; // pixels
  alignment: AlignmentType;
};
