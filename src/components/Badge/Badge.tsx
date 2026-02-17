/**
 * @file Badge component - Small status indicator
 */

import { memo, useMemo } from "react";
import type { ReactNode, CSSProperties } from "react";
import {
  COLOR_PRIMARY,
  COLOR_SUCCESS,
  COLOR_WARNING,
  COLOR_ERROR,
  COLOR_TEXT,
  COLOR_TEXT_ON_EMPHASIS,
  COLOR_TEXT_ON_WARNING,
  COLOR_SURFACE_RAISED,
  FONT_WEIGHT_MEDIUM,
  RADIUS_SM,
  SIZE_FONT_XS,
  SIZE_FONT_SM,
  SIZE_BADGE_SM,
  SIZE_BADGE_MD,
  SPACE_XS,
  SPACE_SM,
  SPACE_MD,
  SPACE_LG,
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
    color: COLOR_TEXT_ON_EMPHASIS,
  },
  success: {
    bg: COLOR_SUCCESS,
    color: COLOR_TEXT_ON_EMPHASIS,
  },
  warning: {
    bg: COLOR_WARNING,
    color: COLOR_TEXT_ON_WARNING,
  },
  error: {
    bg: COLOR_ERROR,
    color: COLOR_TEXT_ON_EMPHASIS,
  },
};

const sizeStyles = {
  sm: {
    fontSize: SIZE_FONT_XS,
    padding: `${SPACE_XS} ${SPACE_MD}`,
    minHeight: SIZE_BADGE_SM,
  },
  md: {
    fontSize: SIZE_FONT_SM,
    padding: `${SPACE_SM} ${SPACE_LG}`,
    minHeight: SIZE_BADGE_MD,
  },
};

export const Badge = memo(function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  const variantConfig = variantStyles[variant];
  const sizeConfig = sizeStyles[size];

  const style = useMemo<CSSProperties>(
    () => ({
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: sizeConfig.padding,
      minHeight: sizeConfig.minHeight,
      backgroundColor: variantConfig.bg,
      color: variantConfig.color,
      fontSize: sizeConfig.fontSize,
      fontWeight: FONT_WEIGHT_MEDIUM,
      lineHeight: 1,
      borderRadius: RADIUS_SM,
      whiteSpace: "nowrap",
    }),
    [sizeConfig, variantConfig],
  );

  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
});
