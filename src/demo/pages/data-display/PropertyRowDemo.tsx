/**
 * @file PropertyRow demo page
 */

import {
  demoContainerStyle,
  demoSectionStyle,
  demoLabelStyle,
} from "../../components";
import { PropertyRow } from "../../../components/PropertyRow/PropertyRow";

export function PropertyRowDemo() {
  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>PropertyRow</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic Properties</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <PropertyRow label="Name">MyComponent</PropertyRow>
          <PropertyRow label="Type">UIView</PropertyRow>
          <PropertyRow label="Position">x: 100, y: 200</PropertyRow>
          <PropertyRow label="Size">width: 300, height: 150</PropertyRow>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Clickable Row</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <PropertyRow label="Action" onClick={() => alert("Clicked!")}>
            Click to edit
          </PropertyRow>
        </div>
      </div>
    </div>
  );
}
