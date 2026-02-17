/**
 * @file GridLayer mount page for E2E tests
 */

import { useState } from "react";
import { Canvas } from "../../Canvas/Canvas";
import { CanvasGridLayer } from "../../CanvasGridLayer/CanvasGridLayer";
import type { ViewportState } from "../../core/types";

/**
 * GridLayer mount page for E2E testing.
 */
export default function GridLayerMount() {
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });
  const [showOrigin, setShowOrigin] = useState(true);

  return (
    <div className="canvas-mount">
      <h1>CanvasGridLayer E2E</h1>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={showOrigin}
            onChange={(e) => setShowOrigin(e.target.checked)}
          />
          Show Origin Lines
        </label>
      </div>
      <div className="canvas-section">
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={800}
          height={500}
          aria-label="GridLayer test canvas"
          svgLayers={
            <CanvasGridLayer
              minorSize={10}
              majorSize={100}
              showOrigin={showOrigin}
            />
          }
        />
      </div>
      <div style={{ marginTop: 16, fontSize: 14, color: "#888" }}>
        <p>Viewport: x={viewport.x.toFixed(1)}, y={viewport.y.toFixed(1)}, scale={viewport.scale.toFixed(2)}</p>
        <p>Minor grid: 10px, Major grid: 100px</p>
      </div>
    </div>
  );
}
