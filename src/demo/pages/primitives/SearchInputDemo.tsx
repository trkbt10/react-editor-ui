/**
 * @file SearchInput demo page
 */

import { useState } from "react";
import { DemoContainer, DemoSection } from "../../components";
import { SearchInput } from "../../../components/SearchInput/SearchInput";

export function SearchInputDemo() {
  const [value, setValue] = useState("");
  const [withValue, setWithValue] = useState("example query");

  return (
    <DemoContainer title="SearchInput">
      <DemoSection label="Basic">
        <SearchInput
          value={value}
          onChange={setValue}
          placeholder="Search..."
        />
      </DemoSection>

      <DemoSection label="With Value (Clear Button)">
        <SearchInput
          value={withValue}
          onChange={setWithValue}
          placeholder="Search..."
        />
      </DemoSection>

      <DemoSection label="Sizes">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <SearchInput value="" onChange={() => {}} size="sm" placeholder="Small" />
          <SearchInput value="" onChange={() => {}} size="md" placeholder="Medium" />
          <SearchInput value="" onChange={() => {}} size="lg" placeholder="Large" />
        </div>
      </DemoSection>

      <DemoSection label="Disabled">
        <SearchInput
          value="Disabled search"
          onChange={() => {}}
          disabled
        />
      </DemoSection>
    </DemoContainer>
  );
}
