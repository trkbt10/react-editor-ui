/**
 * @file TextHorizontalAlignSelect - Text horizontal alignment selector
 */

import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import {
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
} from "../../icons";

export type TextHorizontalAlign = "left" | "center" | "right";

export type TextHorizontalAlignSelectProps = {
  value: TextHorizontalAlign;
  onChange: (value: TextHorizontalAlign) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  fullWidth?: boolean;
};

const options = [
  { value: "left" as const, icon: <TextAlignLeftIcon />, "aria-label": "Align left" },
  { value: "center" as const, icon: <TextAlignCenterIcon />, "aria-label": "Align center" },
  { value: "right" as const, icon: <TextAlignRightIcon />, "aria-label": "Align right" },
];

/** Segmented control for text horizontal alignment: left, center, or right */
export function TextHorizontalAlignSelect({
  value,
  onChange,
  disabled = false,
  size = "sm",
  fullWidth = false,
}: TextHorizontalAlignSelectProps) {
  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(v) => onChange(v as TextHorizontalAlign)}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      aria-label="Horizontal alignment"
    />
  );
}
