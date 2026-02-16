/**
 * @file CanvasRuler - Horizontal and Vertical rulers for Canvas
 *
 * These are standalone components positioned outside the Canvas element.
 * They receive viewport state directly via props.
 */

import type { ReactNode, CSSProperties } from "react";
import { useMemo } from "react";
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
 * Calculate adaptive tick intervals based on zoom level
 */
function getAdaptiveIntervals(
  scale: number,
  baseTickInterval: number,
  baseLabelInterval: number,
): { tickInterval: number; labelInterval: number } {
  // Find the best interval for the current scale
  const targetPixelsBetweenLabels = 50; // Aim for ~50px between labels on screen
  const baseInterval = baseLabelInterval;

  // Calculate what interval gives us ~50px on screen
  const idealInterval = targetPixelsBetweenLabels / scale;

  // Snap to nice numbers (1, 2, 5, 10, 20, 50, 100, etc.)
  const magnitude = Math.pow(10, Math.floor(Math.log10(idealInterval)));
  const normalized = idealInterval / magnitude;

  const getNiceFactor = (n: number): number => {
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
  };

  const labelInterval = getNiceFactor(normalized) * magnitude;
  const tickInterval = labelInterval / 5; // 5 ticks per label

  return {
    tickInterval: Math.max(tickInterval, baseTickInterval / 10),
    labelInterval: Math.max(labelInterval, baseInterval / 10),
  };
}

/**
 * Horizontal ruler (top)
 */
export function CanvasHorizontalRuler({
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

  const ticks = useMemo(() => {
    const result: ReactNode[] = [];

    for (let x = startX; x <= endX; x += tickInterval) {
      const isLabel = Math.abs(x % labelInterval) < tickInterval / 2;
      const screenX = (x - viewport.x) * viewport.scale + rulerOffset;

      if (screenX < rulerOffset || screenX > width + rulerOffset) {
        continue;
      }

      const tickHeight = isLabel ? size * 0.5 : size * 0.25;

      result.push(
        <line
          key={`tick-${x}`}
          x1={screenX}
          y1={size - 1}
          x2={screenX}
          y2={size - 1 - tickHeight}
          stroke={COLOR_CANVAS_RULER_TICK}
          strokeWidth={1}
        />,
      );

      if (isLabel) {
        // Round to avoid floating point display issues
        const label = Math.round(x);
        result.push(
          <text
            key={`label-${x}`}
            x={screenX + 3}
            y={size - tickHeight - 3}
            fill={COLOR_CANVAS_RULER_TEXT}
            fontSize={SIZE_FONT_XS}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {label}
          </text>,
        );
      }
    }

    return result;
  }, [startX, endX, tickInterval, labelInterval, viewport, size, rulerOffset, width]);

  // Indicator for current mouse position
  const indicator = useMemo(() => {
    if (indicatorPosition === undefined) {
      return null;
    }

    const screenX = (indicatorPosition - viewport.x) * viewport.scale + rulerOffset;
    if (screenX < rulerOffset || screenX > width + rulerOffset) {
      return null;
    }

    const label = Math.round(indicatorPosition);
    return (
      <g key="indicator">
        <line
          x1={screenX}
          y1={0}
          x2={screenX}
          y2={size}
          stroke={COLOR_CANVAS_RULER_INDICATOR}
          strokeWidth={1}
        />
        <text
          x={screenX + 3}
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
  }, [indicatorPosition, viewport, size, rulerOffset, width]);

  const containerStyle: CSSProperties = {
    position: "relative",
    width: width + rulerOffset,
    height: size,
    background: COLOR_CANVAS_RULER_BG,
    borderBottom: `1px solid ${COLOR_BORDER}`,
    overflow: "hidden",
    userSelect: "none",
    flexShrink: 0,
  };

  return (
    <div style={containerStyle} data-testid="canvas-ruler-horizontal">
      <svg width={width + rulerOffset} height={size}>
        {ticks}
        {indicator}
      </svg>
    </div>
  );
}

/**
 * Vertical ruler (left)
 */
export function CanvasVerticalRuler({
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

  const ticks = useMemo(() => {
    const result: ReactNode[] = [];

    for (let y = startY; y <= endY; y += tickInterval) {
      const isLabel = Math.abs(y % labelInterval) < tickInterval / 2;
      const screenY = (y - viewport.y) * viewport.scale;

      if (screenY < 0 || screenY > height) {
        continue;
      }

      const tickWidth = isLabel ? size * 0.5 : size * 0.25;

      result.push(
        <line
          key={`tick-${y}`}
          x1={size - 1}
          y1={screenY}
          x2={size - 1 - tickWidth}
          y2={screenY}
          stroke={COLOR_CANVAS_RULER_TICK}
          strokeWidth={1}
        />,
      );

      if (isLabel) {
        const label = Math.round(y);
        // Rotate text 90 degrees for vertical ruler
        result.push(
          <text
            key={`label-${y}`}
            x={2}
            y={screenY + 3}
            fill={COLOR_CANVAS_RULER_TEXT}
            fontSize={SIZE_FONT_XS}
            fontFamily="system-ui, -apple-system, sans-serif"
            transform={`rotate(-90, 2, ${screenY + 3})`}
            dominantBaseline="hanging"
          >
            {label}
          </text>,
        );
      }
    }

    return result;
  }, [startY, endY, tickInterval, labelInterval, viewport, size, height]);

  // Indicator for current mouse position
  const indicator = useMemo(() => {
    if (indicatorPosition === undefined) {
      return null;
    }

    const screenY = (indicatorPosition - viewport.y) * viewport.scale;
    if (screenY < 0 || screenY > height) {
      return null;
    }

    const label = Math.round(indicatorPosition);
    return (
      <g key="indicator">
        <line
          x1={0}
          y1={screenY}
          x2={size}
          y2={screenY}
          stroke={COLOR_CANVAS_RULER_INDICATOR}
          strokeWidth={1}
        />
        <text
          x={2}
          y={screenY + 3}
          fill={COLOR_CANVAS_RULER_INDICATOR}
          fontSize={SIZE_FONT_XS}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight={500}
          transform={`rotate(-90, 2, ${screenY + 3})`}
          dominantBaseline="hanging"
        >
          {label}
        </text>
      </g>
    );
  }, [indicatorPosition, viewport, size, height]);

  const containerStyle: CSSProperties = {
    position: "relative",
    width: size,
    height,
    background: COLOR_CANVAS_RULER_BG,
    borderRight: `1px solid ${COLOR_BORDER}`,
    overflow: "hidden",
    userSelect: "none",
    flexShrink: 0,
  };

  return (
    <div style={containerStyle} data-testid="canvas-ruler-vertical">
      <svg width={size} height={height}>
        {ticks}
        {indicator}
      </svg>
    </div>
  );
}

/**
 * Corner piece connecting horizontal and vertical rulers
 */
export function CanvasRulerCorner({
  size = DEFAULT_RULER_CONFIG.size,
}: CanvasRulerCornerProps): ReactNode {
  const style: CSSProperties = {
    width: size,
    height: size,
    background: COLOR_CANVAS_RULER_BG,
    borderRight: `1px solid ${COLOR_BORDER}`,
    borderBottom: `1px solid ${COLOR_BORDER}`,
    boxSizing: "border-box",
    flexShrink: 0,
  };

  return <div style={style} data-testid="canvas-ruler-corner" />;
}
