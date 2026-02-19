/**
 * @file AlignObjectsSectionDemo - Demo page for AlignObjectsSection
 */

import { type CSSProperties } from "react";
import { AlignObjectsSection } from "../../../sections/AlignObjectsSection/AlignObjectsSection";
import type { HorizontalAlign, VerticalAlign } from "../../../sections/AlignObjectsSection/types";

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
 * AlignObjectsSection demo page.
 */
export function AlignObjectsSectionDemo() {
  const handleAlignHorizontal = (align: HorizontalAlign) => {
    console.log("Align horizontal:", align);
  };

  const handleAlignVertical = (align: VerticalAlign) => {
    console.log("Align vertical:", align);
  };

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <AlignObjectsSection
          onAlignHorizontal={handleAlignHorizontal}
          onAlignVertical={handleAlignVertical}
        />
        <div style={logStyle}>Click buttons to see console logs</div>
      </div>
    </div>
  );
}
