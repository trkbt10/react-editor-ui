/**
 * @file ObjectHorizontalAlignSelect - Object horizontal alignment selector
 */

import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import { AlignLeftIcon, AlignCenterHIcon, AlignRightIcon } from "../../icons";

export type ObjectHorizontalAlign = "left" | "center" | "right";

export type ObjectHorizontalAlignSelectProps = {
  value: ObjectHorizontalAlign;
  onChange: (value: ObjectHorizontalAlign) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  fullWidth?: boolean;
};

const options = [
  { value: "left" as const, icon: <AlignLeftIcon />, "aria-label": "Align left" },
  { value: "center" as const, icon: <AlignCenterHIcon />, "aria-label": "Align center" },
  { value: "right" as const, icon: <AlignRightIcon />, "aria-label": "Align right" },
];

/** Segmented control for object horizontal alignment: left, center, or right */
export function ObjectHorizontalAlignSelect({
  value,
  onChange,
  disabled = false,
  size = "sm",
  fullWidth = false,
}: ObjectHorizontalAlignSelectProps) {
  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(v) => onChange(v as ObjectHorizontalAlign)}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      aria-label="Horizontal alignment"
    />
  );
}
