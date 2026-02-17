/**
 * @file Checkerboard mount page for E2E tests
 */

import { useState } from "react";
import { Canvas } from "../../Canvas/Canvas";
import { CanvasCheckerboard } from "../../CanvasCheckerboard/CanvasCheckerboard";
import type { ViewportState } from "../../core/types";

/**
 * Checkerboard mount page for E2E testing.
 */
export default function CheckerboardMount() {
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });
  const [size, setSize] = useState(8);

  return (
    <div className="canvas-mount">
      <h1>CanvasCheckerboard E2E</h1>
      <div style={{ marginBottom: 16, display: "flex", gap: 16, alignItems: "center" }}>
        <label>
          Size:
          <input
            type="range"
            min={4}
            max={32}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          />
          {size}px
        </label>
      </div>
      <div className="canvas-section">
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={800}
          height={500}
          aria-label="Checkerboard test canvas"
          svgLayers={<CanvasCheckerboard size={size} />}
        >
          <div
            style={{
              position: "absolute",
              left: 100,
              top: 100,
              width: 300,
              height: 200,
              background: "linear-gradient(135deg, rgba(255,0,0,0.5), rgba(0,0,255,0.5))",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 24,
            }}
          >
            Semi-transparent
          </div>
        </Canvas>
      </div>
      <div style={{ marginTop: 16, fontSize: 14, color: "#888" }}>
        <p>Viewport: x={viewport.x.toFixed(1)}, y={viewport.y.toFixed(1)}, scale={viewport.scale.toFixed(2)}</p>
        <p>Checkerboard size: {size}px (transparency indicator)</p>
      </div>
    </div>
  );
}
