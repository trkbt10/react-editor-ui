/**
 * @file CanvasGuideLayer component - Guide lines overlay for Canvas
 *
 * @description
 * Renders guide lines on the canvas. Guides can be moved by dragging,
 * deleted by pressing Delete/Backspace when selected, and locked to
 * prevent accidental modifications.
 *
 * @example
 * ```tsx
 * import { CanvasGuideLayer } from "react-editor-ui/canvas/CanvasGuideLayer";
 *
 * <Canvas svgLayers={
 *   <CanvasGuideLayer
 *     guides={guides}
 *     onMoveGuide={handleMove}
 *     onDeleteGuide={handleDelete}
 *     onToggleLock={handleToggleLock}
 *   />
 * } />
 * ```
 */

import {
  memo,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  COLOR_CANVAS_GUIDE,
  COLOR_CANVAS_GUIDE_LOCKED,
  COLOR_CANVAS_GUIDE_HOVER,
} from "../../themes/styles";
import type { CanvasGuide, CanvasGuideHandlers, ViewportState } from "../core/types";

export type CanvasGuideLayerProps = {
  /** List of guides to render */
  guides: readonly CanvasGuide[];
  /** Current viewport state for coordinate conversion */
  viewport?: ViewportState;
  /** Currently selected guide ID */
  selectedGuideId?: string | null;
  /** Called when a guide is selected */
  onSelectGuide?: (id: string | null) => void;
} & CanvasGuideHandlers;

type GuideDragState = {
  guideId: string;
  startPosition: number;
  startPointer: number;
};

const GUIDE_HIT_AREA = 6;

/**
 * Single guide line component
 */
const GuideLine = memo(function GuideLine({
  guide,
  isSelected,
  isHovered,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
}: {
  guide: CanvasGuide;
  isSelected: boolean;
  isHovered: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  const color = guide.locked
    ? COLOR_CANVAS_GUIDE_LOCKED
    : isHovered || isSelected
      ? COLOR_CANVAS_GUIDE_HOVER
      : COLOR_CANVAS_GUIDE;

  const strokeWidth = isSelected ? 2 : 1;

  // Use a large value for "infinite" lines - SVG clips to viewport anyway
  const LARGE = 100000;

  const lineProps =
    guide.orientation === "horizontal"
      ? {
          x1: -LARGE,
          y1: guide.position,
          x2: LARGE,
          y2: guide.position,
        }
      : {
          x1: guide.position,
          y1: -LARGE,
          x2: guide.position,
          y2: LARGE,
        };

  const hitAreaProps =
    guide.orientation === "horizontal"
      ? {
          x1: -LARGE,
          y1: guide.position,
          x2: LARGE,
          y2: guide.position,
        }
      : {
          x1: guide.position,
          y1: -LARGE,
          x2: guide.position,
          y2: LARGE,
        };

  const cursor = guide.locked
    ? "not-allowed"
    : guide.orientation === "horizontal"
      ? "ns-resize"
      : "ew-resize";

  return (
    <g data-guide-id={guide.id}>
      {/* Visible line */}
      <line
        {...lineProps}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={guide.locked ? "4 2" : undefined}
        pointerEvents="none"
      />
      {/* Invisible hit area for interaction */}
      <line
        {...hitAreaProps}
        stroke="transparent"
        strokeWidth={GUIDE_HIT_AREA}
        style={{ cursor }}
        onPointerDown={onPointerDown}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      />
    </g>
  );
});

/**
 * Canvas guide layer - renders guide lines that can be moved, deleted, and locked
 */
export const CanvasGuideLayer = memo(function CanvasGuideLayer({
  guides,
  viewport,
  selectedGuideId,
  onSelectGuide,
  onMoveGuide,
  onDeleteGuide,
  onToggleLock,
}: CanvasGuideLayerProps): ReactNode {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<GuideDragState | null>(null);

  // Handle keyboard events for delete and lock
  useEffect(() => {
    if (!selectedGuideId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const guide = guides.find((g) => g.id === selectedGuideId);
      if (!guide) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (!guide.locked && onDeleteGuide) {
          e.preventDefault();
          onDeleteGuide(selectedGuideId);
          onSelectGuide?.(null);
        }
      } else if (e.key === "l" || e.key === "L") {
        if (onToggleLock) {
          e.preventDefault();
          onToggleLock(selectedGuideId);
        }
      } else if (e.key === "Escape") {
        onSelectGuide?.(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedGuideId, guides, onDeleteGuide, onToggleLock, onSelectGuide]);

  // Handle drag
  useEffect(() => {
    if (!dragState) return;

    const guide = guides.find((g) => g.id === dragState.guideId);
    if (!guide || guide.locked) return;

    const scale = viewport?.scale ?? 1;

    const handlePointerMove = (e: PointerEvent) => {
      const screenDelta =
        guide.orientation === "horizontal"
          ? e.clientY - dragState.startPointer
          : e.clientX - dragState.startPointer;

      // Convert screen delta to canvas coordinates
      const canvasDelta = screenDelta / scale;
      const newPosition = dragState.startPosition + canvasDelta;
      onMoveGuide?.(dragState.guideId, Math.round(newPosition));
    };

    const handlePointerUp = () => {
      setDragState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, guides, onMoveGuide, viewport?.scale]);

  const handlers = useMemo(() => {
    return {
      createPointerDown:
        (guide: CanvasGuide) => (e: React.PointerEvent) => {
          e.stopPropagation();
          onSelectGuide?.(guide.id);

          if (!guide.locked) {
            setDragState({
              guideId: guide.id,
              startPosition: guide.position,
              startPointer:
                guide.orientation === "horizontal" ? e.clientY : e.clientX,
            });
          }
        },
      createPointerEnter: (id: string) => () => setHoveredId(id),
      createPointerLeave: () => () => setHoveredId(null),
    };
  }, [onSelectGuide]);

  return (
    <g data-testid="canvas-guide-layer">
      {guides.map((guide) => (
        <GuideLine
          key={guide.id}
          guide={guide}
          isSelected={guide.id === selectedGuideId}
          isHovered={guide.id === hoveredId}
          onPointerDown={handlers.createPointerDown(guide)}
          onPointerEnter={handlers.createPointerEnter(guide.id)}
          onPointerLeave={handlers.createPointerLeave()}
        />
      ))}
    </g>
  );
});
