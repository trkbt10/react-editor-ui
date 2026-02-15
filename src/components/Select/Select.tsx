/**
 * @file Select component - Dropdown selection
 */

import { useState, useRef, useEffect, useEffectEvent, type CSSProperties } from "react";
import {
  COLOR_INPUT_BG,
  COLOR_INPUT_BORDER,
  COLOR_INPUT_BORDER_FOCUS,
  COLOR_SURFACE_RAISED,
  COLOR_HOVER,
  COLOR_SELECTED,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_DISABLED,
  COLOR_ICON,
  COLOR_FOCUS_RING,
  RADIUS_SM,
  SHADOW_MD,
  Z_DROPDOWN,
  DURATION_FAST,
  EASING_DEFAULT,
  SIZE_FONT_SM,
  SIZE_HEIGHT_SM,
  SIZE_HEIGHT_MD,
  SIZE_HEIGHT_LG,
  SPACE_SM,
  SPACE_MD,
} from "../../constants/styles";

type DropdownRenderProps<T extends string> = {
  isOpen: boolean;
  dropdownStyle: CSSProperties;
  options: SelectOption<T>[];
  value: T;
  focusedIndex: number;
  onChange: (value: T) => void;
  setIsOpen: (open: boolean) => void;
  setFocusedIndex: (index: number) => void;
  getOptionStyle: (
    isSelected: boolean,
    isFocused: boolean,
    isDisabled: boolean,
  ) => CSSProperties;
};

function renderDropdown<T extends string>(props: DropdownRenderProps<T>) {
  const {
    isOpen,
    dropdownStyle,
    options,
    value,
    focusedIndex,
    onChange,
    setIsOpen,
    setFocusedIndex,
    getOptionStyle,
  } = props;

  if (!isOpen) {
    return null;
  }

  return (
    <div role="listbox" style={dropdownStyle}>
      {options.map((option, index) => (
        <div
          key={option.value}
          role="option"
          aria-selected={option.value === value}
          aria-disabled={option.disabled}
          onClick={() => {
            if (!option.disabled) {
              onChange(option.value);
              setIsOpen(false);
            }
          }}
          onPointerEnter={() => setFocusedIndex(index)}
          style={getOptionStyle(
            option.value === value,
            index === focusedIndex,
            option.disabled ?? false,
          )}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
}

function getOptionBackground(isSelected: boolean, isFocused: boolean): string {
  if (isSelected) {
    return COLOR_SELECTED;
  }
  if (isFocused) {
    return COLOR_HOVER;
  }
  return "transparent";
}

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export type SelectProps<T extends string = string> = {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
};

const sizeMap = {
  sm: { height: SIZE_HEIGHT_SM, fontSize: SIZE_FONT_SM, padding: SPACE_SM },
  md: { height: SIZE_HEIGHT_MD, fontSize: SIZE_FONT_SM, padding: SPACE_MD },
  lg: { height: SIZE_HEIGHT_LG, fontSize: SIZE_FONT_SM, padding: SPACE_MD },
};

export function Select<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = "Select...",
  size = "md",
  disabled = false,
  "aria-label": ariaLabel,
  className,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeConfig = sizeMap[size];

  const selectedOption = options.find((opt) => opt.value === value);

  const handleClickOutside = useEffectEvent((event: PointerEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  });

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("pointerdown", handleClickOutside);
      return () => document.removeEventListener("pointerdown", handleClickOutside);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) {
      return;
    }

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          const option = options[focusedIndex];
          if (option && !option.disabled) {
            onChange(option.value);
            setIsOpen(false);
          }
        } else {
          setIsOpen(true);
          setFocusedIndex(options.findIndex((o) => o.value === value));
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(options.findIndex((o) => o.value === value));
        } else {
          setFocusedIndex((prev) => Math.min(prev + 1, options.length - 1));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
        }
        break;
    }
  };

  const triggerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: sizeConfig.height,
    padding: `0 ${sizeConfig.padding}`,
    backgroundColor: COLOR_INPUT_BG,
    border: `1px solid ${isOpen ? COLOR_INPUT_BORDER_FOCUS : COLOR_INPUT_BORDER}`,
    borderRadius: RADIUS_SM,
    color: selectedOption ? COLOR_TEXT : COLOR_TEXT_MUTED,
    fontSize: sizeConfig.fontSize,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: `border-color ${DURATION_FAST} ${EASING_DEFAULT}`,
    outline: "none",
    boxShadow: isOpen ? `0 0 0 2px ${COLOR_FOCUS_RING}` : "none",
  };

  const dropdownStyle: CSSProperties = {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "4px",
    backgroundColor: COLOR_SURFACE_RAISED,
    border: `1px solid ${COLOR_INPUT_BORDER}`,
    borderRadius: RADIUS_SM,
    boxShadow: SHADOW_MD,
    zIndex: Z_DROPDOWN,
    maxHeight: "200px",
    overflowY: "auto",
  };

  const getOptionStyle = (
    isSelected: boolean,
    isFocused: boolean,
    isDisabled: boolean,
  ): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    padding: `${SPACE_SM} ${sizeConfig.padding}`,
    backgroundColor: getOptionBackground(isSelected, isFocused),
    color: isDisabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: sizeConfig.fontSize,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.5 : 1,
  });

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        onKeyDown={handleKeyDown}
        style={triggerStyle}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span
          style={{
            display: "flex",
            marginLeft: SPACE_SM,
            color: COLOR_ICON,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: `transform ${DURATION_FAST} ${EASING_DEFAULT}`,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      {renderDropdown({
        isOpen,
        dropdownStyle,
        options,
        value,
        focusedIndex,
        onChange,
        setIsOpen,
        setFocusedIndex,
        getOptionStyle,
      })}
    </div>
  );
}
