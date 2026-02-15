/**
 * @file Checkbox component
 */

import type { CSSProperties, PointerEvent } from "react";
import {
  COLOR_PRIMARY,
  COLOR_TEXT,
  COLOR_TEXT_DISABLED,
  COLOR_BORDER,
  COLOR_INPUT_BORDER_FOCUS,
  COLOR_FOCUS_RING,
  RADIUS_SM,
  DURATION_FAST,
  EASING_DEFAULT,
  SIZE_FONT_SM,
  SIZE_FONT_MD,
  SIZE_CHECKBOX_SM,
  SIZE_CHECKBOX_MD,
  SPACE_SM,
} from "../../constants/styles";

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  size?: "sm" | "md";
  "aria-label"?: string;
  className?: string;
};

const sizeMap = {
  sm: { box: SIZE_CHECKBOX_SM, icon: 10, fontSize: SIZE_FONT_SM },
  md: { box: SIZE_CHECKBOX_MD, icon: 12, fontSize: SIZE_FONT_MD },
};

function renderCheckIcon(iconSize: number) {
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function renderIndeterminateIcon(iconSize: number) {
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function renderIcon(
  checked: boolean,
  indeterminate: boolean,
  iconSize: number,
) {
  if (indeterminate) {
    return renderIndeterminateIcon(iconSize);
  }
  if (checked) {
    return renderCheckIcon(iconSize);
  }
  return null;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  indeterminate = false,
  size = "md",
  "aria-label": ariaLabel,
  className,
}: CheckboxProps) {
  const sizeConfig = sizeMap[size];
  const isActive = checked || indeterminate;

  const containerStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: SPACE_SM,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };

  const boxStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: sizeConfig.box,
    height: sizeConfig.box,
    borderRadius: RADIUS_SM,
    border: `1px solid ${isActive ? COLOR_PRIMARY : COLOR_BORDER}`,
    backgroundColor: isActive ? COLOR_PRIMARY : "transparent",
    color: "#ffffff",
    transition: `all ${DURATION_FAST} ${EASING_DEFAULT}`,
    flexShrink: 0,
  };

  const labelStyle: CSSProperties = {
    color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: sizeConfig.fontSize,
    userSelect: "none",
  };

  const handleClick = () => {
    if (disabled) {
      return;
    }
    onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) {
      return;
    }
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(!checked);
    }
  };

  const handlePointerEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    const box = e.currentTarget.querySelector(
      "[data-checkbox-box]",
    ) as HTMLElement | null;
    if (box) {
      box.style.borderColor = COLOR_INPUT_BORDER_FOCUS;
    }
  };

  const handlePointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    const box = e.currentTarget.querySelector(
      "[data-checkbox-box]",
    ) as HTMLElement | null;
    if (box) {
      box.style.borderColor = isActive ? COLOR_PRIMARY : COLOR_BORDER;
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const box = e.currentTarget.querySelector(
      "[data-checkbox-box]",
    ) as HTMLElement | null;
    if (box) {
      box.style.boxShadow = `0 0 0 2px ${COLOR_FOCUS_RING}`;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const box = e.currentTarget.querySelector(
      "[data-checkbox-box]",
    ) as HTMLElement | null;
    if (box) {
      box.style.boxShadow = "none";
    }
  };

  return (
    <div
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={ariaLabel ?? label}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
      style={containerStyle}
    >
      <span data-checkbox-box style={boxStyle}>
        {renderIcon(checked, indeterminate, sizeConfig.icon)}
      </span>
      {label ? <span style={labelStyle}>{label}</span> : null}
    </div>
  );
}
