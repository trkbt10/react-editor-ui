/**
 * @file BoundingBox mount page for E2E tests
 */

import { useState, useCallback } from "react";
import { Canvas } from "../../Canvas/Canvas";
import { BoundingBox, type HandlePosition } from "../../BoundingBox/BoundingBox";
import type { ViewportState } from "../../core/types";

type BoxState = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

/**
 * BoundingBox mount page for E2E testing.
 */
export default function BoundingBoxMount() {
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });
  const [box, setBox] = useState<BoxState>({
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    rotation: 0,
  });
  const [lastAction, setLastAction] = useState<string>("none");

  const handleMove = useCallback((dx: number, dy: number) => {
    setBox((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    setLastAction("move");
  }, []);

  const handleResize = useCallback((handle: HandlePosition, dx: number, dy: number) => {
    setBox((prev) => {
      const next = { ...prev };
      if (handle.includes("right")) {
        next.width = Math.max(20, prev.width + dx);
      }
      if (handle.includes("left")) {
        next.x = prev.x + dx;
        next.width = Math.max(20, prev.width - dx);
      }
      if (handle.includes("bottom")) {
        next.height = Math.max(20, prev.height + dy);
      }
      if (handle.includes("top") && handle !== "top-left" && handle !== "top-right") {
        next.y = prev.y + dy;
        next.height = Math.max(20, prev.height - dy);
      }
      if (handle === "top-left" || handle === "top-right") {
        next.y = prev.y + dy;
        next.height = Math.max(20, prev.height - dy);
      }
      return next;
    });
    setLastAction(`resize-${handle}`);
  }, []);

  const handleRotate = useCallback((angle: number) => {
    setBox((prev) => ({ ...prev, rotation: angle }));
    setLastAction("rotate");
  }, []);

  return (
    <div className="canvas-mount">
      <h1>BoundingBox E2E</h1>
      <div className="canvas-section">
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={800}
          height={500}
          showGrid
          aria-label="BoundingBox test canvas"
          svgLayers={
            <BoundingBox
              x={box.x}
              y={box.y}
              width={box.width}
              height={box.height}
              rotation={box.rotation}
              onMove={handleMove}
              onResize={handleResize}
              onRotate={handleRotate}
            />
          }
        />
      </div>
      <div style={{ marginTop: 16, fontSize: 14, color: "#888" }} data-testid="box-info">
        <p>Box: x={box.x.toFixed(0)}, y={box.y.toFixed(0)}, w={box.width.toFixed(0)}, h={box.height.toFixed(0)}, rotation={box.rotation.toFixed(1)}°</p>
        <p>Last action: <span data-testid="last-action">{lastAction}</span></p>
        <p>Viewport: scale={viewport.scale.toFixed(2)}</p>
      </div>
    </div>
  );
}
