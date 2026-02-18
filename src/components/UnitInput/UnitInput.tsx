/**
 * @file UnitInput component - Numeric input with unit support
 *
 * @description
 * A numeric input with a clickable unit suffix. Supports mouse wheel and arrow keys
 * for value adjustment, Shift for larger steps. Click the unit to cycle through
 * options, or type with unit (e.g., "10%") to change both. Supports "Auto" value.
 *
 * @example
 * ```tsx
 * import { UnitInput } from "react-editor-ui/UnitInput";
 *
 * const [width, setWidth] = useState("100px");
 *
 * <UnitInput
 *   value={width}
 *   onChange={setWidth}
 *   units={[
 *     { value: "px", label: "px" },
 *     { value: "%", label: "%" },
 *   ]}
 * />
 * ```
 */

import { memo, useState, useRef, useCallback, useMemo, type CSSProperties, type KeyboardEvent } from "react";
import {
  COLOR_INPUT_BG,
  COLOR_INPUT_BORDER,
  COLOR_INPUT_BORDER_FOCUS,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_DISABLED,
  COLOR_ICON,
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
} from "../../themes/styles";
import {
  type UnitOption,
  parseValue,
  formatNumber,
  formatFullValue,
  getDisplayValue,
  clampValue,
  findUnitIndex,
} from "./unitInputUtils";
import { UnitDropdown } from "./UnitDropdown";
import { useNumericStepper } from "./useNumericStepper";

export type { UnitOption };

/** Threshold for showing dropdown instead of cycling */
const DROPDOWN_THRESHOLD = 5;

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

const chevronIconStyle: React.CSSProperties = {
  marginLeft: 2,
  opacity: 0.6,
};





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
  const inputRef = useRef<HTMLInputElement>(null);
  const unitButtonRef = useRef<HTMLSpanElement>(null);
  const skipBlurCommitRef = useRef(false);
  const sizeConfig = sizeMap[size];

  // Determine if we should use dropdown based on unit count
  const allOptions = allowAuto ? [...units, { value: "auto", label: "Auto" }] : units;
  const useDropdown = allOptions.length >= DROPDOWN_THRESHOLD;

  const defaultUnit = units[0]?.value ?? "px";
  const parsed = parseValue(value, defaultUnit);
  const currentUnit = parsed.unit || defaultUnit;
  const currentUnitIndex = findUnitIndex(units, currentUnit);

  // Derive display value from props when not editing
  const derivedDisplayValue = getDisplayValue(parsed);

  // Current numeric value for stepping (0 if auto or null)
  const currentNumericValue = parsed.isAuto ? 0 : (parsed.num ?? 0);

  // Handle numeric value changes from stepper
  const handleStepperValueChange = useCallback(
    (newValue: number) => {
      setEditValue(formatNumber(newValue));
      onChange(formatFullValue(newValue, currentUnit, false));
    },
    [onChange, currentUnit],
  );

  // Numeric stepper for arrow keys and wheel
  const { handleKeyStep, handleWheel } = useNumericStepper({
    value: currentNumericValue,
    step,
    shiftStep,
    min,
    max,
    disabled,
    isFocused,
    onValueChange: handleStepperValueChange,
  });

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
    // Initialize edit value from current display value
    setEditValue(derivedDisplayValue);
    // Select all text on focus
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  }, [derivedDisplayValue]);

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
      if (disabled) {return;}

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

      // Delegate arrow key handling to stepper
      handleKeyStep(e);
    },
    [disabled, editValue, commitValue, handleKeyStep],
  );

  const cycleUnit = useCallback(() => {
    if (disabled) {return;}

    if (parsed.isAuto) {
      const nextUnit = units[0]?.value ?? "px";
      onChange(formatFullValue(0, nextUnit, false));
      return;
    }

    if (parsed.num === null) {return;}

    const nextIndex = (currentUnitIndex + 1) % allOptions.length;
    const nextOption = allOptions[nextIndex];

    if (nextOption.value === "auto") {
      onChange("Auto");
    } else {
      onChange(formatFullValue(parsed.num, nextOption.value, false));
    }
  }, [disabled, units, parsed, currentUnitIndex, onChange, allOptions]);

  const openDropdown = useCallback(() => {
    if (disabled) {return;}
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
    if (disabled) {return;}

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

  const containerStyle = useMemo<CSSProperties>(() => ({
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
  }), [sizeConfig.height, sizeConfig.paddingX, isFocused, disabled]);

  const iconStyle = useMemo<CSSProperties>(() => ({
    display: "flex",
    alignItems: "center",
    color: COLOR_ICON,
    flexShrink: 0,
  }), []);

  const inputStyle = useMemo<CSSProperties>(() => ({
    flex: 1,
    minWidth: 0,
    height: "100%",
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: sizeConfig.fontSize,
    outline: "none",
  }), [disabled, sizeConfig.fontSize]);

  const unitStyle = useMemo<CSSProperties>(() => ({
    display: "flex",
    alignItems: "center",
    color: isUnitHovered && !disabled ? COLOR_TEXT : COLOR_TEXT_MUTED,
    fontSize: sizeConfig.fontSize,
    cursor: disabled ? "not-allowed" : "pointer",
    userSelect: "none",
    transition: `color ${DURATION_FAST} ${EASING_DEFAULT}`,
    flexShrink: 0,
  }), [isUnitHovered, disabled, sizeConfig.fontSize]);

  const handleUnitPointerEnter = useCallback(() => setIsUnitHovered(true), []);
  const handleUnitPointerLeave = useCallback(() => setIsUnitHovered(false), []);

  const getDisplayUnit = () => {
    if (parsed.isAuto) {
      return "";
    }
    return units[currentUnitIndex]?.label ?? currentUnit;
  };

  const displayUnit = getDisplayUnit();
  const showUnitButton = !parsed.isAuto && units.length > 0;

  // Determine selected value for dropdown (auto or current unit)
  const dropdownSelectedValue = parsed.isAuto ? "auto" : currentUnit;

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
        value={isEditing ? editValue : derivedDisplayValue}
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
          onPointerEnter={handleUnitPointerEnter}
          onPointerLeave={handleUnitPointerLeave}
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
              style={chevronIconStyle}
            >
              <path d="M1 2.5L4 5.5L7 2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          )}
        </span>
      )}
      {isDropdownOpen && (
        <UnitDropdown
          options={allOptions}
          selectedValue={dropdownSelectedValue}
          onSelect={selectUnit}
          onClose={closeDropdown}
          anchorRef={unitButtonRef}
          fontSize={sizeConfig.fontSize}
        />
      )}
    </div>
  );
});
