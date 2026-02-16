/**
 * @file PropertySection demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoSurface,
  DemoMutedText,
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
    <DemoContainer title="PropertySection">
      <DemoSection label="Basic Section">
        <DemoSurface>
          <PropertySection title="Properties">
            <PropertyRow label="Name">MyComponent</PropertyRow>
            <PropertyRow label="Type">UIView</PropertyRow>
          </PropertySection>
        </DemoSurface>
      </DemoSection>

      <DemoSection label="Collapsible">
        <DemoSurface>
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
        </DemoSurface>
      </DemoSection>

      <DemoSection label="With Action">
        <DemoSurface>
          <PropertySection
            title="Effects"
            collapsible
            action={<Button size="sm" variant="ghost">+ Add</Button>}
          >
            <DemoMutedText size={12}>
              No effects applied
            </DemoMutedText>
          </PropertySection>
        </DemoSurface>
      </DemoSection>
    </DemoContainer>
  );
}
