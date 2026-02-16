/**
 * @file PropertyRow demo page
 */

import {
  DemoContainer,
  DemoSection,
  DemoSurface,
} from "../../components";
import { PropertyRow } from "../../../components/PropertyRow/PropertyRow";

export function PropertyRowDemo() {
  return (
    <DemoContainer title="PropertyRow">
      <DemoSection label="Basic Properties">
        <DemoSurface>
          <PropertyRow label="Name">MyComponent</PropertyRow>
          <PropertyRow label="Type">UIView</PropertyRow>
          <PropertyRow label="Position">x: 100, y: 200</PropertyRow>
          <PropertyRow label="Size">width: 300, height: 150</PropertyRow>
        </DemoSurface>
      </DemoSection>

      <DemoSection label="Clickable Row">
        <DemoSurface>
          <PropertyRow label="Action" onClick={() => alert("Clicked!")}>
            Click to edit
          </PropertyRow>
        </DemoSurface>
      </DemoSection>
    </DemoContainer>
  );
}
