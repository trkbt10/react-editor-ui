/**
 * @file BoundingBox demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoMutedText,
} from "../../components";
import { Canvas } from "../../../canvas/Canvas/Canvas";
import { BoundingBox } from "../../../canvas/BoundingBox/BoundingBox";
import type { ViewportState } from "../../../canvas/core/types";
import type { HandlePosition } from "../../../canvas/BoundingBox/BoundingBox";

export function BoundingBoxDemo() {
  const [viewport, setViewport] = useState<ViewportState>({ x: -50, y: -50, scale: 1 });
  const [selectedHandle, setSelectedHandle] = useState<HandlePosition | null>(null);

  return (
    <DemoContainer title="BoundingBox">
      <DemoMutedText>
        Selection bounding box with resize handles for canvas objects.
        Click handles to see the resize start callback.
      </DemoMutedText>

      <DemoSection label="Basic BoundingBox">
        <div style={{ display: "flex", gap: 16 }}>
          <Canvas
            viewport={viewport}
            onViewportChange={setViewport}
            width={500}
            height={350}
            showGrid
            gridSize={50}
            svgLayers={
              <BoundingBox
                x={100}
                y={100}
                width={200}
                height={150}
                onResizeStart={(handle) => setSelectedHandle(handle)}
              />
            }
          />
          <div style={{ flex: "0 0 180px" }}>
            <h4 style={{ margin: "0 0 8px" }}>Last Handle</h4>
            <DemoMutedText size={12}>
              {selectedHandle ?? "Click a handle"}
            </DemoMutedText>
          </div>
        </div>
      </DemoSection>

      <DemoSection label="Without Label">
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={400}
          height={250}
          showGrid
          gridSize={50}
          svgLayers={
            <BoundingBox
              x={80}
              y={60}
              width={150}
              height={100}
              showLabel={false}
            />
          }
        />
      </DemoSection>

      <DemoSection label="Custom Styling">
        <DemoMutedText>
          Custom stroke color, handle colors, and label formatter.
        </DemoMutedText>
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={400}
          height={250}
          showGrid
          gridSize={50}
          svgLayers={
            <BoundingBox
              x={80}
              y={60}
              width={180}
              height={120}
              strokeColor="#f59e0b"
              handleFill="#fef3c7"
              handleStroke="#f59e0b"
              labelBackground="#f59e0b"
              formatLabel={(w, h) => `${Math.round(w)}px × ${Math.round(h)}px`}
            />
          }
        />
      </DemoSection>

      <DemoSection label="Non-interactive">
        <DemoMutedText>
          Display-only bounding box (no pointer events).
        </DemoMutedText>
        <Canvas
          viewport={viewport}
          onViewportChange={setViewport}
          width={400}
          height={250}
          showGrid
          gridSize={50}
          svgLayers={
            <BoundingBox
              x={80}
              y={60}
              width={160}
              height={100}
              interactive={false}
            />
          }
        />
      </DemoSection>
    </DemoContainer>
  );
}
