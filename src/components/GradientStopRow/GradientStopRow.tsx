/**
 * @file GradientStopRow component - Single gradient stop editor row
 */

import { useState, useRef, memo, useCallback, useMemo } from "react";
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
} from "../../themes/styles";
import { ColorInput } from "../ColorInput/ColorInput";
import type { ColorValue } from "../../utils/color/types";
import type { GradientStop } from "../../utils/gradient/types";
import { parsePercentageInput } from "../../utils/color/rangeValidation";

export type GradientStopRowProps = {
  stop: GradientStop;
  onChange: (stop: GradientStop) => void;
  /** Called with stop.id when remove is clicked */
  onRemove: (stopId: string) => void;
  isSelected: boolean;
  /** Called with stop.id when row is selected */
  onSelect: (stopId: string) => void;
  removeDisabled?: boolean;
  disabled?: boolean;
};

function areGradientStopRowPropsEqual(
  prevProps: GradientStopRowProps,
  nextProps: GradientStopRowProps,
): boolean {
  // Compare stop by actual content
  if (prevProps.stop.id !== nextProps.stop.id) {
    return false;
  }
  if (prevProps.stop.position !== nextProps.stop.position) {
    return false;
  }
  if (prevProps.stop.color.hex !== nextProps.stop.color.hex) {
    return false;
  }
  if (prevProps.stop.color.opacity !== nextProps.stop.color.opacity) {
    return false;
  }
  if (prevProps.stop.color.visible !== nextProps.stop.color.visible) {
    return false;
  }

  // Compare other props
  if (prevProps.isSelected !== nextProps.isSelected) {
    return false;
  }
  if (prevProps.removeDisabled !== nextProps.removeDisabled) {
    return false;
  }
  if (prevProps.disabled !== nextProps.disabled) {
    return false;
  }

  return true;
}

/**
 * Single gradient color stop row with position, color, and remove controls.
 */
const GradientStopRowInner = function GradientStopRow({
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

  const handlePositionChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setPositionInput(inputValue);
    const result = parsePercentageInput(inputValue);
    if (result.isValid && result.parsed !== null) {
      onChange({ ...stop, position: result.parsed });
    }
  }, [onChange, stop]);

  const handlePositionBlur = useCallback(() => {
    const result = parsePercentageInput(positionInput);
    if (!result.isValid) {
      setPositionInput(String(stop.position));
    }
  }, [positionInput, stop.position]);

  const handleColorChange = useCallback((color: ColorValue) => {
    onChange({ ...stop, color });
  }, [onChange, stop]);

  const handleRemove = useCallback(() => {
    if (!disabled && !removeDisabled) {
      onRemove(stop.id);
    }
  }, [disabled, removeDisabled, onRemove, stop.id]);

  const handleSelect = useCallback(() => {
    onSelect(stop.id);
  }, [onSelect, stop.id]);

  const handleInputClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const containerStyle = useMemo<CSSProperties>(() => ({
    display: "flex",
    alignItems: "center",
    gap: SPACE_SM,
    padding: SPACE_XS,
    backgroundColor: isSelected ? COLOR_SELECTED : "transparent",
    borderRadius: RADIUS_SM,
    cursor: "pointer",
    opacity: disabled ? 0.5 : 1,
  }), [isSelected, disabled]);

  const positionContainerStyle = useMemo<CSSProperties>(() => ({
    display: "flex",
    alignItems: "center",
    height: 22,
    border: `1px solid ${COLOR_INPUT_BORDER}`,
    borderRadius: RADIUS_SM,
    backgroundColor: COLOR_INPUT_BG,
    flexShrink: 0,
  }), []);

  const positionInputStyle = useMemo<CSSProperties>(() => ({
    width: 36,
    height: "100%",
    padding: `0 ${SPACE_XS}`,
    border: "none",
    backgroundColor: "transparent",
    color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: SIZE_FONT_SM,
    outline: "none",
    textAlign: "right" as const,
  }), [disabled]);

  const suffixStyle = useMemo<CSSProperties>(() => ({
    paddingRight: SPACE_XS,
    color: COLOR_TEXT_MUTED,
    fontSize: SIZE_FONT_SM,
  }), []);

  return (
    <div style={containerStyle} onClick={handleSelect} role="row">
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
          onClick={handleInputClick}
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
};

export const GradientStopRow = memo(GradientStopRowInner, areGradientStopRowPropsEqual);
