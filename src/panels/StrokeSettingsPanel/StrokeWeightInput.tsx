/**
 * @file StrokeWeightInput - Weight input with stepper using UnitInput
 */

import { useCallback, useMemo } from "react";
import { UnitInput, type UnitOption } from "../../components/UnitInput/UnitInput";

export type WeightUnit = "px" | "pt" | "em" | "rem";

export type StrokeWeightInputProps = {
  value: string;
  onChange: (value: string) => void;
  unit?: WeightUnit;
  onUnitChange?: (unit: WeightUnit) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showUnit?: boolean;
};

const unitOptions: UnitOption[] = [
  { value: "pt", label: "pt" },
  { value: "px", label: "px" },
  { value: "em", label: "em" },
  { value: "rem", label: "rem" },
];

/** Stroke weight input with unit selector (px, pt, em, rem) */
export function StrokeWeightInput({
  value,
  onChange,
  unit = "pt",
  onUnitChange,
  min = 0,
  max = 1000,
  step = 1,
  disabled = false,
  showUnit = true,
}: StrokeWeightInputProps) {
  // Combine value and unit for UnitInput
  const combinedValue = useMemo(() => `${value}${unit}`, [value, unit]);

  const handleChange = useCallback(
    (newValue: string) => {
      // Parse the value to extract number and unit
      const match = newValue.match(/^(-?[\d.]+)\s*([a-z]+)?$/i);
      if (match) {
        const numStr = match[1];
        const newUnit = match[2]?.toLowerCase() as WeightUnit | undefined;

        onChange(numStr);

        if (newUnit && onUnitChange && ["px", "pt", "em", "rem"].includes(newUnit)) {
          onUnitChange(newUnit as WeightUnit);
        }
      } else {
        onChange(newValue);
      }
    },
    [onChange, onUnitChange],
  );

  return (
    <UnitInput
      value={combinedValue}
      onChange={handleChange}
      units={showUnit ? unitOptions : [{ value: unit, label: unit }]}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
            aria-label="Stroke weight"
    />
  );
}
