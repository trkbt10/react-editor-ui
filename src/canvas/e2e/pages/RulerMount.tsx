/**
 * @file Ruler mount page for E2E tests
 */

import { useState, useCallback } from "react";
import { Canvas } from "../../Canvas/Canvas";
import {
  CanvasHorizontalRuler,
  CanvasVerticalRuler,
  CanvasRulerCorner,
} from "../../CanvasRuler/CanvasRuler";
import type { ViewportState } from "../../core/types";

const RULER_SIZE = 20;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

/**
 * Ruler mount page for E2E testing.
 */
export default function RulerMount() {
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / viewport.scale + viewport.x;
    const y = (e.clientY - rect.top) / viewport.scale + viewport.y;
    setMousePos({ x, y });
  }, [viewport]);

  const handlePointerLeave = useCallback(() => {
    setMousePos(null);
  }, []);

  return (
    <div className="canvas-mount">
      <h1>CanvasRuler E2E</h1>
      <div className="canvas-section">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Top row: corner + horizontal ruler */}
          <div style={{ display: "flex" }}>
            <CanvasRulerCorner size={RULER_SIZE} />
            <CanvasHorizontalRuler
              viewport={viewport}
              width={CANVAS_WIDTH}
              size={RULER_SIZE}
              indicatorPosition={mousePos?.x}
            />
          </div>
          {/* Bottom row: vertical ruler + canvas */}
          <div style={{ display: "flex" }}>
            <CanvasVerticalRuler
              viewport={viewport}
              height={CANVAS_HEIGHT}
              size={RULER_SIZE}
              indicatorPosition={mousePos?.y}
            />
            <div
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
            >
              <Canvas
                viewport={viewport}
                onViewportChange={setViewport}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                showGrid
                aria-label="Ruler test canvas"
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
                  }}
                />
              </Canvas>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, fontSize: 14, color: "#888" }}>
        <p>Viewport: x={viewport.x.toFixed(1)}, y={viewport.y.toFixed(1)}, scale={viewport.scale.toFixed(2)}</p>
        <p>Mouse: {mousePos ? `(${mousePos.x.toFixed(0)}, ${mousePos.y.toFixed(0)})` : "outside"}</p>
      </div>
    </div>
  );
}
