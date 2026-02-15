/**
 * @file Input component - Text input with optional icons
 */

import type { ReactNode, ChangeEvent, CSSProperties } from "react";
import { useState } from "react";
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
  SPACE_SM,
  SPACE_MD,
  SPACE_LG,
} from "../../constants/styles";

function renderClearButton(showClearButton: boolean, handleClear: () => void) {
  if (!showClearButton) {
    return null;
  }
  return (
    <button
      type="button"
      onClick={handleClear}
      aria-label="Clear"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        border: "none",
        backgroundColor: "transparent",
        color: COLOR_ICON,
        cursor: "pointer",
        flexShrink: 0,
      }}
      onPointerEnter={(e) => {
        e.currentTarget.style.color = COLOR_ICON_HOVER;
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.color = COLOR_ICON;
      }}
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
}

function renderIconEnd(
  iconEnd: ReactNode,
  showClearButton: boolean,
  iconStyle: CSSProperties,
) {
  if (!iconEnd || showClearButton) {
    return null;
  }
  return <span style={iconStyle}>{iconEnd}</span>;
}

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
  sm: { height: SIZE_HEIGHT_SM, fontSize: SIZE_FONT_SM, paddingX: SPACE_SM },
  md: { height: SIZE_HEIGHT_MD, fontSize: SIZE_FONT_MD, paddingX: SPACE_MD },
  lg: { height: SIZE_HEIGHT_LG, fontSize: SIZE_FONT_MD, paddingX: SPACE_LG },
};

function renderPrefix(
  prefix: ReactNode | string | undefined,
  affixStyle: CSSProperties,
) {
  if (!prefix) {
    return null;
  }
  return <span style={affixStyle}>{prefix}</span>;
}

function renderSuffix(
  suffix: ReactNode | string | undefined,
  affixStyle: CSSProperties,
) {
  if (!suffix) {
    return null;
  }
  return <span style={affixStyle}>{suffix}</span>;
}

export function Input({
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
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const sizeConfig = sizeMap[size];

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

  const iconStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    color: COLOR_ICON,
    flexShrink: 0,
  };

  const affixStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    color: COLOR_TEXT_MUTED,
    fontSize: sizeConfig.fontSize,
    flexShrink: 0,
    userSelect: "none",
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value, e);
  };

  const handleClear = () => {
    onChange("", {
      target: { value: "" },
    } as ChangeEvent<HTMLInputElement>);
  };

  const showClearButton = clearable && value.length > 0 && !disabled;

  return (
    <div className={className} style={containerStyle}>
      {iconStart ? <span style={iconStyle}>{iconStart}</span> : null}
      {renderPrefix(prefix, affixStyle)}
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={inputStyle}
      />
      {renderSuffix(suffix, affixStyle)}
      {renderClearButton(showClearButton, handleClear)}
      {renderIconEnd(iconEnd, showClearButton, iconStyle)}
    </div>
  );
}
