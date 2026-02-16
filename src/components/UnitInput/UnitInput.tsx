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

import { memo, useState, useRef, useCallback, useEffect, type CSSProperties, type WheelEvent, type KeyboardEvent } from "react";
import {
  COLOR_INPUT_BG,
  COLOR_INPUT_BORDER,
  COLOR_INPUT_BORDER_FOCUS,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_DISABLED,
  COLOR_ICON,
  COLOR_FOCUS_RING,
  COLOR_SURFACE_RAISED,
  COLOR_SELECTED,
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
  SHADOW_MD,
  Z_DROPDOWN,
} from "../../constants/styles";
import { Portal } from "../Portal/Portal";

/** Threshold for showing dropdown instead of cycling */
const DROPDOWN_THRESHOLD = 5;

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
  /** Icon to show at the start of the input */
  iconStart?: React.ReactNode;
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





export const UnitInput = memo(function UnitInput({
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
  iconStart,
  "aria-label": ariaLabel,
  className,
}: UnitInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isUnitHovered, setIsUnitHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const unitButtonRef = useRef<HTMLSpanElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const skipBlurCommitRef = useRef(false);
  const sizeConfig = sizeMap[size];

  // Determine if we should use dropdown based on unit count
  const allOptions = allowAuto ? [...units, { value: "auto", label: "Auto" }] : units;
  const useDropdown = allOptions.length >= DROPDOWN_THRESHOLD;

  const defaultUnit = units[0]?.value ?? "px";
  const parsed = parseValue(value, defaultUnit);
  const currentUnit = parsed.unit || defaultUnit;
  const currentUnitIndex = findUnitIndex(units, currentUnit);

  // Sync edit value when value changes externally (not during manual typing)
  /* eslint-disable custom/no-use-state-in-use-effect -- Intentional: sync local state with prop */
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
  /* eslint-enable custom/no-use-state-in-use-effect */

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
  }, [disabled, units, parsed, currentUnitIndex, onChange, allOptions]);

  const openDropdown = useCallback(() => {
    if (disabled || !unitButtonRef.current) return;

    const rect = unitButtonRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 60),
    });
    setIsDropdownOpen(true);
  }, [disabled]);

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const selectUnit = useCallback((unitValue: string) => {
    if (unitValue === "auto") {
      onChange("Auto");
    } else {
      const num = parsed.isAuto ? 0 : (parsed.num ?? 0);
      onChange(formatFullValue(num, unitValue, false));
    }
    closeDropdown();
  }, [parsed, onChange, closeDropdown]);

  const handleUnitClick = useCallback(() => {
    if (disabled) return;

    if (useDropdown) {
      if (isDropdownOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    } else {
      cycleUnit();
    }
  }, [disabled, useDropdown, isDropdownOpen, closeDropdown, openDropdown, cycleUnit]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        unitButtonRef.current &&
        !unitButtonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        closeDropdown();
      }
    };

    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDropdownOpen, closeDropdown]);

  const containerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    gap: SPACE_SM,
    height: sizeConfig.height,
    padding: `0 ${sizeConfig.paddingX}`,
    backgroundColor: COLOR_INPUT_BG,
    border: `1px solid ${isFocused ? COLOR_INPUT_BORDER_FOCUS : COLOR_INPUT_BORDER}`,
    borderRadius: RADIUS_SM,
    transition: `border-color ${DURATION_FAST} ${EASING_DEFAULT}`,
    boxShadow: isFocused ? `0 0 0 2px ${COLOR_FOCUS_RING}` : "none",
    opacity: disabled ? 0.5 : 1,
    boxSizing: "border-box",
  };

  const iconStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    color: COLOR_ICON,
    flexShrink: 0,
  };

  const inputStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    height: "100%",
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: sizeConfig.fontSize,
    outline: "none",
  };

  const unitStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    color: isUnitHovered && !disabled ? COLOR_TEXT : COLOR_TEXT_MUTED,
    fontSize: sizeConfig.fontSize,
    cursor: disabled ? "not-allowed" : "pointer",
    userSelect: "none",
    transition: `color ${DURATION_FAST} ${EASING_DEFAULT}`,
    flexShrink: 0,
  };

  const getDisplayUnit = () => {
    if (parsed.isAuto) {
      return "";
    }
    return units[currentUnitIndex]?.label ?? currentUnit;
  };

  const displayUnit = getDisplayUnit();
  const showUnitButton = !parsed.isAuto && units.length > 0;

  const dropdownStyle: CSSProperties = {
    position: "fixed",
    top: dropdownPosition.top,
    left: dropdownPosition.left,
    minWidth: dropdownPosition.width,
    backgroundColor: COLOR_SURFACE_RAISED,
    border: `1px solid ${COLOR_INPUT_BORDER}`,
    borderRadius: RADIUS_SM,
    boxShadow: SHADOW_MD,
    zIndex: Z_DROPDOWN,
    padding: "4px 0",
    maxHeight: 200,
    overflowY: "auto",
  };

  const dropdownItemStyle: CSSProperties = {
    padding: `4px ${SPACE_SM}`,
    fontSize: sizeConfig.fontSize,
    color: COLOR_TEXT,
    cursor: "pointer",
    transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
  };

  return (
    <div
      className={className}
      style={containerStyle}
      onWheel={handleWheel}
      data-testid="unit-input"
    >
      {iconStart && (
        <span style={iconStyle} data-testid="unit-input-icon">
          {iconStart}
        </span>
      )}
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
          ref={unitButtonRef}
          onClick={handleUnitClick}
          onPointerEnter={() => setIsUnitHovered(true)}
          onPointerLeave={() => setIsUnitHovered(false)}
          style={unitStyle}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`Unit: ${displayUnit}. Click to ${useDropdown ? "select" : "change"}.`}
          aria-haspopup={useDropdown ? "listbox" : undefined}
          aria-expanded={useDropdown ? isDropdownOpen : undefined}
          data-testid="unit-input-unit-button"
        >
          {displayUnit}
          {useDropdown && (
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="currentColor"
              style={{ marginLeft: 2, opacity: 0.6 }}
            >
              <path d="M1 2.5L4 5.5L7 2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          )}
        </span>
      )}
      {isDropdownOpen && (
        <Portal>
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            role="listbox"
            aria-label="Select unit"
            data-testid="unit-input-dropdown"
          >
            {allOptions.map((option) => {
              const isAutoOption = option.value === "auto";
              const isSelected = isAutoOption ? parsed.isAuto : option.value.toLowerCase() === currentUnit.toLowerCase();
              return (
                <div
                  key={option.value}
                  onClick={() => selectUnit(option.value)}
                  style={{
                    ...dropdownItemStyle,
                    backgroundColor: isSelected ? COLOR_SELECTED : "transparent",
                  }}
                  role="option"
                  aria-selected={isSelected}
                  data-testid={`unit-option-${option.value}`}
                >
                  {option.label}
                </div>
              );
            })}
          </div>
        </Portal>
      )}
    </div>
  );
});
