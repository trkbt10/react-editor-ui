/**
 * @file Stroke preview components for width profile and brush type
 */

import { memo } from "react";
import type { CSSProperties } from "react";
import type { WidthProfile } from "../../components/StrokeWidthProfileSelect/StrokeWidthProfileSelect";
import type { BrushType } from "./types";

const widthProfilePreviewStyle: CSSProperties = {
  width: "100%",
  height: "8px",
  display: "flex",
  alignItems: "center",
};

/**
 * Preview component for stroke width profiles.
 */
export const WidthProfilePreview = memo(function WidthProfilePreview({
  variant = "uniform",
}: {
  variant?: WidthProfile;
}) {
  const getPath = () => {
    switch (variant) {
      case "taper-end":
        return "M0 4 Q40 2 80 4 Q120 6 160 4";
      case "taper-both":
        return "M0 4 Q20 2 40 4 Q80 6 120 4 Q140 6 160 4";
      default:
        return "M0 4 L160 4";
    }
  };

  const getStrokeWidth = () => (variant === "uniform" ? "4" : "3");

  return (
    <div style={widthProfilePreviewStyle}>
      <svg width="100%" height="8" viewBox="0 0 160 8" preserveAspectRatio="none">
        <path
          d={getPath()}
          fill="none"
          stroke="currentColor"
          strokeWidth={getStrokeWidth()}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
});

const brushPreviewStyle: CSSProperties = {
  width: "100%",
  height: "24px",
  display: "flex",
  alignItems: "center",
};

const sprayParticles = Array.from({ length: 40 }).map((_, i) => ({
  cx: 5 + i * 5 + ((i % 5) * 0.8 - 2),
  cy: 12 + ((i % 7) * 1.14 - 4),
  r: 2 + (i % 3) * 0.67,
}));

/**
 * Preview component for brush types.
 */
export const BrushPreview = memo(function BrushPreview({ type = "smooth" }: { type?: BrushType }) {
  if (type === "rough") {
    return (
      <div style={brushPreviewStyle}>
        <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none">
          <path
            d="M0 12 Q10 8 20 12 Q30 16 40 12 Q50 8 60 12 Q70 16 80 12 Q90 8 100 12 Q110 16 120 12 Q130 8 140 12 Q150 16 160 12 Q170 8 180 12 Q190 16 200 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  if (type === "spray") {
    return (
      <div style={brushPreviewStyle}>
        <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none">
          {sprayParticles.map((p, i) => (
            <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="currentColor" />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div style={brushPreviewStyle}>
      <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none">
        <path
          d="M0 12 Q50 6 100 12 Q150 18 200 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
});
