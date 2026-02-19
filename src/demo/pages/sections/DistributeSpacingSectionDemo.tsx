/**
 * @file DistributeSpacingSectionDemo - Demo page for DistributeSpacingSection
 */

import { useState, type CSSProperties } from "react";
import { DistributeSpacingSection } from "../../../sections/DistributeSpacingSection/DistributeSpacingSection";
import type { DistributeSpacingData } from "../../../sections/DistributeSpacingSection/types";

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
 * DistributeSpacingSection demo page.
 */
export function DistributeSpacingSectionDemo() {
  const [data, setData] = useState<DistributeSpacingData>({
    horizontal: false,
    vertical: false,
    spacing: "0 pt",
    alignTo: "selection",
  });

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <DistributeSpacingSection
          data={data}
          onChange={setData}
          onApplyHorizontal={() => console.log("Apply horizontal spacing")}
          onApplyVertical={() => console.log("Apply vertical spacing")}
        />
        <div style={stateDisplayStyle}>{JSON.stringify(data, null, 2)}</div>
      </div>
    </div>
  );
}
