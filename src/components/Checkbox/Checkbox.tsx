/**
 * @file Checkbox component
 */

import { memo, useState, useMemo, useCallback } from "react";
import type { CSSProperties } from "react";
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
  variant?: "checkbox" | "switch";
  "aria-label"?: string;
  className?: string;
};

const sizeMap = {
  sm: { box: SIZE_CHECKBOX_SM, icon: 8, fontSize: SIZE_FONT_SM },
  md: { box: SIZE_CHECKBOX_MD, icon: 10, fontSize: SIZE_FONT_MD },
};

const switchSizeMap = {
  sm: { trackWidth: 24, trackHeight: 12, thumbSize: 8, thumbOffset: 2 },
  md: { trackWidth: 28, trackHeight: 14, thumbSize: 10, thumbOffset: 2 },
};

function getThumbTransform(
  checked: boolean,
  config: { trackWidth: number; thumbSize: number; thumbOffset: number },
): string {
  if (checked) {
    const offset = config.trackWidth - config.thumbSize - config.thumbOffset;
    return `translateX(${offset}px)`;
  }
  return `translateX(${config.thumbOffset}px)`;
}

const CheckIcon = memo(function CheckIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
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
});

const IndeterminateIcon = memo(function IndeterminateIcon({
  size,
}: {
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
});

export const Checkbox = memo(function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  indeterminate = false,
  size = "md",
  variant = "checkbox",
  "aria-label": ariaLabel,
  className,
}: CheckboxProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const sizeConfig = sizeMap[size];
  const switchConfig = switchSizeMap[size];
  const isActive = checked || indeterminate;

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "inline-flex",
      alignItems: "center",
      gap: SPACE_SM,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
    }),
    [disabled],
  );

  const boxStyle = useMemo<CSSProperties>(() => {
    const getBorderColor = (): string => {
      if (!disabled && isHovered) {
        return COLOR_INPUT_BORDER_FOCUS;
      }
      if (isActive) {
        return COLOR_PRIMARY;
      }
      return COLOR_BORDER;
    };

    const borderColor = getBorderColor();

    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: sizeConfig.box,
      height: sizeConfig.box,
      borderRadius: RADIUS_SM,
      border: `1px solid ${borderColor}`,
      backgroundColor: isActive ? COLOR_PRIMARY : "transparent",
      color: "#ffffff",
      transition: `all ${DURATION_FAST} ${EASING_DEFAULT}`,
      flexShrink: 0,
      boxShadow: isFocused ? `0 0 0 2px ${COLOR_FOCUS_RING}` : "none",
    };
  }, [isHovered, isFocused, disabled, isActive, sizeConfig.box]);

  const trackStyle = useMemo<CSSProperties>(() => {
    const borderColor =
      !disabled && isHovered ? COLOR_INPUT_BORDER_FOCUS : "transparent";

    return {
      display: "inline-flex",
      alignItems: "center",
      width: switchConfig.trackWidth,
      height: switchConfig.trackHeight,
      borderRadius: switchConfig.trackHeight / 2,
      backgroundColor: checked ? COLOR_PRIMARY : COLOR_BORDER,
      transition: `all ${DURATION_FAST} ${EASING_DEFAULT}`,
      flexShrink: 0,
      position: "relative",
      boxShadow: isFocused ? `0 0 0 2px ${COLOR_FOCUS_RING}` : "none",
      border: `1px solid ${borderColor}`,
    };
  }, [isHovered, isFocused, disabled, checked, switchConfig]);

  const thumbStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      width: switchConfig.thumbSize,
      height: switchConfig.thumbSize,
      borderRadius: "50%",
      backgroundColor: "#ffffff",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
      transition: `transform ${DURATION_FAST} ${EASING_DEFAULT}`,
      transform: getThumbTransform(checked, switchConfig),
    }),
    [checked, switchConfig],
  );

  const labelStyle = useMemo<CSSProperties>(
    () => ({
      color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
      fontSize: sizeConfig.fontSize,
      userSelect: "none",
    }),
    [disabled, sizeConfig.fontSize],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      onChange(!checked);
    }
  }, [disabled, checked, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) {
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onChange(!checked);
      }
    },
    [disabled, checked, onChange],
  );

  const handlePointerEnter = useCallback(() => {
    if (!disabled) {
      setIsHovered(true);
    }
  }, [disabled]);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const renderIcon = () => {
    if (indeterminate) {
      return <IndeterminateIcon size={sizeConfig.icon} />;
    }
    if (checked) {
      return <CheckIcon size={sizeConfig.icon} />;
    }
    return null;
  };

  if (variant === "switch") {
    return (
      <div
        role="switch"
        aria-checked={checked}
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
        <span style={trackStyle}>
          <span style={thumbStyle} />
        </span>
        {label ? <span style={labelStyle}>{label}</span> : null}
      </div>
    );
  }

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
      <span style={boxStyle}>{renderIcon()}</span>
      {label ? <span style={labelStyle}>{label}</span> : null}
    </div>
  );
});
