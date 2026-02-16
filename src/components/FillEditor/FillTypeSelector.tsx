/**
 * @file FillTypeSelector component - Icon-based fill type selector
 */

import { memo, useCallback } from "react";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import type { SegmentedControlOption } from "../SegmentedControl/SegmentedControl";
import type { FillType } from "./fillTypes";
import {
  FillSolidIcon,
  FillGradientIcon,
  FillImageIcon,
  FillPatternIcon,
  FillVideoIcon,
} from "../../icons";

export type FillTypeSelectorProps = {
  value: FillType;
  onChange: (value: FillType) => void;
  disabled?: boolean;
  "aria-label"?: string;
};

const fillTypeOptions: SegmentedControlOption<FillType>[] = [
  { value: "solid", icon: <FillSolidIcon />, "aria-label": "Solid fill" },
  { value: "gradient", icon: <FillGradientIcon />, "aria-label": "Gradient fill" },
  { value: "image", icon: <FillImageIcon />, "aria-label": "Image fill" },
  { value: "pattern", icon: <FillPatternIcon />, "aria-label": "Pattern fill" },
  { value: "video", icon: <FillVideoIcon />, "aria-label": "Video fill" },
];

/** Segmented control for selecting between solid, gradient, image, pattern, and video fills */
export const FillTypeSelector = memo(function FillTypeSelector({
  value,
  onChange,
  disabled = false,
  "aria-label": ariaLabel = "Fill type",
}: FillTypeSelectorProps) {
  const handleChange = useCallback(
    (newValue: FillType | FillType[]) => {
      if (Array.isArray(newValue)) {
        return;
      }
      onChange(newValue);
    },
    [onChange],
  );

  return (
    <SegmentedControl
      options={fillTypeOptions}
      value={value}
      onChange={handleChange}
      size="sm"
      disabled={disabled}
      aria-label={ariaLabel}
    />
  );
});
