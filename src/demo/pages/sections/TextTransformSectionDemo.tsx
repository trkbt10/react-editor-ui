/**
 * @file TextTransformSectionDemo - Demo page for TextTransformSection
 */

import { useState, type CSSProperties } from "react";
import { TextTransformSection } from "../../../sections/TextTransformSection/TextTransformSection";
import type { TextTransformData } from "../../../sections/TextTransformSection/types";

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
};

/**
 * TextTransformSection demo page.
 */
export function TextTransformSectionDemo() {
  const [data, setData] = useState<TextTransformData>({
    baselineShift: "0 pt",
    rotation: "0°",
  });

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <TextTransformSection data={data} onChange={setData} />
        <div style={stateDisplayStyle}>{JSON.stringify(data, null, 2)}</div>
      </div>
    </div>
  );
}
