/**
 * @file TypographySectionDemo - Demo page for TypographySection
 */

import { useState, type CSSProperties } from "react";
import { TypographySection } from "../../../sections/TypographySection/TypographySection";
import type { TypographyData } from "../../../sections/TypographySection/types";

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
 * TypographySection demo page.
 */
export function TypographySectionDemo() {
  const [data, setData] = useState<TypographyData>({
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: "16",
    lineHeight: "1.5",
    letterSpacing: "0",
    textAlign: "left",
    verticalAlign: "top",
  });

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <TypographySection data={data} onChange={setData} />
        <div style={stateDisplayStyle}>{JSON.stringify(data, null, 2)}</div>
      </div>
    </div>
  );
}
