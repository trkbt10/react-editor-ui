/**
 * @file ColorPicker demo page
 */

import { useState } from "react";
import { DemoContainer, DemoSection } from "../../components";
import { ColorPicker } from "../../../components/ColorPicker/ColorPicker";

export function ColorPickerDemo() {
  const [color, setColor] = useState("#3b82f6");

  return (
    <DemoContainer title="ColorPicker">
      <DemoSection label="Basic">
        <ColorPicker value={color} onChange={setColor} />
      </DemoSection>

      <DemoSection label={`Selected Color: ${color}`}>
        <div
          style={{
            width: 100,
            height: 40,
            backgroundColor: color,
            borderRadius: "4px",
            border: "1px solid var(--rei-color-border)",
          }}
        />
      </DemoSection>

      <DemoSection label="Custom Presets">
        <ColorPicker
          value="#ef4444"
          onChange={() => {}}
          presetColors={["#ef4444", "#22c55e", "#3b82f6", "#8b5cf6"]}
        />
      </DemoSection>
    </DemoContainer>
  );
}
