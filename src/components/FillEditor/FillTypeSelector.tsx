/**
 * @file FillTypeSelector component - Icon-based fill type selector
 */

import type { CSSProperties } from "react";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import type { SegmentedControlOption } from "../SegmentedControl/SegmentedControl";
import type { FillType } from "./fillTypes";

export type FillTypeSelectorProps = {
  value: FillType;
  onChange: (value: FillType) => void;
  disabled?: boolean;
  "aria-label"?: string;
};

const iconStyle: CSSProperties = {
  display: "block",
};

function SolidIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style={iconStyle}>
      <rect x="2" y="2" width="10" height="10" rx="2" />
    </svg>
  );
}

function GradientIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" style={iconStyle}>
      <defs>
        <linearGradient id="fill-gradient-icon" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="10" height="10" rx="2" fill="url(#fill-gradient-icon)" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" style={iconStyle}>
      <rect x="2" y="2" width="10" height="10" rx="2" />
      <circle cx="5" cy="5" r="1" fill="currentColor" stroke="none" />
      <path d="M2.5 10L5 7.5L7 9.5L9.5 6.5L12 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PatternIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style={iconStyle}>
      <rect x="2" y="2" width="4" height="4" rx="0.5" />
      <rect x="8" y="2" width="4" height="4" rx="0.5" />
      <rect x="2" y="8" width="4" height="4" rx="0.5" />
      <rect x="8" y="8" width="4" height="4" rx="0.5" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" style={iconStyle}>
      <rect x="2" y="3" width="8" height="8" rx="1.5" />
      <path d="M10 6L12.5 4.5V9.5L10 8" fill="currentColor" stroke="none" />
      <path d="M10 6L12.5 4.5V9.5L10 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const fillTypeOptions: SegmentedControlOption<FillType>[] = [
  { value: "solid", icon: <SolidIcon />, "aria-label": "Solid fill" },
  { value: "gradient", icon: <GradientIcon />, "aria-label": "Gradient fill" },
  { value: "image", icon: <ImageIcon />, "aria-label": "Image fill" },
  { value: "pattern", icon: <PatternIcon />, "aria-label": "Pattern fill" },
  { value: "video", icon: <VideoIcon />, "aria-label": "Video fill" },
];






export function FillTypeSelector({
  value,
  onChange,
  disabled = false,
  "aria-label": ariaLabel = "Fill type",
}: FillTypeSelectorProps) {
  const handleChange = (newValue: FillType | FillType[]) => {
    if (Array.isArray(newValue)) {
      return;
    }
    onChange(newValue);
  };

  return (
    <SegmentedControl
      options={fillTypeOptions}
      value={value}
      onChange={handleChange}
      size="sm"
      disabled={disabled}
      aria-label={ariaLabel}
    />
  );
}
