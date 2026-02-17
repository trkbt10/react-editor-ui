/**
 * @file StrokeMiterAngleInput - Miter angle input control
 */

import { memo } from "react";
import { UnitInput } from "../UnitInput/UnitInput";
import { MiterAngleIcon } from "../../icons";

export type StrokeMiterAngleInputProps = {
  /** Current miter angle value */
  value: string;
  /** Called when miter angle changes */
  onChange: (value: string) => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Aria label */
  "aria-label"?: string;
};

const miterAngleUnits = [{ value: "°", label: "°" }];

/**
 * Miter angle input control.
 */
export const StrokeMiterAngleInput = memo(function StrokeMiterAngleInput({
  value,
  onChange,
  size = "md",
  "aria-label": ariaLabel = "Miter angle",
}: StrokeMiterAngleInputProps) {
  return (
    <UnitInput
      value={value}
      onChange={onChange}
      units={miterAngleUnits}
      iconStart={<MiterAngleIcon />}
      min={0}
      max={180}
      step={1}
      size={size}
      aria-label={ariaLabel}
    />
  );
});
