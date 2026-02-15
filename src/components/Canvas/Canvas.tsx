/**
 * @file Canvas component - SVG-based canvas with pan/zoom control
 *
 * Features:
 * - SVG background layer for grid/rulers
 * - HTML content layer with CSS transform for pan/zoom
 * - Pointer events for pan gesture (middle mouse, alt+left, space+left)
 * - Wheel zoom (including pinch-to-zoom via ctrl+wheel)
 * - Touch pinch-to-zoom
 * - Context for children to access viewport state
 */

import { useRef, useMemo, type ReactNode, type CSSProperties } from "react";
import { COLOR_SURFACE, COLOR_BORDER, COLOR_TEXT_MUTED } from "../../constants/styles";
import { CanvasContext, type CanvasContextValue, type Point } from "./core/CanvasContext";
import { useGestures } from "./core/useGestures";
import type { CanvasProps, ViewportState } from "./core/types";
import { DEFAULT_CONSTRAINTS, DEFAULT_GESTURE_CONFIG } from "./core/types";

/**
 * Grid pattern component for canvas background
 */
type CanvasGridProps = {
  gridSize: number;
  viewport: ViewportState;
  width: number;
  height: number;
};

function CanvasGrid({ gridSize, viewport, width, height }: CanvasGridProps): ReactNode {
  // Calculate viewBox dimensions
  const viewWidth = width / viewport.scale;
  const viewHeight = height / viewport.scale;

  // Calculate grid lines based on viewport
  const startX = Math.floor(viewport.x / gridSize) * gridSize;
  const startY = Math.floor(viewport.y / gridSize) * gridSize;
  const endX = viewport.x + viewWidth;
  const endY = viewport.y + viewHeight;

  const verticalLines: ReactNode[] = [];
  const horizontalLines: ReactNode[] = [];

  for (let x = startX; x <= endX; x += gridSize) {
    verticalLines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={viewport.y}
        x2={x}
        y2={viewport.y + viewHeight}
        stroke={COLOR_TEXT_MUTED}
        strokeWidth={1 / viewport.scale}
        opacity={0.3}
      />,
    );
  }

  for (let y = startY; y <= endY; y += gridSize) {
    horizontalLines.push(
      <line
        key={`h-${y}`}
        x1={viewport.x}
        y1={y}
        x2={viewport.x + viewWidth}
        y2={y}
        stroke={COLOR_TEXT_MUTED}
        strokeWidth={1 / viewport.scale}
        opacity={0.3}
      />,
    );
  }

  return (
    <g>
      {verticalLines}
      {horizontalLines}
    </g>
  );
}

/**
 * Canvas component for pan/zoom interactions
 */
export function Canvas({
  viewport,
  onViewportChange,
  width,
  height,
  children,
  constraints: partialConstraints,
  gestureConfig: partialGestureConfig,
  background,
  showGrid = false,
  gridSize = 10,
  className,
  style,
  "aria-label": ariaLabel = "Canvas",
}: CanvasProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);

  const constraints = { ...DEFAULT_CONSTRAINTS, ...partialConstraints };
  const gestureConfig = { ...DEFAULT_GESTURE_CONFIG, ...partialGestureConfig };

  const { handlers, isPanning, isSpacePanning } = useGestures({
    viewport,
    onViewportChange,
    gestureConfig,
    constraints,
    containerRef,
  });

  // Calculate viewBox based on viewport state
  const viewBox = useMemo(() => {
    const viewWidth = width / viewport.scale;
    const viewHeight = height / viewport.scale;
    return `${viewport.x} ${viewport.y} ${viewWidth} ${viewHeight}`;
  }, [viewport, width, height]);

  // Transform for HTML content layer
  const contentTransform = useMemo(
    (): CSSProperties => ({
      transform: `scale(${viewport.scale}) translate(${-viewport.x}px, ${-viewport.y}px)`,
      transformOrigin: "0 0",
    }),
    [viewport],
  );

  // Context value for children
  const contextValue = useMemo((): CanvasContextValue => {
    const screenToCanvas = (screenX: number, screenY: number): Point => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) {
        return { x: 0, y: 0 };
      }
      return {
        x: (screenX - rect.left) / viewport.scale + viewport.x,
        y: (screenY - rect.top) / viewport.scale + viewport.y,
      };
    };

    const canvasToScreen = (canvasX: number, canvasY: number): Point => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) {
        return { x: 0, y: 0 };
      }
      return {
        x: (canvasX - viewport.x) * viewport.scale + rect.left,
        y: (canvasY - viewport.y) * viewport.scale + rect.top,
      };
    };

    return {
      viewport,
      canvasWidth: width,
      canvasHeight: height,
      screenToCanvas,
      canvasToScreen,
    };
  }, [viewport, width, height]);

  // Determine cursor based on state
  const getCursor = (): string => {
    if (isPanning) {
      return "grabbing";
    }
    if (isSpacePanning) {
      return "grab";
    }
    return "default";
  };

  const containerStyle: CSSProperties = {
    position: "relative",
    width,
    height,
    overflow: "hidden",
    touchAction: "none",
    cursor: getCursor(),
    background: background ?? COLOR_SURFACE,
    border: `1px solid ${COLOR_BORDER}`,
    boxSizing: "border-box",
    // iOS Safari specific: prevent default touch behaviors
    WebkitTouchCallout: "none",
    WebkitUserSelect: "none",
    userSelect: "none",
    // Prevent iOS bounce scroll
    overscrollBehavior: "none",
    ...style,
  };

  const svgStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  };

  const contentLayerStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    ...contentTransform,
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
      role="application"
      aria-label={ariaLabel}
      {...handlers}
    >
      <CanvasContext.Provider value={contextValue}>
        {/* Background SVG layer */}
        <svg style={svgStyle} viewBox={viewBox} data-testid="canvas-svg">
          {showGrid && (
            <CanvasGrid gridSize={gridSize} viewport={viewport} width={width} height={height} />
          )}
        </svg>

        {/* HTML Content layer */}
        <div style={contentLayerStyle} data-testid="canvas-content">
          {children}
        </div>
      </CanvasContext.Provider>
    </div>
  );
}
