/**
 * @file CanvasCheckerboard demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoMutedText,
} from "../../components";
import { Canvas } from "../../../canvas/Canvas/Canvas";
import { CanvasCheckerboard } from "../../../canvas/CanvasCheckerboard/CanvasCheckerboard";
import type { ViewportState } from "../../../canvas/core/types";

export function CanvasCheckerboardDemo() {
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });

  return (
    <DemoContainer title="CanvasCheckerboard">
      <DemoMutedText>
        Checkerboard background pattern typically used to indicate transparency.
      </DemoMutedText>

      <DemoSection label="Default Checkerboard">
        <DemoMutedText>
          Standard checkerboard (10px squares).
        </DemoMutedText>
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={400}
          height={250}
          svgLayers={<CanvasCheckerboard />}
        >
          <div
            style={{
              position: "absolute",
              left: 50,
              top: 50,
              width: 200,
              height: 100,
              background: "rgba(59, 130, 246, 0.7)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 600,
            }}
          >
            Transparent element
          </div>
        </Canvas>
      </DemoSection>

      <DemoSection label="Small Checkerboard">
        <DemoMutedText>
          Smaller 5px squares for finer detail.
        </DemoMutedText>
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={400}
          height={200}
          svgLayers={<CanvasCheckerboard size={5} />}
        />
      </DemoSection>

      <DemoSection label="Large Checkerboard">
        <DemoMutedText>
          Larger 20px squares.
        </DemoMutedText>
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={400}
          height={200}
          svgLayers={<CanvasCheckerboard size={20} />}
        />
      </DemoSection>

      <DemoSection label="Custom Colors">
        <DemoMutedText>
          Checkerboard with custom colors.
        </DemoMutedText>
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={400}
          height={200}
          svgLayers={
            <CanvasCheckerboard
              size={15}
              lightColor="#fef3c7"
              darkColor="#fcd34d"
            />
          }
        />
      </DemoSection>
    </DemoContainer>
  );
}
