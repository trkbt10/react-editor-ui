/**
 * @file BezierCurveEditor component - Interactive cubic bezier curve editor
 *
 * @description
 * SVG-based editor for cubic bezier easing curves with draggable control points.
 * P0 (0,0) and P3 (1,1) are fixed; P1 and P2 are adjustable.
 *
 * @example
 * ```tsx
 * import { BezierCurveEditor } from "react-editor-ui/BezierCurveEditor";
 * import { useState } from "react";
 *
 * const [points, setPoints] = useState<[number, number, number, number]>([0.25, 0.1, 0.25, 1]);
 *
 * <BezierCurveEditor
 *   value={points}
 *   onChange={setPoints}
 *   aria-label="Easing curve editor"
 * />
 * ```
 */

import { memo, useRef, useCallback, useMemo } from "react";
import type { CSSProperties, PointerEvent } from "react";
import {
  COLOR_BORDER,
  COLOR_PRIMARY,
  COLOR_TEXT_MUTED,
  COLOR_SURFACE,
  RADIUS_SM,
} from "../../constants/styles";
import type { BezierControlPoints } from "./bezierTypes";

export type BezierCurveEditorProps = {
  value: BezierControlPoints;
  onChange: (value: BezierControlPoints) => void;
  width?: number;
  height?: number;
  disabled?: boolean;
  showGrid?: boolean;
  "aria-label"?: string;
};

const PADDING = 16;
const HANDLE_RADIUS = 6;
const HANDLE_HIT_RADIUS = 12;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

type DragHandle = "p1" | "p2";

type ControlPointHandleProps = {
  cx: number;
  cy: number;
  handleId: DragHandle;
  disabled: boolean;
  onPointerDown: (e: PointerEvent<SVGCircleElement>, handle: DragHandle) => void;
};

const hitAreaStyle: CSSProperties = { cursor: "grab" };
const hitAreaDisabledStyle: CSSProperties = { cursor: "not-allowed" };
const visualHandleStyle: CSSProperties = { pointerEvents: "none" };

const ControlPointHandle = memo(function ControlPointHandle({
  cx,
  cy,
  handleId,
  disabled,
  onPointerDown,
}: ControlPointHandleProps) {
  const handlePointerDown = useCallback(
    (e: PointerEvent<SVGCircleElement>) => {
      onPointerDown(e, handleId);
    },
    [onPointerDown, handleId],
  );

  return (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={HANDLE_HIT_RADIUS}
        fill="transparent"
        style={disabled ? hitAreaDisabledStyle : hitAreaStyle}
        onPointerDown={handlePointerDown}
      />
      <circle
        cx={cx}
        cy={cy}
        r={HANDLE_RADIUS}
        fill={COLOR_PRIMARY}
        stroke={COLOR_SURFACE}
        strokeWidth={2}
        style={visualHandleStyle}
      />
    </>
  );
});

export const BezierCurveEditor = memo(function BezierCurveEditor({
  value,
  onChange,
  width = 200,
  height = 150,
  disabled = false,
  showGrid = true,
  "aria-label": ariaLabel,
}: BezierCurveEditorProps) {
  const containerRef = useRef<SVGSVGElement>(null);
  const draggingHandle = useRef<DragHandle | null>(null);

  const [x1, y1, x2, y2] = value;

  // Content area dimensions (excluding padding)
  const contentWidth = width - 2 * PADDING;
  const contentHeight = height - 2 * PADDING;

  // Convert normalized [0,1] coordinates to SVG pixel coordinates
  // Note: Y axis is flipped (0 at bottom, 1 at top)
  const toSvgX = useCallback(
    (x: number) => PADDING + x * contentWidth,
    [contentWidth]
  );
  const toSvgY = useCallback(
    (y: number) => PADDING + (1 - y) * contentHeight,
    [contentHeight]
  );

  // Convert SVG pixel coordinates to normalized [0,1]
  const fromSvgX = useCallback(
    (svgX: number) => clamp((svgX - PADDING) / contentWidth, 0, 1),
    [contentWidth]
  );
  const fromSvgY = useCallback(
    (svgY: number) => clamp(1 - (svgY - PADDING) / contentHeight, 0, 1),
    [contentHeight]
  );

  // Fixed points
  const p0 = useMemo(() => ({ x: toSvgX(0), y: toSvgY(0) }), [toSvgX, toSvgY]);
  const p3 = useMemo(() => ({ x: toSvgX(1), y: toSvgY(1) }), [toSvgX, toSvgY]);

  // Control points
  const p1 = useMemo(() => ({ x: toSvgX(x1), y: toSvgY(y1) }), [toSvgX, toSvgY, x1, y1]);
  const p2 = useMemo(() => ({ x: toSvgX(x2), y: toSvgY(y2) }), [toSvgX, toSvgY, x2, y2]);

  // Bezier curve path
  const curvePath = useMemo(
    () =>
      `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`,
    [p0, p1, p2, p3]
  );

  // Handle pointer events
  const handlePointerDown = useCallback(
    (e: PointerEvent<SVGCircleElement>, handle: DragHandle) => {
      if (disabled) {
        return;
      }
      e.stopPropagation();
      draggingHandle.current = handle;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [disabled]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      if (!draggingHandle.current || disabled) {
        return;
      }

      const svg = containerRef.current;
      if (!svg) {
        return;
      }

      const rect = svg.getBoundingClientRect();
      const svgX = e.clientX - rect.left;
      const svgY = e.clientY - rect.top;

      const normalX = fromSvgX(svgX);
      const normalY = fromSvgY(svgY);

      const newValue: BezierControlPoints = [...value];
      if (draggingHandle.current === "p1") {
        newValue[0] = normalX;
        newValue[1] = normalY;
      } else {
        newValue[2] = normalX;
        newValue[3] = normalY;
      }

      onChange(newValue);
    },
    [disabled, fromSvgX, fromSvgY, onChange, value]
  );

  const handlePointerUp = useCallback(() => {
    draggingHandle.current = null;
  }, []);

  // Grid lines (quarters)
  const gridLines = useMemo(() => {
    if (!showGrid) {
      return null;
    }

    const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    const divisions = 4;

    for (let i = 0; i <= divisions; i++) {
      const pos = i / divisions;
      // Vertical lines
      lines.push({
        x1: toSvgX(pos),
        y1: toSvgY(0),
        x2: toSvgX(pos),
        y2: toSvgY(1),
      });
      // Horizontal lines
      lines.push({
        x1: toSvgX(0),
        y1: toSvgY(pos),
        x2: toSvgX(1),
        y2: toSvgY(pos),
      });
    }

    return lines;
  }, [showGrid, toSvgX, toSvgY]);

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      borderRadius: RADIUS_SM,
      border: `1px solid ${COLOR_BORDER}`,
      backgroundColor: COLOR_SURFACE,
      touchAction: "none",
      cursor: disabled ? "not-allowed" : "default",
      opacity: disabled ? 0.5 : 1,
    }),
    [disabled],
  );

  return (
    <svg
      ref={containerRef}
      width={width}
      height={height}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={containerStyle}
      role="application"
      aria-label={ariaLabel}
    >
      {/* Grid lines */}
      {gridLines?.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={COLOR_BORDER}
          strokeWidth={1}
        />
      ))}

      {/* Diagonal reference line (linear) */}
      <line
        x1={p0.x}
        y1={p0.y}
        x2={p3.x}
        y2={p3.y}
        stroke={COLOR_TEXT_MUTED}
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.5}
      />

      {/* Control point lines */}
      <line
        x1={p0.x}
        y1={p0.y}
        x2={p1.x}
        y2={p1.y}
        stroke={COLOR_TEXT_MUTED}
        strokeWidth={1}
      />
      <line
        x1={p3.x}
        y1={p3.y}
        x2={p2.x}
        y2={p2.y}
        stroke={COLOR_TEXT_MUTED}
        strokeWidth={1}
      />

      {/* Bezier curve */}
      <path
        d={curvePath}
        fill="none"
        stroke={COLOR_PRIMARY}
        strokeWidth={2}
      />

      {/* Fixed points (P0, P3) */}
      <circle
        cx={p0.x}
        cy={p0.y}
        r={3}
        fill={COLOR_TEXT_MUTED}
      />
      <circle
        cx={p3.x}
        cy={p3.y}
        r={3}
        fill={COLOR_TEXT_MUTED}
      />

      {/* Control point handles */}
      <ControlPointHandle
        cx={p1.x}
        cy={p1.y}
        handleId="p1"
        disabled={disabled}
        onPointerDown={handlePointerDown}
      />
      <ControlPointHandle
        cx={p2.x}
        cy={p2.y}
        handleId="p2"
        disabled={disabled}
        onPointerDown={handlePointerDown}
      />
    </svg>
  );
});
