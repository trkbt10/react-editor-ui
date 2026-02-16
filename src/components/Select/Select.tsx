/**
 * @file Select component - Dropdown selection with portal rendering
 */

import { memo, useState, useRef, useEffect, useEffectEvent, useLayoutEffect, type CSSProperties, type ReactNode } from "react";
import { Portal } from "../Portal/Portal";
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
  SPACE_LG,
} from "../../constants/styles";

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
  label?: string;
  preview?: ReactNode;
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
  lg: { height: SIZE_HEIGHT_LG, fontSize: SIZE_FONT_SM, padding: SPACE_LG },
};






type DropdownPosition = {
  top: number;
  left: number;
  width: number;
};

export const Select = memo(function Select<T extends string = string>({
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
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sizeConfig = sizeMap[size];

  const selectedOption = options.find((opt) => opt.value === value);

  const updateDropdownPosition = useEffectEvent(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  });

  const handleClickOutside = useEffectEvent((event: PointerEvent) => {
    const target = event.target as Node;
    if (
      containerRef.current &&
      !containerRef.current.contains(target) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(target)
    ) {
      setIsOpen(false);
    }
  });

  useLayoutEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("pointerdown", handleClickOutside);
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);
      return () => {
        document.removeEventListener("pointerdown", handleClickOutside);
        window.removeEventListener("scroll", updateDropdownPosition, true);
        window.removeEventListener("resize", updateDropdownPosition);
      };
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
    gap: SPACE_SM,
  };

  const previewContainerStyle: CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    minWidth: 0,
    overflow: "hidden",
  };

  const dropdownStyle: CSSProperties = {
    position: "absolute",
    top: dropdownPosition.top,
    left: dropdownPosition.left,
    width: dropdownPosition.width,
    backgroundColor: COLOR_SURFACE_RAISED,
    border: `1px solid ${COLOR_INPUT_BORDER}`,
    borderRadius: RADIUS_SM,
    boxShadow: SHADOW_MD,
    zIndex: Z_DROPDOWN,
    maxHeight: "240px",
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
    gap: SPACE_SM,
  });

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%" }}
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
        {selectedOption?.preview ? (
          <div style={previewContainerStyle}>{selectedOption.preview}</div>
        ) : (
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedOption?.label ?? placeholder}
          </span>
        )}
        <span
          style={{
            display: "flex",
            flexShrink: 0,
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
      {isOpen && (
        <Portal>
          <div ref={dropdownRef} role="listbox" style={dropdownStyle}>
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
                {option.preview && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                    {option.preview}
                  </div>
                )}
                {option.label && <span>{option.label}</span>}
              </div>
            ))}
          </div>
        </Portal>
      )}
    </div>
  );
}) as <T extends string = string>(props: SelectProps<T>) => React.ReactElement;
