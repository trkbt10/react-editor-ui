/**
 * @file Canvas demo page
 */

import { useState } from "react";
import { demoContainerStyle, demoSectionStyle } from "../../components";
import { Canvas } from "../../../components/Canvas/Canvas";
import { CanvasContent } from "../../../components/Canvas/CanvasContent";
import { CanvasGridLayer } from "../../../components/Canvas/CanvasGridLayer";
import {
  CanvasHorizontalRuler,
  CanvasVerticalRuler,
  CanvasRulerCorner,
} from "../../../components/Canvas/CanvasRuler";
import { CanvasGuides } from "../../../components/Canvas/CanvasGuide";
import { CanvasCheckerboard } from "../../../components/Canvas/CanvasCheckerboard";
import { Button } from "../../../components/Button/Button";
import type { ViewportState } from "../../../components/Canvas/core/types";

export function CanvasDemo() {
  const [viewport, setViewport] = useState<ViewportState>({ x: -50, y: -150, scale: 1 });

  // Fixed guide positions (like dragging from ruler in Figma)
  const guides = [
    { orientation: "horizontal" as const, position: -134 },
    { orientation: "vertical" as const, position: 50 },
  ];

  return (
    <div style={demoContainerStyle}>
      <h2>Canvas</h2>
      <p style={{ color: "var(--rei-color-text-muted)" }}>
        Pan/zoom canvas for placing elements. Pan: middle mouse, Alt+left click, Space+left click.
        Zoom: mouse wheel or pinch.
      </p>

      <div style={demoSectionStyle}>
        <h3>Basic Canvas</h3>
        <div style={{ display: "flex", gap: 16 }}>
          <Canvas
            viewport={viewport}
            onViewportChange={setViewport}
            width={600}
            height={400}
            showGrid
            gridSize={50}
          >
            <CanvasContent x={100} y={100}>
              <div
                style={{
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
            </CanvasContent>
            <CanvasContent x={350} y={200}>
              <div
                style={{
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
            </CanvasContent>
          </Canvas>
          <div style={{ flex: "0 0 200px" }}>
            <h4 style={{ margin: "0 0 8px" }}>Viewport State</h4>
            <div style={{ fontSize: 12, color: "var(--rei-color-text-muted)" }}>
              <div>X: {viewport.x.toFixed(1)}</div>
              <div>Y: {viewport.y.toFixed(1)}</div>
              <div>Scale: {(viewport.scale * 100).toFixed(0)}%</div>
            </div>
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
      </div>

      <div style={demoSectionStyle}>
        <h3>With Rulers, Guides, and Checkerboard (Figma-style)</h3>
        <p style={{ color: "var(--rei-color-text-muted)", marginBottom: 12 }}>
          Complete canvas with rulers, fixed guide lines, and checkerboard background.
          Guides are drawn at fixed positions (Y=-134, X=50).
        </p>
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
                <CanvasContent x={100} y={100}>
                  <div
                    style={{
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
                </CanvasContent>
                <CanvasContent x={0} y={0}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      background: "var(--rei-color-error)",
                      borderRadius: "50%",
                      transform: "translate(-5px, -5px)",
                    }}
                    title="Origin (0, 0)"
                  />
                </CanvasContent>
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  );
}
