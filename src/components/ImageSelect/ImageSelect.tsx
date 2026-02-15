/**
 * @file ImageSelect component - Dropdown selection with image/preview support
 */

import { useState, useRef, useEffect, useEffectEvent, type CSSProperties, type ReactNode } from "react";
import {
  COLOR_INPUT_BG,
  COLOR_INPUT_BORDER,
  COLOR_INPUT_BORDER_FOCUS,
  COLOR_SURFACE_RAISED,
  COLOR_HOVER,
  COLOR_SELECTED,
  COLOR_TEXT,
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

export type ImageSelectOption<T extends string = string> = {
  value: T;
  label?: string;
  image?: ReactNode;
  disabled?: boolean;
};

export type ImageSelectProps<T extends string = string> = {
  options: ImageSelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
};

function getOptionBackground(isSelected: boolean, isFocused: boolean): string {
  if (isSelected) {
    return COLOR_SELECTED;
  }
  if (isFocused) {
    return COLOR_HOVER;
  }
  return "transparent";
}

function renderOptionImage(image: ReactNode | undefined) {
  if (!image) {
    return null;
  }
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
      {image}
    </div>
  );
}

function renderOptionLabel(label: string | undefined) {
  if (!label) {
    return null;
  }
  return <span>{label}</span>;
}

const sizeMap = {
  sm: { height: SIZE_HEIGHT_SM, fontSize: SIZE_FONT_SM, padding: SPACE_SM },
  md: { height: SIZE_HEIGHT_MD, fontSize: SIZE_FONT_SM, padding: SPACE_MD },
  lg: { height: SIZE_HEIGHT_LG, fontSize: SIZE_FONT_SM, padding: SPACE_LG },
};

export function ImageSelect<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = "Select...",
  size = "md",
  disabled = false,
  "aria-label": ariaLabel,
  className,
}: ImageSelectProps<T>) {
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
    color: COLOR_TEXT,
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
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "4px",
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

  const renderTriggerContent = () => {
    if (!selectedOption) {
      return <span style={{ color: "var(--rei-color-text-muted)" }}>{placeholder}</span>;
    }
    if (selectedOption.image) {
      return <div style={previewContainerStyle}>{selectedOption.image}</div>;
    }
    return <span>{selectedOption.label ?? selectedOption.value}</span>;
  };

  const renderDropdown = () => {
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
            {renderOptionImage(option.image)}
            {renderOptionLabel(option.label)}
          </div>
        ))}
      </div>
    );
  };

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
        {renderTriggerContent()}
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
      {renderDropdown()}
    </div>
  );
}
