/**
 * @file DistributeVerticalSelect - Vertical distribution selector
 */

import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import {
  DistributeVerticalStartIcon,
  DistributeVerticalCenterIcon,
  DistributeVerticalEndIcon,
} from "../../icons";

export type DistributeVertical = "top" | "center" | "bottom";

export type DistributeVerticalSelectProps = {
  value: DistributeVertical;
  onChange: (value: DistributeVertical) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  fullWidth?: boolean;
};

const options = [
  { value: "top" as const, icon: <DistributeVerticalStartIcon />, "aria-label": "Distribute top" },
  { value: "center" as const, icon: <DistributeVerticalCenterIcon />, "aria-label": "Distribute center" },
  { value: "bottom" as const, icon: <DistributeVerticalEndIcon />, "aria-label": "Distribute bottom" },
];

/** Segmented control for vertical distribution: top, center, or bottom */
export function DistributeVerticalSelect({
  value,
  onChange,
  disabled = false,
  size = "sm",
  fullWidth = false,
}: DistributeVerticalSelectProps) {
  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(v) => onChange(v as DistributeVertical)}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      aria-label="Vertical distribution"
    />
  );
}
