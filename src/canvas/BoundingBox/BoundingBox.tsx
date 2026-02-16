/**
 * @file BoundingBox - Selection bounding box for canvas objects
 *
 * @description
 * Renders a selection bounding box with resize/rotate handles for selected objects.
 * Includes corner handles, edge handles, and an optional size label.
 * Rotation is triggered by hovering outside the corner handles.
 * Handles pointer capture internally for smooth drag operations on all devices.
 *
 * @example
 * ```tsx
 * <Canvas viewport={viewport} onViewportChange={setViewport} width={800} height={600}
 *   svgLayers={
 *     <BoundingBox
 *       x={100}
 *       y={100}
 *       width={200}
 *       height={150}
 *       rotation={0}
 *       onMove={(dx, dy) => updatePosition(dx, dy)}
 *       onResize={(handle, dx, dy) => updateSize(handle, dx, dy)}
 *       onRotate={(angle) => updateRotation(angle)}
 *     />
 *   }
 * />
 * ```
 */

import { useRef, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";
import { useCanvasContext } from "../core/CanvasContext";
import { calculateAngle as matrixCalculateAngle } from "../../utils/matrix";

/**
 * Handle position identifiers for resize
 */
export type HandlePosition =
  | "top-left"
  | "top"
  | "top-right"
  | "right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left";

/**
 * Interaction mode
 */
export type InteractionMode = "idle" | "move" | "resize" | "rotate";

export type BoundingBoxProps = {
  /** X position in canvas coordinates */
  x: number;
  /** Y position in canvas coordinates */
  y: number;
  /** Width in canvas coordinates */
  width: number;
  /** Height in canvas coordinates */
  height: number;
  /** Rotation angle in degrees */
  rotation?: number;
  /** Stroke color for the bounding box border */
  strokeColor?: string;
  /** Stroke width in screen pixels (will be scaled) */
  strokeWidth?: number;
  /** Handle fill color */
  handleFill?: string;
  /** Handle stroke color */
  handleStroke?: string;
  /** Handle size in screen pixels */
  handleSize?: number;
  /** Show size label */
  showLabel?: boolean;
  /** Label background color */
  labelBackground?: string;
  /** Label text color */
  labelColor?: string;
  /** Custom label formatter */
  formatLabel?: (width: number, height: number) => string;
  /** Show rotation zones at corners */
  showRotationHandle?: boolean;
  /** Size of the rotation zone outside corners in screen pixels */
  rotationZoneSize?: number;
  /** Show edge handles (not just corners) */
  showEdgeHandles?: boolean;
  /** Called when move starts */
  onMoveStart?: () => void;
  /** Called during move drag (delta in canvas coordinates) */
  onMove?: (deltaX: number, deltaY: number) => void;
  /** Called when move ends */
  onMoveEnd?: () => void;
  /** Called when resize starts */
  onResizeStart?: (handle: HandlePosition) => void;
  /** Called during resize drag (delta in canvas coordinates) */
  onResize?: (handle: HandlePosition, deltaX: number, deltaY: number) => void;
  /** Called when resize ends */
  onResizeEnd?: (handle: HandlePosition) => void;
  /** Called when rotation starts */
  onRotateStart?: () => void;
  /** Called during rotation (angle in degrees from center) */
  onRotate?: (angle: number) => void;
  /** Called when rotation ends */
  onRotateEnd?: () => void;
  /** Whether the handles are interactive */
  interactive?: boolean;
};

type HandleConfig = {
  position: HandlePosition;
  x: number;
  y: number;
  cursor: string;
  isEdge: boolean;
};

/**
 * Default label formatter showing "width × height"
 */
function defaultFormatLabel(width: number, height: number): string {
  return `${Math.round(width)} × ${Math.round(height)}`;
}

/**
 * Get cursor for handle position, accounting for rotation
 */
function getRotatedCursor(position: HandlePosition, rotation: number): string {
  const baseCursors: Record<HandlePosition, number> = {
    "top": 0,
    "top-right": 45,
    "right": 90,
    "bottom-right": 135,
    "bottom": 180,
    "bottom-left": 225,
    "left": 270,
    "top-left": 315,
  };

  const cursorTypes = [
    "ns-resize",    // 0
    "nesw-resize",  // 45
    "ew-resize",    // 90
    "nwse-resize",  // 135
    "ns-resize",    // 180
    "nesw-resize",  // 225
    "ew-resize",    // 270
    "nwse-resize",  // 315
  ];

  const baseAngle = baseCursors[position];
  const adjustedAngle = (baseAngle + rotation + 360) % 360;
  const index = Math.round(adjustedAngle / 45) % 8;

  return cursorTypes[index];
}

/**
 * SVG rotation cursor (LuRotateCcw icon with white outline for visibility)
 * Based on Lucide's rotate-ccw icon
 */
const ROTATION_CURSOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="white" stroke-width="4"/>
  <path d="M3 3v5h5" stroke="white" stroke-width="4"/>
  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="black" stroke-width="2"/>
  <path d="M3 3v5h5" stroke="black" stroke-width="2"/>
</svg>`;
const ROTATION_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(ROTATION_CURSOR_SVG)}") 10 10, crosshair`;

/**
 * BoundingBox component for selection visualization and transform interactions
 */
export function BoundingBox({
  x,
  y,
  width,
  height,
  rotation = 0,
  strokeColor = "#18a0fb",
  strokeWidth = 1,
  handleFill = "#ffffff",
  handleStroke = "#18a0fb",
  handleSize = 8,
  showLabel = true,
  labelBackground = "#18a0fb",
  labelColor = "#ffffff",
  formatLabel = defaultFormatLabel,
  showRotationHandle = true,
  showEdgeHandles = true,
  rotationZoneSize = 12,
  onMoveStart,
  onMove,
  onMoveEnd,
  onResizeStart,
  onResize,
  onResizeEnd,
  onRotateStart,
  onRotate,
  onRotateEnd,
  interactive = true,
}: BoundingBoxProps): ReactNode {
  const { viewport, screenToCanvas } = useCanvasContext();
  const dragStateRef = useRef<{
    mode: InteractionMode;
    handle?: HandlePosition;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    // For rotation: store initial angle and rotation to calculate delta
    initialAngle?: number;
    initialRotation?: number;
  } | null>(null);

  // Scale sizes by inverse viewport scale for consistent screen appearance
  const scale = viewport.scale;
  const scaledStrokeWidth = strokeWidth / scale;
  const scaledHandleSize = handleSize / scale;
  const halfHandle = scaledHandleSize / 2;
  const scaledRotationZone = rotationZoneSize / scale;

  // Center point for rotation
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Handle positions (relative to box, before rotation)
  const cornerHandles: HandleConfig[] = [
    { position: "top-left", x: x - halfHandle, y: y - halfHandle, cursor: "nwse-resize", isEdge: false },
    { position: "top-right", x: x + width - halfHandle, y: y - halfHandle, cursor: "nesw-resize", isEdge: false },
    { position: "bottom-left", x: x - halfHandle, y: y + height - halfHandle, cursor: "nesw-resize", isEdge: false },
    { position: "bottom-right", x: x + width - halfHandle, y: y + height - halfHandle, cursor: "nwse-resize", isEdge: false },
  ];

  const edgeHandles: HandleConfig[] = [
    { position: "top", x: x + width / 2 - halfHandle, y: y - halfHandle, cursor: "ns-resize", isEdge: true },
    { position: "right", x: x + width - halfHandle, y: y + height / 2 - halfHandle, cursor: "ew-resize", isEdge: true },
    { position: "bottom", x: x + width / 2 - halfHandle, y: y + height - halfHandle, cursor: "ns-resize", isEdge: true },
    { position: "left", x: x - halfHandle, y: y + height / 2 - halfHandle, cursor: "ew-resize", isEdge: true },
  ];

  const handles = showEdgeHandles ? [...cornerHandles, ...edgeHandles] : cornerHandles;

  // Label positioning
  const labelPadding = 4 / scale;
  const labelFontSize = 11 / scale;
  const labelHeight = 18 / scale;
  const labelText = formatLabel(width, height);
  const labelWidth = (labelText.length * 7 + 12) / scale;
  const labelX = x + (width - labelWidth) / 2;
  const labelY = y + height + 6 / scale;

  const handlePointerDown = (
    mode: InteractionMode,
    event: ReactPointerEvent<SVGElement>,
    handle?: HandlePosition,
  ): void => {
    if (!interactive) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();

    const element = event.currentTarget;
    // setPointerCapture may not exist in JSDOM
    if (typeof element.setPointerCapture === "function") {
      element.setPointerCapture(event.pointerId);
    }

    const canvasPos = screenToCanvas(event.clientX, event.clientY);

    // For rotation, calculate the initial angle from center to pointer
    const initialAngle = mode === "rotate" ? matrixCalculateAngle(centerX, centerY, canvasPos.x, canvasPos.y) : undefined;

    dragStateRef.current = {
      mode,
      handle,
      startX: canvasPos.x,
      startY: canvasPos.y,
      lastX: canvasPos.x,
      lastY: canvasPos.y,
      initialAngle,
      initialRotation: mode === "rotate" ? rotation : undefined,
    };

    if (mode === "move") {
      onMoveStart?.();
    } else if (mode === "resize" && handle) {
      onResizeStart?.(handle);
    } else if (mode === "rotate") {
      onRotateStart?.();
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGElement>): void => {
    const state = dragStateRef.current;
    if (!state) {
      return;
    }

    const canvasPos = screenToCanvas(event.clientX, event.clientY);
    const deltaX = canvasPos.x - state.lastX;
    const deltaY = canvasPos.y - state.lastY;

    state.lastX = canvasPos.x;
    state.lastY = canvasPos.y;

    if (state.mode === "move") {
      onMove?.(deltaX, deltaY);
    } else if (state.mode === "resize" && state.handle) {
      onResize?.(state.handle, deltaX, deltaY);
    } else if (state.mode === "rotate" && state.initialAngle !== undefined && state.initialRotation !== undefined) {
      // Calculate current angle from center to pointer
      const currentAngle = matrixCalculateAngle(centerX, centerY, canvasPos.x, canvasPos.y);
      // Calculate delta from initial angle
      const deltaAngle = currentAngle - state.initialAngle;
      // Apply delta to initial rotation
      const newRotation = state.initialRotation + deltaAngle;
      onRotate?.(newRotation);
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<SVGElement>): void => {
    const state = dragStateRef.current;
    if (!state) {
      return;
    }

    const element = event.currentTarget;
    // releasePointerCapture may not exist in JSDOM
    if (typeof element.releasePointerCapture === "function") {
      element.releasePointerCapture(event.pointerId);
    }

    if (state.mode === "move") {
      onMoveEnd?.();
    } else if (state.mode === "resize" && state.handle) {
      onResizeEnd?.(state.handle);
    } else if (state.mode === "rotate") {
      onRotateEnd?.();
    }

    dragStateRef.current = null;
  };

  // Transform string for rotation
  const transform = rotation !== 0 ? `rotate(${rotation} ${centerX} ${centerY})` : undefined;

  return (
    <g data-testid="bounding-box" transform={transform}>
      {/* Selection border - handles move */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke={strokeColor}
        strokeWidth={scaledStrokeWidth}
        style={{
          pointerEvents: interactive ? "stroke" : "none",
          cursor: interactive ? "move" : "default",
        }}
        onPointerDown={(e) => handlePointerDown("move", e)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        data-testid="bounding-box-border"
      />

      {/* Invisible fill for easier move interaction */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="transparent"
        style={{
          pointerEvents: interactive ? "fill" : "none",
          cursor: interactive ? "move" : "default",
        }}
        onPointerDown={(e) => handlePointerDown("move", e)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        data-testid="bounding-box-move-area"
      />

      {/* Corner rotation zones - invisible areas outside corners for rotation */}
      {showRotationHandle && (
        <>
          {/* Top-left rotation zone */}
          <rect
            x={x - halfHandle - scaledRotationZone}
            y={y - halfHandle - scaledRotationZone}
            width={scaledRotationZone}
            height={scaledRotationZone}
            fill="transparent"
            style={{
              pointerEvents: interactive ? "all" : "none",
              cursor: interactive ? ROTATION_CURSOR : "default",
            }}
                        onPointerDown={(e) => handlePointerDown("rotate", e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            data-testid="bounding-box-rotation-zone-top-left"
          />
          {/* Top-right rotation zone */}
          <rect
            x={x + width + halfHandle}
            y={y - halfHandle - scaledRotationZone}
            width={scaledRotationZone}
            height={scaledRotationZone}
            fill="transparent"
            style={{
              pointerEvents: interactive ? "all" : "none",
              cursor: interactive ? ROTATION_CURSOR : "default",
            }}
                        onPointerDown={(e) => handlePointerDown("rotate", e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            data-testid="bounding-box-rotation-zone-top-right"
          />
          {/* Bottom-right rotation zone */}
          <rect
            x={x + width + halfHandle}
            y={y + height + halfHandle}
            width={scaledRotationZone}
            height={scaledRotationZone}
            fill="transparent"
            style={{
              pointerEvents: interactive ? "all" : "none",
              cursor: interactive ? ROTATION_CURSOR : "default",
            }}
                        onPointerDown={(e) => handlePointerDown("rotate", e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            data-testid="bounding-box-rotation-zone-bottom-right"
          />
          {/* Bottom-left rotation zone */}
          <rect
            x={x - halfHandle - scaledRotationZone}
            y={y + height + halfHandle}
            width={scaledRotationZone}
            height={scaledRotationZone}
            fill="transparent"
            style={{
              pointerEvents: interactive ? "all" : "none",
              cursor: interactive ? ROTATION_CURSOR : "default",
            }}
                        onPointerDown={(e) => handlePointerDown("rotate", e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            data-testid="bounding-box-rotation-zone-bottom-left"
          />
        </>
      )}

      {/* Resize handles */}
      {handles.map((handle) => (
        <rect
          key={handle.position}
          x={handle.x}
          y={handle.y}
          width={scaledHandleSize}
          height={scaledHandleSize}
          fill={handleFill}
          stroke={handleStroke}
          strokeWidth={scaledStrokeWidth}
          style={{
            pointerEvents: interactive ? "all" : "none",
            cursor: interactive ? getRotatedCursor(handle.position, rotation) : "default",
          }}
          onPointerDown={(e) => handlePointerDown("resize", e, handle.position)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          data-testid={`bounding-box-handle-${handle.position}`}
        />
      ))}

      {/* Size label */}
      {showLabel && (
        <g data-testid="bounding-box-label">
          <rect
            x={labelX}
            y={labelY}
            width={labelWidth}
            height={labelHeight}
            rx={3 / scale}
            ry={3 / scale}
            fill={labelBackground}
          />
          <text
            x={labelX + labelWidth / 2}
            y={labelY + labelHeight / 2 + labelPadding / 2}
            fill={labelColor}
            fontSize={labelFontSize}
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {labelText}
          </text>
        </g>
      )}
    </g>
  );
}
