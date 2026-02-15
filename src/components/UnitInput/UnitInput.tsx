/**
 * @file UnitInput component - Figma-style numeric input with unit support
 *
 * Features:
 * - Displays only the number, with unit as a separate clickable suffix
 * - Mouse wheel to adjust value (when focused)
 * - Arrow keys to adjust value (Shift for larger steps)
 * - Click unit to cycle through available units
 * - Type with unit (e.g., "10%") to change both value and unit
 * - Supports "Auto" value
 */

import { useState, useRef, useCallback, useEffect, type CSSProperties, type WheelEvent, type KeyboardEvent } from "react";
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
  SIZE_HEIGHT_SM,
  SIZE_HEIGHT_MD,
  SIZE_HEIGHT_LG,
  SPACE_XS,
  SPACE_SM,
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
  sm: { height: SIZE_HEIGHT_SM, fontSize: SIZE_FONT_SM },
  md: { height: SIZE_HEIGHT_MD, fontSize: SIZE_FONT_SM },
  lg: { height: SIZE_HEIGHT_LG, fontSize: SIZE_FONT_SM },
};

const defaultUnits: UnitOption[] = [
  { value: "px", label: "px" },
];

type ParsedValue = {
  num: number | null;
  unit: string;
  isAuto: boolean;
};

function parseValue(value: string, defaultUnit: string): ParsedValue {
  const trimmed = value.trim().toLowerCase();

  if (trimmed === "auto") {
    return { num: null, unit: "", isAuto: true };
  }

  const match = trimmed.match(/^(-?[\d.]+)\s*([a-z%]*)$/i);
  if (match) {
    const num = parseFloat(match[1]);
    const unit = match[2] || defaultUnit;
    return { num: isNaN(num) ? null : num, unit, isAuto: false };
  }

  return { num: null, unit: defaultUnit, isAuto: false };
}

function formatNumber(num: number): string {
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return num.toFixed(2).replace(/\.?0+$/, "");
}

function formatFullValue(num: number | null, unit: string, isAuto: boolean): string {
  if (isAuto) {
    return "Auto";
  }
  if (num === null) {
    return "";
  }
  return `${formatNumber(num)}${unit}`;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isUnitHovered, setIsUnitHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipBlurCommitRef = useRef(false);
  const sizeConfig = sizeMap[size];

  const defaultUnit = units[0]?.value ?? "px";
  const parsed = parseValue(value, defaultUnit);
  const currentUnit = parsed.unit || defaultUnit;
  const currentUnitIndex = findUnitIndex(units, currentUnit);

  // Sync edit value when value changes externally (not during manual typing)
  useEffect(() => {
    if (!isEditing) {
      if (parsed.isAuto) {
        setEditValue("Auto");
      } else if (parsed.num !== null) {
        setEditValue(formatNumber(parsed.num));
      } else {
        setEditValue("");
      }
    }
  }, [value, isEditing, parsed.isAuto, parsed.num]);

  const commitValue = useCallback(
    (inputValue: string) => {
      const trimmed = inputValue.trim();

      if (allowAuto && trimmed.toLowerCase() === "auto") {
        onChange("Auto");
        return;
      }

      const newParsed = parseValue(trimmed, currentUnit);
      if (newParsed.num !== null) {
        const clampedValue = clampValue(newParsed.num, min, max);
        onChange(formatFullValue(clampedValue, newParsed.unit, false));
      } else if (trimmed === "") {
        onChange(formatFullValue(0, currentUnit, false));
      }
    },
    [onChange, currentUnit, allowAuto, min, max],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setIsEditing(true);
    // Select all text on focus
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setIsEditing(false);
    if (skipBlurCommitRef.current) {
      skipBlurCommitRef.current = false;
      return;
    }
    commitValue(editValue);
  }, [editValue, commitValue]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditValue(e.target.value);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (e.key === "Enter") {
        e.preventDefault();
        commitValue(editValue);
        setIsEditing(false);
        inputRef.current?.blur();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        skipBlurCommitRef.current = true;
        setIsEditing(false);
        inputRef.current?.blur();
        return;
      }

      const actualStep = e.shiftKey ? shiftStep : step;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const currentNum = parsed.isAuto ? 0 : (parsed.num ?? 0);
        const newValue = clampValue(currentNum + actualStep, min, max);
        setEditValue(formatNumber(newValue));
        onChange(formatFullValue(newValue, currentUnit, false));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const currentNum = parsed.isAuto ? 0 : (parsed.num ?? 0);
        const newValue = clampValue(currentNum - actualStep, min, max);
        setEditValue(formatNumber(newValue));
        onChange(formatFullValue(newValue, currentUnit, false));
      }
    },
    [disabled, editValue, commitValue, parsed, step, shiftStep, min, max, currentUnit, onChange],
  );

  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      if (disabled || !isFocused) return;

      e.preventDefault();
      const actualStep = e.shiftKey ? shiftStep : step;
      const delta = e.deltaY < 0 ? actualStep : -actualStep;
      const currentNum = parsed.isAuto ? 0 : (parsed.num ?? 0);
      const newValue = clampValue(currentNum + delta, min, max);
      setEditValue(formatNumber(newValue));
      onChange(formatFullValue(newValue, currentUnit, false));
    },
    [disabled, isFocused, step, shiftStep, parsed, min, max, currentUnit, onChange],
  );

  const cycleUnit = useCallback(() => {
    if (disabled) return;

    const allOptions = allowAuto ? [...units, { value: "auto", label: "Auto" }] : units;

    if (parsed.isAuto) {
      const nextUnit = units[0]?.value ?? "px";
      onChange(formatFullValue(0, nextUnit, false));
      return;
    }

    if (parsed.num === null) return;

    const nextIndex = (currentUnitIndex + 1) % allOptions.length;
    const nextOption = allOptions[nextIndex];

    if (nextOption.value === "auto") {
      onChange("Auto");
    } else {
      onChange(formatFullValue(parsed.num, nextOption.value, false));
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
    padding: `0 ${SPACE_SM}`,
    border: "none",
    backgroundColor: "transparent",
    color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: sizeConfig.fontSize,
    outline: "none",
    boxSizing: "border-box",
    textAlign: "left",
  };

  const unitStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    padding: `0 ${SPACE_XS} 0 0`,
    color: isUnitHovered && !disabled ? COLOR_TEXT : COLOR_TEXT_MUTED,
    fontSize: sizeConfig.fontSize,
    cursor: disabled ? "not-allowed" : "pointer",
    userSelect: "none",
    transition: `color ${DURATION_FAST} ${EASING_DEFAULT}`,
    flexShrink: 0,
    minWidth: 20,
  };

  const getDisplayUnit = () => {
    if (parsed.isAuto) {
      return "";
    }
    return units[currentUnitIndex]?.label ?? currentUnit;
  };

  const displayUnit = getDisplayUnit();
  const showUnitButton = !parsed.isAuto && units.length > 0;

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
        value={isEditing ? editValue : (parsed.isAuto ? "Auto" : (parsed.num !== null ? formatNumber(parsed.num) : ""))}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={inputStyle}
        data-testid="unit-input-field"
      />
      {showUnitButton && (
        <span
          onClick={cycleUnit}
          onPointerEnter={() => setIsUnitHovered(true)}
          onPointerLeave={() => setIsUnitHovered(false)}
          style={unitStyle}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`Unit: ${displayUnit}. Click to change.`}
          data-testid="unit-input-unit-button"
        >
          {displayUnit}
        </span>
      )}
    </div>
  );
}
