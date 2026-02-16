/**
 * @file StrokeJoinSelect - Corner join style selector
 */

import type { StrokeJoin } from "./types";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import { JoinMiterIcon, JoinRoundIcon, JoinBevelIcon } from "../../icons";

export type StrokeJoinSelectProps = {
  value: StrokeJoin;
  onChange: (value: StrokeJoin) => void;
  disabled?: boolean;
  size?: "sm" | "md";
};

const options = [
  { value: "miter" as const, icon: <JoinMiterIcon />, "aria-label": "Miter join" },
  { value: "round" as const, icon: <JoinRoundIcon />, "aria-label": "Round join" },
  { value: "bevel" as const, icon: <JoinBevelIcon />, "aria-label": "Bevel join" },
];

/** Segmented control for line join style: miter, round, or bevel */
export function StrokeJoinSelect({
  value,
  onChange,
  disabled = false,
  size = "sm",
}: StrokeJoinSelectProps) {
  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(v) => onChange(v as StrokeJoin)}
      size={size}
      disabled={disabled}
      aria-label="Corner join"
    />
  );
}
