/**
 * @file GradientSection demo page
 */

import { useState } from "react";
import { DemoContainer, DemoSection } from "../../components";
import { GradientSection } from "../../../sections/GradientSection/GradientSection";
import { createDefaultGradient } from "../../../utils/gradient/utils";
import type { GradientValue, GradientStop } from "../../../utils/gradient/types";

function getGradientBackground(gradient: GradientValue): string {
  const stops = gradient.stops.map((s: GradientStop) => `${s.color.hex} ${s.position}%`).join(", ");
  return `linear-gradient(${gradient.angle}deg, ${stops})`;
}

export function GradientSectionDemo() {
  const [gradient, setGradient] = useState<GradientValue>(createDefaultGradient());

  return (
    <DemoContainer title="GradientSection">
      <DemoSection label="Basic">
        <div style={{ width: 280 }}>
          <GradientSection value={gradient} onChange={setGradient} />
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
          <GradientSection value={gradient} onChange={() => {}} disabled />
        </div>
      </DemoSection>
    </DemoContainer>
  );
}
