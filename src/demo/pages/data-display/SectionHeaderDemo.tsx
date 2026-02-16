/**
 * @file SectionHeader demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoSurface,
  DemoMutedText,
} from "../../components";
import { SectionHeader } from "../../../components/SectionHeader/SectionHeader";
import { Button } from "../../../components/Button/Button";

function renderSectionContent(expanded: boolean) {
  if (!expanded) {
    return null;
  }
  return (
    <div style={{ padding: "8px 12px" }}>
      <DemoMutedText size={12}>
        Section content here...
      </DemoMutedText>
    </div>
  );
}

export function SectionHeaderDemo() {
  const [expanded, setExpanded] = useState(true);

  return (
    <DemoContainer title="SectionHeader">
      <DemoSection label="Static Header">
        <DemoSurface>
          <SectionHeader title="Properties" />
        </DemoSurface>
      </DemoSection>

      <DemoSection label="Collapsible (Controlled)">
        <DemoSurface>
          <SectionHeader
            title="Appearance"
            collapsible
            expanded={expanded}
            onToggle={setExpanded}
          />
          {renderSectionContent(expanded)}
        </DemoSurface>
      </DemoSection>

      <DemoSection label="With Action">
        <DemoSurface>
          <SectionHeader
            title="Layers"
            collapsible
            action={<Button size="sm" variant="ghost">+ Add</Button>}
          />
        </DemoSurface>
      </DemoSection>
    </DemoContainer>
  );
}
