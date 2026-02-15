/**
 * @file StrokeAlignSelect - Stroke alignment selector
 */

import type { StrokeAlign } from "./types";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import { AlignInsideIcon, AlignCenterIcon, AlignOutsideIcon } from "./icons";

export type StrokeAlignSelectProps = {
  value: StrokeAlign;
  onChange: (value: StrokeAlign) => void;
  disabled?: boolean;
  size?: "sm" | "md";
};

const options = [
  { value: "inside" as const, icon: <AlignInsideIcon />, "aria-label": "Inside" },
  { value: "center" as const, icon: <AlignCenterIcon />, "aria-label": "Center" },
  { value: "outside" as const, icon: <AlignOutsideIcon />, "aria-label": "Outside" },
];

export function StrokeAlignSelect({
  value,
  onChange,
  disabled = false,
  size = "sm",
}: StrokeAlignSelectProps) {
  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(v) => onChange(v as StrokeAlign)}
      size={size}
      disabled={disabled}
      aria-label="Stroke alignment"
    />
  );
}
