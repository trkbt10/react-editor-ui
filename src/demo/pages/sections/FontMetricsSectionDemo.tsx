/**
 * @file FontMetricsSectionDemo - Demo page for FontMetricsSection
 */

import { useState, type CSSProperties } from "react";
import { FontMetricsSection } from "../../../sections/FontMetricsSection/FontMetricsSection";
import type { FontMetricsData } from "../../../sections/FontMetricsSection/types";

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
 * FontMetricsSection demo page.
 */
export function FontMetricsSectionDemo() {
  const [data, setData] = useState<FontMetricsData>({
    size: "12 pt",
    leading: "auto",
    kerning: "auto",
    tracking: "0",
  });

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <FontMetricsSection data={data} onChange={setData} />
        <div style={stateDisplayStyle}>{JSON.stringify(data, null, 2)}</div>
      </div>
    </div>
  );
}
