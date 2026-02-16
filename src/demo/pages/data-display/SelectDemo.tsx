/**
 * @file Select demo page
 */

import { useState } from "react";
import {
  demoContainerStyle,
  demoSectionStyle,
  demoLabelStyle,
} from "../../components";
import { Select } from "../../../components/Select/Select";

export function SelectDemo() {
  const [value, setValue] = useState("apple");

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>Select</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic Select</div>
        <Select
          options={[
            { value: "apple", label: "Apple" },
            { value: "banana", label: "Banana" },
            { value: "cherry", label: "Cherry" },
          ]}
          value={value}
          onChange={setValue}
          aria-label="Select fruit"
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Disabled Option</div>
        <Select
          options={[
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large", disabled: true },
          ]}
          value="medium"
          onChange={() => {}}
          aria-label="Select size"
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Disabled</div>
        <Select
          options={[{ value: "disabled", label: "Cannot change" }]}
          value="disabled"
          onChange={() => {}}
          disabled
          aria-label="Disabled select"
        />
      </div>
    </div>
  );
}
