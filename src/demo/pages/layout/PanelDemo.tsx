/**
 * @file Panel demo page
 */

import {
  demoContainerStyle,
  demoSectionStyle,
  demoLabelStyle,
} from "../../components";
import { Panel } from "../../../components/Panel/Panel";
import { PropertyRow } from "../../../components/PropertyRow/PropertyRow";

export function PanelDemo() {
  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>Panel</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic Panel</div>
        <Panel title="Settings" onClose={() => alert("Close clicked")}>
          <div style={{ color: "var(--rei-color-text)", fontSize: "12px" }}>
            Panel content goes here
          </div>
        </Panel>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Without Close Button</div>
        <Panel title="Information" width={280}>
          <PropertyRow label="Name">Component</PropertyRow>
          <PropertyRow label="Type">UIView</PropertyRow>
        </Panel>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Custom Width</div>
        <Panel title="Wide Panel" width={400} onClose={() => {}}>
          <div style={{ color: "var(--rei-color-text)", fontSize: "12px" }}>
            This panel has a custom width of 400px
          </div>
        </Panel>
      </div>
    </div>
  );
}
