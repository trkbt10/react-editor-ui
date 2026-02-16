/**
 * @file Canvas demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoMutedText,
} from "../../components";
import { Canvas } from "../../../canvas/Canvas/Canvas";
import { Button } from "../../../components/Button/Button";
import type { ViewportState } from "../../../canvas/core/types";

export function CanvasDemo() {
  const [viewport, setViewport] = useState<ViewportState>({ x: -50, y: -150, scale: 1 });

  return (
    <DemoContainer title="Canvas">
      <DemoMutedText>
        Pan/zoom canvas for placing elements. Pan: middle mouse, Alt+left click, Space+left click.
        Zoom: mouse wheel or pinch.
      </DemoMutedText>

      <DemoSection label="Basic Canvas">
        <div style={{ display: "flex", gap: 16 }}>
          <Canvas
            viewport={viewport}
            onViewportChange={setViewport}
            width={600}
            height={400}
            showGrid
            gridSize={50}
          >
            <div
              style={{
                position: "absolute",
                left: 100,
                top: 100,
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
              Drag me (pan)
            </div>
            <div
              style={{
                position: "absolute",
                left: 350,
                top: 200,
                width: 120,
                height: 120,
                background: "var(--rei-color-success)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 600,
              }}
            >
              Circle
            </div>
          </Canvas>
          <div style={{ flex: "0 0 200px" }}>
            <h4 style={{ margin: "0 0 8px" }}>Viewport State</h4>
            <DemoMutedText size={12}>
              <div>X: {viewport.x.toFixed(1)}</div>
              <div>Y: {viewport.y.toFixed(1)}</div>
              <div>Scale: {(viewport.scale * 100).toFixed(0)}%</div>
            </DemoMutedText>
            <div style={{ marginTop: 12 }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewport({ x: 0, y: 0, scale: 1 })}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </DemoSection>
    </DemoContainer>
  );
}
