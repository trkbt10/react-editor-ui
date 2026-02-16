/**
 * @file Input component - Text input with optional icons
 *
 * @description
 * Versatile text input supporting icons, prefix/suffix, and clearable mode.
 * Available in multiple sizes with consistent styling.
 *
 * @example
 * ```tsx
 * import { Input } from "react-editor-ui/Input";
 * import { useState } from "react";
 *
 * const [value, setValue] = useState("");
 *
 * <Input
 *   value={value}
 *   onChange={setValue}
 *   placeholder="Enter text..."
 *   clearable
 * />
 * ```
 */

import {
  memo,
  useState,
  useMemo,
  useCallback,
  forwardRef,
} from "react";
import type { ReactNode, ChangeEvent, CSSProperties, Ref } from "react";
import {
  COLOR_INPUT_BG,
  COLOR_INPUT_BORDER,
  COLOR_INPUT_BORDER_FOCUS,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_DISABLED,
  COLOR_ICON,
  COLOR_ICON_HOVER,
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
  SPACE_LG,
} from "../../constants/styles";

export type InputProps = {
  value: string;
  onChange: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "search" | "number" | "password";
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  prefix?: ReactNode | string;
  suffix?: ReactNode | string;
  clearable?: boolean;
  "aria-label"?: string;
  className?: string;
};

const sizeMap = {
  sm: { height: SIZE_HEIGHT_SM, fontSize: SIZE_FONT_SM, paddingX: SPACE_SM, iconSize: SIZE_ICON_SM },
  md: { height: SIZE_HEIGHT_MD, fontSize: SIZE_FONT_MD, paddingX: SPACE_MD, iconSize: SIZE_ICON_MD },
  lg: { height: SIZE_HEIGHT_LG, fontSize: SIZE_FONT_MD, paddingX: SPACE_LG, iconSize: SIZE_ICON_LG },
};

type ClearButtonProps = {
  onClear: () => void;
};

const ClearButton = memo(function ClearButton({ onClear }: ClearButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      border: "none",
      backgroundColor: "transparent",
      color: isHovered ? COLOR_ICON_HOVER : COLOR_ICON,
      cursor: "pointer",
      flexShrink: 0,
    }),
    [isHovered],
  );

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <button
      type="button"
      onClick={onClear}
      aria-label="Clear"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={buttonStyle}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
});

export const Input = memo(
  forwardRef(function Input(
    {
      value,
      onChange,
      type = "text",
      placeholder,
      size = "md",
      disabled = false,
      iconStart,
      iconEnd,
      prefix,
      suffix,
      clearable = false,
      "aria-label": ariaLabel,
      className,
    }: InputProps,
    ref: Ref<HTMLInputElement>,
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const sizeConfig = sizeMap[size];

    const containerStyle = useMemo<CSSProperties>(
      () => ({
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
      }),
      [isFocused, disabled, sizeConfig],
    );

    const inputStyle = useMemo<CSSProperties>(
      () => ({
        flex: 1,
        minWidth: 0,
        height: "100%",
        padding: 0,
        border: "none",
        backgroundColor: "transparent",
        color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
        fontSize: sizeConfig.fontSize,
        outline: "none",
      }),
      [disabled, sizeConfig.fontSize],
    );

    const iconStyle = useMemo<CSSProperties>(
      () => ({
        display: "flex",
        alignItems: "center",
        color: COLOR_ICON,
        flexShrink: 0,
        width: sizeConfig.iconSize,
        height: sizeConfig.iconSize,
      }),
      [sizeConfig.iconSize],
    );

    const affixStyle = useMemo<CSSProperties>(
      () => ({
        display: "flex",
        alignItems: "center",
        color: COLOR_TEXT_MUTED,
        fontSize: sizeConfig.fontSize,
        flexShrink: 0,
        userSelect: "none",
      }),
      [sizeConfig.fontSize],
    );

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value, e);
      },
      [onChange],
    );

    const handleClear = useCallback(() => {
      onChange("", {
        target: { value: "" },
      } as ChangeEvent<HTMLInputElement>);
    }, [onChange]);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
    }, []);

    const showClearButton = clearable && value.length > 0 && !disabled;

    return (
      <div className={className} style={containerStyle}>
        {iconStart ? <span style={iconStyle}>{iconStart}</span> : null}
        {prefix ? <span style={affixStyle}>{prefix}</span> : null}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={ariaLabel}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={inputStyle}
        />
        {suffix ? <span style={affixStyle}>{suffix}</span> : null}
        {showClearButton ? <ClearButton onClear={handleClear} /> : null}
        {iconEnd && !showClearButton ? <span style={iconStyle}>{iconEnd}</span> : null}
      </div>
    );
  }),
);
