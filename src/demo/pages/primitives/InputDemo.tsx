/**
 * @file Input demo page
 */

import { useState } from "react";
import { DemoContainer, DemoSection, SearchIcon } from "../../components";
import { Input } from "../../../components/Input/Input";

export function InputDemo() {
  const [value, setValue] = useState("");
  const [searchValue, setSearchValue] = useState("example search");

  return (
    <DemoContainer title="Input">
      <DemoSection label="Basic">
        <Input
          value={value}
          onChange={setValue}
          placeholder="Type something..."
          aria-label="Basic input"
        />
      </DemoSection>

      <DemoSection label="With Icons">
        <Input
          value={searchValue}
          onChange={setSearchValue}
          iconStart={<SearchIcon />}
          placeholder="Search..."
          aria-label="Search input"
        />
      </DemoSection>

      <DemoSection label="Clearable">
        <Input
          value={searchValue}
          onChange={setSearchValue}
          clearable
          placeholder="Clearable input"
          aria-label="Clearable input"
        />
      </DemoSection>

      <DemoSection label="Sizes">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Input value="" onChange={() => {}} size="sm" placeholder="Small" aria-label="Small" />
          <Input value="" onChange={() => {}} size="md" placeholder="Medium" aria-label="Medium" />
          <Input value="" onChange={() => {}} size="lg" placeholder="Large" aria-label="Large" />
        </div>
      </DemoSection>

      <DemoSection label="Disabled">
        <Input
          value="Disabled value"
          onChange={() => {}}
          disabled
          aria-label="Disabled input"
        />
      </DemoSection>
    </DemoContainer>
  );
}
