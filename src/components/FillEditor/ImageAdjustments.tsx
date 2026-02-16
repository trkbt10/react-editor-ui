/**
 * @file ImageAdjustments component - Sliders for image adjustments
 */

import type { CSSProperties } from "react";
import { Slider } from "../Slider/Slider";
import { PropertyRow } from "../PropertyRow/PropertyRow";
import {
  COLOR_TEXT,
  SIZE_FONT_SM,
  SPACE_SM,
} from "../../constants/styles";
import type { ImageAdjustments as ImageAdjustmentsType } from "./fillTypes";

export type ImageAdjustmentsProps = {
  value: ImageAdjustmentsType;
  onChange: (value: ImageAdjustmentsType) => void;
  disabled?: boolean;
};

type AdjustmentKey = keyof ImageAdjustmentsType;

type AdjustmentConfig = {
  key: AdjustmentKey;
  label: string;
};

const adjustmentConfigs: AdjustmentConfig[] = [
  { key: "exposure", label: "Exposure" },
  { key: "contrast", label: "Contrast" },
  { key: "saturation", label: "Saturation" },
  { key: "temperature", label: "Temperature" },
  { key: "tint", label: "Tint" },
  { key: "highlights", label: "Highlights" },
  { key: "shadows", label: "Shadows" },
];

/**
 * Convert -100 to 100 value to 0 to 1 slider value
 */
function adjustmentToSlider(value: number): number {
  return (value + 100) / 200;
}

/**
 * Convert 0 to 1 slider value to -100 to 100 adjustment value
 */
function sliderToAdjustment(value: number): number {
  return Math.round(value * 200 - 100);
}

/**
 * Get slider background gradient based on adjustment type
 */
function getSliderBackground(key: AdjustmentKey): string {
  switch (key) {
    case "exposure": {
      return "linear-gradient(to right, #000, #fff)";
    }
    case "contrast": {
      return "linear-gradient(to right, #808080, #000 50%, #fff)";
    }
    case "saturation": {
      return "linear-gradient(to right, #888, #f00)";
    }
    case "temperature": {
      return "linear-gradient(to right, #00bfff, #ff8c00)";
    }
    case "tint": {
      return "linear-gradient(to right, #00ff00, #ff00ff)";
    }
    case "highlights": {
      return "linear-gradient(to right, #666, #fff)";
    }
    case "shadows": {
      return "linear-gradient(to right, #000, #666)";
    }
  }
}

function AdjustmentSlider({
  config,
  value,
  onChange,
  disabled,
}: {
  config: AdjustmentConfig;
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
}) {
  const sliderContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: SPACE_SM,
    width: "100%",
  };

  const sliderStyle: CSSProperties = {
    flex: 1,
  };

  const valueStyle: CSSProperties = {
    width: "32px",
    textAlign: "right",
    fontSize: SIZE_FONT_SM,
    color: COLOR_TEXT,
    fontVariantNumeric: "tabular-nums",
  };

  const handleSliderChange = (sliderValue: number) => {
    onChange(sliderToAdjustment(sliderValue));
  };

  return (
    <PropertyRow label={config.label}>
      <div style={sliderContainerStyle}>
        <div style={sliderStyle}>
          <Slider
            value={adjustmentToSlider(value)}
            onChange={handleSliderChange}
            background={getSliderBackground(config.key)}
            disabled={disabled}
            aria-label={config.label}
          />
        </div>
        <span style={valueStyle}>{value}</span>
      </div>
    </PropertyRow>
  );
}

/** Sliders for adjusting image exposure, contrast, saturation, temperature, and tint */
export function ImageAdjustments({
  value,
  onChange,
  disabled = false,
}: ImageAdjustmentsProps) {
  const handleAdjustmentChange = (key: AdjustmentKey, newValue: number) => {
    onChange({
      ...value,
      [key]: newValue,
    });
  };

  return (
    <div role="group" aria-label="Image adjustments">
      {adjustmentConfigs.map((config) => (
        <AdjustmentSlider
          key={config.key}
          config={config}
          value={value[config.key]}
          onChange={(newValue) => handleAdjustmentChange(config.key, newValue)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
