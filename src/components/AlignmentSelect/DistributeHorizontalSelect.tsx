/**
 * @file DistributeHorizontalSelect - Horizontal distribution selector
 */

import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import {
  DistributeHorizontalStartIcon,
  DistributeHorizontalCenterIcon,
  DistributeHorizontalEndIcon,
} from "../../icons";

export type DistributeHorizontal = "left" | "center" | "right";

export type DistributeHorizontalSelectProps = {
  value: DistributeHorizontal;
  onChange: (value: DistributeHorizontal) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  fullWidth?: boolean;
};

const options = [
  { value: "left" as const, icon: <DistributeHorizontalStartIcon />, "aria-label": "Distribute left" },
  { value: "center" as const, icon: <DistributeHorizontalCenterIcon />, "aria-label": "Distribute center" },
  { value: "right" as const, icon: <DistributeHorizontalEndIcon />, "aria-label": "Distribute right" },
];

/** Segmented control for horizontal distribution: left, center, or right */
export function DistributeHorizontalSelect({
  value,
  onChange,
  disabled = false,
  size = "sm",
  fullWidth = false,
}: DistributeHorizontalSelectProps) {
  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(v) => onChange(v as DistributeHorizontal)}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      aria-label="Horizontal distribution"
    />
  );
}
