/**
 * @file ImageFillSection component - Section for image fill settings
 */

import { memo, useMemo, useCallback, type CSSProperties } from "react";
import { Button } from "../../components/Button/Button";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl";
import type { SegmentedControlOption } from "../../components/SegmentedControl/SegmentedControl";
import { Slider } from "../../components/Slider/Slider";
import { PropertyRow } from "../../components/PropertyRow/PropertyRow";
import {
  COLOR_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  SIZE_FONT_SM,
  SPACE_SM,
  SPACE_MD,
  RADIUS_SM,
} from "../../themes/styles";
import { ImageAdjustments } from "../../components/ImageAdjustments/ImageAdjustments";
import type { ImageAdjustmentsData } from "../../components/ImageAdjustments/types";
import type { ImageFillValue, ImageFillMode } from "./types";

export type ImageFillSectionProps = {
  value: ImageFillValue;
  onChange: (value: ImageFillValue) => void;
  onUpload?: () => void;
  disabled?: boolean;
};

const checkerboardBackground = `
  linear-gradient(45deg, #ccc 25%, transparent 25%),
  linear-gradient(-45deg, #ccc 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, #ccc 75%),
  linear-gradient(-45deg, transparent 75%, #ccc 75%)
`;

const imageModeOptions: SegmentedControlOption<ImageFillMode>[] = [
  { value: "fill", label: "Fill" },
  { value: "fit", label: "Fit" },
  { value: "crop", label: "Crop" },
  { value: "tile", label: "Tile" },
];

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 10V3M7 3L4 6M7 3L10 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 11H12" strokeLinecap="round" />
    </svg>
  );
}

function getImageObjectFit(mode: ImageFillMode): CSSProperties["objectFit"] {
  switch (mode) {
    case "fill": {
      return "cover";
    }
    case "fit": {
      return "contain";
    }
    case "crop": {
      return "cover";
    }
    case "tile": {
      return "none";
    }
  }
}

// Static styles
const previewContainerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "120px",
  borderRadius: RADIUS_SM,
  border: `1px solid ${COLOR_BORDER}`,
  overflow: "hidden",
  background: checkerboardBackground,
  backgroundSize: "12px 12px",
  backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0",
};

const previewImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
};

const placeholderStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  gap: SPACE_SM,
};

const iconStyle: CSSProperties = {
  color: COLOR_TEXT_MUTED,
};

const textStyle: CSSProperties = {
  fontSize: SIZE_FONT_SM,
  color: COLOR_TEXT_MUTED,
};

const controlsStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_SM,
};

const opacityContainerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
  width: "100%",
};

const opacityValueStyle: CSSProperties = {
  width: "32px",
  textAlign: "right",
  fontSize: SIZE_FONT_SM,
  color: COLOR_TEXT,
  fontVariantNumeric: "tabular-nums",
};

const sliderContainerStyle: CSSProperties = {
  flex: 1,
};

/**
 * Image fill section with sizing, positioning, and exposure/tint adjustments.
 */
export const ImageFillSection = memo(function ImageFillSection({
  value,
  onChange,
  onUpload,
  disabled = false,
}: ImageFillSectionProps) {
  const hasImage = Boolean(value.url);

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      gap: SPACE_MD,
      opacity: disabled ? 0.5 : 1,
    }),
    [disabled],
  );

  const handleModeChange = useCallback(
    (mode: ImageFillMode | ImageFillMode[]) => {
      if (Array.isArray(mode)) {
        return;
      }
      onChange({ ...value, mode });
    },
    [onChange, value],
  );

  const handleOpacityChange = useCallback(
    (opacity: number) => {
      onChange({ ...value, opacity: Math.round(opacity * 100) });
    },
    [onChange, value],
  );

  const handleAdjustmentsChange = useCallback(
    (adjustments: ImageAdjustmentsData) => {
      onChange({ ...value, adjustments });
    },
    [onChange, value],
  );

  const buttonLabel = hasImage ? "Replace image" : "Upload image";

  const renderPreviewContent = () => {
    if (hasImage) {
      return (
        <img
          src={value.url}
          alt="Image preview"
          style={{
            ...previewImageStyle,
            objectFit: getImageObjectFit(value.mode),
          }}
        />
      );
    }
    return (
      <div style={placeholderStyle}>
        <div style={iconStyle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <span style={textStyle}>No image selected</span>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={previewContainerStyle}>{renderPreviewContent()}</div>

      <Button
        onClick={onUpload}
        disabled={disabled}
        variant="secondary"
        size="sm"
        iconStart={<UploadIcon />}
      >
        {buttonLabel}
      </Button>

      <div style={controlsStyle}>
        <SegmentedControl
          options={imageModeOptions}
          value={value.mode}
          onChange={handleModeChange}
          size="sm"
          disabled={disabled || !hasImage}
          aria-label="Image mode"
        />

        <PropertyRow label="Opacity">
          <div style={opacityContainerStyle}>
            <div style={sliderContainerStyle}>
              <Slider
                value={value.opacity / 100}
                onChange={handleOpacityChange}
                background="linear-gradient(to right, transparent, #000)"
                disabled={disabled || !hasImage}
                aria-label="Image opacity"
              />
            </div>
            <span style={opacityValueStyle}>{value.opacity}%</span>
          </div>
        </PropertyRow>
      </div>

      {hasImage && (
        <ImageAdjustments
          value={value.adjustments}
          onChange={handleAdjustmentsChange}
          disabled={disabled}
        />
      )}
    </div>
  );
});
