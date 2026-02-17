/**
 * @file PositionSectionDemo - Demo page for PositionSection
 */

import { useState, type CSSProperties } from "react";
import { PositionSection } from "../../../sections/PositionSection/PositionSection";
import type { PositionData } from "../../../sections/PositionSection/types";

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
 * PositionSection demo page.
 */
export function PositionSectionDemo() {
  const [data, setData] = useState<PositionData>({
    x: "100",
    y: "200",
  });

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <PositionSection data={data} onChange={setData} />
        <div style={stateDisplayStyle}>{JSON.stringify(data)}</div>
      </div>
    </div>
  );
}
