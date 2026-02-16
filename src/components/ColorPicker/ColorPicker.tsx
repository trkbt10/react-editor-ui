/**
 * @file ColorPicker component - Color selection with HSV area and hue slider
 */

import { memo, useState, useRef, useCallback, useMemo } from "react";
import type { CSSProperties, PointerEvent } from "react";
import {
  COLOR_SURFACE,
  COLOR_BORDER,
  COLOR_TEXT,
  COLOR_INPUT_BG,
  COLOR_INPUT_BORDER,
  COLOR_INPUT_BORDER_FOCUS,
  COLOR_FOCUS_RING,
  RADIUS_SM,
  RADIUS_MD,
  SHADOW_LG,
  SPACE_SM,
  SIZE_FONT_SM,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../constants/styles";
import { hexToHsv, hsvToHex, isValidHex, normalizeHex } from "../../utils/color/conversion";
import type { HSV } from "../../utils/color/types";
import { clamp } from "../../utils/color/clamp";
import { OpacitySlider } from "./OpacitySlider";

export type ColorPickerProps = {
  value: string;
  onChange: (hex: string) => void;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
  showOpacity?: boolean;
  presetColors?: string[];
  "aria-label"?: string;
};

const DEFAULT_PRESETS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#000000",
  "#ffffff",
];






export const ColorPicker = memo(function ColorPicker({
  value,
  onChange,
  opacity = 100,
  onOpacityChange,
  showOpacity = false,
  presetColors = DEFAULT_PRESETS,
  "aria-label": ariaLabel,
}: ColorPickerProps) {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(value));
  const [hexInput, setHexInput] = useState(value.replace(/^#/, ""));
  const saturationRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const isDraggingSaturation = useRef(false);
  const isDraggingHue = useRef(false);
  const [isHexInputFocused, setIsHexInputFocused] = useState(false);

  // Track last committed external value for controlled input synchronization
  const lastExternalValueRef = useRef(value);

  // Sync local state when external value changes (setState during render is allowed
  // when the condition ensures it won't repeat on the next render)
  if (lastExternalValueRef.current !== value) {
    lastExternalValueRef.current = value;
    setHsv(hexToHsv(value));
    setHexInput(value.replace(/^#/, ""));
  }

  const updateColor = useCallback(
    (newHsv: HSV) => {
      setHsv(newHsv);
      const hex = hsvToHex(newHsv);
      setHexInput(hex.replace(/^#/, ""));
      onChange(hex);
    },
    [onChange],
  );

  const handleSaturationPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    isDraggingSaturation.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSaturationFromPointer(e);
  };

  const handleSaturationPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSaturation.current) {
      return;
    }
    updateSaturationFromPointer(e);
  };

  const handleSaturationPointerUp = () => {
    isDraggingSaturation.current = false;
  };

  const updateSaturationFromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const rect = saturationRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const x = clamp(e.clientX - rect.left, 0, rect.width);
    const y = clamp(e.clientY - rect.top, 0, rect.height);
    const s = (x / rect.width) * 100;
    const v = 100 - (y / rect.height) * 100;
    updateColor({ ...hsv, s, v });
  };

  const handleHuePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    isDraggingHue.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateHueFromPointer(e);
  };

  const handleHuePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingHue.current) {
      return;
    }
    updateHueFromPointer(e);
  };

  const handleHuePointerUp = () => {
    isDraggingHue.current = false;
  };

  const updateHueFromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const x = clamp(e.clientX - rect.left, 0, rect.width);
    const h = (x / rect.width) * 360;
    updateColor({ ...hsv, h });
  };

  const handleHexInputChange = (newHex: string) => {
    setHexInput(newHex);
    if (isValidHex(newHex)) {
      const normalizedHex = normalizeHex(newHex);
      setHsv(hexToHsv(normalizedHex));
      onChange(normalizedHex);
    }
  };

  const handlePresetClick = useCallback(
    (preset: string) => {
      const normalizedHex = normalizeHex(preset);
      setHsv(hexToHsv(normalizedHex));
      setHexInput(normalizedHex.replace(/^#/, ""));
      onChange(normalizedHex);
    },
    [onChange],
  );

  const handleHexInputFocus = useCallback(() => {
    setIsHexInputFocused(true);
  }, []);

  const handleHexInputBlur = useCallback(() => {
    setIsHexInputFocused(false);
  }, []);

  const containerStyle: CSSProperties = {
    width: 200,
    padding: SPACE_SM,
    backgroundColor: COLOR_SURFACE,
    border: `1px solid ${COLOR_BORDER}`,
    borderRadius: RADIUS_MD,
    boxShadow: SHADOW_LG,
    display: "flex",
    flexDirection: "column",
    gap: SPACE_SM,
  };

  const saturationAreaStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: 130,
    borderRadius: RADIUS_SM,
    cursor: "crosshair",
    background: `
      linear-gradient(to top, #000, transparent),
      linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))
    `,
  };

  const saturationHandleStyle: CSSProperties = {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: "50%",
    border: "2px solid white",
    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
    transform: "translate(-50%, -50%)",
    left: `${hsv.s}%`,
    top: `${100 - hsv.v}%`,
    pointerEvents: "none",
  };

  const hueSliderStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: 10,
    borderRadius: RADIUS_SM,
    cursor: "pointer",
    background:
      "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
  };

  const hueHandleStyle: CSSProperties = {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: "50%",
    border: "2px solid white",
    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
    transform: "translate(-50%, 0)",
    left: `${(hsv.h / 360) * 100}%`,
    top: 0,
    pointerEvents: "none",
  };

  const hexInputContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: SPACE_SM,
  };

  const hexLabelStyle: CSSProperties = {
    color: COLOR_TEXT,
    fontSize: SIZE_FONT_SM,
    fontWeight: 500,
  };

  const hexInputStyle = useMemo<CSSProperties>(
    () => ({
      flex: 1,
      height: 24,
      padding: `0 ${SPACE_SM}`,
      border: `1px solid ${isHexInputFocused ? COLOR_INPUT_BORDER_FOCUS : COLOR_INPUT_BORDER}`,
      borderRadius: RADIUS_SM,
      backgroundColor: COLOR_INPUT_BG,
      color: COLOR_TEXT,
      fontSize: SIZE_FONT_SM,
      outline: "none",
      transition: `border-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      boxShadow: isHexInputFocused ? `0 0 0 2px ${COLOR_FOCUS_RING}` : "none",
    }),
    [isHexInputFocused],
  );

  const presetContainerStyle: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: SPACE_SM,
  };

  const getPresetStyle = (color: string): CSSProperties => ({
    width: 18,
    height: 18,
    borderRadius: RADIUS_SM,
    border: `1px solid ${COLOR_BORDER}`,
    backgroundColor: color,
    cursor: "pointer",
    padding: 0,
    outline: "none",
  });

  return (
    <div
      role="application"
      aria-label={ariaLabel ?? "Color picker"}
      style={containerStyle}
    >
      <div
        ref={saturationRef}
        role="slider"
        aria-label="Saturation and brightness"
        aria-valuetext={`Saturation ${Math.round(hsv.s)}%, Brightness ${Math.round(hsv.v)}%`}
        tabIndex={0}
        onPointerDown={handleSaturationPointerDown}
        onPointerMove={handleSaturationPointerMove}
        onPointerUp={handleSaturationPointerUp}
        style={saturationAreaStyle}
      >
        <div style={saturationHandleStyle} />
      </div>

      <div
        ref={hueRef}
        role="slider"
        aria-label="Hue"
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(hsv.h)}
        tabIndex={0}
        onPointerDown={handleHuePointerDown}
        onPointerMove={handleHuePointerMove}
        onPointerUp={handleHuePointerUp}
        style={hueSliderStyle}
      >
        <div style={hueHandleStyle} />
      </div>

      {renderOpacitySlider(showOpacity, opacity, onOpacityChange, value)}

      <div style={hexInputContainerStyle}>
        <span style={hexLabelStyle}>#</span>
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexInputChange(e.target.value)}
          maxLength={6}
          aria-label="Hex color value"
          style={hexInputStyle}
          onFocus={handleHexInputFocus}
          onBlur={handleHexInputBlur}
        />
      </div>

      {renderPresets(presetColors, presetContainerStyle, handlePresetClick, getPresetStyle)}
    </div>
  );
});

function renderOpacitySlider(
  show: boolean,
  opacity: number,
  onOpacityChange: ((value: number) => void) | undefined,
  color: string,
) {
  if (!show || !onOpacityChange) {
    return null;
  }
  return (
    <OpacitySlider
      value={opacity}
      onChange={onOpacityChange}
      color={color}
    />
  );
}

function renderPresets(
  presetColors: string[],
  containerStyle: CSSProperties,
  onClick: (color: string) => void,
  getStyle: (color: string) => CSSProperties,
) {
  if (presetColors.length === 0) {
    return null;
  }
  return (
    <div style={containerStyle}>
      {presetColors.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Select color ${color}`}
          onClick={() => onClick(color)}
          style={getStyle(color)}
        />
      ))}
    </div>
  );
}
