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
import { CanvasGridLayer } from "../../../canvas/CanvasGridLayer/CanvasGridLayer";
import {
  CanvasHorizontalRuler,
  CanvasVerticalRuler,
  CanvasRulerCorner,
} from "../../../canvas/CanvasRuler/CanvasRuler";
import { CanvasGuides } from "../../../canvas/CanvasGuide/CanvasGuide";
import { CanvasCheckerboard } from "../../../canvas/CanvasCheckerboard/CanvasCheckerboard";
import { Button } from "../../../components/Button/Button";
import type { ViewportState } from "../../../canvas/core/types";

export function CanvasDemo() {
  const [viewport, setViewport] = useState<ViewportState>({ x: -50, y: -150, scale: 1 });

  // Fixed guide positions (like dragging from ruler in Figma)
  const guides = [
    { orientation: "horizontal" as const, position: -134 },
    { orientation: "vertical" as const, position: 50 },
  ];

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

      <DemoSection label="With Rulers, Guides, and Checkerboard (Figma-style)">
        <DemoMutedText>
          Complete canvas with rulers, fixed guide lines, and checkerboard background.
          Guides are drawn at fixed positions (Y=-134, X=50).
        </DemoMutedText>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Horizontal ruler row */}
          <div style={{ display: "flex" }}>
            <CanvasRulerCorner size={20} />
            <CanvasHorizontalRuler viewport={viewport} width={600} />
          </div>
          {/* Canvas row with vertical ruler */}
          <div style={{ display: "flex" }}>
            <CanvasVerticalRuler viewport={viewport} height={400} />
            <Canvas
              viewport={viewport}
              onViewportChange={setViewport}
              width={600}
              height={400}
              svgLayers={
                <>
                  <CanvasCheckerboard size={8} />
                  <CanvasGridLayer minorSize={10} majorSize={100} showOrigin />
                  <CanvasGuides guides={guides} />
                </>
              }
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
                Element at (100, 100)
              </div>
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
          </div>
        </div>
      </DemoSection>
    </DemoContainer>
  );
}
