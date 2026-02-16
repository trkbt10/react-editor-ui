/**
 * @file PropertySection demo page
 */

import { useState } from "react";
import {
  demoContainerStyle,
  demoSectionStyle,
  demoLabelStyle,
} from "../../components";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import { ColorInput } from "../../../components/ColorInput/ColorInput";
import { PropertyRow } from "../../../components/PropertyRow/PropertyRow";
import { PropertySection } from "../../../components/PropertySection/PropertySection";
import { PropertyGrid } from "../../../components/PropertyGrid/PropertyGrid";
import { PropertyGridItem } from "../../../components/PropertyGrid/PropertyGridItem";

export function PropertySectionDemo() {
  const [expanded1, setExpanded1] = useState(true);
  const [expanded2, setExpanded2] = useState(true);

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>PropertySection</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic Section</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <PropertySection title="Properties">
            <PropertyRow label="Name">MyComponent</PropertyRow>
            <PropertyRow label="Type">UIView</PropertyRow>
          </PropertySection>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Collapsible</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <PropertySection
            title="Layout"
            collapsible
            expanded={expanded1}
            onToggle={setExpanded1}
          >
            <PropertyGrid>
              <PropertyGridItem>
                <Input value="0" onChange={() => {}} prefix="X" aria-label="X" />
              </PropertyGridItem>
              <PropertyGridItem>
                <Input value="0" onChange={() => {}} prefix="Y" aria-label="Y" />
              </PropertyGridItem>
            </PropertyGrid>
          </PropertySection>
          <PropertySection
            title="Appearance"
            collapsible
            expanded={expanded2}
            onToggle={setExpanded2}
          >
            <ColorInput
              value={{ hex: "#3b82f6", opacity: 100, visible: true }}
              onChange={() => {}}
            />
          </PropertySection>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Action</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <PropertySection
            title="Effects"
            collapsible
            action={<Button size="sm" variant="ghost">+ Add</Button>}
          >
            <div style={{ color: "var(--rei-color-text-muted)", fontSize: "12px" }}>
              No effects applied
            </div>
          </PropertySection>
        </div>
      </div>
    </div>
  );
}
