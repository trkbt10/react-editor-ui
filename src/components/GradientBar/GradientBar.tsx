/**
 * @file GradientBar component - Visual gradient preview with draggable stop handles
 */

import { memo, useRef, useCallback, useMemo } from "react";
import type { CSSProperties, PointerEvent } from "react";
import {
  COLOR_BORDER,
  COLOR_PRIMARY,
  RADIUS_SM,
} from "../../constants/styles";
import type { GradientValue, GradientStop } from "../../utils/gradient/types";
import { gradientToLinearCss, generateStopId, interpolateColor } from "../../utils/gradient/utils";
import { clamp } from "../../utils/color/clamp";
import { createCheckerboardSVG } from "../../utils/color/checkerboard";

export type GradientBarProps = {
  value: GradientValue;
  onChange: (value: GradientValue) => void;
  selectedStopId: string | null;
  onSelectStop: (id: string) => void;
  height?: number;
  disabled?: boolean;
};

function getHandleBoxShadow(isSelected: boolean): string {
  if (isSelected) {
    return `0 0 0 2px ${COLOR_PRIMARY}, 0 1px 3px rgba(0, 0, 0, 0.3)`;
  }
  return "0 1px 3px rgba(0, 0, 0, 0.3)";
}

function getHandleCursor(disabled: boolean): string {
  if (disabled) {
    return "not-allowed";
  }
  return "grab";
}

function getHandleBorderColor(isSelected: boolean): string {
  if (isSelected) {
    return COLOR_PRIMARY;
  }
  return "white";
}

const CHECKERBOARD_SIZE = 6;

type StopHandleProps = {
  stop: GradientStop;
  isSelected: boolean;
  disabled: boolean;
  onPointerDown: (e: PointerEvent<HTMLDivElement>, stopId: string) => void;
};

const StopHandle = memo(function StopHandle({
  stop,
  isSelected,
  disabled,
  onPointerDown,
}: StopHandleProps) {
  const style = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      left: `${stop.position}%`,
      top: "50%",
      width: 12,
      height: 12,
      borderRadius: "50%",
      border: `2px solid ${getHandleBorderColor(isSelected)}`,
      boxShadow: getHandleBoxShadow(isSelected),
      transform: "translate(-50%, -50%)",
      backgroundColor: stop.color.hex,
      cursor: getHandleCursor(disabled),
      zIndex: isSelected ? 10 : 1,
    }),
    [stop.position, stop.color.hex, isSelected, disabled],
  );

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      onPointerDown(e, stop.id);
    },
    [onPointerDown, stop.id],
  );

  return (
    <div
      data-stop-id={stop.id}
      onPointerDown={handlePointerDown}
      style={style}
      role="slider"
      aria-label={`Stop at ${stop.position}%`}
      aria-valuenow={stop.position}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={disabled ? -1 : 0}
    />
  );
});

/**
 * Visual gradient bar with draggable stop handles.
 * Double-click to add new stops.
 */
export const GradientBar = memo(function GradientBar({
  value,
  onChange,
  selectedStopId,
  onSelectStop,
  height = 20,
  disabled = false,
}: GradientBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const draggingStopId = useRef<string | null>(null);

  const updateStopPosition = useCallback(
    (stopId: string, clientX: number) => {
      const rect = barRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const x = clamp(clientX - rect.left, 0, rect.width);
      const position = Math.round((x / rect.width) * 100);

      const newStops = value.stops.map((stop) => {
        if (stop.id === stopId) {
          return { ...stop, position };
        }
        return stop;
      });

      onChange({ ...value, stops: newStops });
    },
    [value, onChange],
  );

  const handleBarPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    // Check if clicking on a handle
    const target = e.target as HTMLElement;
    if (target.dataset.stopId) {
      return;
    }

    // Double-click to add a stop
    if (e.detail === 2) {
      const rect = barRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const x = clamp(e.clientX - rect.left, 0, rect.width);
      const position = Math.round((x / rect.width) * 100);
      const newColor = interpolateColor(value.stops, position);
      const newStop: GradientStop = {
        id: generateStopId(),
        position,
        color: newColor,
      };

      onChange({ ...value, stops: [...value.stops, newStop] });
      onSelectStop(newStop.id);
    }
  };

  const handleHandlePointerDown = (e: PointerEvent<HTMLDivElement>, stopId: string) => {
    if (disabled) {
      return;
    }

    e.stopPropagation();
    draggingStopId.current = stopId;
    onSelectStop(stopId);
    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingStopId.current || disabled) {
      return;
    }
    updateStopPosition(draggingStopId.current, e.clientX);
  };

  const handlePointerUp = () => {
    draggingStopId.current = null;
  };

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      position: "relative",
      width: "100%",
      height,
      borderRadius: RADIUS_SM,
      border: `1px solid ${COLOR_BORDER}`,
      overflow: "visible",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      touchAction: "none",
    }),
    [height, disabled],
  );

  const checkerboardStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      inset: 0,
      borderRadius: RADIUS_SM,
      backgroundImage: createCheckerboardSVG(CHECKERBOARD_SIZE),
      backgroundSize: `${CHECKERBOARD_SIZE * 2}px ${CHECKERBOARD_SIZE * 2}px`,
    }),
    [],
  );

  const gradientStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      inset: 0,
      borderRadius: RADIUS_SM,
      background: gradientToLinearCss(value),
    }),
    [value],
  );

  return (
    <div
      ref={barRef}
      onPointerDown={handleBarPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={containerStyle}
      role="group"
      aria-label="Gradient preview"
    >
      <div style={checkerboardStyle} />
      <div style={gradientStyle} />
      {value.stops.map((stop) => (
        <StopHandle
          key={stop.id}
          stop={stop}
          isSelected={stop.id === selectedStopId}
          disabled={disabled}
          onPointerDown={handleHandlePointerDown}
        />
      ))}
    </div>
  );
});
