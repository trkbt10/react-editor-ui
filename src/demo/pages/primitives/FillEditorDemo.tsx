/**
 * @file FillEditor demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoStateDisplay,
} from "../../components";
import { FillEditor } from "../../../components/FillEditor/FillEditor";
import type { FillValue } from "../../../components/FillEditor/fillTypes";
import type { GradientStop } from "../../../components/GradientEditor/gradientTypes";

function getFillBackground(fill: FillValue): string {
  switch (fill.type) {
    case "solid": {
      return fill.color.hex;
    }
    case "gradient": {
      const stops = fill.gradient.stops.map((s: GradientStop) => `${s.color.hex} ${s.position}%`).join(", ");
      return `linear-gradient(${fill.gradient.angle}deg, ${stops})`;
    }
    case "image": {
      if (fill.image.url) {
        return `url(${fill.image.url})`;
      }
      return "#808080";
    }
    case "pattern": {
      if (fill.pattern.sourceUrl) {
        return `url(${fill.pattern.sourceUrl})`;
      }
      return "#808080";
    }
    case "video": {
      return "#1a1a2e";
    }
  }
}

export function FillEditorDemo() {
  const [fill, setFill] = useState<FillValue>({
    type: "solid",
    color: { hex: "#3b82f6", opacity: 100, visible: true },
  });

  return (
    <DemoContainer title="FillEditor">
      <DemoSection label="Solid/Gradient Toggle">
        <div style={{ width: 280 }}>
          <FillEditor value={fill} onChange={setFill} />
        </div>
      </DemoSection>

      <DemoSection label="Preview">
        <div
          style={{
            width: 280,
            height: 80,
            borderRadius: "4px",
            background: getFillBackground(fill),
            border: "1px solid var(--rei-color-border)",
          }}
        />
      </DemoSection>

      <DemoSection label="Current State">
        <DemoStateDisplay value={fill} />
      </DemoSection>
    </DemoContainer>
  );
}
