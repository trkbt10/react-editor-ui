/**
 * @file Type definitions for stroke settings components
 */

export type StrokeCap = "butt" | "round" | "square";
export type StrokeJoin = "miter" | "round" | "bevel";
export type StrokeAlign = "inside" | "center" | "outside";
export type DashCornerMode = "adjust" | "exact";

export type ArrowheadType =
  | "none"
  | "triangle"
  | "triangle-open"
  | "circle"
  | "circle-open"
  | "square"
  | "diamond"
  | "bar";

export type ArrowheadAlign = "start" | "end";

export type WidthProfile = "uniform" | "taper-start" | "taper-end" | "taper-both";

export type DashPattern = {
  values: string[];
};

export type ArrowheadSettings = {
  start: ArrowheadType;
  end: ArrowheadType;
  startScale: string;
  endScale: string;
  align: ArrowheadAlign;
};

export type StrokePanelVariant = "expanded" | "compact";
