/**
 * @file GradientTypeSelector component - Gradient type selection control
 */

import type { GradientType } from "./gradientTypes";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import type { SegmentedControlOption } from "../SegmentedControl/SegmentedControl";

export type GradientTypeSelectorProps = {
  value: GradientType;
  onChange: (type: GradientType) => void;
  disabled?: boolean;
  "aria-label"?: string;
};

function LinearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect
        x="2"
        y="2"
        width="10"
        height="10"
        rx="1"
        fill="url(#linear-grad)"
      />
      <defs>
        <linearGradient id="linear-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function RadialIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect
        x="2"
        y="2"
        width="10"
        height="10"
        rx="1"
        fill="url(#radial-grad)"
      />
      <defs>
        <radialGradient id="radial-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function AngularIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect
        x="2"
        y="2"
        width="10"
        height="10"
        rx="1"
        fill="url(#angular-grad)"
      />
      <defs>
        <linearGradient id="angular-grad" gradientTransform="rotate(45)">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 2 L12 7 L7 12 L2 7 Z"
        fill="url(#diamond-grad)"
      />
      <defs>
        <radialGradient id="diamond-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </radialGradient>
      </defs>
    </svg>
  );
}

const gradientTypeOptions: SegmentedControlOption<GradientType>[] = [
  { value: "linear", icon: <LinearIcon />, "aria-label": "Linear gradient" },
  { value: "radial", icon: <RadialIcon />, "aria-label": "Radial gradient" },
  { value: "angular", icon: <AngularIcon />, "aria-label": "Angular gradient" },
  { value: "diamond", icon: <DiamondIcon />, "aria-label": "Diamond gradient" },
];

export function GradientTypeSelector({
  value,
  onChange,
  disabled = false,
  "aria-label": ariaLabel = "Gradient type",
}: GradientTypeSelectorProps) {
  const handleChange = (newValue: GradientType | GradientType[]) => {
    if (!Array.isArray(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <SegmentedControl
      options={gradientTypeOptions}
      value={value}
      onChange={handleChange}
      size="sm"
      disabled={disabled}
      aria-label={ariaLabel}
    />
  );
}
