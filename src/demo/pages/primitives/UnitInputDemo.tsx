/**
 * @file UnitInput demo page
 */

import { useState } from "react";
import { DemoContainer, DemoSection } from "../../components";
import { UnitInput } from "../../../components/UnitInput/UnitInput";

export function UnitInputDemo() {
  const [width, setWidth] = useState("100px");
  const [height, setHeight] = useState("Auto");
  const [fontSize, setFontSize] = useState("16px");
  const [lineHeight, setLineHeight] = useState("1.5em");
  const [opacity, setOpacity] = useState("100%");

  return (
    <DemoContainer title="UnitInput">
      <DemoSection
        label="Basic (with wheel &amp; arrow key support)"
        note="Focus and use mouse wheel or arrow keys to adjust value. Hold Shift for larger steps."
      >
        <div style={{ width: 200 }}>
          <UnitInput
            value={width}
            onChange={setWidth}
            units={[
              { value: "px", label: "px" },
              { value: "%", label: "%" },
              { value: "em", label: "em" },
              { value: "rem", label: "rem" },
            ]}
            aria-label="Width"
          />
        </div>
      </DemoSection>

      <DemoSection
        label="With Auto support (click unit to cycle)"
        note="Click the unit button to cycle through: px -> % -> em -> Auto"
      >
        <div style={{ width: 200 }}>
          <UnitInput
            value={height}
            onChange={setHeight}
            units={[
              { value: "px", label: "px" },
              { value: "%", label: "%" },
              { value: "em", label: "em" },
            ]}
            allowAuto
            aria-label="Height"
          />
        </div>
      </DemoSection>

      <DemoSection label="Custom units">
        <div style={{ width: 200 }}>
          <UnitInput
            value={fontSize}
            onChange={setFontSize}
            units={[
              { value: "px", label: "px" },
              { value: "pt", label: "pt" },
              { value: "em", label: "em" },
              { value: "rem", label: "rem" },
            ]}
            aria-label="Font size"
          />
        </div>
      </DemoSection>

      <DemoSection
        label="With min/max constraints"
        note="Constrained between 0% and 100%"
      >
        <div style={{ width: 200 }}>
          <UnitInput
            value={opacity}
            onChange={setOpacity}
            units={[{ value: "%", label: "%" }]}
            min={0}
            max={100}
            aria-label="Opacity"
          />
        </div>
      </DemoSection>

      <DemoSection
        label="Custom step values"
        note="Step: 0.1, Shift+Step: 0.5"
      >
        <div style={{ width: 200 }}>
          <UnitInput
            value={lineHeight}
            onChange={setLineHeight}
            units={[
              { value: "em", label: "em" },
              { value: "", label: "—" },
            ]}
            step={0.1}
            shiftStep={0.5}
            aria-label="Line height"
          />
        </div>
      </DemoSection>

      <DemoSection
        label="Many units (dropdown mode)"
        note="With 5+ units, clicking shows a dropdown instead of cycling"
      >
        <div style={{ width: 200 }}>
          <UnitInput
            value="100px"
            onChange={(v) => console.log("Many units:", v)}
            units={[
              { value: "px", label: "px" },
              { value: "%", label: "%" },
              { value: "em", label: "em" },
              { value: "rem", label: "rem" },
              { value: "vw", label: "vw" },
              { value: "vh", label: "vh" },
              { value: "ch", label: "ch" },
            ]}
            aria-label="Many units"
          />
        </div>
      </DemoSection>

      <DemoSection label="Sizes">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: 200 }}>
          <UnitInput value="10px" onChange={() => {}} size="sm" aria-label="Small" />
          <UnitInput value="10px" onChange={() => {}} size="md" aria-label="Medium" />
          <UnitInput value="10px" onChange={() => {}} size="lg" aria-label="Large" />
        </div>
      </DemoSection>

      <DemoSection label="Disabled">
        <div style={{ width: 200 }}>
          <UnitInput
            value="100px"
            onChange={() => {}}
            disabled
            aria-label="Disabled"
          />
        </div>
      </DemoSection>
    </DemoContainer>
  );
}
