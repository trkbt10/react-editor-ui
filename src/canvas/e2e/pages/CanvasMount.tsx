/**
 * @file Canvas mount page for E2E tests
 */

import { useState } from "react";
import { Canvas } from "../../Canvas/Canvas";
import type { ViewportState } from "../../core/types";

/**
 * Canvas mount page for E2E testing.
 */
export default function CanvasMount() {
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });

  return (
    <div className="canvas-mount">
      <h1>Canvas E2E</h1>
      <div className="canvas-section">
        <h2>Basic Canvas</h2>
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={800}
          height={600}
          showGrid
          aria-label="Test canvas"
        >
          <div
            style={{
              position: "absolute",
              left: 100,
              top: 100,
              width: 200,
              height: 150,
              background: "#3b82f6",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
            data-testid="canvas-element"
          >
            Canvas Element
          </div>
        </Canvas>
      </div>
      <div style={{ marginTop: 16, fontSize: 14, color: "#888" }}>
        <p>Viewport: x={viewport.x.toFixed(1)}, y={viewport.y.toFixed(1)}, scale={viewport.scale.toFixed(2)}</p>
      </div>
    </div>
  );
}
