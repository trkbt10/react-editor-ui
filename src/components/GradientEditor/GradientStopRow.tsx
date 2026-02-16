/**
 * @file GradientStopRow component - Single gradient stop editor row
 */

import { useState, useRef } from "react";
import type { CSSProperties, ChangeEvent } from "react";
import {
  COLOR_INPUT_BG,
  COLOR_INPUT_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_DISABLED,
  COLOR_SELECTED,
  RADIUS_SM,
  SIZE_FONT_SM,
  SPACE_SM,
  SPACE_XS,
} from "../../constants/styles";
import { ColorInput } from "../ColorInput/ColorInput";
import type { ColorValue } from "../../utils/color/types";
import type { GradientStop } from "./gradientTypes";
import { parsePercentageInput } from "../../utils/color/rangeValidation";

export type GradientStopRowProps = {
  stop: GradientStop;
  onChange: (stop: GradientStop) => void;
  onRemove: () => void;
  isSelected: boolean;
  onSelect: () => void;
  removeDisabled?: boolean;
  disabled?: boolean;
};

/** Single gradient color stop row with position, color, and remove controls */
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

  // Track last position for syncing
  const lastPositionRef = useRef(stop.position);

  // Sync local state when external value changes
  if (lastPositionRef.current !== stop.position) {
    lastPositionRef.current = stop.position;
    setPositionInput(String(stop.position));
  }

  const handlePositionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setPositionInput(inputValue);
    const result = parsePercentageInput(inputValue);
    if (result.isValid && result.parsed !== null) {
      onChange({ ...stop, position: result.parsed });
    }
  };

  const handlePositionBlur = () => {
    const result = parsePercentageInput(positionInput);
    if (!result.isValid) {
      setPositionInput(String(stop.position));
    }
  };

  const handleColorChange = (color: ColorValue) => {
    onChange({ ...stop, color });
  };

  const handleRemove = () => {
    if (!disabled && !removeDisabled) {
      onRemove();
    }
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

  const positionContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: 22,
    border: `1px solid ${COLOR_INPUT_BORDER}`,
    borderRadius: RADIUS_SM,
    backgroundColor: COLOR_INPUT_BG,
    flexShrink: 0,
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

  const suffixStyle: CSSProperties = {
    paddingRight: SPACE_XS,
    color: COLOR_TEXT_MUTED,
    fontSize: SIZE_FONT_SM,
  };

  return (
    <div style={containerStyle} onClick={onSelect} role="row">
      <div style={positionContainerStyle}>
        <input
          type="text"
          value={positionInput}
          onChange={handlePositionChange}
          onBlur={handlePositionBlur}
          maxLength={3}
          disabled={disabled}
          aria-label="Position"
          style={positionInputStyle}
          onClick={(e) => e.stopPropagation()}
        />
        <span style={suffixStyle}>%</span>
      </div>

      <ColorInput
        value={stop.color}
        onChange={handleColorChange}
        showRemove
        removeDisabled={removeDisabled}
        onRemove={handleRemove}
        disabled={disabled}
        size="md"
        fullWidth
        aria-label="Stop color"
      />
    </div>
  );
}
