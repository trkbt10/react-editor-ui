/**
 * @file Guide mount page for E2E tests
 */

import { useState } from "react";
import { Canvas } from "../../Canvas/Canvas";
import { CanvasGuides } from "../../CanvasGuide/CanvasGuide";
import { CanvasGridLayer } from "../../CanvasGridLayer/CanvasGridLayer";
import type { ViewportState } from "../../core/types";

/**
 * Guide mount page for E2E testing.
 */
export default function GuideMount() {
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });

  const guides = [
    { orientation: "horizontal" as const, position: 100, color: "#ef4444" },
    { orientation: "horizontal" as const, position: 300, color: "#ef4444" },
    { orientation: "vertical" as const, position: 150, color: "#3b82f6" },
    { orientation: "vertical" as const, position: 400, color: "#3b82f6" },
  ];

  return (
    <div className="canvas-mount">
      <h1>CanvasGuide E2E</h1>
      <div className="canvas-section">
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={800}
          height={500}
          aria-label="Guide test canvas"
          svgLayers={
            <>
              <CanvasGridLayer minorSize={10} majorSize={100} />
              <CanvasGuides guides={guides} />
            </>
          }
        >
          <div
            style={{
              position: "absolute",
              left: 150,
              top: 100,
              width: 250,
              height: 200,
              background: "rgba(59, 130, 246, 0.3)",
              border: "2px solid #3b82f6",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            Snapped to guides
          </div>
        </Canvas>
      </div>
      <div style={{ marginTop: 16, fontSize: 14, color: "#888" }}>
        <p>Viewport: x={viewport.x.toFixed(1)}, y={viewport.y.toFixed(1)}, scale={viewport.scale.toFixed(2)}</p>
        <p>Guides: H@100, H@300 (red), V@150, V@400 (blue)</p>
      </div>
    </div>
  );
}
