/**
 * @file Select demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
} from "../../components";
import { Select } from "../../../components/Select/Select";

export function SelectDemo() {
  const [value, setValue] = useState("apple");

  return (
    <DemoContainer title="Select">
      <DemoSection label="Basic Select">
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
      </DemoSection>

      <DemoSection label="With Disabled Option">
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
      </DemoSection>

      <DemoSection label="Disabled">
        <Select
          options={[{ value: "disabled", label: "Cannot change" }]}
          value="disabled"
          onChange={() => {}}
          disabled
          aria-label="Disabled select"
        />
      </DemoSection>
    </DemoContainer>
  );
}
