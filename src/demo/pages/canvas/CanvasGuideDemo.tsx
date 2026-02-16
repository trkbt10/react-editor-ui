/**
 * @file CanvasGuide demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoMutedText,
} from "../../components";
import { Canvas } from "../../../canvas/Canvas/Canvas";
import { CanvasGuide, CanvasGuides } from "../../../canvas/CanvasGuide/CanvasGuide";
import { CanvasGridLayer } from "../../../canvas/CanvasGridLayer/CanvasGridLayer";
import type { ViewportState } from "../../../canvas/core/types";

export function CanvasGuideDemo() {
  const [viewport, setViewport] = useState<ViewportState>({ x: -100, y: -100, scale: 1 });

  const guides = [
    { orientation: "horizontal" as const, position: 50 },
    { orientation: "horizontal" as const, position: 200 },
    { orientation: "vertical" as const, position: 100 },
    { orientation: "vertical" as const, position: 300 },
  ];

  return (
    <DemoContainer title="CanvasGuide">
      <DemoMutedText>
        Fixed guide lines for Canvas. Useful for alignment reference (like dragging from rulers in Figma).
      </DemoMutedText>

      <DemoSection label="Multiple Guides">
        <DemoMutedText>
          Horizontal guides at Y=50, Y=200. Vertical guides at X=100, X=300.
        </DemoMutedText>
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={500}
          height={350}
          svgLayers={
            <>
              <CanvasGridLayer minorSize={10} majorSize={100} showOrigin />
              <CanvasGuides guides={guides} />
            </>
          }
        >
          <div
            style={{
              position: "absolute",
              left: 100,
              top: 50,
              width: 200,
              height: 150,
              background: "var(--rei-color-primary)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 600,
            }}
          >
            Aligned to guides
          </div>
        </Canvas>
      </DemoSection>

      <DemoSection label="Single Guides">
        <DemoMutedText>
          Individual CanvasGuide components.
        </DemoMutedText>
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={400}
          height={250}
          svgLayers={
            <>
              <CanvasGridLayer minorSize={10} majorSize={100} showOrigin={false} />
              <CanvasGuide orientation="horizontal" position={100} />
              <CanvasGuide orientation="vertical" position={150} />
            </>
          }
        />
      </DemoSection>

      <DemoSection label="Custom Colors">
        <DemoMutedText>
          Guides with custom colors for different purposes.
        </DemoMutedText>
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={400}
          height={250}
          svgLayers={
            <>
              <CanvasGridLayer minorSize={10} majorSize={100} showOrigin={false} />
              <CanvasGuides
                guides={[
                  { orientation: "horizontal", position: 50, color: "#ef4444" },
                  { orientation: "horizontal", position: 150, color: "#22c55e" },
                  { orientation: "vertical", position: 80, color: "#3b82f6" },
                  { orientation: "vertical", position: 250, color: "#f59e0b" },
                ]}
              />
            </>
          }
        />
      </DemoSection>
    </DemoContainer>
  );
}
