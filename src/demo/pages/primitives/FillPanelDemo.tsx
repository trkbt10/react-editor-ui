/**
 * @file FillPanel demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoStateDisplay,
} from "../../components";
import { FillPanel } from "../../../panels/FillPanel/FillPanel";
import type { FillValue } from "../../../panels/FillPanel/types";
import type { GradientStop } from "../../../utils/gradient/types";

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

export function FillPanelDemo() {
  const [fill, setFill] = useState<FillValue>({
    type: "solid",
    color: { hex: "#3b82f6", opacity: 100, visible: true },
  });

  return (
    <DemoContainer title="FillPanel">
      <DemoSection label="Fill Type Selection">
        <div style={{ width: 280 }}>
          <FillPanel value={fill} onChange={setFill} />
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
