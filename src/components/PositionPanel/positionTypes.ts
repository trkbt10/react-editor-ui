/**
 * @file Position panel type definitions
 */

export type HorizontalAlign = "left" | "center" | "right";
export type VerticalAlign = "top" | "middle" | "bottom";
export type HorizontalConstraint = "left" | "right" | "left-right" | "center" | "scale";
export type VerticalConstraint = "top" | "bottom" | "top-bottom" | "center" | "scale";

export type PositionSettings = {
  horizontalAlign: HorizontalAlign;
  verticalAlign: VerticalAlign;
  x: string;
  y: string;
  horizontalConstraint: HorizontalConstraint;
  verticalConstraint: VerticalConstraint;
  rotation: string;
};

export type PositionPanelProps = {
  settings: PositionSettings;
  onChange: (settings: PositionSettings) => void;
  onClose?: () => void;
  onToggleConstraints?: () => void;
  onTransformAction?: (action: string) => void;
  width?: number | string;
  className?: string;
};

export function createDefaultPositionSettings(): PositionSettings {
  return {
    horizontalAlign: "left",
    verticalAlign: "top",
    x: "0",
    y: "0",
    horizontalConstraint: "left",
    verticalConstraint: "top",
    rotation: "0",
  };
}
