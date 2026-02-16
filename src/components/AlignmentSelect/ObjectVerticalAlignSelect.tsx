/**
 * @file ObjectVerticalAlignSelect - Object vertical alignment selector
 */

import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import { AlignTopIcon, AlignMiddleIcon, AlignBottomIcon } from "../../icons";

export type ObjectVerticalAlign = "top" | "middle" | "bottom";

export type ObjectVerticalAlignSelectProps = {
  value: ObjectVerticalAlign;
  onChange: (value: ObjectVerticalAlign) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  fullWidth?: boolean;
};

const options = [
  { value: "top" as const, icon: <AlignTopIcon />, "aria-label": "Align top" },
  { value: "middle" as const, icon: <AlignMiddleIcon />, "aria-label": "Align middle" },
  { value: "bottom" as const, icon: <AlignBottomIcon />, "aria-label": "Align bottom" },
];

/** Segmented control for object vertical alignment: top, middle, or bottom */
export function ObjectVerticalAlignSelect({
  value,
  onChange,
  disabled = false,
  size = "sm",
  fullWidth = false,
}: ObjectVerticalAlignSelectProps) {
  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(v) => onChange(v as ObjectVerticalAlign)}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      aria-label="Vertical alignment"
    />
  );
}
