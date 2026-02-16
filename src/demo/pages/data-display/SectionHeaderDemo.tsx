/**
 * @file SectionHeader demo page
 */

import { useState } from "react";
import {
  demoContainerStyle,
  demoSectionStyle,
  demoLabelStyle,
} from "../../components";
import { SectionHeader } from "../../../components/SectionHeader/SectionHeader";
import { Button } from "../../../components/Button/Button";

function renderSectionContent(expanded: boolean) {
  if (!expanded) {
    return null;
  }
  return (
    <div
      style={{
        padding: "8px 12px",
        color: "var(--rei-color-text-muted, #9ca3af)",
        fontSize: "12px",
      }}
    >
      Section content here...
    </div>
  );
}

export function SectionHeaderDemo() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>SectionHeader</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Static Header</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <SectionHeader title="Properties" />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Collapsible (Controlled)</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <SectionHeader
            title="Appearance"
            collapsible
            expanded={expanded}
            onToggle={setExpanded}
          />
          {renderSectionContent(expanded)}
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Action</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <SectionHeader
            title="Layers"
            collapsible
            action={<Button size="sm" variant="ghost">+ Add</Button>}
          />
        </div>
      </div>
    </div>
  );
}
