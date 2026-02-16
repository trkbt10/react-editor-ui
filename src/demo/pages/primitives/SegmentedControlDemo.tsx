/**
 * @file SegmentedControl demo page
 */

import { useState } from "react";
import { DemoContainer, DemoSection, AlignLeftIcon, AlignCenterIcon, AlignRightIcon } from "../../components";
import { SegmentedControl } from "../../../components/SegmentedControl/SegmentedControl";

export function SegmentedControlDemo() {
  const [alignment, setAlignment] = useState("left");
  const [sizes, setSizes] = useState<string[]>(["md"]);

  return (
    <DemoContainer title="SegmentedControl">
      <DemoSection label="With Icons">
        <SegmentedControl
          options={[
            { value: "left", icon: <AlignLeftIcon />, "aria-label": "Align left" },
            { value: "center", icon: <AlignCenterIcon />, "aria-label": "Align center" },
            { value: "right", icon: <AlignRightIcon />, "aria-label": "Align right" },
          ]}
          value={alignment}
          onChange={(v) => setAlignment(v as string)}
          aria-label="Text alignment"
        />
      </DemoSection>

      <DemoSection label="With Labels">
        <SegmentedControl
          options={[
            { value: "sm", label: "S" },
            { value: "md", label: "M" },
            { value: "lg", label: "L" },
            { value: "xl", label: "XL" },
          ]}
          value="md"
          onChange={() => {}}
          aria-label="Size selection"
        />
      </DemoSection>

      <DemoSection label="Multiple Selection">
        <SegmentedControl
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
          value={sizes}
          onChange={(v) => setSizes(v as string[])}
          multiple
          aria-label="Size options"
        />
      </DemoSection>

      <DemoSection label="Sizes">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <SegmentedControl
            options={[
              { value: "a", label: "A" },
              { value: "b", label: "B" },
            ]}
            value="a"
            onChange={() => {}}
            size="sm"
            aria-label="Small control"
          />
          <SegmentedControl
            options={[
              { value: "a", label: "A" },
              { value: "b", label: "B" },
            ]}
            value="a"
            onChange={() => {}}
            size="md"
            aria-label="Medium control"
          />
          <SegmentedControl
            options={[
              { value: "a", label: "A" },
              { value: "b", label: "B" },
            ]}
            value="a"
            onChange={() => {}}
            size="lg"
            aria-label="Large control"
          />
        </div>
      </DemoSection>

      <DemoSection label="Disabled">
        <SegmentedControl
          options={[
            { value: "a", label: "Option A" },
            { value: "b", label: "Option B" },
          ]}
          value="a"
          onChange={() => {}}
          disabled
          aria-label="Disabled control"
        />
      </DemoSection>
    </DemoContainer>
  );
}
