/**
 * @file BoxModelEditor component - SVG-based visual box model editor
 *
 * @description
 * Interactive SVG-based editor for CSS box model properties.
 * Displays nested boxes for margin, border, padding, and content.
 * Border-radius is applied to the border layer (not margin).
 * Supports drag interactions to adjust values visually.
 *
 * @example
 * ```tsx
 * import { BoxModelEditor } from "react-editor-ui/BoxModelEditor";
 * import { useState } from "react";
 *
 * const [data, setData] = useState({
 *   margin: { top: 16, right: 16, bottom: 16, left: 16 },
 *   border: { top: 1, right: 1, bottom: 1, left: 1 },
 *   padding: { top: 16, right: 8, bottom: 16, left: 8 },
 *   borderRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
 *   contentSize: { width: 100, height: 60 },
 * });
 *
 * <BoxModelEditor value={data} onChange={setData} />
 * ```
 */

import { memo, useCallback, useRef, useMemo, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import {
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_BOX_MODEL_MARGIN_BG,
  COLOR_BOX_MODEL_MARGIN_STROKE,
  COLOR_BOX_MODEL_BORDER_BG,
  COLOR_BOX_MODEL_BORDER_STROKE,
  COLOR_BOX_MODEL_PADDING_BG,
  COLOR_BOX_MODEL_PADDING_STROKE,
  COLOR_BOX_MODEL_CONTENT_BG,
  COLOR_BOX_MODEL_CONTENT_STROKE,
  COLOR_BOX_MODEL_HANDLE,
  SIZE_FONT_XS,
} from "../../themes/styles";
import type {
  BoxModelData,
  BoxModelDisplayMode,
  BoxModelEditableFeatures,
} from "./types";

export type {
  BoxModelData,
  BoxSpacing,
  BoxCornerRadius,
  BoxModelDisplayMode,
  BoxModelEditableFeatures,
} from "./types";

export type BoxModelEditorProps = {
  value: BoxModelData;
  onChange: (value: BoxModelData) => void;
  /** Base width of the editor for fixed/proportional modes (default: 320) */
  width?: number;
  /** Base height of the editor for fixed/proportional modes (default: 200) */
  height?: number;
  /** Display mode (default: proportional) */
  displayMode?: BoxModelDisplayMode;
  /** Editable features (default: all enabled) */
  editable?: BoxModelEditableFeatures;
  /** @deprecated Use editable.margin instead */
  showMargin?: boolean;
  /** @deprecated Use editable.radius instead */
  showRadius?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

type Corner = "topLeft" | "topRight" | "bottomRight" | "bottomLeft";
type Side = "top" | "right" | "bottom" | "left";
type LayerType = "margin" | "border" | "padding" | "content";

type DragTarget =
  | { type: "edge"; layer: LayerType; side: Side }
  | { type: "corner"; layer: LayerType; corner: Corner }
  | { type: "radius"; corner: Corner };

type DragState = {
  startX: number;
  startY: number;
  startValue: number;
  startValue2?: number;
};

const OUTER_PADDING = 20;
const CORNER_HANDLE_SIZE = 6;
const MIN_VALUE = 0;
const MAX_VALUE = 200;
const MIN_CONTENT_SIZE = 20;
const FIXED_LAYER_THICKNESS = 28;
const AUTO_SCALE = 1.5;

const textStyle: CSSProperties = {
  pointerEvents: "none",
  userSelect: "none",
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundToStep(value: number, step: number = 1): number {
  return Math.round(value / step) * step;
}

// Cursor for each corner
const CORNER_CURSORS: Record<Corner, string> = {
  topLeft: "nwse-resize",
  topRight: "nesw-resize",
  bottomRight: "nwse-resize",
  bottomLeft: "nesw-resize",
};

// Direction vectors for corners - pointing OUTWARD from center
// Used for RESIZE operations: dragging outward increases value
const CORNER_RESIZE_DIRECTIONS: Record<Corner, { x: number; y: number }> = {
  topLeft: { x: -1, y: -1 },
  topRight: { x: 1, y: -1 },
  bottomRight: { x: 1, y: 1 },
  bottomLeft: { x: -1, y: 1 },
};

// Direction vectors for radius - pointing INWARD toward center
// Used for RADIUS operations: dragging inward increases radius
const CORNER_RADIUS_DIRECTIONS: Record<Corner, { x: number; y: number }> = {
  topLeft: { x: 1, y: 1 },
  topRight: { x: -1, y: 1 },
  bottomRight: { x: -1, y: -1 },
  bottomLeft: { x: 1, y: -1 },
};

// Normal vectors for edges (pointing outward for increasing value)
const SIDE_NORMALS: Record<Side, { x: number; y: number }> = {
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function calculateEdgeDelta(side: Side, dx: number, dy: number, scaleFactor: number): number {
  const normal = SIDE_NORMALS[side];
  return (dx * normal.x + dy * normal.y) * scaleFactor;
}

function calculateCornerResizeDelta(
  corner: Corner,
  dx: number,
  dy: number,
  scaleFactor: number
): { dWidth: number; dHeight: number } {
  const dir = CORNER_RESIZE_DIRECTIONS[corner];
  // Dragging in the direction of the corner increases the value
  return {
    dWidth: dx * dir.x * scaleFactor,
    dHeight: dy * dir.y * scaleFactor,
  };
}

type Rect = { x: number; y: number; width: number; height: number };

function getCornerPosition(corner: Corner, box: Rect): { x: number; y: number } {
  const isLeft = corner.includes("Left");
  const isTop = corner.includes("top");
  return {
    x: isLeft ? box.x : box.x + box.width,
    y: isTop ? box.y : box.y + box.height,
  };
}

// Edge handle component
type EdgeHandleProps = {
  rect: Rect;
  side: Side;
  value: number;
  layer: LayerType;
  onPointerDown: (e: PointerEvent<SVGElement>, target: DragTarget) => void;
  disabled: boolean;
  testId: string;
};

const EdgeHandle = memo(function EdgeHandle({
  rect,
  side,
  value,
  layer,
  onPointerDown,
  disabled,
  testId,
}: EdgeHandleProps) {
  const handlePointerDown = useCallback(
    (e: PointerEvent<SVGElement>) => {
      if (!disabled) {
        onPointerDown(e, { type: "edge", layer, side });
      }
    },
    [onPointerDown, layer, side, disabled]
  );

  const isVertical = side === "top" || side === "bottom";
  const cursor = disabled ? "not-allowed" : isVertical ? "ns-resize" : "ew-resize";

  return (
    <g>
      <rect
        data-testid={testId}
        x={rect.x}
        y={rect.y}
        width={Math.max(rect.width, 1)}
        height={Math.max(rect.height, 1)}
        fill="transparent"
        style={{ cursor }}
        onPointerDown={handlePointerDown}
      />
      <text
        x={rect.x + rect.width / 2}
        y={rect.y + rect.height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={COLOR_TEXT}
        fontSize={SIZE_FONT_XS}
        style={textStyle}
      >
        {value}
      </text>
    </g>
  );
});

// Corner resize handle component - only visible on hover
// Position is adjusted inward based on border-radius
type CornerHandleProps = {
  cx: number;
  cy: number;
  corner: Corner;
  layer: LayerType;
  radiusOffset: number; // How much to offset inward along diagonal due to border-radius
  strokeColor: string;
  onPointerDown: (e: PointerEvent<SVGElement>, target: DragTarget) => void;
  disabled: boolean;
  isHovered: boolean;
  isDragging: boolean;
};

const CornerHandle = memo(function CornerHandle({
  cx,
  cy,
  corner,
  layer,
  radiusOffset,
  strokeColor,
  onPointerDown,
  disabled,
  isHovered,
  isDragging,
}: CornerHandleProps) {
  const handlePointerDown = useCallback(
    (e: PointerEvent<SVGElement>) => {
      if (!disabled) {
        onPointerDown(e, { type: "corner", layer, corner });
      }
    },
    [onPointerDown, layer, corner, disabled]
  );

  const cursor = disabled ? "not-allowed" : CORNER_CURSORS[corner];
  const visible = isHovered || isDragging;

  // Offset position inward along the diagonal based on radius
  const dir = CORNER_RESIZE_DIRECTIONS[corner];
  // Move handle inward (opposite to corner direction) by the radius offset
  // Use 0.7 factor for diagonal (approximately 1/sqrt(2))
  const offsetX = cx - dir.x * radiusOffset * 0.7;
  const offsetY = cy - dir.y * radiusOffset * 0.7;

  return (
    <rect
      data-testid={`box-model-${layer}-corner-${corner}`}
      x={offsetX - CORNER_HANDLE_SIZE / 2}
      y={offsetY - CORNER_HANDLE_SIZE / 2}
      width={CORNER_HANDLE_SIZE}
      height={CORNER_HANDLE_SIZE}
      fill={visible ? strokeColor : "transparent"}
      fillOpacity={visible ? 0.9 : 0}
      stroke={visible ? strokeColor : "none"}
      strokeWidth={1}
      style={{ cursor }}
      onPointerDown={handlePointerDown}
    />
  );
});

// Radius indicator component - CAD-style with arc and R label at the corner
type RadiusIndicatorProps = {
  cornerX: number;
  cornerY: number;
  corner: Corner;
  radius: number;
  displayRadius: number; // Visual radius in SVG units
  onPointerDown: (e: PointerEvent<SVGElement>, target: DragTarget) => void;
  disabled: boolean;
};

/**
 * Calculate arc parameters for a corner's border-radius visualization.
 * Uses a unified formula based on corner direction vectors.
 *
 * For each corner:
 * - Arc center is offset inward from corner by radius in both x and y
 * - Start point is on horizontal edge (for top corners) or vertical edge (for bottom corners)
 * - End point is on the other edge
 * - Sweep flag depends on corner side: left corners use 0, right corners use 1
 */
function calculateArcParams(
  cornerX: number,
  cornerY: number,
  corner: Corner,
  r: number
): { start: { x: number; y: number }; end: { x: number; y: number }; sweep: 0 | 1 } {
  const dir = CORNER_RESIZE_DIRECTIONS[corner];
  const isTop = dir.y < 0;
  // Left corners (dir.x < 0) need counterclockwise (sweep=0)
  // Right corners (dir.x > 0) need clockwise (sweep=1)
  const sweep: 0 | 1 = dir.x > 0 ? 1 : 0;

  if (isTop) {
    // Top corners: start on horizontal edge, end on vertical edge
    return {
      start: { x: cornerX - dir.x * r, y: cornerY },
      end: { x: cornerX, y: cornerY - dir.y * r },
      sweep,
    };
  }
  // Bottom corners: start on vertical edge, end on horizontal edge
  return {
    start: { x: cornerX, y: cornerY - dir.y * r },
    end: { x: cornerX - dir.x * r, y: cornerY },
    sweep,
  };
}

const RadiusIndicator = memo(function RadiusIndicator({
  cornerX,
  cornerY,
  corner,
  radius,
  displayRadius,
  onPointerDown,
  disabled,
}: RadiusIndicatorProps) {
  const handlePointerDown = useCallback(
    (e: PointerEvent<SVGElement>) => {
      if (!disabled) {
        onPointerDown(e, { type: "radius", corner });
      }
    },
    [onPointerDown, corner, disabled]
  );

  const cursor = disabled ? "not-allowed" : CORNER_CURSORS[corner];
  const dir = CORNER_RESIZE_DIRECTIONS[corner];

  // Calculate arc path at the corner using unified formula
  const r = Math.max(displayRadius, 4);
  const { start: arcStart, end: arcEnd, sweep } = calculateArcParams(cornerX, cornerY, corner, r);

  // Draw arc from start to end with correct sweep direction
  const arcPath = `M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 0 ${sweep} ${arcEnd.x} ${arcEnd.y}`;

  // Label positioned inward from corner along the diagonal
  const labelOffset = Math.max(r + 12, 20);
  const labelX = cornerX - dir.x * labelOffset * 0.7;
  const labelY = cornerY - dir.y * labelOffset * 0.7;

  // Drag zone centered on the arc area
  const dragZoneSize = Math.max(r * 1.5, 16);

  return (
    <g>
      {/* Visible arc indicator */}
      {radius > 0 && (
        <path
          d={arcPath}
          fill="none"
          stroke={COLOR_BOX_MODEL_HANDLE}
          strokeWidth={1.5}
          strokeDasharray="3 2"
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Drag zone - invisible but interactive, positioned at the corner */}
      <rect
        data-testid={`box-model-radius-${corner}`}
        x={cornerX - dir.x * dragZoneSize / 2 - dragZoneSize / 2}
        y={cornerY - dir.y * dragZoneSize / 2 - dragZoneSize / 2}
        width={dragZoneSize}
        height={dragZoneSize}
        fill="transparent"
        style={{ cursor }}
        onPointerDown={handlePointerDown}
      />

      {/* R label with value - CAD style */}
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fill={COLOR_BOX_MODEL_HANDLE}
        fontSize={SIZE_FONT_XS}
        fontWeight={500}
        style={{ ...textStyle, cursor }}
        onPointerDown={handlePointerDown}
      >
        {radius}
      </text>
    </g>
  );
});

const containerStyle: CSSProperties = {
  display: "block",
  touchAction: "none",
  userSelect: "none",
};

/**
 * SVG-based visual box model editor.
 * Border-radius is applied to the border layer (the actual element boundary).
 */
export const BoxModelEditor = memo(function BoxModelEditor({
  value,
  onChange,
  width = 320,
  height = 200,
  displayMode = "proportional",
  editable,
  showMargin = true,
  showRadius = true,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: BoxModelEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragTarget = useRef<DragTarget | null>(null);
  const dragStart = useRef<DragState | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Resolve editable features
  const editableFeatures = useMemo((): Required<BoxModelEditableFeatures> => ({
    margin: editable?.margin ?? showMargin,
    border: editable?.border ?? true,
    padding: editable?.padding ?? true,
    radius: editable?.radius ?? showRadius,
    contentSize: editable?.contentSize ?? true,
  }), [editable, showMargin, showRadius]);

  // Calculate dimensions based on display mode
  const dimensions = useMemo(() => {
    if (displayMode === "auto") {
      const totalWidth = value.margin.left + value.margin.right +
        value.border.left + value.border.right +
        value.padding.left + value.padding.right +
        value.contentSize.width;
      const totalHeight = value.margin.top + value.margin.bottom +
        value.border.top + value.border.bottom +
        value.padding.top + value.padding.bottom +
        value.contentSize.height;

      const svgWidth = totalWidth * AUTO_SCALE + OUTER_PADDING * 2;
      const svgHeight = totalHeight * AUTO_SCALE + OUTER_PADDING * 2;

      return {
        svgWidth: Math.max(svgWidth, 200),
        svgHeight: Math.max(svgHeight, 120),
        margin: scaleSpacing(value.margin, AUTO_SCALE),
        border: scaleSpacing(value.border, AUTO_SCALE),
        padding: scaleSpacing(value.padding, AUTO_SCALE),
        contentWidth: value.contentSize.width * AUTO_SCALE,
        contentHeight: value.contentSize.height * AUTO_SCALE,
      };
    }

    if (displayMode === "fixed") {
      const innerWidth = width - OUTER_PADDING * 2;
      const innerHeight = height - OUTER_PADDING * 2;
      const contentWidth = innerWidth - FIXED_LAYER_THICKNESS * 5;
      const contentHeight = innerHeight - FIXED_LAYER_THICKNESS * 5;

      return {
        svgWidth: width,
        svgHeight: height,
        margin: uniformSpacing(FIXED_LAYER_THICKNESS),
        border: uniformSpacing(FIXED_LAYER_THICKNESS / 2),
        padding: uniformSpacing(FIXED_LAYER_THICKNESS),
        contentWidth: Math.max(contentWidth, 40),
        contentHeight: Math.max(contentHeight, 20),
      };
    }

    // Proportional mode
    const innerWidth = width - OUTER_PADDING * 2;
    const innerHeight = height - OUTER_PADDING * 2;

    const scaleH = innerWidth / Math.max(
      value.margin.left + value.margin.right +
      value.border.left + value.border.right +
      value.padding.left + value.padding.right +
      value.contentSize.width,
      100
    );
    const scaleV = innerHeight / Math.max(
      value.margin.top + value.margin.bottom +
      value.border.top + value.border.bottom +
      value.padding.top + value.padding.bottom +
      value.contentSize.height,
      60
    );
    const scale = Math.min(scaleH, scaleV, 3);

    return {
      svgWidth: width,
      svgHeight: height,
      margin: scaleSpacingWithMin(value.margin, scale, 14),
      border: scaleSpacingWithMin(value.border, scale, 8),
      padding: scaleSpacingWithMin(value.padding, scale, 14),
      contentWidth: Math.max(value.contentSize.width * scale, 40),
      contentHeight: Math.max(value.contentSize.height * scale, 20),
    };
  }, [displayMode, width, height, value]);

  // Calculate box positions
  const marginBox: Rect = useMemo(() => ({
    x: OUTER_PADDING,
    y: OUTER_PADDING,
    width: dimensions.margin.left + dimensions.border.left +
      dimensions.padding.left + dimensions.contentWidth +
      dimensions.padding.right + dimensions.border.right +
      dimensions.margin.right,
    height: dimensions.margin.top + dimensions.border.top +
      dimensions.padding.top + dimensions.contentHeight +
      dimensions.padding.bottom + dimensions.border.bottom +
      dimensions.margin.bottom,
  }), [dimensions]);

  const borderBox: Rect = useMemo(() => ({
    x: marginBox.x + dimensions.margin.left,
    y: marginBox.y + dimensions.margin.top,
    width: dimensions.border.left + dimensions.padding.left +
      dimensions.contentWidth + dimensions.padding.right +
      dimensions.border.right,
    height: dimensions.border.top + dimensions.padding.top +
      dimensions.contentHeight + dimensions.padding.bottom +
      dimensions.border.bottom,
  }), [marginBox, dimensions]);

  const paddingBox: Rect = useMemo(() => ({
    x: borderBox.x + dimensions.border.left,
    y: borderBox.y + dimensions.border.top,
    width: dimensions.padding.left + dimensions.contentWidth +
      dimensions.padding.right,
    height: dimensions.padding.top + dimensions.contentHeight +
      dimensions.padding.bottom,
  }), [borderBox, dimensions]);

  const contentBox: Rect = useMemo(() => ({
    x: paddingBox.x + dimensions.padding.left,
    y: paddingBox.y + dimensions.padding.top,
    width: dimensions.contentWidth,
    height: dimensions.contentHeight,
  }), [paddingBox, dimensions]);

  const handlePointerDown = useCallback(
    (e: PointerEvent<SVGElement>, target: DragTarget) => {
      if (disabled) {
        return;
      }
      e.stopPropagation();
      dragTarget.current = target;
      setIsDragging(true);

      const data = valueRef.current;
      const startValue = getStartValue(target, data);
      const startValue2 = getStartValue2(target, data);

      dragStart.current = {
        startX: e.clientX,
        startY: e.clientY,
        startValue,
        startValue2,
      };
      (e.target as SVGElement).setPointerCapture(e.pointerId);
    },
    [disabled]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      if (!dragTarget.current || !dragStart.current || disabled) {
        return;
      }

      const target = dragTarget.current;
      const start = dragStart.current;
      const currentValue = valueRef.current;
      const currentOnChange = onChangeRef.current;

      const dx = e.clientX - start.startX;
      const dy = e.clientY - start.startY;
      const scaleFactor = displayMode === "auto" ? 1 / AUTO_SCALE : 0.5;

      if (target.type === "edge") {
        const delta = calculateEdgeDelta(target.side, dx, dy, scaleFactor);
        const newValue = clamp(roundToStep(start.startValue + delta), MIN_VALUE, MAX_VALUE);

        if (target.layer === "content") {
          const key = target.side === "right" ? "width" : "height";
          currentOnChange({
            ...currentValue,
            contentSize: { ...currentValue.contentSize, [key]: Math.max(newValue, MIN_CONTENT_SIZE) },
          });
        } else {
          currentOnChange({
            ...currentValue,
            [target.layer]: { ...currentValue[target.layer], [target.side]: newValue },
          });
        }
      } else if (target.type === "corner") {
        const { dWidth, dHeight } = calculateCornerResizeDelta(target.corner, dx, dy, scaleFactor);

        if (target.layer === "content") {
          const newWidth = clamp(roundToStep(start.startValue + dWidth), MIN_CONTENT_SIZE, MAX_VALUE * 2);
          const newHeight = clamp(roundToStep((start.startValue2 || 0) + dHeight), MIN_CONTENT_SIZE, MAX_VALUE * 2);
          currentOnChange({
            ...currentValue,
            contentSize: { width: newWidth, height: newHeight },
          });
        } else {
          // For margin/border/padding: use START values + delta
          const isLeft = target.corner.includes("Left");
          const isTop = target.corner.includes("top");
          const hSide: Side = isLeft ? "left" : "right";
          const vSide: Side = isTop ? "top" : "bottom";

          const newHValue = clamp(roundToStep(start.startValue + dWidth), MIN_VALUE, MAX_VALUE);
          const newVValue = clamp(roundToStep((start.startValue2 || 0) + dHeight), MIN_VALUE, MAX_VALUE);

          currentOnChange({
            ...currentValue,
            [target.layer]: {
              ...currentValue[target.layer],
              [hSide]: newHValue,
              [vSide]: newVValue,
            },
          });
        }
      } else if (target.type === "radius") {
        // Radius: diagonal drag inward increases
        const dir = CORNER_RADIUS_DIRECTIONS[target.corner];
        const diagonalDist = (dx * dir.x + dy * dir.y) * scaleFactor;
        const newValue = clamp(roundToStep(start.startValue + diagonalDist), MIN_VALUE, MAX_VALUE);

        currentOnChange({
          ...currentValue,
          borderRadius: { ...currentValue.borderRadius, [target.corner]: newValue },
        });
      }
    },
    [disabled, displayMode]
  );

  const handlePointerUp = useCallback(() => {
    dragTarget.current = null;
    dragStart.current = null;
    setIsDragging(false);
  }, []);

  const handlePointerEnter = useCallback(() => setIsHovered(true), []);
  const handlePointerOut = useCallback(() => setIsHovered(false), []);

  const contentSizeText = `${value.contentSize.width}×${value.contentSize.height}`;

  // Generate rounded rect path (clockwise for outer, used with evenodd fill)
  const generateRoundedPath = useCallback(
    (box: Rect, radii: { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number }) => {
      const { x, y, width: w, height: h } = box;
      const clampR = (r: number) => Math.min(r, w / 2, h / 2);
      const rtl = clampR(radii.topLeft);
      const rtr = clampR(radii.topRight);
      const rbr = clampR(radii.bottomRight);
      const rbl = clampR(radii.bottomLeft);

      return `
        M ${x + rtl} ${y}
        L ${x + w - rtr} ${y}
        Q ${x + w} ${y} ${x + w} ${y + rtr}
        L ${x + w} ${y + h - rbr}
        Q ${x + w} ${y + h} ${x + w - rbr} ${y + h}
        L ${x + rbl} ${y + h}
        Q ${x} ${y + h} ${x} ${y + h - rbl}
        L ${x} ${y + rtl}
        Q ${x} ${y} ${x + rtl} ${y}
        Z
      `;
    },
    []
  );

  // Generate rectangular path (for margin layer outer)
  const generateRectPath = useCallback((box: Rect) => {
    const { x, y, width: w, height: h } = box;
    return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  }, []);

  // Generate reversed rounded rect path (counter-clockwise for inner hole)
  const generateReversedRoundedPath = useCallback(
    (box: Rect, radii: { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number }) => {
      const { x, y, width: w, height: h } = box;
      const clampR = (r: number) => Math.min(r, w / 2, h / 2);
      const rtl = clampR(radii.topLeft);
      const rtr = clampR(radii.topRight);
      const rbr = clampR(radii.bottomRight);
      const rbl = clampR(radii.bottomLeft);

      // Draw counter-clockwise (reversed) to create a hole
      return `
        M ${x + rtl} ${y}
        Q ${x} ${y} ${x} ${y + rtl}
        L ${x} ${y + h - rbl}
        Q ${x} ${y + h} ${x + rbl} ${y + h}
        L ${x + w - rbr} ${y + h}
        Q ${x + w} ${y + h} ${x + w} ${y + h - rbr}
        L ${x + w} ${y + rtr}
        Q ${x + w} ${y} ${x + w - rtr} ${y}
        Z
      `;
    },
    []
  );

  // Calculate scaled radii for inner layers
  const paddingRadii = useMemo(() => {
    const inset = Math.min(dimensions.border.top, dimensions.border.right, dimensions.border.bottom, dimensions.border.left);
    return {
      topLeft: Math.max(0, value.borderRadius.topLeft - inset),
      topRight: Math.max(0, value.borderRadius.topRight - inset),
      bottomRight: Math.max(0, value.borderRadius.bottomRight - inset),
      bottomLeft: Math.max(0, value.borderRadius.bottomLeft - inset),
    };
  }, [value.borderRadius, dimensions.border]);

  const contentRadii = useMemo(() => {
    const inset = Math.min(
      dimensions.border.top + dimensions.padding.top,
      dimensions.border.right + dimensions.padding.right,
      dimensions.border.bottom + dimensions.padding.bottom,
      dimensions.border.left + dimensions.padding.left
    );
    return {
      topLeft: Math.max(0, value.borderRadius.topLeft - inset),
      topRight: Math.max(0, value.borderRadius.topRight - inset),
      bottomRight: Math.max(0, value.borderRadius.bottomRight - inset),
      bottomLeft: Math.max(0, value.borderRadius.bottomLeft - inset),
    };
  }, [value.borderRadius, dimensions]);

  // Donut paths: outer + reversed inner to create hole (using evenodd fill)
  // Margin donut: rectangle outside, border shape hole inside
  const marginDonutPath = useMemo(() => {
    const outer = generateRectPath(marginBox);
    const inner = generateReversedRoundedPath(borderBox, value.borderRadius);
    return outer + " " + inner;
  }, [marginBox, borderBox, value.borderRadius, generateRectPath, generateReversedRoundedPath]);

  // Border donut: border shape outside, padding shape hole inside
  const borderDonutPath = useMemo(() => {
    const outer = generateRoundedPath(borderBox, value.borderRadius);
    const inner = generateReversedRoundedPath(paddingBox, paddingRadii);
    return outer + " " + inner;
  }, [borderBox, paddingBox, value.borderRadius, paddingRadii, generateRoundedPath, generateReversedRoundedPath]);

  // Padding donut: padding shape outside, content shape hole inside
  const paddingDonutPath = useMemo(() => {
    const outer = generateRoundedPath(paddingBox, paddingRadii);
    const inner = generateReversedRoundedPath(contentBox, contentRadii);
    return outer + " " + inner;
  }, [paddingBox, contentBox, paddingRadii, contentRadii, generateRoundedPath, generateReversedRoundedPath]);

  // Content path (solid, no hole)
  const contentPath = useMemo(
    () => generateRoundedPath(contentBox, contentRadii),
    [contentBox, contentRadii, generateRoundedPath]
  );

  // Simple paths for stroke only (without holes)
  const borderStrokePath = useMemo(
    () => generateRoundedPath(borderBox, value.borderRadius),
    [borderBox, value.borderRadius, generateRoundedPath]
  );

  const paddingStrokePath = useMemo(
    () => generateRoundedPath(paddingBox, paddingRadii),
    [paddingBox, paddingRadii, generateRoundedPath]
  );

  const corners: Corner[] = ["topLeft", "topRight", "bottomRight", "bottomLeft"];

  return (
    <svg
      ref={svgRef}
      data-testid="box-model-editor"
      width={dimensions.svgWidth}
      height={dimensions.svgHeight}
      className={className}
      style={containerStyle}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onPointerOut={handlePointerOut}
      role="application"
      aria-label={ariaLabel ?? "Box model editor"}
    >
      {/* Margin layer (donut: rectangle with border hole) */}
      <path
        data-testid="box-model-margin-layer"
        d={marginDonutPath}
        fill={COLOR_BOX_MODEL_MARGIN_BG}
        fillRule="evenodd"
        stroke="none"
      />
      {/* Margin outer stroke */}
      <rect
        x={marginBox.x}
        y={marginBox.y}
        width={marginBox.width}
        height={marginBox.height}
        fill="none"
        stroke={COLOR_BOX_MODEL_MARGIN_STROKE}
        strokeWidth={1}
      />

      {/* Border layer (donut: border shape with padding hole) */}
      <path
        data-testid="box-model-border-layer"
        d={borderDonutPath}
        fill={COLOR_BOX_MODEL_BORDER_BG}
        fillRule="evenodd"
        stroke="none"
      />
      {/* Border stroke */}
      <path
        d={borderStrokePath}
        fill="none"
        stroke={COLOR_BOX_MODEL_BORDER_STROKE}
        strokeWidth={1}
      />

      {/* Padding layer (donut: padding shape with content hole) */}
      <path
        data-testid="box-model-padding-layer"
        d={paddingDonutPath}
        fill={COLOR_BOX_MODEL_PADDING_BG}
        fillRule="evenodd"
        stroke="none"
      />
      {/* Padding stroke */}
      <path
        d={paddingStrokePath}
        fill="none"
        stroke={COLOR_BOX_MODEL_PADDING_STROKE}
        strokeWidth={1}
        strokeDasharray="4 2"
      />

      {/* Content layer (solid) */}
      <path
        data-testid="box-model-content-layer"
        d={contentPath}
        fill={COLOR_BOX_MODEL_CONTENT_BG}
        stroke={COLOR_BOX_MODEL_CONTENT_STROKE}
        strokeWidth={1}
        strokeDasharray="2 2"
      />

      {/* Content size label */}
      <text
        x={contentBox.x + contentBox.width / 2}
        y={contentBox.y + contentBox.height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={COLOR_TEXT}
        fontSize={SIZE_FONT_XS}
        style={textStyle}
      >
        {contentSizeText}
      </text>

      {/* Layer labels */}
      <text x={marginBox.x + 4} y={marginBox.y + 12} fill={COLOR_TEXT_MUTED} fontSize={SIZE_FONT_XS} style={textStyle}>
        margin
      </text>
      <text x={borderBox.x + 4} y={borderBox.y + 10} fill={COLOR_TEXT_MUTED} fontSize={SIZE_FONT_XS} style={textStyle}>
        border
      </text>
      <text x={paddingBox.x + 4} y={paddingBox.y + 10} fill={COLOR_TEXT_MUTED} fontSize={SIZE_FONT_XS} style={textStyle}>
        padding
      </text>

      {/* Margin edge handles */}
      {editableFeatures.margin && (
        <>
          <EdgeHandle
            rect={{ x: marginBox.x + 20, y: marginBox.y, width: marginBox.width - 40, height: dimensions.margin.top }}
            side="top" value={value.margin.top} layer="margin"
            onPointerDown={handlePointerDown} disabled={disabled} testId="box-model-margin-top"
          />
          <EdgeHandle
            rect={{ x: marginBox.x + marginBox.width - dimensions.margin.right, y: marginBox.y + 20, width: dimensions.margin.right, height: marginBox.height - 40 }}
            side="right" value={value.margin.right} layer="margin"
            onPointerDown={handlePointerDown} disabled={disabled} testId="box-model-margin-right"
          />
          <EdgeHandle
            rect={{ x: marginBox.x + 20, y: marginBox.y + marginBox.height - dimensions.margin.bottom, width: marginBox.width - 40, height: dimensions.margin.bottom }}
            side="bottom" value={value.margin.bottom} layer="margin"
            onPointerDown={handlePointerDown} disabled={disabled} testId="box-model-margin-bottom"
          />
          <EdgeHandle
            rect={{ x: marginBox.x, y: marginBox.y + 20, width: dimensions.margin.left, height: marginBox.height - 40 }}
            side="left" value={value.margin.left} layer="margin"
            onPointerDown={handlePointerDown} disabled={disabled} testId="box-model-margin-left"
          />
          {/* Margin corner handles - no radius offset (margin is rectangular) */}
          {corners.map((corner) => {
            const pos = getCornerPosition(corner, marginBox);
            return (
              <CornerHandle
                key={`margin-${corner}`}
                cx={pos.x} cy={pos.y}
                corner={corner} layer="margin"
                radiusOffset={0}
                strokeColor={COLOR_BOX_MODEL_MARGIN_STROKE}
                onPointerDown={handlePointerDown} disabled={disabled}
                isHovered={isHovered} isDragging={isDragging}
              />
            );
          })}
        </>
      )}

      {/* Border edge handles */}
      {editableFeatures.border && (
        <>
          <EdgeHandle
            rect={{ x: borderBox.x + borderBox.width / 2 - 16, y: borderBox.y, width: 32, height: dimensions.border.top }}
            side="top" value={value.border.top} layer="border"
            onPointerDown={handlePointerDown} disabled={disabled} testId="box-model-border-top"
          />
          <EdgeHandle
            rect={{ x: borderBox.x + borderBox.width - dimensions.border.right, y: borderBox.y + borderBox.height / 2 - 10, width: dimensions.border.right, height: 20 }}
            side="right" value={value.border.right} layer="border"
            onPointerDown={handlePointerDown} disabled={disabled} testId="box-model-border-right"
          />
          <EdgeHandle
            rect={{ x: borderBox.x + borderBox.width / 2 - 16, y: borderBox.y + borderBox.height - dimensions.border.bottom, width: 32, height: dimensions.border.bottom }}
            side="bottom" value={value.border.bottom} layer="border"
            onPointerDown={handlePointerDown} disabled={disabled} testId="box-model-border-bottom"
          />
          <EdgeHandle
            rect={{ x: borderBox.x, y: borderBox.y + borderBox.height / 2 - 10, width: dimensions.border.left, height: 20 }}
            side="left" value={value.border.left} layer="border"
            onPointerDown={handlePointerDown} disabled={disabled} testId="box-model-border-left"
          />
        </>
      )}

      {/* Padding edge handles */}
      {editableFeatures.padding && (
        <>
          <EdgeHandle
            rect={{ x: paddingBox.x + paddingBox.width / 2 - 16, y: paddingBox.y, width: 32, height: dimensions.padding.top }}
            side="top" value={value.padding.top} layer="padding"
            onPointerDown={handlePointerDown} disabled={disabled} testId="box-model-padding-top"
          />
          <EdgeHandle
            rect={{ x: paddingBox.x + paddingBox.width - dimensions.padding.right, y: paddingBox.y + paddingBox.height / 2 - 10, width: dimensions.padding.right, height: 20 }}
            side="right" value={value.padding.right} layer="padding"
            onPointerDown={handlePointerDown} disabled={disabled} testId="box-model-padding-right"
          />
          <EdgeHandle
            rect={{ x: paddingBox.x + paddingBox.width / 2 - 16, y: paddingBox.y + paddingBox.height - dimensions.padding.bottom, width: 32, height: dimensions.padding.bottom }}
            side="bottom" value={value.padding.bottom} layer="padding"
            onPointerDown={handlePointerDown} disabled={disabled} testId="box-model-padding-bottom"
          />
          <EdgeHandle
            rect={{ x: paddingBox.x, y: paddingBox.y + paddingBox.height / 2 - 10, width: dimensions.padding.left, height: 20 }}
            side="left" value={value.padding.left} layer="padding"
            onPointerDown={handlePointerDown} disabled={disabled} testId="box-model-padding-left"
          />
        </>
      )}

      {/* Content edge handles */}
      {editableFeatures.contentSize && (
        <>
          <EdgeHandle
            rect={{ x: contentBox.x + contentBox.width - 6, y: contentBox.y + 8, width: 12, height: contentBox.height - 16 }}
            side="right" value={value.contentSize.width} layer="content"
            onPointerDown={handlePointerDown} disabled={disabled} testId="box-model-content-right"
          />
          <EdgeHandle
            rect={{ x: contentBox.x + 8, y: contentBox.y + contentBox.height - 6, width: contentBox.width - 16, height: 12 }}
            side="bottom" value={value.contentSize.height} layer="content"
            onPointerDown={handlePointerDown} disabled={disabled} testId="box-model-content-bottom"
          />
          {/* Content corner handles - offset by scaled content radius */}
          {corners.map((corner) => {
            const pos = getCornerPosition(corner, contentBox);
            const contentCornerRadius = contentRadii[corner];
            const displayContentRadius = calculateDisplayRadius(displayMode, contentCornerRadius, contentBox.width, contentBox.height);
            return (
              <CornerHandle
                key={`content-${corner}`}
                cx={pos.x} cy={pos.y}
                corner={corner} layer="content"
                radiusOffset={displayContentRadius}
                strokeColor={COLOR_BOX_MODEL_CONTENT_STROKE}
                onPointerDown={handlePointerDown} disabled={disabled}
                isHovered={isHovered} isDragging={isDragging}
              />
            );
          })}
        </>
      )}

      {/* Radius indicators - CAD style at border corners */}
      {editableFeatures.radius && corners.map((corner) => {
        const pos = getCornerPosition(corner, borderBox);
        const radius = value.borderRadius[corner];
        const dr = calculateDisplayRadius(displayMode, radius, borderBox.width, borderBox.height);
        return (
          <RadiusIndicator
            key={`radius-${corner}`}
            cornerX={pos.x}
            cornerY={pos.y}
            corner={corner}
            radius={radius}
            displayRadius={dr}
            onPointerDown={handlePointerDown}
            disabled={disabled}
          />
        );
      })}
    </svg>
  );
});

// Helper functions
function calculateDisplayRadius(
  mode: BoxModelDisplayMode,
  radius: number,
  boxWidth: number,
  boxHeight: number
): number {
  if (mode === "auto") {
    return radius * AUTO_SCALE;
  }
  if (mode === "proportional") {
    return Math.min(radius * 0.8, boxWidth / 4, boxHeight / 4);
  }
  return Math.min(radius, FIXED_LAYER_THICKNESS);
}

function scaleSpacing(spacing: { top: number; right: number; bottom: number; left: number }, scale: number) {
  return {
    top: spacing.top * scale,
    right: spacing.right * scale,
    bottom: spacing.bottom * scale,
    left: spacing.left * scale,
  };
}

function scaleSpacingWithMin(spacing: { top: number; right: number; bottom: number; left: number }, scale: number, min: number) {
  return {
    top: Math.max(spacing.top * scale, min),
    right: Math.max(spacing.right * scale, min),
    bottom: Math.max(spacing.bottom * scale, min),
    left: Math.max(spacing.left * scale, min),
  };
}

function uniformSpacing(value: number) {
  return { top: value, right: value, bottom: value, left: value };
}

function getStartValue(target: DragTarget, data: BoxModelData): number {
  if (target.type === "edge") {
    if (target.layer === "content") {
      return target.side === "right" ? data.contentSize.width : data.contentSize.height;
    }
    return data[target.layer][target.side];
  }
  if (target.type === "corner") {
    if (target.layer === "content") {
      return data.contentSize.width;
    }
    const isLeft = target.corner.includes("Left");
    return data[target.layer][isLeft ? "left" : "right"];
  }
  if (target.type === "radius") {
    return data.borderRadius[target.corner];
  }
  return 0;
}

function getStartValue2(target: DragTarget, data: BoxModelData): number | undefined {
  if (target.type === "corner") {
    if (target.layer === "content") {
      return data.contentSize.height;
    }
    const isTop = target.corner.includes("top");
    return data[target.layer][isTop ? "top" : "bottom"];
  }
  return undefined;
}
