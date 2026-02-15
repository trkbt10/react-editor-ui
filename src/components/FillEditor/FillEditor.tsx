/**
 * @file FillEditor component - Switch between solid and gradient fill modes
 */

import type { CSSProperties } from "react";
import {
  SPACE_MD,
} from "../../constants/styles";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import type { SegmentedControlOption } from "../SegmentedControl/SegmentedControl";
import { ColorInput } from "../ColorInput/ColorInput";
import type { ColorValue } from "../ColorInput/ColorInput";
import { GradientEditor } from "../GradientEditor/GradientEditor";
import type { FillValue, FillType, GradientValue } from "../GradientEditor/gradientTypes";
import { createDefaultGradient } from "../GradientEditor/gradientUtils";

export type FillEditorProps = {
  value: FillValue;
  onChange: (value: FillValue) => void;
  disabled?: boolean;
  "aria-label"?: string;
};

const fillTypeOptions: SegmentedControlOption<FillType>[] = [
  { value: "solid", label: "Solid" },
  { value: "gradient", label: "Gradient" },
];

function getDefaultSolidColor(value: FillValue): ColorValue {
  if (value.type === "gradient" && value.gradient.stops.length > 0) {
    return { ...value.gradient.stops[0].color };
  }
  return { hex: "#000000", opacity: 100, visible: true };
}

export function FillEditor({
  value,
  onChange,
  disabled = false,
  "aria-label": ariaLabel = "Fill editor",
}: FillEditorProps) {
  const handleTypeChange = (newType: FillType | FillType[]) => {
    if (Array.isArray(newType)) {
      return;
    }

    if (newType === value.type) {
      return;
    }

    if (newType === "solid") {
      // Switch to solid - use first gradient stop color or default
      const defaultColor = getDefaultSolidColor(value);
      onChange({ type: "solid", color: defaultColor });
    } else {
      // Switch to gradient - use current solid color as first stop
      const defaultGradient = createDefaultGradient();
      if (value.type === "solid") {
        defaultGradient.stops[0].color = { ...value.color };
      }

      onChange({ type: "gradient", gradient: defaultGradient });
    }
  };

  const handleSolidColorChange = (color: ColorValue) => {
    if (value.type === "solid") {
      onChange({ type: "solid", color });
    }
  };

  const handleGradientChange = (gradient: GradientValue) => {
    if (value.type === "gradient") {
      onChange({ type: "gradient", gradient });
    }
  };

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: SPACE_MD,
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={containerStyle}
    >
      <SegmentedControl
        options={fillTypeOptions}
        value={value.type}
        onChange={handleTypeChange}
        size="sm"
        disabled={disabled}
        aria-label="Fill type"
      />

      {renderFillContent(value, handleSolidColorChange, handleGradientChange, disabled)}
    </div>
  );
}

function renderFillContent(
  value: FillValue,
  onSolidChange: (color: ColorValue) => void,
  onGradientChange: (gradient: GradientValue) => void,
  disabled: boolean,
) {
  if (value.type === "solid") {
    return (
      <ColorInput
        value={value.color}
        onChange={onSolidChange}
        disabled={disabled}
      />
    );
  }

  return (
    <GradientEditor
      value={value.gradient}
      onChange={onGradientChange}
      disabled={disabled}
    />
  );
}
