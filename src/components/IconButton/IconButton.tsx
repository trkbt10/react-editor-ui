/**
 * @file IconButton component - A button with only an icon
 */

import type { ReactNode, PointerEvent, MouseEvent, CSSProperties } from "react";
import {
  COLOR_HOVER,
  COLOR_ACTIVE,
  COLOR_ICON,
  COLOR_ICON_HOVER,
  COLOR_ICON_ACTIVE,
  COLOR_FOCUS_RING,
  RADIUS_SM,
  DURATION_FAST,
  EASING_DEFAULT,
  SIZE_ICON_SM,
  SIZE_ICON_MD,
  SIZE_ICON_LG,
  SIZE_HEIGHT_SM,
  SIZE_HEIGHT_MD,
  SIZE_HEIGHT_LG,
} from "../../constants/styles";

export type IconButtonProps = {
  icon: ReactNode;
  "aria-label": string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "filled";
  disabled?: boolean;
  active?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

const sizeMap = {
  sm: { height: SIZE_HEIGHT_SM, iconSize: SIZE_ICON_SM },
  md: { height: SIZE_HEIGHT_MD, iconSize: SIZE_ICON_MD },
  lg: { height: SIZE_HEIGHT_LG, iconSize: SIZE_ICON_LG },
};

export function IconButton({
  icon,
  "aria-label": ariaLabel,
  size = "md",
  variant = "default",
  disabled = false,
  active = false,
  onClick,
  className,
}: IconButtonProps) {
  const { height, iconSize } = sizeMap[size];

  const baseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: height,
    height,
    padding: 0,
    border: "none",
    borderRadius: RADIUS_SM,
    backgroundColor: variant === "filled" ? COLOR_HOVER : "transparent",
    color: active ? COLOR_ICON_ACTIVE : COLOR_ICON,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}, color ${DURATION_FAST} ${EASING_DEFAULT}`,
    outline: "none",
  };

  const iconStyle: CSSProperties = {
    width: iconSize,
    height: iconSize,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const handlePointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    e.currentTarget.style.backgroundColor = COLOR_HOVER;
    if (!active) {
      e.currentTarget.style.color = COLOR_ICON_HOVER;
    }
  };

  const handlePointerLeave = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    e.currentTarget.style.backgroundColor =
      variant === "filled" ? COLOR_HOVER : "transparent";
    if (!active) {
      e.currentTarget.style.color = COLOR_ICON;
    }
  };

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    e.currentTarget.style.backgroundColor = COLOR_ACTIVE;
  };

  const handlePointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    e.currentTarget.style.backgroundColor = COLOR_HOVER;
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = `0 0 0 2px ${COLOR_FOCUS_RING}`;
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
      style={baseStyle}
    >
      <span style={iconStyle}>{icon}</span>
    </button>
  );
}
