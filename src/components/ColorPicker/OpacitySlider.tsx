/**
 * @file OpacitySlider component - Slider with checkerboard background for opacity selection
 */

import type { CSSProperties } from "react";
import { Slider } from "../Slider/Slider";

export type OpacitySliderProps = {
  value: number; // 0-100
  onChange: (value: number) => void;
  color: string; // hex color
  disabled?: boolean;
  "aria-label"?: string;
};

const CHECKERBOARD_SIZE = 6;

/**
 * Generate inline checkerboard pattern as data URI
 */
function createCheckerboardPattern(): string {
  const s = CHECKERBOARD_SIZE;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s * 2}" height="${s * 2}">
    <rect width="${s}" height="${s}" fill="#fff"/>
    <rect x="${s}" width="${s}" height="${s}" fill="#ccc"/>
    <rect y="${s}" width="${s}" height="${s}" fill="#ccc"/>
    <rect x="${s}" y="${s}" width="${s}" height="${s}" fill="#fff"/>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function OpacitySlider({
  value,
  onChange,
  color,
  disabled = false,
  "aria-label": ariaLabel = "Opacity",
}: OpacitySliderProps) {
  const handleChange = (normalizedValue: number) => {
    onChange(Math.round(normalizedValue * 100));
  };

  const containerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: 10,
  };

  const checkerboardStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: "9999px",
    backgroundImage: createCheckerboardPattern(),
    backgroundSize: `${CHECKERBOARD_SIZE * 2}px ${CHECKERBOARD_SIZE * 2}px`,
  };

  const gradientBackground = `linear-gradient(to right, transparent, ${color})`;

  return (
    <div style={containerStyle}>
      <div style={checkerboardStyle} />
      <Slider
        value={value / 100}
        onChange={handleChange}
        background={gradientBackground}
        disabled={disabled}
        aria-label={ariaLabel}
        height={10}
      />
    </div>
  );
}
