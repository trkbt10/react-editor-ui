/**
 * @file StrokeSectionDemo - Demo page for StrokeSection
 */

import { useState, type CSSProperties } from "react";
import { StrokeSection } from "../../../sections/StrokeSection/StrokeSection";
import type { StrokeData } from "../../../sections/StrokeSection/types";

const containerStyle: CSSProperties = {
  padding: 24,
  maxWidth: 400,
};

const sectionWrapperStyle: CSSProperties = {
  padding: 16,
  backgroundColor: "var(--rei-color-surface)",
  borderRadius: 8,
  border: "1px solid var(--rei-color-border)",
};

const stateDisplayStyle: CSSProperties = {
  marginTop: 12,
  padding: 8,
  backgroundColor: "var(--rei-color-surface-raised)",
  borderRadius: 4,
  fontSize: 11,
  fontFamily: "monospace",
  color: "var(--rei-color-text-muted)",
  whiteSpace: "pre-wrap",
  maxHeight: 200,
  overflow: "auto",
};

/**
 * StrokeSection demo page.
 */
export function StrokeSectionDemo() {
  const [data, setData] = useState<StrokeData>({
    tab: "basic",
    style: "solid",
    widthProfile: "uniform",
    join: "miter",
    miterAngle: "45",
    frequency: "50",
    wiggle: "0",
    smoothen: "50",
    brushType: "smooth",
    brushDirection: "right",
    brushWidthProfile: "uniform",
  });

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <StrokeSection data={data} onChange={setData} />
        <div style={stateDisplayStyle}>{JSON.stringify(data, null, 2)}</div>
      </div>
    </div>
  );
}
