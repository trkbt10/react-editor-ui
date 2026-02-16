/**
 * @file GradientBar component - Visual gradient preview with draggable stop handles
 */

import { memo, useRef, useCallback } from "react";
import type { CSSProperties, PointerEvent } from "react";
import {
  COLOR_BORDER,
  COLOR_PRIMARY,
  RADIUS_SM,
} from "../../constants/styles";
import type { GradientValue, GradientStop } from "./gradientTypes";
import { gradientToLinearCss, generateStopId, interpolateColor } from "./gradientUtils";

export type GradientBarProps = {
  value: GradientValue;
  onChange: (value: GradientValue) => void;
  selectedStopId: string | null;
  onSelectStop: (id: string) => void;
  height?: number;
  disabled?: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

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

function createCheckerboardPattern(): string {
  const s = CHECKERBOARD_SIZE;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s * 2}" height="${s * 2}">
    <rect width="${s}" height="${s}" fill="#fff"/>
    <rect x="${s}" width="${s}" height="${s}" fill="#ccc"/>
    <rect y="${s}" width="${s}" height="${s}" fill="#ccc"/>
    <rect x="${s}" y="${s}" width="${s}" height="${s}" fill="#fff"/>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}






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

  const containerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height,
    borderRadius: RADIUS_SM,
    border: `1px solid ${COLOR_BORDER}`,
    overflow: "visible",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    touchAction: "none",
  };

  const checkerboardStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: RADIUS_SM,
    backgroundImage: createCheckerboardPattern(),
    backgroundSize: `${CHECKERBOARD_SIZE * 2}px ${CHECKERBOARD_SIZE * 2}px`,
  };

  const gradientStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: RADIUS_SM,
    background: gradientToLinearCss(value),
  };

  const getHandleStyle = (stop: GradientStop): CSSProperties => {
    const isSelected = stop.id === selectedStopId;
    return {
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
    };
  };

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
        <div
          key={stop.id}
          data-stop-id={stop.id}
          onPointerDown={(e) => handleHandlePointerDown(e, stop.id)}
          style={getHandleStyle(stop)}
          role="slider"
          aria-label={`Stop at ${stop.position}%`}
          aria-valuenow={stop.position}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={disabled ? -1 : 0}
        />
      ))}
    </div>
  );
});
