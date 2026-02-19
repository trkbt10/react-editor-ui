/**
 * @file TextScaleSectionDemo - Demo page for TextScaleSection
 */

import { useState, type CSSProperties } from "react";
import { TextScaleSection } from "../../../sections/TextScaleSection/TextScaleSection";
import type { TextScaleData } from "../../../sections/TextScaleSection/types";

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
 * TextScaleSection demo page.
 */
export function TextScaleSectionDemo() {
  const [data, setData] = useState<TextScaleData>({
    vertical: "100%",
    horizontal: "100%",
  });

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <TextScaleSection data={data} onChange={setData} />
        <div style={stateDisplayStyle}>{JSON.stringify(data, null, 2)}</div>
      </div>
    </div>
  );
}
