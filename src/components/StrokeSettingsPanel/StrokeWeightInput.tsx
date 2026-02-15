/**
 * @file StrokeWeightInput - Weight input with stepper
 */

import type { CSSProperties, PointerEvent } from "react";
import { Select, type SelectOption } from "../Select/Select";
import { ChevronUpIcon, ChevronDownIcon } from "./icons";
import {
  COLOR_SURFACE,
  COLOR_BORDER,
  COLOR_HOVER,
  COLOR_ACTIVE,
  COLOR_TEXT,
  RADIUS_MD,
  DURATION_FAST,
  EASING_DEFAULT,
  SIZE_FONT_SM,
  SIZE_HEIGHT_MD,
  SPACE_SM,
} from "../../constants/styles";

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

const unitOptions: SelectOption<WeightUnit>[] = [
  { value: "pt", label: "pt" },
  { value: "px", label: "px" },
  { value: "em", label: "em" },
  { value: "rem", label: "rem" },
];

const containerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

const stepperStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: RADIUS_MD,
  overflow: "hidden",
};

const stepperButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "20px",
  height: "11px",
  backgroundColor: COLOR_SURFACE,
  border: "none",
  cursor: "pointer",
  color: COLOR_TEXT,
  transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
  padding: 0,
};

const inputContainerStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  height: SIZE_HEIGHT_MD,
  backgroundColor: COLOR_SURFACE,
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: RADIUS_MD,
  overflow: "hidden",
};

const inputStyle: CSSProperties = {
  flex: 1,
  height: "100%",
  border: "none",
  backgroundColor: "transparent",
  color: COLOR_TEXT,
  fontSize: SIZE_FONT_SM,
  padding: `0 ${SPACE_SM}`,
  outline: "none",
  minWidth: 0,
};

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
  const numericValue = parseFloat(value) || 0;

  const handleIncrement = () => {
    if (disabled) {
      return;
    }
    const newValue = Math.min(numericValue + step, max);
    onChange(String(newValue));
  };

  const handleDecrement = () => {
    if (disabled) {
      return;
    }
    const newValue = Math.max(numericValue - step, min);
    onChange(String(newValue));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handlePointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = COLOR_HOVER;
    }
  };

  const handlePointerLeave = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = COLOR_SURFACE;
  };

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = COLOR_ACTIVE;
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = COLOR_HOVER;
    }
  };

  const buttonEvents = {
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
  };

  return (
    <div style={containerStyle}>
      <div style={stepperStyle}>
        <button
          type="button"
          style={{
            ...stepperButtonStyle,
            borderBottom: `1px solid ${COLOR_BORDER}`,
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
          onClick={handleIncrement}
          {...buttonEvents}
          disabled={disabled}
          aria-label="Increase"
        >
          <ChevronUpIcon />
        </button>
        <button
          type="button"
          style={{
            ...stepperButtonStyle,
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
          onClick={handleDecrement}
          {...buttonEvents}
          disabled={disabled}
          aria-label="Decrease"
        >
          <ChevronDownIcon />
        </button>
      </div>

      <div style={inputContainerStyle}>
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          style={{
            ...inputStyle,
            opacity: disabled ? 0.5 : 1,
          }}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-label="Stroke weight"
        />
      </div>

      {showUnit && onUnitChange ? (
        <div style={{ width: "55px" }}>
          <Select
            options={unitOptions}
            value={unit}
            onChange={onUnitChange}
            disabled={disabled}
            aria-label="Unit"
          />
        </div>
      ) : null}
    </div>
  );
}
