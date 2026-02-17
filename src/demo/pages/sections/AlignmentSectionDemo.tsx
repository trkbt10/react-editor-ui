/**
 * @file AlignmentSectionDemo - Demo page for AlignmentSection
 */

import { useState, type CSSProperties } from "react";
import { AlignmentSection } from "../../../sections/AlignmentSection/AlignmentSection";
import type { AlignmentData } from "../../../sections/AlignmentSection/types";

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
 * AlignmentSection demo page.
 */
export function AlignmentSectionDemo() {
  const [data, setData] = useState<AlignmentData>({
    horizontal: "left",
    vertical: "top",
  });

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <AlignmentSection data={data} onChange={setData} />
        <div style={stateDisplayStyle}>{JSON.stringify(data)}</div>
      </div>
    </div>
  );
}
