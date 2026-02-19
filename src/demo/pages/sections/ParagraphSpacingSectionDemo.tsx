/**
 * @file ParagraphSpacingSectionDemo - Demo page for ParagraphSpacingSection
 */

import { useState, type CSSProperties } from "react";
import { ParagraphSpacingSection } from "../../../sections/ParagraphSpacingSection/ParagraphSpacingSection";
import type { ParagraphSpacingData } from "../../../sections/ParagraphSpacingSection/types";

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
 * ParagraphSpacingSection demo page.
 */
export function ParagraphSpacingSectionDemo() {
  const [data, setData] = useState<ParagraphSpacingData>({
    before: "0 pt",
    after: "12 pt",
    hyphenate: false,
  });

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <ParagraphSpacingSection data={data} onChange={setData} />
        <div style={stateDisplayStyle}>{JSON.stringify(data, null, 2)}</div>
      </div>
    </div>
  );
}
