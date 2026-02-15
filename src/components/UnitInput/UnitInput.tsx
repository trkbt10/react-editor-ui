/**
 * @file UnitInput component - Numeric input with unit support, wheel interaction, and auto value
 */

import { useState, useRef, useCallback, type CSSProperties, type WheelEvent, type KeyboardEvent } from "react";
import {
  COLOR_INPUT_BG,
  COLOR_INPUT_BORDER,
  COLOR_INPUT_BORDER_FOCUS,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_DISABLED,
  COLOR_HOVER,
  COLOR_FOCUS_RING,
  RADIUS_SM,
  DURATION_FAST,
  EASING_DEFAULT,
  SIZE_FONT_SM,
  SIZE_FONT_MD,
  SIZE_HEIGHT_SM,
  SIZE_HEIGHT_MD,
  SIZE_HEIGHT_LG,
  SPACE_SM,
  SPACE_MD,
  SPACE_LG,
} from "../../constants/styles";

export type UnitOption = {
  value: string;
  label: string;
};

export type UnitInputProps = {
  value: string;
  onChange: (value: string) => void;
  units?: UnitOption[];
  allowAuto?: boolean;
  min?: number;
  max?: number;
  step?: number;
  shiftStep?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
};

const sizeMap = {
  sm: { height: SIZE_HEIGHT_SM, fontSize: SIZE_FONT_SM, paddingX: SPACE_SM },
  md: { height: SIZE_HEIGHT_MD, fontSize: SIZE_FONT_MD, paddingX: SPACE_MD },
  lg: { height: SIZE_HEIGHT_LG, fontSize: SIZE_FONT_MD, paddingX: SPACE_LG },
};

const defaultUnits: UnitOption[] = [
  { value: "px", label: "px" },
  { value: "%", label: "%" },
  { value: "em", label: "em" },
  { value: "rem", label: "rem" },
];

function parseValue(value: string): { num: number | null; unit: string; isAuto: boolean } {
  const trimmed = value.trim().toLowerCase();

  if (trimmed === "auto") {
    return { num: null, unit: "", isAuto: true };
  }

  const match = trimmed.match(/^(-?[\d.]+)\s*([a-z%]*)$/i);
  if (match) {
    const num = parseFloat(match[1]);
    const unit = match[2] || "px";
    return { num: isNaN(num) ? null : num, unit, isAuto: false };
  }

  return { num: null, unit: "", isAuto: false };
}

function formatValue(num: number | null, unit: string, isAuto: boolean): string {
  if (isAuto) {
    return "Auto";
  }
  if (num === null) {
    return "";
  }
  const formatted = Number.isInteger(num) ? num.toString() : num.toFixed(2).replace(/\.?0+$/, "");
  return `${formatted}${unit}`;
}

function clampValue(value: number, min?: number, max?: number): number {
  if (min !== undefined && value < min) {
    return min;
  }
  if (max !== undefined && value > max) {
    return max;
  }
  return value;
}

function findUnitIndex(units: UnitOption[], currentUnit: string): number {
  const index = units.findIndex((u) => u.value.toLowerCase() === currentUnit.toLowerCase());
  return index >= 0 ? index : 0;
}





export function UnitInput({
  value,
  onChange,
  units = defaultUnits,
  allowAuto = false,
  min,
  max,
  step = 1,
  shiftStep = 10,
  size = "md",
  disabled = false,
  placeholder,
  "aria-label": ariaLabel,
  className,
}: UnitInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isUnitHovered, setIsUnitHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sizeConfig = sizeMap[size];

  const parsed = parseValue(value);
  const currentUnit = parsed.unit || (units[0]?.value ?? "px");
  const currentUnitIndex = findUnitIndex(units, currentUnit);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (allowAuto && newValue.toLowerCase() === "auto") {
        onChange("Auto");
        return;
      }

      const newParsed = parseValue(newValue);
      if (newParsed.num !== null) {
        const unit = newParsed.unit || currentUnit;
        onChange(formatValue(newParsed.num, unit, false));
      } else {
        onChange(newValue);
      }
    },
    [onChange, currentUnit, allowAuto],
  );

  const adjustValue = useCallback(
    (delta: number) => {
      if (disabled) return;

      if (parsed.isAuto || parsed.num === null) {
        const defaultValue = 0;
        const newValue = clampValue(defaultValue + delta, min, max);
        onChange(formatValue(newValue, currentUnit, false));
        return;
      }

      const newValue = clampValue(parsed.num + delta, min, max);
      onChange(formatValue(newValue, currentUnit, false));
    },
    [disabled, parsed, currentUnit, min, max, onChange],
  );

  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      if (disabled || !isFocused) return;

      e.preventDefault();
      const actualStep = e.shiftKey ? shiftStep : step;
      const delta = e.deltaY < 0 ? actualStep : -actualStep;
      adjustValue(delta);
    },
    [disabled, isFocused, step, shiftStep, adjustValue],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      const actualStep = e.shiftKey ? shiftStep : step;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        adjustValue(actualStep);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        adjustValue(-actualStep);
      }
    },
    [disabled, step, shiftStep, adjustValue],
  );

  const cycleUnit = useCallback(() => {
    if (disabled) return;

    const allOptions = allowAuto ? [...units, { value: "auto", label: "Auto" }] : units;

    if (parsed.isAuto) {
      const nextUnit = units[0]?.value ?? "px";
      onChange(formatValue(0, nextUnit, false));
      return;
    }

    if (parsed.num === null) return;

    const nextIndex = (currentUnitIndex + 1) % allOptions.length;
    const nextOption = allOptions[nextIndex];

    if (nextOption.value === "auto") {
      onChange("Auto");
    } else {
      onChange(formatValue(parsed.num, nextOption.value, false));
    }
  }, [disabled, allowAuto, units, parsed, currentUnitIndex, onChange]);

  const containerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: sizeConfig.height,
    backgroundColor: COLOR_INPUT_BG,
    border: `1px solid ${isFocused ? COLOR_INPUT_BORDER_FOCUS : COLOR_INPUT_BORDER}`,
    borderRadius: RADIUS_SM,
    transition: `border-color ${DURATION_FAST} ${EASING_DEFAULT}`,
    boxShadow: isFocused ? `0 0 0 2px ${COLOR_FOCUS_RING}` : "none",
    opacity: disabled ? 0.5 : 1,
    boxSizing: "border-box",
    overflow: "hidden",
  };

  const inputStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    height: "100%",
    padding: `0 ${sizeConfig.paddingX}`,
    border: "none",
    backgroundColor: "transparent",
    color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: sizeConfig.fontSize,
    outline: "none",
    boxSizing: "border-box",
  };

  const unitButtonStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    padding: `0 ${SPACE_SM}`,
    border: "none",
    borderLeft: `1px solid ${COLOR_INPUT_BORDER}`,
    backgroundColor: isUnitHovered && !disabled ? COLOR_HOVER : "transparent",
    color: COLOR_TEXT_MUTED,
    fontSize: sizeConfig.fontSize,
    cursor: disabled ? "not-allowed" : "pointer",
    userSelect: "none",
    transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
    minWidth: 32,
  };

  const displayUnit = parsed.isAuto ? "Auto" : units[currentUnitIndex]?.label ?? currentUnit;

  return (
    <div
      className={className}
      style={containerStyle}
      onWheel={handleWheel}
      data-testid="unit-input"
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={inputStyle}
        data-testid="unit-input-field"
      />
      <button
        type="button"
        onClick={cycleUnit}
        onPointerEnter={() => setIsUnitHovered(true)}
        onPointerLeave={() => setIsUnitHovered(false)}
        disabled={disabled}
        style={unitButtonStyle}
        aria-label={`Current unit: ${displayUnit}. Click to change unit.`}
        data-testid="unit-input-unit-button"
      >
        {displayUnit}
      </button>
    </div>
  );
}
