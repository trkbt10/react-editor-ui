/**
 * @file GradientStopRow component - Single gradient stop editor row
 */

import { useState, useRef } from "react";
import type { CSSProperties, ChangeEvent, PointerEvent } from "react";
import {
  COLOR_INPUT_BG,
  COLOR_INPUT_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_DISABLED,
  COLOR_BORDER,
  COLOR_ICON,
  COLOR_ICON_HOVER,
  COLOR_SELECTED,
  RADIUS_SM,
  SIZE_FONT_SM,
  SPACE_SM,
  SPACE_XS,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../constants/styles";
import { isValidHex, normalizeHex } from "../ColorPicker/colorUtils";
import type { GradientStop } from "./gradientTypes";

export type GradientStopRowProps = {
  stop: GradientStop;
  onChange: (stop: GradientStop) => void;
  onRemove: () => void;
  isSelected: boolean;
  onSelect: () => void;
  removeDisabled?: boolean;
  disabled?: boolean;
};

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

export function GradientStopRow({
  stop,
  onChange,
  onRemove,
  isSelected,
  onSelect,
  removeDisabled = false,
  disabled = false,
}: GradientStopRowProps) {
  const [positionInput, setPositionInput] = useState(String(stop.position));
  const [hexInput, setHexInput] = useState(stop.color.hex.replace(/^#/, ""));
  const [opacityInput, setOpacityInput] = useState(String(stop.color.opacity));

  // Track last values for syncing
  const lastPositionRef = useRef(stop.position);
  const lastHexRef = useRef(stop.color.hex);
  const lastOpacityRef = useRef(stop.color.opacity);

  // Sync local state when external value changes
  if (lastPositionRef.current !== stop.position) {
    lastPositionRef.current = stop.position;
    setPositionInput(String(stop.position));
  }
  if (lastHexRef.current !== stop.color.hex) {
    lastHexRef.current = stop.color.hex;
    setHexInput(stop.color.hex.replace(/^#/, ""));
  }
  if (lastOpacityRef.current !== stop.color.opacity) {
    lastOpacityRef.current = stop.color.opacity;
    setOpacityInput(String(stop.color.opacity));
  }

  const handlePositionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPositionInput(value);
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      onChange({ ...stop, position: parsed });
    }
  };

  const handlePositionBlur = () => {
    const parsed = parseInt(positionInput, 10);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      setPositionInput(String(stop.position));
    }
  };

  const handleHexChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexInput(value);
    if (isValidHex(value)) {
      onChange({
        ...stop,
        color: { ...stop.color, hex: normalizeHex(value) },
      });
    }
  };

  const handleHexBlur = () => {
    if (!isValidHex(hexInput)) {
      setHexInput(stop.color.hex.replace(/^#/, ""));
    }
  };

  const handleOpacityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOpacityInput(value);
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      onChange({
        ...stop,
        color: { ...stop.color, opacity: parsed },
      });
    }
  };

  const handleOpacityBlur = () => {
    const parsed = parseInt(opacityInput, 10);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      setOpacityInput(String(stop.color.opacity));
    }
  };

  const handleIconPointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    if (!disabled && !removeDisabled) {
      e.currentTarget.style.color = COLOR_ICON_HOVER;
    }
  };

  const handleIconPointerLeave = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = COLOR_ICON;
  };

  const containerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: SPACE_SM,
    padding: SPACE_XS,
    backgroundColor: isSelected ? COLOR_SELECTED : "transparent",
    borderRadius: RADIUS_SM,
    cursor: "pointer",
    opacity: disabled ? 0.5 : 1,
  };

  const swatchStyle: CSSProperties = {
    width: 18,
    height: 18,
    borderRadius: RADIUS_SM,
    border: `1px solid ${COLOR_BORDER}`,
    backgroundColor: stop.color.hex,
    flexShrink: 0,
  };

  const inputContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: 22,
    border: `1px solid ${COLOR_INPUT_BORDER}`,
    borderRadius: RADIUS_SM,
    backgroundColor: COLOR_INPUT_BG,
    overflow: "hidden",
  };

  const positionInputStyle: CSSProperties = {
    width: 36,
    height: "100%",
    padding: `0 ${SPACE_XS}`,
    border: "none",
    backgroundColor: "transparent",
    color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: SIZE_FONT_SM,
    outline: "none",
    textAlign: "right" as const,
  };

  const hexInputStyle: CSSProperties = {
    width: 52,
    height: "100%",
    padding: `0 ${SPACE_XS}`,
    border: "none",
    backgroundColor: "transparent",
    color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: SIZE_FONT_SM,
    outline: "none",
  };

  const opacityInputStyle: CSSProperties = {
    width: 28,
    height: "100%",
    padding: `0 ${SPACE_XS}`,
    border: "none",
    borderLeft: `1px solid ${COLOR_INPUT_BORDER}`,
    backgroundColor: "transparent",
    color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: SIZE_FONT_SM,
    outline: "none",
    textAlign: "right" as const,
  };

  const suffixStyle: CSSProperties = {
    paddingRight: SPACE_XS,
    color: COLOR_TEXT_MUTED,
    fontSize: SIZE_FONT_SM,
  };

  const deleteButtonStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    color: COLOR_ICON,
    cursor: disabled || removeDisabled ? "not-allowed" : "pointer",
    outline: "none",
    opacity: removeDisabled ? 0.3 : 1,
    transition: `color ${DURATION_FAST} ${EASING_DEFAULT}`,
    flexShrink: 0,
  };

  return (
    <div style={containerStyle} onClick={onSelect} role="row">
      <div style={inputContainerStyle}>
        <input
          type="text"
          value={positionInput}
          onChange={handlePositionChange}
          onBlur={handlePositionBlur}
          maxLength={3}
          disabled={disabled}
          aria-label="Position"
          style={positionInputStyle}
        />
        <span style={suffixStyle}>%</span>
      </div>

      <div style={swatchStyle} />

      <div style={inputContainerStyle}>
        <input
          type="text"
          value={hexInput}
          onChange={handleHexChange}
          onBlur={handleHexBlur}
          maxLength={6}
          disabled={disabled}
          aria-label="Hex color"
          style={hexInputStyle}
        />
        <input
          type="text"
          value={opacityInput}
          onChange={handleOpacityChange}
          onBlur={handleOpacityBlur}
          maxLength={3}
          disabled={disabled}
          aria-label="Opacity"
          style={opacityInputStyle}
        />
        <span style={suffixStyle}>%</span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled && !removeDisabled) {
            onRemove();
          }
        }}
        disabled={disabled || removeDisabled}
        aria-label="Remove stop"
        style={deleteButtonStyle}
        onPointerEnter={handleIconPointerEnter}
        onPointerLeave={handleIconPointerLeave}
      >
        <TrashIcon />
      </button>
    </div>
  );
}
