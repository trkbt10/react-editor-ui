/**
 * @file TextJustifySectionDemo - Demo page for TextJustifySection
 */

import { useState, type CSSProperties } from "react";
import { TextJustifySection } from "../../../sections/TextJustifySection/TextJustifySection";
import type { TextJustifyData } from "../../../sections/TextJustifySection/types";

const containerStyle: CSSProperties = {
  padding: 24,
  maxWidth: 400,
};

const sectionWrapperStyle: CSSProperties = {
  padding: 16,
  backgroundColor: "var(--rei-color-surface)",
  borderRadius: 8,
  border: "1px solid var(--rei-color-border)",
  marginBottom: 16,
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

const headingStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 8,
  color: "var(--rei-color-text)",
};

/**
 * TextJustifySection demo page.
 */
export function TextJustifySectionDemo() {
  const [data, setData] = useState<TextJustifyData>({
    align: "left",
  });

  const [dataExtended, setDataExtended] = useState<TextJustifyData>({
    align: "left",
  });

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <div style={headingStyle}>Basic</div>
        <TextJustifySection data={data} onChange={setData} />
        <div style={stateDisplayStyle}>{JSON.stringify(data)}</div>
      </div>
      <div style={sectionWrapperStyle}>
        <div style={headingStyle}>Extended (with justify variants)</div>
        <TextJustifySection data={dataExtended} onChange={setDataExtended} extended />
        <div style={stateDisplayStyle}>{JSON.stringify(dataExtended)}</div>
      </div>
    </div>
  );
}
