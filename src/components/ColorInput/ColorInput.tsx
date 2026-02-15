/**
 * @file ColorInput component - Color input row with swatch, hex, opacity, and visibility toggle
 */

import { useState, useRef, useEffect, useEffectEvent } from "react";
import type { CSSProperties, PointerEvent, ChangeEvent } from "react";
import {
  COLOR_INPUT_BG,
  COLOR_INPUT_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_DISABLED,
  COLOR_ICON,
  COLOR_ICON_HOVER,
  COLOR_BORDER,
  COLOR_FOCUS_RING,
  RADIUS_SM,
  DURATION_FAST,
  EASING_DEFAULT,
  SIZE_FONT_SM,
  SIZE_FONT_MD,
  SIZE_HEIGHT_SM,
  SIZE_HEIGHT_MD,
  SIZE_HEIGHT_LG,
  SIZE_COLOR_SWATCH_SM,
  SIZE_COLOR_SWATCH_MD,
  SIZE_COLOR_SWATCH_LG,
  SPACE_SM,
  SPACE_MD,
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
    swatchSize: SIZE_COLOR_SWATCH_SM,
    paddingX: SPACE_SM,
  },
  md: {
    height: SIZE_HEIGHT_MD,
    fontSize: SIZE_FONT_MD,
    swatchSize: SIZE_COLOR_SWATCH_MD,
    paddingX: SPACE_MD,
  },
  lg: {
    height: SIZE_HEIGHT_LG,
    fontSize: SIZE_FONT_MD,
    swatchSize: SIZE_COLOR_SWATCH_LG,
    paddingX: SPACE_MD,
  },
};

function EyeIcon() {
  return (
    <svg
      width="14"
      height="14"
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

function EyeOffIcon() {
  return (
    <svg
      width="14"
      height="14"
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

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
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

  const prevHex = usePrevious(value.hex);
  const prevOpacity = usePrevious(value.opacity);

  if (prevHex !== value.hex && prevHex !== undefined) {
    setHexInput(value.hex.replace(/^#/, ""));
  }
  if (prevOpacity !== value.opacity && prevOpacity !== undefined) {
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

  const containerStyle: CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: SPACE_SM,
    opacity: disabled ? 0.5 : 1,
  };

  const swatchStyle: CSSProperties = {
    width: sizeConfig.swatchSize,
    height: sizeConfig.swatchSize,
    borderRadius: RADIUS_SM,
    border: `1px solid ${COLOR_BORDER}`,
    backgroundColor: value.hex,
    cursor: disabled ? "not-allowed" : "pointer",
    padding: 0,
    outline: "none",
  };

  const inputContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: sizeConfig.height,
    border: `1px solid ${COLOR_INPUT_BORDER}`,
    borderRadius: RADIUS_SM,
    backgroundColor: COLOR_INPUT_BG,
    overflow: "hidden",
  };

  const hexInputStyle: CSSProperties = {
    width: 60,
    height: "100%",
    padding: `0 ${SPACE_SM}`,
    border: "none",
    backgroundColor: "transparent",
    color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: sizeConfig.fontSize,
    outline: "none",
  };

  const opacityInputStyle: CSSProperties = {
    width: 40,
    height: "100%",
    padding: `0 ${SPACE_SM}`,
    border: "none",
    borderLeft: `1px solid ${COLOR_INPUT_BORDER}`,
    backgroundColor: "transparent",
    color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: sizeConfig.fontSize,
    outline: "none",
    textAlign: "right" as const,
  };

  const suffixStyle: CSSProperties = {
    paddingRight: SPACE_SM,
    color: COLOR_TEXT_MUTED,
    fontSize: sizeConfig.fontSize,
  };

  const iconButtonStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: sizeConfig.height,
    height: sizeConfig.height,
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    color: COLOR_ICON,
    cursor: disabled ? "not-allowed" : "pointer",
    outline: "none",
    transition: `color ${DURATION_FAST} ${EASING_DEFAULT}`,
  };

  const pickerContainerStyle: CSSProperties = {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: SPACE_SM,
    zIndex: Z_POPOVER,
  };

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
      <button
        type="button"
        onClick={handleSwatchClick}
        disabled={disabled}
        style={swatchStyle}
        aria-label="Open color picker"
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${COLOR_FOCUS_RING}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
      />

      <div style={inputContainerStyle}>
        <input
          type="text"
          value={hexInput}
          onChange={handleHexInputChange}
          onBlur={handleHexInputBlur}
          maxLength={6}
          disabled={disabled}
          aria-label="Hex color"
          style={hexInputStyle}
        />
        <input
          type="text"
          value={opacityInput}
          onChange={handleOpacityInputChange}
          onBlur={handleOpacityInputBlur}
          maxLength={3}
          disabled={disabled}
          aria-label="Opacity"
          style={opacityInputStyle}
        />
        <span style={suffixStyle}>%</span>
      </div>

      {renderVisibilityToggle(
        showVisibilityToggle,
        handleVisibilityToggle,
        disabled,
        value.visible,
        iconButtonStyle,
        handleIconPointerEnter,
        handleIconPointerLeave,
      )}

      {renderRemoveButton(
        showRemove,
        handleRemove,
        disabled,
        iconButtonStyle,
        handleIconPointerEnter,
        handleIconPointerLeave,
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

function renderVisibilityIcon(visible: boolean) {
  if (visible) {
    return <EyeIcon />;
  }
  return <EyeOffIcon />;
}

function renderVisibilityToggle(
  show: boolean,
  onClick: () => void,
  disabled: boolean,
  visible: boolean,
  buttonStyle: CSSProperties,
  onPointerEnter: (e: PointerEvent<HTMLButtonElement>) => void,
  onPointerLeave: (e: PointerEvent<HTMLButtonElement>) => void,
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
      {renderVisibilityIcon(visible)}
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
      <TrashIcon />
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
