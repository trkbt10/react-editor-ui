/**
 * @file Checkbox demo page
 */

import { useState } from "react";
import { DemoContainer, DemoSection, DemoRow } from "../../components";
import { Checkbox } from "../../../components/Checkbox/Checkbox";

export function CheckboxDemo() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [checked3, setChecked3] = useState(false);
  const [switch1, setSwitch1] = useState(false);
  const [switch2, setSwitch2] = useState(true);

  return (
    <DemoContainer title="Checkbox">
      <DemoSection label="Basic">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Checkbox
            checked={checked1}
            onChange={setChecked1}
            label="Clip content"
          />
          <Checkbox
            checked={checked2}
            onChange={setChecked2}
            label="Show in exports"
          />
        </div>
      </DemoSection>

      <DemoSection label="Sizes">
        <DemoRow>
          <Checkbox checked onChange={() => {}} label="Small" size="sm" />
          <Checkbox checked onChange={() => {}} label="Medium" size="md" />
        </DemoRow>
      </DemoSection>

      <DemoSection label="Indeterminate">
        <Checkbox
          checked={checked3}
          onChange={setChecked3}
          indeterminate
          label="Select all"
        />
      </DemoSection>

      <DemoSection label="Disabled">
        <DemoRow>
          <Checkbox checked={false} onChange={() => {}} label="Disabled unchecked" disabled />
          <Checkbox checked onChange={() => {}} label="Disabled checked" disabled />
        </DemoRow>
      </DemoSection>

      <h2 style={{ margin: "24px 0 0 0", color: "var(--rei-color-text, #e4e6eb)" }}>Switch</h2>

      <DemoSection label="Basic">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Checkbox
            variant="switch"
            checked={switch1}
            onChange={setSwitch1}
            label="Dark mode"
          />
          <Checkbox
            variant="switch"
            checked={switch2}
            onChange={setSwitch2}
            label="Notifications"
          />
        </div>
      </DemoSection>

      <DemoSection label="Sizes">
        <DemoRow>
          <Checkbox variant="switch" checked onChange={() => {}} label="Small" size="sm" />
          <Checkbox variant="switch" checked onChange={() => {}} label="Medium" size="md" />
        </DemoRow>
      </DemoSection>

      <DemoSection label="States">
        <DemoRow>
          <Checkbox variant="switch" checked={false} onChange={() => {}} label="Off" />
          <Checkbox variant="switch" checked onChange={() => {}} label="On" />
        </DemoRow>
      </DemoSection>

      <DemoSection label="Disabled">
        <DemoRow>
          <Checkbox variant="switch" checked={false} onChange={() => {}} label="Disabled off" disabled />
          <Checkbox variant="switch" checked onChange={() => {}} label="Disabled on" disabled />
        </DemoRow>
      </DemoSection>
    </DemoContainer>
  );
}
