/**
 * @file AnimationSectionDemo - Demo page for AnimationSection
 */

import { useState, type CSSProperties } from "react";
import { AnimationSection } from "../../../sections/AnimationSection/AnimationSection";
import type { AnimationData } from "../../../sections/AnimationSection/types";
import { EASING_PRESETS } from "../../../components/BezierCurveEditor/bezierPresets";

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
 * AnimationSection demo page.
 */
export function AnimationSectionDemo() {
  const [data, setData] = useState<AnimationData>({
    duration: "0.3",
    delay: "0",
    easing: "ease-out",
    bezierControlPoints: EASING_PRESETS["ease-out"],
  });

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <AnimationSection data={data} onChange={setData} />
        <div style={stateDisplayStyle}>{JSON.stringify(data, null, 2)}</div>
      </div>
    </div>
  );
}
