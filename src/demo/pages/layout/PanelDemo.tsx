/**
 * @file Panel demo page
 */

import {
  DemoContainer,
  DemoSection,
  DemoMutedText,
} from "../../components";
import { Panel } from "../../../panels/Panel/Panel";
import { PropertyRow } from "../../../components/PropertyRow/PropertyRow";

export function PanelDemo() {
  return (
    <DemoContainer title="Panel">
      <DemoSection label="Basic Panel">
        <Panel title="Settings" onClose={() => alert("Close clicked")}>
          <DemoMutedText size={12}>
            Panel content goes here
          </DemoMutedText>
        </Panel>
      </DemoSection>

      <DemoSection label="Without Close Button">
        <Panel title="Information" width={280}>
          <PropertyRow label="Name">Component</PropertyRow>
          <PropertyRow label="Type">UIView</PropertyRow>
        </Panel>
      </DemoSection>

      <DemoSection label="Custom Width">
        <Panel title="Wide Panel" width={400} onClose={() => {}}>
          <DemoMutedText size={12}>
            This panel has a custom width of 400px
          </DemoMutedText>
        </Panel>
      </DemoSection>
    </DemoContainer>
  );
}
