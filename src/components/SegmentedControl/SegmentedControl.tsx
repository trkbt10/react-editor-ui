/**
 * @file SegmentedControl component - Button group for selecting options
 */

import type { ReactNode, CSSProperties, PointerEvent } from "react";
import {
  COLOR_HOVER,
  COLOR_ACTIVE,
  COLOR_SELECTED,
  COLOR_PRIMARY,
  COLOR_TEXT,
  COLOR_BORDER,
  COLOR_FOCUS_RING,
  RADIUS_SM,
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
  SPACE_SM,
  SPACE_MD,
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
  "aria-label"?: string;
  className?: string;
};

const sizeMap = {
  sm: {
    height: SIZE_HEIGHT_SM,
    fontSize: SIZE_FONT_SM,
    iconSize: SIZE_ICON_SM,
    paddingX: SPACE_SM,
  },
  md: {
    height: SIZE_HEIGHT_MD,
    fontSize: SIZE_FONT_MD,
    iconSize: SIZE_ICON_MD,
    paddingX: SPACE_MD,
  },
  lg: {
    height: SIZE_HEIGHT_LG,
    fontSize: SIZE_FONT_MD,
    iconSize: SIZE_ICON_LG,
    paddingX: SPACE_MD,
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

function getPointerLeaveBackground(selected: boolean): string {
  if (selected) {
    return COLOR_SELECTED;
  }
  return "transparent";
}

function getPointerUpBackground(selected: boolean): string {
  if (selected) {
    return COLOR_SELECTED;
  }
  return COLOR_HOVER;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = "md",
  disabled = false,
  multiple = false,
  "aria-label": ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  const sizeConfig = sizeMap[size];

  const containerStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    border: `1px solid ${COLOR_BORDER}`,
    borderRadius: RADIUS_SM,
    overflow: "hidden",
  };

  const getButtonStyle = (
    optionDisabled: boolean,
    selected: boolean,
  ): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACE_SM,
    height: sizeConfig.height,
    padding: `0 ${sizeConfig.paddingX}`,
    border: "none",
    borderRight: `1px solid ${COLOR_BORDER}`,
    backgroundColor: selected ? COLOR_SELECTED : "transparent",
    color: selected ? COLOR_PRIMARY : COLOR_TEXT,
    fontSize: sizeConfig.fontSize,
    cursor: disabled || optionDisabled ? "not-allowed" : "pointer",
    opacity: disabled || optionDisabled ? 0.5 : 1,
    transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}, color ${DURATION_FAST} ${EASING_DEFAULT}`,
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
    if (disabled || optionDisabled) {
      return;
    }
    if (!selected) {
      e.currentTarget.style.backgroundColor = COLOR_HOVER;
    }
  };

  const handlePointerLeave = (
    e: PointerEvent<HTMLButtonElement>,
    optionDisabled: boolean,
    selected: boolean,
  ) => {
    if (disabled || optionDisabled) {
      return;
    }
    e.currentTarget.style.backgroundColor = getPointerLeaveBackground(selected);
  };

  const handlePointerDown = (
    e: PointerEvent<HTMLButtonElement>,
    optionDisabled: boolean,
  ) => {
    if (disabled || optionDisabled) {
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
    e.currentTarget.style.backgroundColor = getPointerUpBackground(selected);
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = `inset 0 0 0 2px ${COLOR_FOCUS_RING}`;
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={className}
      style={containerStyle}
    >
      {options.map((option, index) => {
        const selected = isSelected(value, option.value);
        const optionDisabled = option.disabled ?? false;
        const isLast = index === options.length - 1;

        const buttonStyle = getButtonStyle(optionDisabled, selected);
        if (isLast) {
          buttonStyle.borderRight = "none";
        }

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
            onPointerDown={(e) => handlePointerDown(e, optionDisabled)}
            onPointerUp={(e) => handlePointerUp(e, optionDisabled, selected)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={buttonStyle}
          >
            {option.icon ? <span style={iconStyle}>{option.icon}</span> : null}
            {option.label ? <span>{option.label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
