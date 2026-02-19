/**
 * @file DistributeObjectsSectionDemo - Demo page for DistributeObjectsSection
 */

import { type CSSProperties } from "react";
import { DistributeObjectsSection } from "../../../sections/DistributeObjectsSection/DistributeObjectsSection";
import type { DistributeHorizontal, DistributeVertical } from "../../../sections/DistributeObjectsSection/types";

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

const logStyle: CSSProperties = {
  marginTop: 12,
  padding: 8,
  backgroundColor: "var(--rei-color-surface-raised)",
  borderRadius: 4,
  fontSize: 11,
  fontFamily: "monospace",
  color: "var(--rei-color-text-muted)",
  maxHeight: 100,
  overflow: "auto",
};

/**
 * DistributeObjectsSection demo page.
 */
export function DistributeObjectsSectionDemo() {
  const handleDistributeHorizontal = (dist: DistributeHorizontal) => {
    console.log("Distribute horizontal:", dist);
  };

  const handleDistributeVertical = (dist: DistributeVertical) => {
    console.log("Distribute vertical:", dist);
  };

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <DistributeObjectsSection
          onDistributeHorizontal={handleDistributeHorizontal}
          onDistributeVertical={handleDistributeVertical}
        />
        <div style={logStyle}>Click buttons to see console logs</div>
      </div>
    </div>
  );
}
