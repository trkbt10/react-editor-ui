/**
 * @file CanvasRuler - Horizontal and Vertical rulers for Canvas
 *
 * These are standalone components positioned outside the Canvas element.
 * They receive viewport state directly via props.
 */

import { memo, useMemo, type ReactNode, type CSSProperties } from "react";
import {
  COLOR_CANVAS_RULER_BG,
  COLOR_CANVAS_RULER_TEXT,
  COLOR_CANVAS_RULER_TICK,
  COLOR_CANVAS_RULER_INDICATOR,
  COLOR_BORDER,
  SIZE_FONT_XS,
} from "../../constants/styles";
import type { ViewportState, RulerConfig } from "../core/types";
import { DEFAULT_RULER_CONFIG } from "../core/types";

type Orientation = "horizontal" | "vertical";

type BaseRulerProps = {
  viewport: ViewportState;
  /** Current mouse position indicator (canvas coordinate) */
  indicatorPosition?: number;
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
        result.push(
          <text
            key={`label-${pos}`}
            x={2}
            y={screenPos + 3}
            fill={COLOR_CANVAS_RULER_TEXT}
            fontSize={SIZE_FONT_XS}
            fontFamily="system-ui, -apple-system, sans-serif"
            transform={`rotate(-90, 2, ${screenPos + 3})`}
            dominantBaseline="hanging"
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
        x={2}
        y={screenPos + 3}
        fill={COLOR_CANVAS_RULER_INDICATOR}
        fontSize={SIZE_FONT_XS}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight={500}
        transform={`rotate(-90, 2, ${screenPos + 3})`}
        dominantBaseline="hanging"
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
}: CanvasHorizontalRulerProps): ReactNode {
  const { tickInterval, labelInterval } = getAdaptiveIntervals(
    viewport.scale,
    baseTickInterval,
    baseLabelInterval,
  );

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
      }),
    [startX, endX, tickInterval, labelInterval, viewport.x, viewport.scale, size, rulerOffset, width],
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
    });
  }, [indicatorPosition, viewport.x, viewport.scale, size, rulerOffset, width]);

  const containerStyle = useMemo(
    () =>
      getContainerStyle({
        orientation: "horizontal",
        size,
        length: width,
        screenOffset: rulerOffset,
      }),
    [size, width, rulerOffset],
  );

  return (
    <div style={containerStyle} data-testid="canvas-ruler-horizontal">
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
}: CanvasVerticalRulerProps): ReactNode {
  const { tickInterval, labelInterval } = getAdaptiveIntervals(
    viewport.scale,
    baseTickInterval,
    baseLabelInterval,
  );

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
      }),
    [startY, endY, tickInterval, labelInterval, viewport.y, viewport.scale, size, height],
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
    });
  }, [indicatorPosition, viewport.y, viewport.scale, size, height]);

  const containerStyle = useMemo(
    () =>
      getContainerStyle({
        orientation: "vertical",
        size,
        length: height,
        screenOffset: 0,
      }),
    [size, height],
  );

  return (
    <div style={containerStyle} data-testid="canvas-ruler-vertical">
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
