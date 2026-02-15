/**
 * @file SegmentedControl component - Figma-style button group for selecting options
 */

import type { ReactNode, CSSProperties, PointerEvent } from "react";
import {
  COLOR_HOVER,
  COLOR_ACTIVE,
  COLOR_PRIMARY,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_SURFACE,
  COLOR_FOCUS_RING,
  RADIUS_MD,
  DURATION_FAST,
  EASING_DEFAULT,
  SIZE_FONT_SM,
  SIZE_FONT_MD,
  SIZE_HEIGHT_SM,
  SIZE_HEIGHT_MD,
  SIZE_HEIGHT_LG,
  SIZE_ICON_SM,
  SIZE_ICON_MD,
  SIZE_ICON_LG,
  SPACE_XS,
  SPACE_SM,
  SPACE_MD,
  SHADOW_SM,
} from "../../constants/styles";

export type SegmentedControlOption<T extends string = string> = {
  value: T;
  label?: string;
  icon?: ReactNode;
  disabled?: boolean;
  "aria-label"?: string;
};

export type SegmentedControlProps<T extends string = string> = {
  options: SegmentedControlOption<T>[];
  value: T | T[];
  onChange: (value: T | T[]) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  multiple?: boolean;
  fullWidth?: boolean;
  "aria-label"?: string;
  className?: string;
};

const sizeMap = {
  sm: {
    height: SIZE_HEIGHT_SM,
    innerHeight: "calc(var(--rei-size-height-sm, 22px) - 4px)",
    fontSize: SIZE_FONT_SM,
    iconSize: SIZE_ICON_SM,
    paddingX: SPACE_SM,
    containerPadding: "2px",
  },
  md: {
    height: SIZE_HEIGHT_MD,
    innerHeight: "calc(var(--rei-size-height-md, 28px) - 4px)",
    fontSize: SIZE_FONT_MD,
    iconSize: SIZE_ICON_MD,
    paddingX: SPACE_MD,
    containerPadding: "2px",
  },
  lg: {
    height: SIZE_HEIGHT_LG,
    innerHeight: "calc(var(--rei-size-height-lg, 32px) - 6px)",
    fontSize: SIZE_FONT_MD,
    iconSize: SIZE_ICON_LG,
    paddingX: SPACE_MD,
    containerPadding: "3px",
  },
};

function isSelected<T extends string>(
  value: T | T[],
  optionValue: T,
): boolean {
  if (Array.isArray(value)) {
    return value.includes(optionValue);
  }
  return value === optionValue;
}

function computeNewValue<T extends string>(
  currentValue: T[],
  optionValue: T,
): T[] {
  if (currentValue.includes(optionValue)) {
    return currentValue.filter((v) => v !== optionValue);
  }
  return [...currentValue, optionValue];
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = "md",
  disabled = false,
  multiple = false,
  fullWidth = false,
  "aria-label": ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  const sizeConfig = sizeMap[size];

  const containerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    width: fullWidth ? "100%" : "auto",
    height: sizeConfig.height,
    padding: sizeConfig.containerPadding,
    backgroundColor: "var(--rei-color-surface-overlay, #f3f4f6)",
    borderRadius: RADIUS_MD,
    gap: "1px",
    boxSizing: "border-box",
  };

  const getButtonStyle = (
    optionDisabled: boolean,
    selected: boolean,
  ): CSSProperties => ({
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACE_XS,
    height: sizeConfig.innerHeight,
    padding: `0 ${sizeConfig.paddingX}`,
    border: "none",
    borderRadius: `calc(${RADIUS_MD} - 1px)`,
    backgroundColor: selected ? COLOR_SURFACE : "transparent",
    boxShadow: selected ? SHADOW_SM : "none",
    color: selected ? COLOR_PRIMARY : COLOR_TEXT_MUTED,
    fontSize: sizeConfig.fontSize,
    fontWeight: selected ? 500 : 400,
    cursor: disabled || optionDisabled ? "not-allowed" : "pointer",
    opacity: disabled || optionDisabled ? 0.5 : 1,
    transition: `all ${DURATION_FAST} ${EASING_DEFAULT}`,
    outline: "none",
  });

  const iconStyle: CSSProperties = {
    width: sizeConfig.iconSize,
    height: sizeConfig.iconSize,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "inherit",
  };

  const handleClick = (optionValue: T, optionDisabled: boolean) => {
    if (disabled || optionDisabled) {
      return;
    }

    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [value];
      const newValue = computeNewValue(currentValue, optionValue);
      onChange(newValue as T | T[]);
    } else {
      onChange(optionValue);
    }
  };

  const handlePointerEnter = (
    e: PointerEvent<HTMLButtonElement>,
    optionDisabled: boolean,
    selected: boolean,
  ) => {
    if (disabled || optionDisabled || selected) {
      return;
    }
    e.currentTarget.style.backgroundColor = COLOR_HOVER;
  };

  const handlePointerLeave = (
    e: PointerEvent<HTMLButtonElement>,
    optionDisabled: boolean,
    selected: boolean,
  ) => {
    if (disabled || optionDisabled) {
      return;
    }
    e.currentTarget.style.backgroundColor = selected ? COLOR_SURFACE : "transparent";
  };

  const handlePointerDown = (
    e: PointerEvent<HTMLButtonElement>,
    optionDisabled: boolean,
    selected: boolean,
  ) => {
    if (disabled || optionDisabled || selected) {
      return;
    }
    e.currentTarget.style.backgroundColor = COLOR_ACTIVE;
  };

  const handlePointerUp = (
    e: PointerEvent<HTMLButtonElement>,
    optionDisabled: boolean,
    selected: boolean,
  ) => {
    if (disabled || optionDisabled) {
      return;
    }
    e.currentTarget.style.backgroundColor = selected ? COLOR_SURFACE : COLOR_HOVER;
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = `0 0 0 2px ${COLOR_FOCUS_RING}`;
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLButtonElement>,
    selected: boolean,
  ) => {
    e.currentTarget.style.boxShadow = selected ? SHADOW_SM : "none";
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={className}
      style={containerStyle}
    >
      {options.map((option) => {
        const selected = isSelected(value, option.value);
        const optionDisabled = option.disabled ?? false;

        return (
          <button
            key={option.value}
            type="button"
            role={multiple ? "checkbox" : "radio"}
            aria-checked={selected}
            aria-label={option["aria-label"] ?? option.label ?? option.value}
            disabled={disabled || optionDisabled}
            onClick={() => handleClick(option.value, optionDisabled)}
            onPointerEnter={(e) =>
              handlePointerEnter(e, optionDisabled, selected)
            }
            onPointerLeave={(e) =>
              handlePointerLeave(e, optionDisabled, selected)
            }
            onPointerDown={(e) => handlePointerDown(e, optionDisabled, selected)}
            onPointerUp={(e) => handlePointerUp(e, optionDisabled, selected)}
            onFocus={handleFocus}
            onBlur={(e) => handleBlur(e, selected)}
            style={getButtonStyle(optionDisabled, selected)}
          >
            {option.icon ? <span style={iconStyle}>{option.icon}</span> : null}
            {option.label ? <span>{option.label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
