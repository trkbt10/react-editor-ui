/**
 * @file Button component - Text button with optional icons
 */

import type { ReactNode, MouseEvent, PointerEvent, CSSProperties } from "react";
import {
  COLOR_PRIMARY,
  COLOR_PRIMARY_HOVER,
  COLOR_PRIMARY_ACTIVE,
  COLOR_SURFACE_RAISED,
  COLOR_HOVER,
  COLOR_ACTIVE,
  COLOR_ERROR,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_FOCUS_RING,
  COLOR_BORDER,
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

export type ButtonProps = {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

const sizeMap = {
  sm: {
    height: SIZE_HEIGHT_SM,
    fontSize: SIZE_FONT_SM,
    paddingX: SPACE_MD,
    gap: SPACE_SM,
  },
  md: {
    height: SIZE_HEIGHT_MD,
    fontSize: SIZE_FONT_MD,
    paddingX: SPACE_LG,
    gap: SPACE_SM,
  },
  lg: {
    height: SIZE_HEIGHT_LG,
    fontSize: SIZE_FONT_MD,
    paddingX: SPACE_LG,
    gap: SPACE_MD,
  },
};

const variantStyles = {
  primary: {
    bg: COLOR_PRIMARY,
    bgHover: COLOR_PRIMARY_HOVER,
    bgActive: COLOR_PRIMARY_ACTIVE,
    color: "#ffffff",
    border: "none",
  },
  secondary: {
    bg: COLOR_SURFACE_RAISED,
    bgHover: COLOR_HOVER,
    bgActive: COLOR_ACTIVE,
    color: COLOR_TEXT,
    border: `1px solid ${COLOR_BORDER}`,
  },
  ghost: {
    bg: "transparent",
    bgHover: COLOR_HOVER,
    bgActive: COLOR_ACTIVE,
    color: COLOR_TEXT_MUTED,
    border: "none",
  },
  danger: {
    bg: COLOR_ERROR,
    bgHover: "#dc2626",
    bgActive: "#b91c1c",
    color: "#ffffff",
    border: "none",
  },
};

export function Button({
  children,
  size = "md",
  variant = "secondary",
  disabled = false,
  iconStart,
  iconEnd,
  type = "button",
  onClick,
  className,
}: ButtonProps) {
  const sizeConfig = sizeMap[size];
  const variantConfig = variantStyles[variant];

  const baseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: sizeConfig.gap,
    height: sizeConfig.height,
    padding: `0 ${sizeConfig.paddingX}`,
    border: variantConfig.border,
    borderRadius: RADIUS_SM,
    backgroundColor: variantConfig.bg,
    color: variantConfig.color,
    fontSize: sizeConfig.fontSize,
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
    outline: "none",
    whiteSpace: "nowrap",
  };

  const handlePointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    e.currentTarget.style.backgroundColor = variantConfig.bgHover;
  };

  const handlePointerLeave = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    e.currentTarget.style.backgroundColor = variantConfig.bg;
  };

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    e.currentTarget.style.backgroundColor = variantConfig.bgActive;
  };

  const handlePointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    e.currentTarget.style.backgroundColor = variantConfig.bgHover;
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = `0 0 0 2px ${COLOR_FOCUS_RING}`;
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <button
      type={type}
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
      {iconStart ? <span style={{ display: "flex" }}>{iconStart}</span> : null}
      {children}
      {iconEnd ? <span style={{ display: "flex" }}>{iconEnd}</span> : null}
    </button>
  );
}
