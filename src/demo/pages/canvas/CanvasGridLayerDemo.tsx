/**
 * @file CanvasGridLayer demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoMutedText,
} from "../../components";
import { Canvas } from "../../../canvas/Canvas/Canvas";
import { CanvasGridLayer } from "../../../canvas/CanvasGridLayer/CanvasGridLayer";
import type { ViewportState } from "../../../canvas/core/types";

export function CanvasGridLayerDemo() {
  const [viewport, setViewport] = useState<ViewportState>({ x: -100, y: -100, scale: 1 });

  return (
    <DemoContainer title="CanvasGridLayer">
      <DemoMutedText>
        SVG grid layer for Canvas. Renders minor grid lines, major grid lines, and origin axes.
      </DemoMutedText>

      <DemoSection label="Default Grid">
        <DemoMutedText>
          Minor: 10px, Major: 100px, Origin shown.
        </DemoMutedText>
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={500}
          height={350}
          svgLayers={
            <CanvasGridLayer minorSize={10} majorSize={100} showOrigin />
          }
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 10,
              height: 10,
              background: "var(--rei-color-error)",
              borderRadius: "50%",
              transform: "translate(-5px, -5px)",
            }}
            title="Origin (0, 0)"
          />
        </Canvas>
      </DemoSection>

      <DemoSection label="Fine Grid">
        <DemoMutedText>
          Minor: 5px, Major: 50px for detailed work.
        </DemoMutedText>
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={500}
          height={300}
          svgLayers={
            <CanvasGridLayer minorSize={5} majorSize={50} showOrigin />
          }
        />
      </DemoSection>

      <DemoSection label="Without Origin">
        <DemoMutedText>
          Grid without origin lines.
        </DemoMutedText>
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={500}
          height={300}
          svgLayers={
            <CanvasGridLayer minorSize={20} majorSize={100} showOrigin={false} />
          }
        />
      </DemoSection>
    </DemoContainer>
  );
}
