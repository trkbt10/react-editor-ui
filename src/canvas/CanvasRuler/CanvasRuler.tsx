/**
 * @file CanvasRuler component - Horizontal and Vertical rulers for Canvas
 *
 * @description
 * Renders measurement rulers positioned outside the Canvas element.
 * Shows tick marks, labels, and mouse position indicator.
 * Receives viewport state via props for synchronization.
 * Double-click on ruler to add a guide line at that position.
 *
 * @example
 * ```tsx
 * import { CanvasRuler } from "react-editor-ui/canvas/CanvasRuler";
 *
 * <CanvasRuler
 *   orientation="horizontal"
 *   viewport={viewport}
 *   length={800}
 *   mousePosition={100}
 *   onAddGuide={(guide) => setGuides([...guides, guide])}
 * />
 * ```
 */

import { memo, useMemo, useRef, useCallback, type ReactNode, type CSSProperties } from "react";
import {
  COLOR_CANVAS_RULER_BG,
  COLOR_CANVAS_RULER_TEXT,
  COLOR_CANVAS_RULER_TICK,
  COLOR_CANVAS_RULER_INDICATOR,
  COLOR_BORDER,
  SIZE_FONT_XS,
} from "../../themes/styles";
import type { ViewportState, RulerConfig, CanvasGuide } from "../core/types";
import { DEFAULT_RULER_CONFIG } from "../core/types";

type Orientation = "horizontal" | "vertical";

type BaseRulerProps = {
  viewport: ViewportState;
  /** Current mouse position indicator (canvas coordinate) */
  indicatorPosition?: number;
  /** Called when user double-clicks to add a guide */
  onAddGuide?: (guide: CanvasGuide) => void;
} & Partial<RulerConfig>;

export type CanvasHorizontalRulerProps = BaseRulerProps & {
  /** Ruler width (should match canvas width) */
  width: number;
  /** Left offset for ruler corner space */
  rulerOffset?: number;
};

export type CanvasVerticalRulerProps = BaseRulerProps & {
  /** Ruler height (should match canvas height) */
  height: number;
};

export type CanvasRulerCornerProps = {
  /** Corner size (matches ruler size) */
  size?: number;
};

/**
 * Snap to nice numbers (1, 2, 5, 10, 20, 50, 100, etc.)
 */
function getNiceFactor(n: number): number {
  if (n < 1.5) {
    return 1;
  }
  if (n < 3.5) {
    return 2;
  }
  if (n < 7.5) {
    return 5;
  }
  return 10;
}

/**
 * Calculate adaptive tick intervals based on zoom level
 */
function getAdaptiveIntervals(
  scale: number,
  baseTickInterval: number,
  baseLabelInterval: number,
): { tickInterval: number; labelInterval: number } {
  const targetPixelsBetweenLabels = 50;
  const idealInterval = targetPixelsBetweenLabels / scale;
  const magnitude = Math.pow(10, Math.floor(Math.log10(idealInterval)));
  const normalized = idealInterval / magnitude;

  const labelInterval = getNiceFactor(normalized) * magnitude;
  const tickInterval = labelInterval / 5;

  return {
    tickInterval: Math.max(tickInterval, baseTickInterval / 10),
    labelInterval: Math.max(labelInterval, baseLabelInterval / 10),
  };
}

type TickParams = {
  orientation: Orientation;
  start: number;
  end: number;
  tickInterval: number;
  labelInterval: number;
  viewportOffset: number;
  scale: number;
  size: number;
  screenOffset: number;
  length: number;
  /**
   * Font bounding box ascent for iOS-compatible SVG text positioning.
   * iOS does not support dominant-baseline="hanging".
   */
  fontBoundingBoxAscent: number;
};

/**
 * Generate tick and label elements for ruler
 */
function generateTicks(params: TickParams): ReactNode[] {
  const {
    orientation,
    start,
    end,
    tickInterval,
    labelInterval,
    viewportOffset,
    scale,
    size,
    screenOffset,
    length,
    fontBoundingBoxAscent,
  } = params;

  const isHorizontal = orientation === "horizontal";
  const result: ReactNode[] = [];

  for (let pos = start; pos <= end; pos += tickInterval) {
    const isLabel = Math.abs(pos % labelInterval) < tickInterval / 2;
    const screenPos = (pos - viewportOffset) * scale + screenOffset;

    if (screenPos < screenOffset || screenPos > length + screenOffset) {
      continue;
    }

    const tickSize = isLabel ? size * 0.5 : size * 0.25;

    if (isHorizontal) {
      result.push(
        <line
          key={`tick-${pos}`}
          x1={screenPos}
          y1={size - 1}
          x2={screenPos}
          y2={size - 1 - tickSize}
          stroke={COLOR_CANVAS_RULER_TICK}
          strokeWidth={1}
        />,
      );
    } else {
      result.push(
        <line
          key={`tick-${pos}`}
          x1={size - 1}
          y1={screenPos}
          x2={size - 1 - tickSize}
          y2={screenPos}
          stroke={COLOR_CANVAS_RULER_TICK}
          strokeWidth={1}
        />,
      );
    }

    if (isLabel) {
      const label = Math.round(pos);

      if (isHorizontal) {
        result.push(
          <text
            key={`label-${pos}`}
            x={screenPos + 3}
            y={size - tickSize - 3}
            fill={COLOR_CANVAS_RULER_TEXT}
            fontSize={SIZE_FONT_XS}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {label}
          </text>,
        );
      } else {
        // iOS does not support dominant-baseline="hanging".
        // For vertical ruler, we position text at the bottom of the ruler
        // and rotate it so it reads from bottom to top.
        // The text is anchored at the end (right side before rotation, bottom after rotation)
        // Use tickSize offset to prevent label from overlapping with tick marks
        const textX = size - tickSize - 3;
        const textY = screenPos - 3;
        result.push(
          <text
            key={`label-${pos}`}
            x={textX}
            y={textY}
            fill={COLOR_CANVAS_RULER_TEXT}
            fontSize={SIZE_FONT_XS}
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor="end"
            transform={`rotate(-90, ${textX}, ${textY})`}
          >
            {label}
          </text>,
        );
      }
    }
  }

  return result;
}

type IndicatorParams = {
  orientation: Orientation;
  position: number;
  viewportOffset: number;
  scale: number;
  size: number;
  screenOffset: number;
  length: number;
  /**
   * Font bounding box ascent for iOS-compatible SVG text positioning.
   */
  fontBoundingBoxAscent: number;
};

/**
 * Generate indicator element for current mouse position
 */
function generateIndicator(params: IndicatorParams): ReactNode {
  const {
    orientation,
    position,
    viewportOffset,
    scale,
    size,
    screenOffset,
    length,
    fontBoundingBoxAscent,
  } = params;

  const screenPos = (position - viewportOffset) * scale + screenOffset;
  if (screenPos < screenOffset || screenPos > length + screenOffset) {
    return null;
  }

  const label = Math.round(position);
  const isHorizontal = orientation === "horizontal";

  if (isHorizontal) {
    return (
      <g key="indicator">
        <line
          x1={screenPos}
          y1={0}
          x2={screenPos}
          y2={size}
          stroke={COLOR_CANVAS_RULER_INDICATOR}
          strokeWidth={1}
        />
        <text
          x={screenPos + 3}
          y={size * 0.6}
          fill={COLOR_CANVAS_RULER_INDICATOR}
          fontSize={SIZE_FONT_XS}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight={500}
        >
          {label}
        </text>
      </g>
    );
  }

  // For vertical ruler, position text similar to ticks
  // Use half of ruler size as offset to prevent overlapping with indicator line
  const textX = size * 0.5 - 3;
  const textY = screenPos - 3;
  return (
    <g key="indicator">
      <line
        x1={0}
        y1={screenPos}
        x2={size}
        y2={screenPos}
        stroke={COLOR_CANVAS_RULER_INDICATOR}
        strokeWidth={1}
      />
      <text
        x={textX}
        y={textY}
        fill={COLOR_CANVAS_RULER_INDICATOR}
        fontSize={SIZE_FONT_XS}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight={500}
        textAnchor="end"
        transform={`rotate(-90, ${textX}, ${textY})`}
      >
        {label}
      </text>
    </g>
  );
}

type ContainerStyleParams = {
  orientation: Orientation;
  size: number;
  length: number;
  screenOffset: number;
};

/**
 * Generate container style for ruler
 */
function getContainerStyle(params: ContainerStyleParams): CSSProperties {
  const { orientation, size, length, screenOffset } = params;
  const isHorizontal = orientation === "horizontal";

  return {
    position: "relative",
    width: isHorizontal ? length + screenOffset : size,
    height: isHorizontal ? size : length,
    background: COLOR_CANVAS_RULER_BG,
    borderBottom: isHorizontal ? `1px solid ${COLOR_BORDER}` : undefined,
    borderRight: isHorizontal ? undefined : `1px solid ${COLOR_BORDER}`,
    overflow: "hidden",
    userSelect: "none",
    flexShrink: 0,
  };
}

/**
 * Generate unique ID for guide
 */
function generateGuideId(): string {
  return `guide-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Horizontal ruler (top)
 */
export const CanvasHorizontalRuler = memo(function CanvasHorizontalRuler({
  viewport,
  width,
  rulerOffset = 0,
  size = DEFAULT_RULER_CONFIG.size,
  tickInterval: baseTickInterval = DEFAULT_RULER_CONFIG.tickInterval,
  labelInterval: baseLabelInterval = DEFAULT_RULER_CONFIG.labelInterval,
  indicatorPosition,
  onAddGuide,
}: CanvasHorizontalRulerProps): ReactNode {
  const { tickInterval, labelInterval } = getAdaptiveIntervals(
    viewport.scale,
    baseTickInterval,
    baseLabelInterval,
  );

  // Font size in pixels for ruler labels
  const RULER_FONT_SIZE_PX = 9;

  // Canvas context for font metrics (iOS-compatible SVG text positioning)
  const measureCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const fontBoundingBoxAscent = useMemo(() => {
    if (!measureCtxRef.current) {
      const canvas = document.createElement("canvas");
      measureCtxRef.current = canvas.getContext("2d");
    }
    const ctx = measureCtxRef.current;
    if (!ctx) {
      // Fallback for environments without canvas
      return RULER_FONT_SIZE_PX * 0.75;
    }
    ctx.font = `normal normal ${RULER_FONT_SIZE_PX}px system-ui, -apple-system, sans-serif`;
    const metrics = ctx.measureText("M");
    return metrics.fontBoundingBoxAscent;
  }, []);

  const viewWidth = width / viewport.scale;
  const startX = Math.floor(viewport.x / tickInterval) * tickInterval;
  const endX = viewport.x + viewWidth;

  const ticks = useMemo(
    () =>
      generateTicks({
        orientation: "horizontal",
        start: startX,
        end: endX,
        tickInterval,
        labelInterval,
        viewportOffset: viewport.x,
        scale: viewport.scale,
        size,
        screenOffset: rulerOffset,
        length: width,
        fontBoundingBoxAscent,
      }),
    [startX, endX, tickInterval, labelInterval, viewport.x, viewport.scale, size, rulerOffset, width, fontBoundingBoxAscent],
  );

  const indicator = useMemo(() => {
    if (indicatorPosition === undefined) {
      return null;
    }
    return generateIndicator({
      orientation: "horizontal",
      position: indicatorPosition,
      viewportOffset: viewport.x,
      scale: viewport.scale,
      size,
      screenOffset: rulerOffset,
      length: width,
      fontBoundingBoxAscent,
    });
  }, [indicatorPosition, viewport.x, viewport.scale, size, rulerOffset, width, fontBoundingBoxAscent]);

  const containerStyle = useMemo(
    () => ({
      ...getContainerStyle({
        orientation: "horizontal",
        size,
        length: width,
        screenOffset: rulerOffset,
      }),
      cursor: onAddGuide ? "crosshair" : undefined,
    }),
    [size, width, rulerOffset, onAddGuide],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onAddGuide) {return;}
      const rect = e.currentTarget.getBoundingClientRect();
      const screenX = e.clientX - rect.left - rulerOffset;
      // Convert screen position to canvas position
      const canvasX = screenX / viewport.scale + viewport.x;
      onAddGuide({
        id: generateGuideId(),
        orientation: "vertical",
        position: Math.round(canvasX),
        locked: false,
      });
    },
    [onAddGuide, rulerOffset, viewport.scale, viewport.x],
  );

  return (
    <div
      style={containerStyle}
      data-testid="canvas-ruler-horizontal"
      onDoubleClick={handleDoubleClick}
    >
      <svg width={width + rulerOffset} height={size}>
        {ticks}
        {indicator}
      </svg>
    </div>
  );
});

/**
 * Vertical ruler (left)
 */
export const CanvasVerticalRuler = memo(function CanvasVerticalRuler({
  viewport,
  height,
  size = DEFAULT_RULER_CONFIG.size,
  tickInterval: baseTickInterval = DEFAULT_RULER_CONFIG.tickInterval,
  labelInterval: baseLabelInterval = DEFAULT_RULER_CONFIG.labelInterval,
  indicatorPosition,
  onAddGuide,
}: CanvasVerticalRulerProps): ReactNode {
  const { tickInterval, labelInterval } = getAdaptiveIntervals(
    viewport.scale,
    baseTickInterval,
    baseLabelInterval,
  );

  // Font size in pixels for ruler labels
  const RULER_FONT_SIZE_PX = 9;

  // Canvas context for font metrics (iOS-compatible SVG text positioning)
  const measureCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const fontBoundingBoxAscent = useMemo(() => {
    if (!measureCtxRef.current) {
      const canvas = document.createElement("canvas");
      measureCtxRef.current = canvas.getContext("2d");
    }
    const ctx = measureCtxRef.current;
    if (!ctx) {
      // Fallback for environments without canvas
      return RULER_FONT_SIZE_PX * 0.75;
    }
    ctx.font = `normal normal ${RULER_FONT_SIZE_PX}px system-ui, -apple-system, sans-serif`;
    const metrics = ctx.measureText("M");
    return metrics.fontBoundingBoxAscent;
  }, []);

  const viewHeight = height / viewport.scale;
  const startY = Math.floor(viewport.y / tickInterval) * tickInterval;
  const endY = viewport.y + viewHeight;

  const ticks = useMemo(
    () =>
      generateTicks({
        orientation: "vertical",
        start: startY,
        end: endY,
        tickInterval,
        labelInterval,
        viewportOffset: viewport.y,
        scale: viewport.scale,
        size,
        screenOffset: 0,
        length: height,
        fontBoundingBoxAscent,
      }),
    [startY, endY, tickInterval, labelInterval, viewport.y, viewport.scale, size, height, fontBoundingBoxAscent],
  );

  const indicator = useMemo(() => {
    if (indicatorPosition === undefined) {
      return null;
    }
    return generateIndicator({
      orientation: "vertical",
      position: indicatorPosition,
      viewportOffset: viewport.y,
      scale: viewport.scale,
      size,
      screenOffset: 0,
      length: height,
      fontBoundingBoxAscent,
    });
  }, [indicatorPosition, viewport.y, viewport.scale, size, height, fontBoundingBoxAscent]);

  const containerStyle = useMemo(
    () => ({
      ...getContainerStyle({
        orientation: "vertical",
        size,
        length: height,
        screenOffset: 0,
      }),
      cursor: onAddGuide ? "crosshair" : undefined,
    }),
    [size, height, onAddGuide],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onAddGuide) {return;}
      const rect = e.currentTarget.getBoundingClientRect();
      const screenY = e.clientY - rect.top;
      // Convert screen position to canvas position
      const canvasY = screenY / viewport.scale + viewport.y;
      onAddGuide({
        id: generateGuideId(),
        orientation: "horizontal",
        position: Math.round(canvasY),
        locked: false,
      });
    },
    [onAddGuide, viewport.scale, viewport.y],
  );

  return (
    <div
      style={containerStyle}
      data-testid="canvas-ruler-vertical"
      onDoubleClick={handleDoubleClick}
    >
      <svg width={size} height={height}>
        {ticks}
        {indicator}
      </svg>
    </div>
  );
});

/**
 * Corner piece connecting horizontal and vertical rulers
 */
export const CanvasRulerCorner = memo(function CanvasRulerCorner({
  size = DEFAULT_RULER_CONFIG.size,
}: CanvasRulerCornerProps): ReactNode {
  const style: CSSProperties = useMemo(
    () => ({
      width: size,
      height: size,
      background: COLOR_CANVAS_RULER_BG,
      borderRight: `1px solid ${COLOR_BORDER}`,
      borderBottom: `1px solid ${COLOR_BORDER}`,
      boxSizing: "border-box",
      flexShrink: 0,
    }),
    [size],
  );

  return <div style={style} data-testid="canvas-ruler-corner" />;
});
