/**
 * @file PanelFrame demo page
 */

import {
  DemoContainer,
  DemoSection,
  DemoMutedText,
} from "../../components";
import { PanelFrame } from "../../../components/PanelFrame/PanelFrame";
import { PropertyRow } from "../../../components/PropertyRow/PropertyRow";

export function PanelDemo() {
  return (
    <DemoContainer title="PanelFrame">
      <DemoSection label="Basic PanelFrame">
        <PanelFrame title="Settings" onClose={() => alert("Close clicked")}>
          <DemoMutedText size={12}>
            Panel content goes here
          </DemoMutedText>
        </PanelFrame>
      </DemoSection>

      <DemoSection label="Without Close Button">
        <PanelFrame title="Information" width={280}>
          <PropertyRow label="Name">Component</PropertyRow>
          <PropertyRow label="Type">UIView</PropertyRow>
        </PanelFrame>
      </DemoSection>

      <DemoSection label="Custom Width">
        <PanelFrame title="Wide Panel" width={400} onClose={() => {}}>
          <DemoMutedText size={12}>
            This panel has a custom width of 400px
          </DemoMutedText>
        </PanelFrame>
      </DemoSection>
    </DemoContainer>
  );
}
