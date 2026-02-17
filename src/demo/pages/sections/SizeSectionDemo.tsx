/**
 * @file SizeSectionDemo - Demo page for SizeSection
 */

import { useState, type CSSProperties } from "react";
import { SizeSection } from "../../../sections/SizeSection/SizeSection";
import type { SizeData } from "../../../sections/SizeSection/types";

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
 * SizeSection demo page.
 */
export function SizeSectionDemo() {
  const [data, setData] = useState<SizeData>({
    width: "300",
    height: "200",
  });

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <SizeSection data={data} onChange={setData} />
        <div style={stateDisplayStyle}>{JSON.stringify(data)}</div>
      </div>
    </div>
  );
}
