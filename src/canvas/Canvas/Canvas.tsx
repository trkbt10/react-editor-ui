/**
 * @file Canvas component - SVG-based canvas with pan/zoom control
 *
 * @description
 * An infinite canvas with pan/zoom support via mouse, wheel, and touch gestures.
 * Combines SVG background layer for grid/guides with HTML content layer for nodes.
 * Provides context for children to convert between screen and canvas coordinates.
 *
 * @example
 * ```tsx
 * import { Canvas } from "react-editor-ui/canvas/Canvas";
 *
 * const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
 *
 * <Canvas
 *   viewport={viewport}
 *   onViewportChange={setViewport}
 *   width={800}
 *   height={600}
 *   showGrid
 * >
 *   <div style={{ position: "absolute", left: 100, top: 100 }}>Node</div>
 * </Canvas>
 * ```
 */

import { useRef, useMemo, useCallback, type ReactNode, type CSSProperties, type PointerEvent } from "react";
import { COLOR_SURFACE, COLOR_BORDER } from "../../themes/styles";
import { CanvasContext, type CanvasContextValue, type Point } from "../core/CanvasContext";
import { useGestures } from "../core/useGestures";
import type { CanvasProps } from "../core/types";
import { DEFAULT_CONSTRAINTS, DEFAULT_GESTURE_CONFIG } from "../core/types";
import { CanvasGridLayer } from "../CanvasGridLayer/CanvasGridLayer";


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
  svgLayers,
  className,
  style,
  "aria-label": ariaLabel = "Canvas",
  onBackgroundPointerDown,
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

  // Keep viewport in ref for stable function references
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  // Stable screen-to-canvas converter (reads viewport from ref)
  // Accounts for CSS transforms on parent containers (e.g., scale())
  const screenToCanvas = useCallback((screenX: number, screenY: number): Point => {
    const container = containerRef.current;
    const rect = container?.getBoundingClientRect();
    const vp = viewportRef.current;
    if (!rect || !container) {
      return { x: 0, y: 0 };
    }
    // Compute outer scale by comparing visual size (getBoundingClientRect) to CSS size (offsetWidth)
    // This accounts for CSS transform: scale() on parent containers
    const outerScale = rect.width / container.offsetWidth;
    return {
      x: (screenX - rect.left) / outerScale / vp.scale + vp.x,
      y: (screenY - rect.top) / outerScale / vp.scale + vp.y,
    };
  }, []);

  // Stable canvas-to-screen converter (reads viewport from ref)
  // Accounts for CSS transforms on parent containers (e.g., scale())
  const canvasToScreen = useCallback((canvasX: number, canvasY: number): Point => {
    const container = containerRef.current;
    const rect = container?.getBoundingClientRect();
    const vp = viewportRef.current;
    if (!rect || !container) {
      return { x: 0, y: 0 };
    }
    // Compute outer scale by comparing visual size (getBoundingClientRect) to CSS size (offsetWidth)
    const outerScale = rect.width / container.offsetWidth;
    return {
      x: (canvasX - vp.x) * vp.scale * outerScale + rect.left,
      y: (canvasY - vp.y) * vp.scale * outerScale + rect.top,
    };
  }, []);

  // Context value for children - functions are now stable
  const contextValue = useMemo((): CanvasContextValue => ({
    viewport,
    canvasWidth: width,
    canvasHeight: height,
    screenToCanvas,
    canvasToScreen,
  }), [viewport, width, height, screenToCanvas, canvasToScreen]);

  // Wrapped pointer down handler to detect background clicks
  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      // Call the gesture handler
      handlers.onPointerDown(e);

      // Check if clicking on background (container itself or SVG layer)
      if (onBackgroundPointerDown) {
        const target = e.target as Element;
        const isContainer = target === e.currentTarget;
        const isSvgBackground = target.getAttribute?.("data-testid") === "canvas-svg";
        if (isContainer || isSvgBackground) {
          onBackgroundPointerDown(e);
        }
      }
    },
    [handlers, onBackgroundPointerDown],
  );

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
    // z-index: 1 ensures SVG layers (connections, bounding boxes) render above HTML content
    zIndex: 1,
    // Allow pointer events to pass through to HTML layer below, except for SVG elements
    pointerEvents: "none",
  };

  const contentLayerStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    zIndex: 0,
    ...contentTransform,
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
      role="application"
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerCancel}
    >
      <CanvasContext.Provider value={contextValue}>
        {/* Background SVG layer */}
        <svg style={svgStyle} viewBox={viewBox} data-testid="canvas-svg">
          {/* Legacy showGrid prop support */}
          {showGrid && <CanvasGridLayer minorSize={gridSize} majorSize={gridSize * 10} />}
          {/* Custom SVG layers */}
          {svgLayers}
        </svg>

        {/* HTML Content layer */}
        <div style={contentLayerStyle} data-testid="canvas-content">
          {children}
        </div>
      </CanvasContext.Provider>
    </div>
  );
}

