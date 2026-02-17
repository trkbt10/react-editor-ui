/**
 * @file Canvas demo page
 */

import { useState, useCallback, useMemo, memo } from "react";
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
import { BoundingBox, type HandlePosition } from "../../../canvas/BoundingBox/BoundingBox";
import { useBoundingBoxHandlers } from "../../../canvas/hooks/useBoundingBoxHandlers";
import { Button } from "../../../components/Button/Button";
import type { ViewportState } from "../../../canvas/core/types";

type TransformState = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

/**
 * Apply resize delta based on handle position
 */
function applyResize(
  state: TransformState,
  handle: HandlePosition,
  deltaX: number,
  deltaY: number,
): TransformState {
  const { x, y, width, height, rotation } = state;

  // Convert delta to local coordinates if rotated
  const rad = (-rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const localDX = deltaX * cos - deltaY * sin;
  const localDY = deltaX * sin + deltaY * cos;

  switch (handle) {
    case "top-left":
      return {
        ...state,
        x: x + localDX,
        y: y + localDY,
        width: Math.max(20, width - localDX),
        height: Math.max(20, height - localDY),
      };
    case "top":
      return {
        ...state,
        y: y + localDY,
        height: Math.max(20, height - localDY),
      };
    case "top-right":
      return {
        ...state,
        y: y + localDY,
        width: Math.max(20, width + localDX),
        height: Math.max(20, height - localDY),
      };
    case "right":
      return {
        ...state,
        width: Math.max(20, width + localDX),
      };
    case "bottom-right":
      return {
        ...state,
        width: Math.max(20, width + localDX),
        height: Math.max(20, height + localDY),
      };
    case "bottom":
      return {
        ...state,
        height: Math.max(20, height + localDY),
      };
    case "bottom-left":
      return {
        ...state,
        x: x + localDX,
        width: Math.max(20, width - localDX),
        height: Math.max(20, height + localDY),
      };
    case "left":
      return {
        ...state,
        x: x + localDX,
        width: Math.max(20, width - localDX),
      };
    default:
      return state;
  }
}

// Fixed guide positions (static, defined outside component)
const GUIDES = [
  { orientation: "horizontal" as const, position: -134 },
  { orientation: "vertical" as const, position: 50 },
];

// Static basic canvas section (isolated viewport)
const BasicCanvasSection = memo(function BasicCanvasSection() {
  const [viewport, setViewport] = useState<ViewportState>({ x: -50, y: -150, scale: 1 });
  const handleReset = useCallback(() => setViewport({ x: 0, y: 0, scale: 1 }), []);

  return (
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
            <Button variant="secondary" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </div>
    </DemoSection>
  );
});

// Rulers section (isolated viewport)
const RulersSection = memo(function RulersSection() {
  const [viewport, setViewport] = useState<ViewportState>({ x: -50, y: -150, scale: 1 });

  const svgLayers = useMemo(
    () => (
      <>
        <CanvasCheckerboard size={8} />
        <CanvasGridLayer minorSize={10} majorSize={100} showOrigin />
        <CanvasGuides guides={GUIDES} />
      </>
    ),
    [],
  );

  return (
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
            svgLayers={svgLayers}
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
  );
});

const INITIAL_TRANSFORM: TransformState = {
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  rotation: 0,
};

export function CanvasDemo() {
  const [viewport, setViewport] = useState<ViewportState>({ x: -50, y: -150, scale: 1 });

  // Interactive bounding box state
  const [transform, setTransform] = useState<TransformState>(INITIAL_TRANSFORM);
  const [interactionLog, setInteractionLog] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setInteractionLog((prev) => [...prev.slice(-4), message]);
  }, []);

  // Use the hook for correct cumulative delta handling
  const handlers = useBoundingBoxHandlers(transform, setTransform, {
    applyResize,
    onMoveStart: () => addLog("Move started"),
    onMoveEnd: () => addLog("Move ended"),
    onResizeStart: (h) => addLog(`Resize started: ${h}`),
    onResizeEnd: (h) => addLog(`Resize ended: ${h}`),
  });

  const handleRotate = useCallback((angle: number) => {
    setTransform((prev) => ({
      ...prev,
      rotation: angle,
    }));
  }, []);

  const resetTransform = useCallback(() => {
    setTransform(INITIAL_TRANSFORM);
    setInteractionLog([]);
  }, []);

  const handleRotateStart = useCallback(() => addLog("Rotate started"), [addLog]);
  const handleRotateEnd = useCallback(() => addLog("Rotate ended"), [addLog]);

  // Memoize svgLayers
  const interactiveSvgLayers = useMemo(
    () => (
      <>
        <CanvasCheckerboard size={8} />
        <CanvasGridLayer minorSize={10} majorSize={100} showOrigin />
        <BoundingBox
          x={transform.x}
          y={transform.y}
          width={transform.width}
          height={transform.height}
          rotation={transform.rotation}
          onMoveStart={handlers.onMoveStart}
          onMove={handlers.onMove}
          onMoveEnd={handlers.onMoveEnd}
          onResizeStart={handlers.onResizeStart}
          onResize={handlers.onResize}
          onResizeEnd={handlers.onResizeEnd}
          onRotateStart={handleRotateStart}
          onRotate={handleRotate}
          onRotateEnd={handleRotateEnd}
        />
      </>
    ),
    [
      transform.x,
      transform.y,
      transform.width,
      transform.height,
      transform.rotation,
      handlers.onMoveStart,
      handlers.onMove,
      handlers.onMoveEnd,
      handlers.onResizeStart,
      handlers.onResize,
      handlers.onResizeEnd,
      handleRotateStart,
      handleRotate,
      handleRotateEnd,
    ],
  );

  return (
    <DemoContainer title="Canvas">
      <DemoMutedText>
        Pan/zoom canvas for placing elements. Pan: middle mouse, Alt+left click, Space+left click.
        Zoom: mouse wheel or pinch.
      </DemoMutedText>

      <BasicCanvasSection />

      <DemoSection label="Interactive Bounding Box">
        <DemoMutedText>
          Drag to move, use corner/edge handles to resize, use the top handle to rotate.
          Works with mouse and touch. Handles stay consistent size when zooming.
        </DemoMutedText>
        <div style={{ display: "flex", gap: 16 }}>
          <Canvas
            viewport={viewport}
            onViewportChange={setViewport}
            width={600}
            height={400}
            svgLayers={interactiveSvgLayers}
          >
            {/* Visual element that follows the bounding box */}
            <div
              style={{
                position: "absolute",
                left: transform.x,
                top: transform.y,
                width: transform.width,
                height: transform.height,
                background: "var(--rei-color-primary)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 600,
                transform: `rotate(${transform.rotation}deg)`,
                transformOrigin: "center center",
                pointerEvents: "none",
              }}
            >
              Selected
            </div>
          </Canvas>
          <div style={{ flex: "0 0 200px" }}>
            <h4 style={{ margin: "0 0 8px" }}>Transform State</h4>
            <DemoMutedText size={12}>
              <div>X: {transform.x.toFixed(1)}</div>
              <div>Y: {transform.y.toFixed(1)}</div>
              <div>Width: {transform.width.toFixed(1)}</div>
              <div>Height: {transform.height.toFixed(1)}</div>
              <div>Rotation: {transform.rotation.toFixed(1)}°</div>
            </DemoMutedText>
            <div style={{ marginTop: 12 }}>
              <Button variant="secondary" size="sm" onClick={resetTransform}>
                Reset
              </Button>
            </div>
            <h4 style={{ margin: "16px 0 8px" }}>Event Log</h4>
            <div
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                background: "var(--rei-color-surface-overlay)",
                padding: 8,
                borderRadius: 4,
                minHeight: 80,
              }}
            >
              {interactionLog.length === 0 ? (
                <span style={{ color: "var(--rei-color-text-muted)" }}>
                  Interact with the box...
                </span>
              ) : (
                interactionLog.map((log, i) => <div key={i}>{log}</div>)
              )}
            </div>
          </div>
        </div>
      </DemoSection>

      <RulersSection />
    </DemoContainer>
  );
}
