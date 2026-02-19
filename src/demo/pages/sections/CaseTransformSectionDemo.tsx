/**
 * @file CaseTransformSectionDemo - Demo page for CaseTransformSection
 */

import { useState, type CSSProperties } from "react";
import { CaseTransformSection } from "../../../sections/CaseTransformSection/CaseTransformSection";
import type { CaseTransformData } from "../../../sections/CaseTransformSection/types";

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
 * CaseTransformSection demo page.
 */
export function CaseTransformSectionDemo() {
  const [data, setData] = useState<CaseTransformData>({
    case: "normal",
    styles: [],
  });

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <CaseTransformSection data={data} onChange={setData} />
        <div style={stateDisplayStyle}>{JSON.stringify(data, null, 2)}</div>
      </div>
    </div>
  );
}
