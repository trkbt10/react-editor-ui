/**
 * @file TextVerticalAlignSelect - Text vertical alignment selector
 */

import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import {
  TextAlignTopIcon,
  TextAlignMiddleIcon,
  TextAlignBottomIcon,
} from "../../icons";

export type TextVerticalAlign = "top" | "middle" | "bottom";

export type TextVerticalAlignSelectProps = {
  value: TextVerticalAlign;
  onChange: (value: TextVerticalAlign) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  fullWidth?: boolean;
};

const options = [
  { value: "top" as const, icon: <TextAlignTopIcon />, "aria-label": "Align top" },
  { value: "middle" as const, icon: <TextAlignMiddleIcon />, "aria-label": "Align middle" },
  { value: "bottom" as const, icon: <TextAlignBottomIcon />, "aria-label": "Align bottom" },
];

/** Segmented control for text vertical alignment: top, middle, or bottom */
export function TextVerticalAlignSelect({
  value,
  onChange,
  disabled = false,
  size = "sm",
  fullWidth = false,
}: TextVerticalAlignSelectProps) {
  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(v) => onChange(v as TextVerticalAlign)}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      aria-label="Vertical alignment"
    />
  );
}
