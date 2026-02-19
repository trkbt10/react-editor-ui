/**
 * @file IndentSectionDemo - Demo page for IndentSection
 */

import { useState, type CSSProperties } from "react";
import { IndentSection } from "../../../sections/IndentSection/IndentSection";
import type { IndentData } from "../../../sections/IndentSection/types";

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
 * IndentSection demo page.
 */
export function IndentSectionDemo() {
  const [data, setData] = useState<IndentData>({
    left: "0 pt",
    right: "0 pt",
    firstLine: "0 pt",
  });

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <IndentSection
          data={data}
          onChange={setData}
          onIncrease={() => console.log("Increase indent")}
          onDecrease={() => console.log("Decrease indent")}
        />
        <div style={stateDisplayStyle}>{JSON.stringify(data, null, 2)}</div>
      </div>
    </div>
  );
}
