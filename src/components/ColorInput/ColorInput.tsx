/**
 * @file ColorInput component - Figma-style color input with integrated swatch
 */

import { useState, useRef, useEffect, useEffectEvent } from "react";
import type { CSSProperties, PointerEvent, ChangeEvent } from "react";
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
  SPACE_XS,
  SPACE_SM,
  Z_POPOVER,
} from "../../constants/styles";
import { ColorPicker } from "../ColorPicker/ColorPicker";
import { isValidHex, normalizeHex } from "../ColorPicker/colorUtils";

export type ColorValue = {
  hex: string;
  opacity: number;
  visible: boolean;
};

export type ColorInputProps = {
  value: ColorValue;
  onChange: (value: ColorValue) => void;
  showVisibilityToggle?: boolean;
  showRemove?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  "aria-label"?: string;
  className?: string;
};

const sizeMap = {
  sm: {
    height: SIZE_HEIGHT_SM,
    fontSize: SIZE_FONT_SM,
    swatchSize: "14px",
    iconSize: 12,
  },
  md: {
    height: SIZE_HEIGHT_MD,
    fontSize: SIZE_FONT_SM,
    swatchSize: "16px",
    iconSize: 14,
  },
  lg: {
    height: SIZE_HEIGHT_LG,
    fontSize: SIZE_FONT_MD,
    swatchSize: "18px",
    iconSize: 14,
  },
};

/**
 * Checkerboard pattern for transparency indication
 */
const CHECKERBOARD_BG = `
  linear-gradient(45deg, #ccc 25%, transparent 25%),
  linear-gradient(-45deg, #ccc 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, #ccc 75%),
  linear-gradient(-45deg, transparent 75%, #ccc 75%)
`;
const CHECKERBOARD_SIZE = "8px 8px";
const CHECKERBOARD_POSITION = "0 0, 0 4px, 4px -4px, -4px 0px";

type IconProps = {
  size: number;
};

function EyeIcon({ size }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ size }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function MinusIcon({ size }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}


export function ColorInput({
  value,
  onChange,
  showVisibilityToggle = true,
  showRemove = false,
  onRemove,
  disabled = false,
  size = "md",
  "aria-label": ariaLabel,
  className,
}: ColorInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [hexInput, setHexInput] = useState(value.hex.replace(/^#/, ""));
  const [opacityInput, setOpacityInput] = useState(String(value.opacity));
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeConfig = sizeMap[size];

  // Track last committed external values for controlled input synchronization
  const lastExternalHexRef = useRef(value.hex);
  const lastExternalOpacityRef = useRef(value.opacity);

  // Sync local state when external value changes (setState during render is allowed
  // when the condition ensures it won't repeat on the next render)
  if (lastExternalHexRef.current !== value.hex) {
    lastExternalHexRef.current = value.hex;
    setHexInput(value.hex.replace(/^#/, ""));
  }
  if (lastExternalOpacityRef.current !== value.opacity) {
    lastExternalOpacityRef.current = value.opacity;
    setOpacityInput(String(value.opacity));
  }

  const closePicker = useEffectEvent(() => {
    setShowPicker(false);
  });

  useEffect(() => {
    if (!showPicker) {
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closePicker();
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [showPicker]);

  const handleSwatchClick = () => {
    if (disabled) {
      return;
    }
    setShowPicker(!showPicker);
  };

  const handleColorChange = (hex: string) => {
    onChange({ ...value, hex });
  };

  const handleHexInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHexInput(newHex);
    if (isValidHex(newHex)) {
      onChange({ ...value, hex: normalizeHex(newHex) });
    }
  };

  const handleHexInputBlur = () => {
    if (!isValidHex(hexInput)) {
      setHexInput(value.hex.replace(/^#/, ""));
    }
  };

  const handleOpacityInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newOpacity = e.target.value;
    setOpacityInput(newOpacity);
    const parsed = parseInt(newOpacity, 10);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      onChange({ ...value, opacity: parsed });
    }
  };

  const handleOpacityInputBlur = () => {
    const parsed = parseInt(opacityInput, 10);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      setOpacityInput(String(value.opacity));
    }
  };

  const handleVisibilityToggle = () => {
    if (disabled) {
      return;
    }
    onChange({ ...value, visible: !value.visible });
  };

  const handleRemove = () => {
    if (disabled) {
      return;
    }
    onRemove?.();
  };

  const [isFocused, setIsFocused] = useState(false);

  // Container wrapping everything
  const containerStyle: CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    opacity: disabled ? 0.5 : 1,
  };

  // Main input field container (Figma-style unified row)
  const fieldContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: sizeConfig.height,
    border: `1px solid ${isFocused ? COLOR_INPUT_BORDER_FOCUS : COLOR_INPUT_BORDER}`,
    borderRadius: RADIUS_SM,
    backgroundColor: COLOR_INPUT_BG,
    overflow: "hidden",
    transition: `border-color ${DURATION_FAST} ${EASING_DEFAULT}`,
    boxShadow: isFocused ? `0 0 0 2px ${COLOR_FOCUS_RING}` : "none",
  };

  // Swatch wrapper with checkerboard background
  const swatchWrapperStyle: CSSProperties = {
    position: "relative",
    width: sizeConfig.swatchSize,
    height: sizeConfig.swatchSize,
    marginLeft: SPACE_SM,
    borderRadius: "2px",
    overflow: "hidden",
    cursor: disabled ? "not-allowed" : "pointer",
    flexShrink: 0,
  };

  const swatchCheckerboardStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: CHECKERBOARD_BG,
    backgroundSize: CHECKERBOARD_SIZE,
    backgroundPosition: CHECKERBOARD_POSITION,
  };

  const swatchColorStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: value.hex,
    opacity: value.opacity / 100,
  };

  const swatchButtonStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    border: "none",
    backgroundColor: "transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    padding: 0,
    outline: "none",
  };

  // Hex input with # prefix
  const hexContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    marginLeft: SPACE_SM,
    flexShrink: 0,
  };

  const hexPrefixStyle: CSSProperties = {
    color: COLOR_TEXT_MUTED,
    fontSize: sizeConfig.fontSize,
    lineHeight: 1,
    userSelect: "none",
  };

  const hexInputStyle: CSSProperties = {
    width: "48px",
    height: "100%",
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: sizeConfig.fontSize,
    fontFamily: "inherit",
    outline: "none",
    textTransform: "uppercase",
  };

  // Separator between hex and opacity
  const separatorStyle: CSSProperties = {
    width: "1px",
    height: "60%",
    backgroundColor: COLOR_INPUT_BORDER,
    marginLeft: SPACE_SM,
    flexShrink: 0,
  };

  // Opacity input with % suffix
  const opacityContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    marginLeft: SPACE_SM,
    marginRight: SPACE_SM,
    flexShrink: 0,
  };

  const opacityInputStyle: CSSProperties = {
    width: "28px",
    height: "100%",
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: sizeConfig.fontSize,
    fontFamily: "inherit",
    outline: "none",
    textAlign: "right",
  };

  const opacitySuffixStyle: CSSProperties = {
    color: COLOR_TEXT_MUTED,
    fontSize: sizeConfig.fontSize,
    lineHeight: 1,
    userSelect: "none",
  };

  // Icon button (visibility, remove) inside field
  const inlineIconButtonStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "100%",
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    color: COLOR_ICON,
    cursor: disabled ? "not-allowed" : "pointer",
    outline: "none",
    transition: `color ${DURATION_FAST} ${EASING_DEFAULT}`,
    flexShrink: 0,
  };

  // Remove button outside field
  const removeButtonStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: sizeConfig.height,
    marginLeft: SPACE_XS,
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    color: COLOR_ICON,
    cursor: disabled ? "not-allowed" : "pointer",
    outline: "none",
    transition: `color ${DURATION_FAST} ${EASING_DEFAULT}`,
    flexShrink: 0,
  };

  const pickerContainerStyle: CSSProperties = {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: SPACE_SM,
    zIndex: Z_POPOVER,
  };

  const handleFieldFocus = () => setIsFocused(true);
  const handleFieldBlur = () => setIsFocused(false);

  const handleIconPointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.color = COLOR_ICON_HOVER;
    }
  };

  const handleIconPointerLeave = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = COLOR_ICON;
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
      aria-label={ariaLabel}
    >
      <div style={fieldContainerStyle}>
        {/* Color Swatch */}
        <div style={swatchWrapperStyle}>
          <div style={swatchCheckerboardStyle} />
          <div style={swatchColorStyle} />
          <button
            type="button"
            onClick={handleSwatchClick}
            disabled={disabled}
            style={swatchButtonStyle}
            aria-label="Open color picker"
          />
        </div>

        {/* Hex Input */}
        <div style={hexContainerStyle}>
          <span style={hexPrefixStyle}>#</span>
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            onBlur={() => {
              handleHexInputBlur();
              handleFieldBlur();
            }}
            onFocus={handleFieldFocus}
            maxLength={6}
            disabled={disabled}
            aria-label="Hex color"
            style={hexInputStyle}
          />
        </div>

        {/* Separator */}
        <div style={separatorStyle} />

        {/* Opacity Input */}
        <div style={opacityContainerStyle}>
          <input
            type="text"
            value={opacityInput}
            onChange={handleOpacityInputChange}
            onBlur={() => {
              handleOpacityInputBlur();
              handleFieldBlur();
            }}
            onFocus={handleFieldFocus}
            maxLength={3}
            disabled={disabled}
            aria-label="Opacity"
            style={opacityInputStyle}
          />
          <span style={opacitySuffixStyle}>%</span>
        </div>

        {/* Visibility Toggle (inside field) */}
        {renderVisibilityToggle(
          showVisibilityToggle,
          handleVisibilityToggle,
          disabled,
          value.visible,
          inlineIconButtonStyle,
          handleIconPointerEnter,
          handleIconPointerLeave,
          sizeConfig.iconSize,
        )}
      </div>

      {/* Remove Button (outside field) */}
      {renderRemoveButton(
        showRemove,
        handleRemove,
        disabled,
        removeButtonStyle,
        handleIconPointerEnter,
        handleIconPointerLeave,
        sizeConfig.iconSize,
      )}

      {renderPicker(showPicker, pickerContainerStyle, value.hex, handleColorChange)}
    </div>
  );
}

function getVisibilityAriaLabel(visible: boolean): string {
  if (visible) {
    return "Hide color";
  }
  return "Show color";
}

function renderVisibilityIcon(visible: boolean, iconSize: number) {
  if (visible) {
    return <EyeIcon size={iconSize} />;
  }
  return <EyeOffIcon size={iconSize} />;
}

function renderVisibilityToggle(
  show: boolean,
  onClick: () => void,
  disabled: boolean,
  visible: boolean,
  buttonStyle: CSSProperties,
  onPointerEnter: (e: PointerEvent<HTMLButtonElement>) => void,
  onPointerLeave: (e: PointerEvent<HTMLButtonElement>) => void,
  iconSize: number,
) {
  if (!show) {
    return null;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={getVisibilityAriaLabel(visible)}
      style={buttonStyle}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {renderVisibilityIcon(visible, iconSize)}
    </button>
  );
}

function renderRemoveButton(
  show: boolean,
  onClick: () => void,
  disabled: boolean,
  buttonStyle: CSSProperties,
  onPointerEnter: (e: PointerEvent<HTMLButtonElement>) => void,
  onPointerLeave: (e: PointerEvent<HTMLButtonElement>) => void,
  iconSize: number,
) {
  if (!show) {
    return null;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Remove color"
      style={buttonStyle}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <MinusIcon size={iconSize} />
    </button>
  );
}

function renderPicker(
  show: boolean,
  containerStyle: CSSProperties,
  hex: string,
  onChange: (hex: string) => void,
) {
  if (!show) {
    return null;
  }
  return (
    <div style={containerStyle}>
      <ColorPicker value={hex} onChange={onChange} />
    </div>
  );
}
