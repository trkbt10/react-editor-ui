/**
 * @file GradientEditor demo page
 */

import { useState } from "react";
import { DemoContainer, DemoSection } from "../../components";
import { GradientEditor } from "../../../components/GradientEditor/GradientEditor";
import { createDefaultGradient } from "../../../components/GradientEditor/gradientUtils";
import type { GradientValue, GradientStop } from "../../../components/GradientEditor/gradientTypes";

function getGradientBackground(gradient: GradientValue): string {
  const stops = gradient.stops.map((s: GradientStop) => `${s.color.hex} ${s.position}%`).join(", ");
  return `linear-gradient(${gradient.angle}deg, ${stops})`;
}

export function GradientEditorDemo() {
  const [gradient, setGradient] = useState<GradientValue>(createDefaultGradient());

  return (
    <DemoContainer title="GradientEditor">
      <DemoSection label="Basic">
        <div style={{ width: 280 }}>
          <GradientEditor value={gradient} onChange={setGradient} />
        </div>
      </DemoSection>

      <DemoSection label="Preview">
        <div
          style={{
            width: 280,
            height: 80,
            borderRadius: "4px",
            background: getGradientBackground(gradient),
            border: "1px solid var(--rei-color-border)",
          }}
        />
      </DemoSection>

      <DemoSection label="Disabled">
        <div style={{ width: 280 }}>
          <GradientEditor value={gradient} onChange={() => {}} disabled />
        </div>
      </DemoSection>
    </DemoContainer>
  );
}
