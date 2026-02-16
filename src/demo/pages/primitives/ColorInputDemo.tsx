/**
 * @file ColorInput demo page
 */

import { useState } from "react";
import { DemoContainer, DemoSection } from "../../components";
import { ColorInput } from "../../../components/ColorInput/ColorInput";
import type { ColorValue } from "../../../components/ColorInput/ColorInput";

export function ColorInputDemo() {
  const [colorValue, setColorValue] = useState<ColorValue>({
    hex: "#3b82f6",
    opacity: 100,
    visible: true,
  });

  return (
    <DemoContainer title="ColorInput">
      <DemoSection label="Basic">
        <ColorInput value={colorValue} onChange={setColorValue} />
      </DemoSection>

      <DemoSection label="With Remove Button">
        <ColorInput
          value={{ hex: "#ef4444", opacity: 75, visible: true }}
          onChange={() => {}}
          showRemove
          onRemove={() => alert("Remove clicked")}
        />
      </DemoSection>

      <DemoSection label="Without Visibility Toggle">
        <ColorInput
          value={{ hex: "#22c55e", opacity: 100, visible: true }}
          onChange={() => {}}
          showVisibilityToggle={false}
        />
      </DemoSection>

      <DemoSection label="Sizes">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <ColorInput
            value={{ hex: "#8b5cf6", opacity: 100, visible: true }}
            onChange={() => {}}
            size="sm"
          />
          <ColorInput
            value={{ hex: "#8b5cf6", opacity: 100, visible: true }}
            onChange={() => {}}
            size="md"
          />
          <ColorInput
            value={{ hex: "#8b5cf6", opacity: 100, visible: true }}
            onChange={() => {}}
            size="lg"
          />
        </div>
      </DemoSection>

      <DemoSection label="Disabled">
        <ColorInput
          value={{ hex: "#6b7280", opacity: 50, visible: false }}
          onChange={() => {}}
          disabled
        />
      </DemoSection>
    </DemoContainer>
  );
}
