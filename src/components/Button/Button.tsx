/**
 * @file Button component - Text button with optional icons
 *
 * @description
 * Clean, minimal design with attention to detail.
 * Supports primary, secondary, ghost, and danger variants.
 *
 * @example
 * ```tsx
 * import { Button } from "react-editor-ui/Button";
 *
 * <Button variant="primary" onClick={() => console.log("clicked")}>
 *   Save Changes
 * </Button>
 * ```
 */

import {
  memo,
  useState,
  useMemo,
  useCallback,
  forwardRef,
} from "react";
import type { ReactNode, MouseEvent, CSSProperties, Ref } from "react";
import {
  COLOR_PRIMARY,
  COLOR_PRIMARY_HOVER,
  COLOR_PRIMARY_ACTIVE,
  COLOR_HOVER,
  COLOR_ACTIVE,
  COLOR_ERROR,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_ON_EMPHASIS,
  COLOR_FOCUS_RING,
  COLOR_INPUT_BORDER,
  FONT_WEIGHT_MEDIUM,
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
  SPACE_XS,
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
    gap: SPACE_XS,
    iconSize: SIZE_ICON_SM,
  },
  md: {
    height: SIZE_HEIGHT_MD,
    fontSize: SIZE_FONT_SM,
    paddingX: SPACE_LG,
    gap: SPACE_SM,
    iconSize: SIZE_ICON_MD,
  },
  lg: {
    height: SIZE_HEIGHT_LG,
    fontSize: SIZE_FONT_MD,
    paddingX: SPACE_LG,
    gap: SPACE_SM,
    iconSize: SIZE_ICON_LG,
  },
};

const variantStyles = {
  primary: {
    bg: COLOR_PRIMARY,
    bgHover: COLOR_PRIMARY_HOVER,
    bgActive: COLOR_PRIMARY_ACTIVE,
    color: COLOR_TEXT_ON_EMPHASIS,
    border: "none",
    borderHover: "none",
  },
  secondary: {
    bg: "transparent",
    bgHover: COLOR_HOVER,
    bgActive: COLOR_ACTIVE,
    color: COLOR_TEXT,
    border: `1px solid ${COLOR_INPUT_BORDER}`,
    borderHover: `1px solid ${COLOR_INPUT_BORDER}`,
  },
  ghost: {
    bg: "transparent",
    bgHover: COLOR_HOVER,
    bgActive: COLOR_ACTIVE,
    color: COLOR_TEXT_MUTED,
    border: "1px solid transparent",
    borderHover: "1px solid transparent",
  },
  danger: {
    bg: "var(--rei-color-error-bg, rgba(239, 68, 68, 0.1))",
    bgHover: "var(--rei-color-error-bg-hover, rgba(239, 68, 68, 0.15))",
    bgActive: "var(--rei-color-error-bg-active, rgba(239, 68, 68, 0.2))",
    color: COLOR_ERROR,
    border: `1px solid var(--rei-color-error-border, rgba(239, 68, 68, 0.3))`,
    borderHover: `1px solid var(--rei-color-error-border-hover, rgba(239, 68, 68, 0.4))`,
  },
};

export const Button = memo(
  forwardRef(function Button(
    {
      children,
      size = "md",
      variant = "secondary",
      disabled = false,
      iconStart,
      iconEnd,
      type = "button",
      onClick,
      className,
    }: ButtonProps,
    ref: Ref<HTMLButtonElement>,
  ) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const sizeConfig = sizeMap[size];
    const variantConfig = variantStyles[variant];

    const computedStyle = useMemo<CSSProperties>(() => {
      const getEffectiveBg = (): string => {
        if (disabled) {
          return variantConfig.bg;
        }
        if (isPressed) {
          return variantConfig.bgActive;
        }
        if (isHovered) {
          return variantConfig.bgHover;
        }
        return variantConfig.bg;
      };

      const effectiveBg = getEffectiveBg();
      const effectiveBorder =
        !disabled && isHovered ? variantConfig.borderHover : variantConfig.border;

      return {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: sizeConfig.gap,
        height: sizeConfig.height,
        padding: `0 ${sizeConfig.paddingX}`,
        border: effectiveBorder,
        borderRadius: RADIUS_SM,
        backgroundColor: effectiveBg,
        color: variantConfig.color,
        fontSize: sizeConfig.fontSize,
        fontWeight: FONT_WEIGHT_MEDIUM,
        fontFamily: "inherit",
        letterSpacing: "0.01em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: `all ${DURATION_FAST} ${EASING_DEFAULT}`,
        outline: "none",
        whiteSpace: "nowrap",
        userSelect: "none",
        WebkitFontSmoothing: "antialiased",
        boxShadow: isFocused ? `0 0 0 2px ${COLOR_FOCUS_RING}` : "none",
        transform: isPressed && !disabled ? "scale(0.98)" : "scale(1)",
      };
    }, [
      isHovered,
      isPressed,
      isFocused,
      disabled,
      sizeConfig,
      variantConfig,
    ]);

    const iconStyle = useMemo<CSSProperties>(
      () => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: sizeConfig.iconSize,
        height: sizeConfig.iconSize,
        flexShrink: 0,
      }),
      [sizeConfig.iconSize],
    );

    const handlePointerEnter = useCallback(() => {
      if (!disabled) {
        setIsHovered(true);
      }
    }, [disabled]);

    const handlePointerLeave = useCallback(() => {
      setIsHovered(false);
      setIsPressed(false);
    }, []);

    const handlePointerDown = useCallback(() => {
      if (!disabled) {
        setIsPressed(true);
      }
    }, [disabled]);

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
        ref={ref}
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
        style={computedStyle}
      >
        {iconStart ? <span style={iconStyle}>{iconStart}</span> : null}
        {children}
        {iconEnd ? <span style={iconStyle}>{iconEnd}</span> : null}
      </button>
    );
  }),
);
