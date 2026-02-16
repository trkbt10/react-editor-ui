/**
 * @file StrokeCapSelect - Line cap style selector
 */

import type { StrokeCap } from "./types";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import { CapButtIcon, CapRoundIcon, CapSquareIcon } from "../../icons";

export type StrokeCapSelectProps = {
  value: StrokeCap;
  onChange: (value: StrokeCap) => void;
  disabled?: boolean;
  size?: "sm" | "md";
};

const options = [
  { value: "butt" as const, icon: <CapButtIcon />, "aria-label": "Butt cap" },
  { value: "round" as const, icon: <CapRoundIcon />, "aria-label": "Round cap" },
  { value: "square" as const, icon: <CapSquareIcon />, "aria-label": "Square cap" },
];

/** Segmented control for line cap style: butt, round, or square */
export function StrokeCapSelect({
  value,
  onChange,
  disabled = false,
  size = "sm",
}: StrokeCapSelectProps) {
  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(v) => onChange(v as StrokeCap)}
      size={size}
      disabled={disabled}
      aria-label="Line cap"
    />
  );
}
