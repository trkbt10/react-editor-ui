/**
 * @file RotationSectionDemo - Demo page for RotationSection
 */

import { useState, useCallback, type CSSProperties } from "react";
import { RotationSection } from "../../../sections/RotationSection/RotationSection";
import type { RotationData } from "../../../sections/RotationSection/types";

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
 * RotationSection demo page.
 */
export function RotationSectionDemo() {
  const [data, setData] = useState<RotationData>({
    rotation: "0",
  });

  const handleTransformAction = useCallback((actionId: string) => {
    if (actionId === "reset") {
      setData({ rotation: "0" });
    }
  }, []);

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <RotationSection
          data={data}
          onChange={setData}
          onTransformAction={handleTransformAction}
        />
        <div style={stateDisplayStyle}>{JSON.stringify(data)}</div>
      </div>
    </div>
  );
}
