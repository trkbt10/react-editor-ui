/**
 * @file IconButton component - A button with only an icon
 *
 * @description
 * Compact button for toolbar actions and icon-only interactions.
 * Supports multiple sizes and variants including ghost and filled.
 *
 * @example
 * ```tsx
 * import { IconButton } from "react-editor-ui/IconButton";
 * import { FiPlus } from "react-icons/fi";
 *
 * <IconButton
 *   icon={<FiPlus />}
 *   aria-label="Add item"
 *   onClick={() => console.log("add")}
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
import type { ReactNode, MouseEvent, CSSProperties, Ref } from "react";
import {
  COLOR_HOVER,
  COLOR_ACTIVE,
  COLOR_ICON,
  COLOR_ICON_HOVER,
  COLOR_ICON_ACTIVE,
  COLOR_PRIMARY,
  COLOR_PRIMARY_HOVER,
  COLOR_PRIMARY_ACTIVE,
  COLOR_TEXT_ON_EMPHASIS,
  COLOR_FOCUS_RING,
  RADIUS_SM,
  RADIUS_MD,
  DURATION_FAST,
  EASING_DEFAULT,
  SIZE_ICON_SM,
  SIZE_ICON_MD,
  SIZE_ICON_LG,
  SIZE_ICON_XL,
  SIZE_HEIGHT_SM,
  SIZE_HEIGHT_MD,
  SIZE_HEIGHT_LG,
  SIZE_HEIGHT_XL,
} from "../../constants/styles";

export type IconButtonProps = {
  icon: ReactNode;
  "aria-label": string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "ghost" | "filled" | "minimal" | "selected";
  /** Render as a circular button */
  round?: boolean;
  disabled?: boolean;
  active?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

const sizeMap = {
  sm: { height: SIZE_HEIGHT_SM, iconSize: SIZE_ICON_SM },
  md: { height: SIZE_HEIGHT_MD, iconSize: SIZE_ICON_MD },
  lg: { height: SIZE_HEIGHT_LG, iconSize: SIZE_ICON_LG },
  xl: { height: SIZE_HEIGHT_XL, iconSize: SIZE_ICON_XL },
};

export const IconButton = memo(
  forwardRef(function IconButton(
    {
      icon,
      "aria-label": ariaLabel,
      size = "md",
      variant = "default",
      round = false,
      disabled = false,
      active = false,
      onClick,
      className,
    }: IconButtonProps,
    ref: Ref<HTMLButtonElement>,
  ) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const { height, iconSize } = sizeMap[size];

    const computedStyle = useMemo<CSSProperties>(() => {
      // Selected variant: accent color background with white icon
      if (variant === "selected") {
        const getBg = (): string => {
          if (disabled) {
            return COLOR_PRIMARY;
          }
          if (isPressed) {
            return COLOR_PRIMARY_ACTIVE;
          }
          if (isHovered) {
            return COLOR_PRIMARY_HOVER;
          }
          return COLOR_PRIMARY;
        };

        return {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: height,
          height,
          padding: 0,
          border: "none",
          borderRadius: round ? "50%" : RADIUS_MD,
          backgroundColor: getBg(),
          color: COLOR_TEXT_ON_EMPHASIS,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
          outline: "none",
          boxShadow: isFocused ? `0 0 0 2px ${COLOR_FOCUS_RING}` : "none",
        };
      }

      const baseBg = variant === "filled" ? COLOR_HOVER : "transparent";

      const getEffectiveBg = (): string => {
        if (disabled) {
          return baseBg;
        }
        if (variant === "minimal") {
          // Minimal: no hover effect, only pressed state shows subtle background
          return isPressed ? COLOR_ACTIVE : "transparent";
        }
        if (isPressed) {
          return COLOR_ACTIVE;
        }
        if (isHovered) {
          return COLOR_HOVER;
        }
        return baseBg;
      };

      const getEffectiveColor = (): string => {
        if (active) {
          return COLOR_ICON_ACTIVE;
        }
        if (!disabled && isHovered) {
          return COLOR_ICON_HOVER;
        }
        return COLOR_ICON;
      };

      const effectiveBg = getEffectiveBg();
      const effectiveColor = getEffectiveColor();

      return {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: height,
        height,
        padding: 0,
        border: "none",
        borderRadius: round ? "50%" : RADIUS_SM,
        backgroundColor: effectiveBg,
        color: effectiveColor,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}, color ${DURATION_FAST} ${EASING_DEFAULT}`,
        outline: "none",
        boxShadow: isFocused ? `0 0 0 2px ${COLOR_FOCUS_RING}` : "none",
      };
    }, [isHovered, isPressed, isFocused, disabled, active, variant, height, round]);

    const iconStyle = useMemo<CSSProperties>(
      () => ({
        width: iconSize,
        height: iconSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }),
      [iconSize],
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
        style={computedStyle}
      >
        <span style={iconStyle}>{icon}</span>
      </button>
    );
  }),
);
