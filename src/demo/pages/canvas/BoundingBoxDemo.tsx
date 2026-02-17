/**
 * @file BoundingBox demo page
 */

import { useState, useCallback, useMemo, memo } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoMutedText,
} from "../../components";
import { Canvas } from "../../../canvas/Canvas/Canvas";
import { CanvasCheckerboard } from "../../../canvas/CanvasCheckerboard/CanvasCheckerboard";
import { CanvasGridLayer } from "../../../canvas/CanvasGridLayer/CanvasGridLayer";
import { BoundingBox } from "../../../canvas/BoundingBox/BoundingBox";
import { useBoundingBoxHandlers } from "../../../canvas/hooks/useBoundingBoxHandlers";
import { Button } from "../../../components/Button/Button";
import {
  screenToLocalDelta,
  createRotationMatrix,
  transformPoint,
} from "../../../utils/matrix";
import type { ViewportState } from "../../../canvas/core/types";
import type { HandlePosition } from "../../../canvas/BoundingBox/BoundingBox";

type TransformState = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

/**
 * Apply resize delta based on handle position
 * Properly handles rotated boxes by keeping the opposite corner anchored
 */
function applyResize(
  state: TransformState,
  handle: HandlePosition,
  deltaX: number,
  deltaY: number,
): TransformState {
  const { x, y, width, height, rotation } = state;
  const MIN_SIZE = 20;

  // Convert screen delta to local (object-aligned) delta
  const localDelta = screenToLocalDelta(deltaX, deltaY, rotation);
  let localDX = localDelta.x;
  let localDY = localDelta.y;

  // Calculate new dimensions based on handle
  let newWidth = width;
  let newHeight = height;
  let anchorLocalX = 0; // Which corner to anchor (0 = left, 1 = right)
  let anchorLocalY = 0; // Which corner to anchor (0 = top, 1 = bottom)

  switch (handle) {
    case "top-left":
      newWidth = Math.max(MIN_SIZE, width - localDX);
      newHeight = Math.max(MIN_SIZE, height - localDY);
      anchorLocalX = 1; // anchor right
      anchorLocalY = 1; // anchor bottom
      break;
    case "top":
      newHeight = Math.max(MIN_SIZE, height - localDY);
      anchorLocalY = 1;
      localDX = 0;
      break;
    case "top-right":
      newWidth = Math.max(MIN_SIZE, width + localDX);
      newHeight = Math.max(MIN_SIZE, height - localDY);
      anchorLocalX = 0; // anchor left
      anchorLocalY = 1; // anchor bottom
      break;
    case "right":
      newWidth = Math.max(MIN_SIZE, width + localDX);
      localDY = 0;
      break;
    case "bottom-right":
      newWidth = Math.max(MIN_SIZE, width + localDX);
      newHeight = Math.max(MIN_SIZE, height + localDY);
      // No position change needed - bottom-right expands away from top-left
      return { ...state, width: newWidth, height: newHeight };
    case "bottom":
      newHeight = Math.max(MIN_SIZE, height + localDY);
      return { ...state, height: newHeight };
    case "bottom-left":
      newWidth = Math.max(MIN_SIZE, width - localDX);
      newHeight = Math.max(MIN_SIZE, height + localDY);
      anchorLocalX = 1; // anchor right
      anchorLocalY = 0; // anchor top
      break;
    case "left":
      newWidth = Math.max(MIN_SIZE, width - localDX);
      anchorLocalX = 1;
      localDY = 0;
      break;
    default:
      return state;
  }

  // Calculate the center point
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Calculate anchor point in local coordinates (relative to center)
  const anchorLocalOffsetX = (anchorLocalX - 0.5) * width;
  const anchorLocalOffsetY = (anchorLocalY - 0.5) * height;

  // Transform anchor to canvas coordinates
  const rotMatrix = createRotationMatrix(rotation);
  const anchorOffset = transformPoint({ x: anchorLocalOffsetX, y: anchorLocalOffsetY }, rotMatrix);
  const anchorCanvasX = centerX + anchorOffset.x;
  const anchorCanvasY = centerY + anchorOffset.y;

  // Calculate new center position to keep anchor fixed
  const newAnchorLocalOffsetX = (anchorLocalX - 0.5) * newWidth;
  const newAnchorLocalOffsetY = (anchorLocalY - 0.5) * newHeight;
  const newAnchorOffset = transformPoint({ x: newAnchorLocalOffsetX, y: newAnchorLocalOffsetY }, rotMatrix);

  const newCenterX = anchorCanvasX - newAnchorOffset.x;
  const newCenterY = anchorCanvasY - newAnchorOffset.y;

  // Calculate new top-left position
  const newX = newCenterX - newWidth / 2;
  const newY = newCenterY - newHeight / 2;

  return {
    ...state,
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
  };
}

// ============================================================================
// INTERACTIVE CANVAS - Only this part re-renders on transform changes
// ============================================================================
const InteractiveCanvas = memo(function InteractiveCanvas({
  transform,
  onMove,
  onResize,
  onRotate,
  onMoveStart,
  onMoveEnd,
  onResizeStart,
  onResizeEnd,
  onRotateStart,
  onRotateEnd,
}: {
  transform: TransformState;
  onMove: (dx: number, dy: number) => void;
  onResize: (handle: HandlePosition, dx: number, dy: number) => void;
  onRotate: (angle: number) => void;
  onMoveStart: () => void;
  onMoveEnd: () => void;
  onResizeStart: (h: HandlePosition) => void;
  onResizeEnd: (h: HandlePosition) => void;
  onRotateStart: () => void;
  onRotateEnd: () => void;
}) {
  const [viewport, setViewport] = useState<ViewportState>({ x: -50, y: -50, scale: 1 });

  const svgLayers = useMemo(
    () => (
      <>
        <CanvasCheckerboard size={8} />
        <CanvasGridLayer minorSize={10} majorSize={100} showOrigin />
        <g transform={`rotate(${transform.rotation} ${transform.x + transform.width / 2} ${transform.y + transform.height / 2})`}>
          <foreignObject
            x={transform.x}
            y={transform.y}
            width={transform.width}
            height={transform.height}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "var(--rei-color-primary)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 600,
                boxSizing: "border-box",
              }}
            >
              Selected
            </div>
          </foreignObject>
        </g>
        <BoundingBox
          x={transform.x}
          y={transform.y}
          width={transform.width}
          height={transform.height}
          rotation={transform.rotation}
          onMoveStart={onMoveStart}
          onMove={onMove}
          onMoveEnd={onMoveEnd}
          onResizeStart={onResizeStart}
          onResize={onResize}
          onResizeEnd={onResizeEnd}
          onRotateStart={onRotateStart}
          onRotate={onRotate}
          onRotateEnd={onRotateEnd}
        />
      </>
    ),
    [
      transform.x,
      transform.y,
      transform.width,
      transform.height,
      transform.rotation,
      onMoveStart,
      onMove,
      onMoveEnd,
      onResizeStart,
      onResize,
      onResizeEnd,
      onRotateStart,
      onRotate,
      onRotateEnd,
    ],
  );

  return (
    <Canvas
      viewport={viewport}
      onViewportChange={setViewport}
      width={600}
      height={400}
      svgLayers={svgLayers}
    />
  );
});

// Transform state display - only re-renders when transform changes
const TransformDisplay = memo(function TransformDisplay({
  transform,
}: {
  transform: TransformState;
}) {
  return (
    <DemoMutedText size={12}>
      <div>X: {transform.x.toFixed(1)}</div>
      <div>Y: {transform.y.toFixed(1)}</div>
      <div>Width: {transform.width.toFixed(1)}</div>
      <div>Height: {transform.height.toFixed(1)}</div>
      <div>Rotation: {transform.rotation.toFixed(1)}°</div>
    </DemoMutedText>
  );
});

// Event log display - only re-renders when log changes
const EventLogDisplay = memo(function EventLogDisplay({
  logs,
}: {
  logs: string[];
}) {
  return (
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
      {logs.length === 0 ? (
        <span style={{ color: "var(--rei-color-text-muted)" }}>
          Interact with the box...
        </span>
      ) : (
        logs.map((log, i) => <div key={i}>{log}</div>)
      )}
    </div>
  );
});

// ============================================================================
// INTERACTIVE SECTION - Static wrapper with state management
// ============================================================================
const INITIAL_TRANSFORM: TransformState = {
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  rotation: 0,
};

const InteractiveBoundingBoxSection = memo(function InteractiveBoundingBoxSection() {
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

  return (
    <DemoSection label="Interactive BoundingBox">
      <DemoMutedText>
        Drag to move, use corner/edge handles to resize, hover outside corners to rotate.
        Works with mouse and touch. Handles stay consistent size when zooming.
      </DemoMutedText>
      <div style={{ display: "flex", gap: 16 }}>
        <InteractiveCanvas
          transform={transform}
          onMove={handlers.onMove}
          onResize={handlers.onResize}
          onRotate={handleRotate}
          onMoveStart={handlers.onMoveStart}
          onMoveEnd={handlers.onMoveEnd}
          onResizeStart={handlers.onResizeStart}
          onResizeEnd={handlers.onResizeEnd}
          onRotateStart={handleRotateStart}
          onRotateEnd={handleRotateEnd}
        />
        <div style={{ flex: "0 0 200px" }}>
          <h4 style={{ margin: "0 0 8px" }}>Transform State</h4>
          <TransformDisplay transform={transform} />
          <div style={{ marginTop: 12 }}>
            <Button variant="secondary" size="sm" onClick={resetTransform}>
              Reset
            </Button>
          </div>
          <h4 style={{ margin: "16px 0 8px" }}>Event Log</h4>
          <EventLogDisplay logs={interactionLog} />
        </div>
      </div>
    </DemoSection>
  );
});

// ============================================================================
// STATIC SECTIONS - Each fully isolated
// ============================================================================

// Pre-computed static svgLayers to avoid re-creation
const NO_ROTATION_SVG_LAYERS = (
  <BoundingBox
    x={80}
    y={60}
    width={150}
    height={100}
    showRotationHandle={false}
  />
);

const CORNER_ONLY_SVG_LAYERS = (
  <BoundingBox
    x={80}
    y={60}
    width={150}
    height={100}
    showEdgeHandles={false}
    showRotationHandle={false}
  />
);

const formatCustomLabel = (w: number, h: number) => `${Math.round(w)}px × ${Math.round(h)}px`;

const CUSTOM_STYLING_SVG_LAYERS = (
  <BoundingBox
    x={80}
    y={60}
    width={180}
    height={120}
    strokeColor="#f59e0b"
    handleFill="#fef3c7"
    handleStroke="#f59e0b"
    labelBackground="#f59e0b"
    formatLabel={formatCustomLabel}
  />
);

const NON_INTERACTIVE_SVG_LAYERS = (
  <BoundingBox
    x={80}
    y={60}
    width={160}
    height={100}
    interactive={false}
  />
);

const NoRotationSection = memo(function NoRotationSection() {
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });

  return (
    <DemoSection label="Without Rotation Zones">
      <DemoMutedText>Bounding box without corner rotation zones (resize only).</DemoMutedText>
      <Canvas
        viewport={viewport}
        onViewportChange={setViewport}
        width={400}
        height={250}
        showGrid
        gridSize={50}
        svgLayers={NO_ROTATION_SVG_LAYERS}
      />
    </DemoSection>
  );
});

const CornerOnlySection = memo(function CornerOnlySection() {
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });

  return (
    <DemoSection label="Corner Handles Only">
      <DemoMutedText>Bounding box with only corner handles (no edge handles).</DemoMutedText>
      <Canvas
        viewport={viewport}
        onViewportChange={setViewport}
        width={400}
        height={250}
        showGrid
        gridSize={50}
        svgLayers={CORNER_ONLY_SVG_LAYERS}
      />
    </DemoSection>
  );
});

const CustomStylingSection = memo(function CustomStylingSection() {
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });

  return (
    <DemoSection label="Custom Styling">
      <DemoMutedText>Custom stroke color, handle colors, and label formatter.</DemoMutedText>
      <Canvas
        viewport={viewport}
        onViewportChange={setViewport}
        width={400}
        height={250}
        showGrid
        gridSize={50}
        svgLayers={CUSTOM_STYLING_SVG_LAYERS}
      />
    </DemoSection>
  );
});

const NonInteractiveSection = memo(function NonInteractiveSection() {
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });

  return (
    <DemoSection label="Non-interactive">
      <DemoMutedText>Display-only bounding box (no pointer events).</DemoMutedText>
      <Canvas
        viewport={viewport}
        onViewportChange={setViewport}
        width={400}
        height={250}
        showGrid
        gridSize={50}
        svgLayers={NON_INTERACTIVE_SVG_LAYERS}
      />
    </DemoSection>
  );
});

// ============================================================================
// MAIN COMPONENT - Just a static container now
// ============================================================================
export function BoundingBoxDemo() {
  return (
    <DemoContainer title="BoundingBox">
      <DemoMutedText>
        Selection bounding box with resize/rotate handles for canvas objects.
        Supports mouse and touch interactions.
      </DemoMutedText>

      <InteractiveBoundingBoxSection />
      <NoRotationSection />
      <CornerOnlySection />
      <CustomStylingSection />
      <NonInteractiveSection />
    </DemoContainer>
  );
}
