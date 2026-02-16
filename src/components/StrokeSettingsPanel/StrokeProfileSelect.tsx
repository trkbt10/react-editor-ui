/**
 * @file StrokeProfileSelect - Width profile selector
 */

import type { CSSProperties } from "react";
import type { WidthProfile } from "./types";
import { Select, type SelectOption } from "../Select/Select";
import { IconButton } from "../IconButton/IconButton";
import { FlipVerticalIcon as FlipIcon } from "../../icons";
import { SPACE_SM } from "../../constants/styles";

export type StrokeProfileSelectProps = {
  value: WidthProfile;
  onChange: (value: WidthProfile) => void;
  onFlip?: () => void;
  disabled?: boolean;
  showFlip?: boolean;
  size?: "sm" | "md" | "lg";
};

function ProfilePreview({ variant }: { variant: WidthProfile }) {
  const style: CSSProperties = {
    width: "100%",
    height: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  switch (variant) {
    case "taper-start":
      return (
        <div style={style}>
          <svg width="100%" height="10" viewBox="0 0 80 10" preserveAspectRatio="none">
            <path d="M0 5 L80 2 L80 8 Z" fill="currentColor" />
          </svg>
        </div>
      );
    case "taper-end":
      return (
        <div style={style}>
          <svg width="100%" height="10" viewBox="0 0 80 10" preserveAspectRatio="none">
            <path d="M0 2 L0 8 L80 5 Z" fill="currentColor" />
          </svg>
        </div>
      );
    case "taper-both":
      return (
        <div style={style}>
          <svg width="100%" height="10" viewBox="0 0 80 10" preserveAspectRatio="none">
            <path d="M0 5 Q20 0 40 0 Q60 0 80 5 Q60 10 40 10 Q20 10 0 5 Z" fill="currentColor" />
          </svg>
        </div>
      );
    default:
      return (
        <div style={style}>
          <svg width="100%" height="10" viewBox="0 0 80 10" preserveAspectRatio="none">
            <line x1="0" y1="5" x2="80" y2="5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      );
  }
}

const options: SelectOption<WidthProfile>[] = [
  { value: "uniform", preview: <ProfilePreview variant="uniform" /> },
  { value: "taper-start", preview: <ProfilePreview variant="taper-start" /> },
  { value: "taper-end", preview: <ProfilePreview variant="taper-end" /> },
  { value: "taper-both", preview: <ProfilePreview variant="taper-both" /> },
];

const containerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

export function StrokeProfileSelect({
  value,
  onChange,
  onFlip,
  disabled = false,
  showFlip = true,
  size = "md",
}: StrokeProfileSelectProps) {
  const handleFlip = () => {
    if (onFlip) {
      onFlip();
      return;
    }
    // Default flip behavior
    if (value === "taper-start") {
      onChange("taper-end");
    } else if (value === "taper-end") {
      onChange("taper-start");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={{ flex: 1 }}>
        <Select
          options={options}
          value={value}
          onChange={onChange}
          disabled={disabled}
          size={size}
          aria-label="Width profile"
        />
      </div>
      {showFlip && (
        <IconButton
          icon={<FlipIcon />}
          onClick={handleFlip}
          aria-label="Flip profile"
          size="sm"
          disabled={disabled || value === "uniform" || value === "taper-both"}
        />
      )}
    </div>
  );
}
