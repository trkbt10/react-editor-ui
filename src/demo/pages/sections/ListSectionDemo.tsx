/**
 * @file ListSectionDemo - Demo page for ListSection
 */

import { useState, type CSSProperties } from "react";
import { ListSection } from "../../../sections/ListSection/ListSection";
import type { ListData } from "../../../sections/ListSection/types";

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
 * ListSection demo page.
 */
export function ListSectionDemo() {
  const [data, setData] = useState<ListData>({
    type: "none",
    style: "",
  });

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <ListSection data={data} onChange={setData} />
        <div style={stateDisplayStyle}>{JSON.stringify(data, null, 2)}</div>
      </div>
    </div>
  );
}
