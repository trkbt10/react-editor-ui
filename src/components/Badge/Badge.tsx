/**
 * @file Badge component - Small status indicator
 */

import type { ReactNode, CSSProperties } from "react";
import {
  COLOR_PRIMARY,
  COLOR_SUCCESS,
  COLOR_WARNING,
  COLOR_ERROR,
  COLOR_TEXT,
  COLOR_SURFACE_RAISED,
  RADIUS_SM,
  SIZE_FONT_XS,
  SIZE_FONT_SM,
  SPACE_XS,
  SPACE_SM,
} from "../../constants/styles";

export type BadgeProps = {
  children: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "error";
  size?: "sm" | "md";
  className?: string;
};

const variantStyles = {
  default: {
    bg: COLOR_SURFACE_RAISED,
    color: COLOR_TEXT,
  },
  primary: {
    bg: COLOR_PRIMARY,
    color: "#ffffff",
  },
  success: {
    bg: COLOR_SUCCESS,
    color: "#ffffff",
  },
  warning: {
    bg: COLOR_WARNING,
    color: "#000000",
  },
  error: {
    bg: COLOR_ERROR,
    color: "#ffffff",
  },
};

const sizeStyles = {
  sm: {
    fontSize: SIZE_FONT_XS,
    padding: `1px ${SPACE_XS}`,
    minHeight: "14px",
  },
  md: {
    fontSize: SIZE_FONT_SM,
    padding: `${SPACE_XS} ${SPACE_SM}`,
    minHeight: "18px",
  },
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  const variantConfig = variantStyles[variant];
  const sizeConfig = sizeStyles[size];

  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: sizeConfig.padding,
    minHeight: sizeConfig.minHeight,
    backgroundColor: variantConfig.bg,
    color: variantConfig.color,
    fontSize: sizeConfig.fontSize,
    fontWeight: 500,
    lineHeight: 1,
    borderRadius: RADIUS_SM,
    whiteSpace: "nowrap",
  };

  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
}
