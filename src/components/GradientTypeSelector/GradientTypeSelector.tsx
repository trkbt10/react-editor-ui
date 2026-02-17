/**
 * @file GradientTypeSelector component - Gradient type selection control
 */

import { memo, useCallback } from "react";
import type { GradientType } from "../../utils/gradient/types";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import type { SegmentedControlOption } from "../SegmentedControl/SegmentedControl";
import {
  GradientLinearIcon,
  GradientRadialIcon,
  GradientAngularIcon,
  GradientDiamondIcon,
} from "../../icons";

export type GradientTypeSelectorProps = {
  value: GradientType;
  onChange: (type: GradientType) => void;
  disabled?: boolean;
  "aria-label"?: string;
};

const gradientTypeOptions: SegmentedControlOption<GradientType>[] = [
  { value: "linear", icon: <GradientLinearIcon />, "aria-label": "Linear gradient" },
  { value: "radial", icon: <GradientRadialIcon />, "aria-label": "Radial gradient" },
  { value: "angular", icon: <GradientAngularIcon />, "aria-label": "Angular gradient" },
  { value: "diamond", icon: <GradientDiamondIcon />, "aria-label": "Diamond gradient" },
];

/**
 * Selector for choosing gradient type (linear, radial, angular, diamond).
 */
export const GradientTypeSelector = memo(function GradientTypeSelector({
  value,
  onChange,
  disabled = false,
  "aria-label": ariaLabel = "Gradient type",
}: GradientTypeSelectorProps) {
  const handleChange = useCallback(
    (newValue: GradientType | GradientType[]) => {
      if (!Array.isArray(newValue)) {
        onChange(newValue);
      }
    },
    [onChange],
  );

  return (
    <SegmentedControl
      options={gradientTypeOptions}
      value={value}
      onChange={handleChange}
      size="sm"
      disabled={disabled}
      aria-label={ariaLabel}
    />
  );
});
