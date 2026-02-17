/**
 * @file StrokeWidthProfileSelect - Stroke width profile selector
 */

import { memo, type CSSProperties } from "react";
import { Select, type SelectOption } from "../Select/Select";
import { COLOR_TEXT } from "../../themes/styles";

export type WidthProfile = "uniform" | "taper-end" | "taper-both";

export type StrokeWidthProfileSelectProps = {
  /** Current width profile */
  value: WidthProfile;
  /** Called when width profile changes */
  onChange: (value: WidthProfile) => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Aria label */
  "aria-label"?: string;
};

// Preview components for width profiles
const previewContainerStyle: CSSProperties = {
  width: 48,
  height: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

type WidthProfilePreviewProps = {
  variant: WidthProfile;
};

const WidthProfilePreview = memo(function WidthProfilePreview({
  variant,
}: WidthProfilePreviewProps) {
  const getPath = () => {
    switch (variant) {
      case "uniform":
        return "M4,8 L44,8";
      case "taper-end":
        return "M4,8 Q24,8 44,8";
      case "taper-both":
        return "M4,8 Q24,4 44,8";
      default:
        return "M4,8 L44,8";
    }
  };

  const getStrokeWidth = () => {
    switch (variant) {
      case "uniform":
        return "3";
      case "taper-end":
        return "3";
      case "taper-both":
        return "3";
      default:
        return "3";
    }
  };

  return (
    <div style={previewContainerStyle}>
      <svg width="48" height="16" viewBox="0 0 48 16">
        <path
          d={getPath()}
          stroke={COLOR_TEXT}
          strokeWidth={getStrokeWidth()}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
});

const widthProfileOptions: SelectOption<WidthProfile>[] = [
  { value: "uniform", preview: <WidthProfilePreview variant="uniform" /> },
  { value: "taper-end", preview: <WidthProfilePreview variant="taper-end" /> },
  { value: "taper-both", preview: <WidthProfilePreview variant="taper-both" /> },
];

/**
 * Stroke width profile selector.
 */
export const StrokeWidthProfileSelect = memo(function StrokeWidthProfileSelect({
  value,
  onChange,
  size = "md",
  "aria-label": ariaLabel = "Width profile",
}: StrokeWidthProfileSelectProps) {
  return (
    <Select
      options={widthProfileOptions}
      value={value}
      onChange={onChange}
      size={size}
      aria-label={ariaLabel}
    />
  );
});
