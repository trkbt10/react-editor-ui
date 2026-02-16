/**
 * @file SegmentedControl component - Figma-style button group for selecting options
 */

import { memo, useState, useMemo, useCallback } from "react";
import type { ReactNode, CSSProperties } from "react";
import {
  COLOR_HOVER,
  COLOR_ACTIVE,
  COLOR_PRIMARY,
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

function isSelected<T extends string>(value: T | T[], optionValue: T): boolean {
  if (Array.isArray(value)) {
    return value.includes(optionValue);
  }
  return value === optionValue;
}

function computeNewValue<T extends string>(currentValue: T[], optionValue: T): T[] {
  if (currentValue.includes(optionValue)) {
    return currentValue.filter((v) => v !== optionValue);
  }
  return [...currentValue, optionValue];
}

type SegmentButtonProps<T extends string> = {
  option: SegmentedControlOption<T>;
  selected: boolean;
  disabled: boolean;
  multiple: boolean;
  sizeConfig: (typeof sizeMap)["md"];
  onClick: (value: T, disabled: boolean) => void;
};

const SegmentButton = memo(function SegmentButton<T extends string>({
  option,
  selected,
  disabled: groupDisabled,
  multiple,
  sizeConfig,
  onClick,
}: SegmentButtonProps<T>) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const optionDisabled = option.disabled ?? false;
  const isDisabled = groupDisabled || optionDisabled;

  const buttonStyle = useMemo<CSSProperties>(() => {
    const getBackgroundColor = (): string => {
      if (selected) {
        return COLOR_SURFACE;
      }
      if (isDisabled) {
        return "transparent";
      }
      if (isPressed) {
        return COLOR_ACTIVE;
      }
      if (isHovered) {
        return COLOR_HOVER;
      }
      return "transparent";
    };

    const getBoxShadow = (): string => {
      if (isFocused) {
        return `0 0 0 2px ${COLOR_FOCUS_RING}`;
      }
      if (selected) {
        return SHADOW_SM;
      }
      return "none";
    };

    return {
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
      backgroundColor: getBackgroundColor(),
      boxShadow: getBoxShadow(),
      color: selected ? COLOR_PRIMARY : COLOR_TEXT_MUTED,
      fontSize: sizeConfig.fontSize,
      fontWeight: selected ? 500 : 400,
      cursor: isDisabled ? "not-allowed" : "pointer",
      opacity: isDisabled ? 0.5 : 1,
      transition: `all ${DURATION_FAST} ${EASING_DEFAULT}`,
      outline: "none",
    };
  }, [selected, isDisabled, isPressed, isHovered, isFocused, sizeConfig]);

  const iconStyle = useMemo<CSSProperties>(
    () => ({
      width: sizeConfig.iconSize,
      height: sizeConfig.iconSize,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "inherit",
    }),
    [sizeConfig.iconSize],
  );

  const handleClick = useCallback(() => {
    onClick(option.value, optionDisabled);
  }, [onClick, option.value, optionDisabled]);

  const handlePointerEnter = useCallback(() => {
    if (!isDisabled && !selected) {
      setIsHovered(true);
    }
  }, [isDisabled, selected]);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
  }, []);

  const handlePointerDown = useCallback(() => {
    if (!isDisabled && !selected) {
      setIsPressed(true);
    }
  }, [isDisabled, selected]);

  const handlePointerUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      aria-label={option["aria-label"] ?? option.label ?? option.value}
      disabled={isDisabled}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={buttonStyle}
    >
      {option.icon ? <span style={iconStyle}>{option.icon}</span> : null}
      {option.label ? <span>{option.label}</span> : null}
    </button>
  );
}) as <T extends string>(props: SegmentButtonProps<T>) => React.ReactElement;

export const SegmentedControl = memo(function SegmentedControl<T extends string = string>({
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

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      width: fullWidth ? "100%" : "auto",
      height: sizeConfig.height,
      padding: sizeConfig.containerPadding,
      backgroundColor: "var(--rei-color-surface-overlay, #f3f4f6)",
      borderRadius: RADIUS_MD,
      gap: "1px",
      boxSizing: "border-box",
    }),
    [fullWidth, sizeConfig],
  );

  const handleClick = useCallback(
    (optionValue: T, optionDisabled: boolean) => {
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
    },
    [disabled, multiple, value, onChange],
  );

  return (
    <div role="group" aria-label={ariaLabel} className={className} style={containerStyle}>
      {options.map((option) => (
        <SegmentButton
          key={option.value}
          option={option}
          selected={isSelected(value, option.value)}
          disabled={disabled}
          multiple={multiple}
          sizeConfig={sizeConfig}
          onClick={handleClick}
        />
      ))}
    </div>
  );
}) as <T extends string = string>(props: SegmentedControlProps<T>) => React.ReactElement;
