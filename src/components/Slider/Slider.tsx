/**
 * @file Slider component - Reusable drag slider for color/gradient editing
 */

import { useRef, useCallback, memo, forwardRef, useMemo } from "react";
import type { CSSProperties, PointerEvent, Ref } from "react";
import {
  RADIUS_FULL,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../constants/styles";

export type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  orientation?: "horizontal" | "vertical";
  background?: string;
  disabled?: boolean;
  "aria-label"?: string;
  height?: number;
  handleSize?: number;
  className?: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getHandlePosition(
  isHorizontal: boolean,
  value: number,
): { left: string; top: string } {
  if (isHorizontal) {
    return { left: `${value * 100}%`, top: "50%" };
  }
  return { left: "50%", top: `${(1 - value) * 100}%` };
}

export const Slider = memo(
  forwardRef(function Slider(
    {
      value,
      onChange,
      orientation = "horizontal",
      background = "linear-gradient(to right, #000, #fff)",
      disabled = false,
      "aria-label": ariaLabel,
      height = 10,
      handleSize = 12,
      className,
    }: SliderProps,
    ref: Ref<HTMLDivElement>,
  ) {
    const trackRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const updateValue = useCallback(
      (e: PointerEvent<HTMLDivElement>) => {
        const rect = trackRef.current?.getBoundingClientRect();
        if (!rect) {
          return;
        }

        if (orientation === "horizontal") {
          const x = clamp(e.clientX - rect.left, 0, rect.width);
          const newValue = x / rect.width;
          onChange(clamp(newValue, 0, 1));
        } else {
          const y = clamp(e.clientY - rect.top, 0, rect.height);
          const newValue = 1 - y / rect.height;
          onChange(clamp(newValue, 0, 1));
        }
      },
      [onChange, orientation],
    );

    const handlePointerDown = useCallback(
      (e: PointerEvent<HTMLDivElement>) => {
        if (disabled) {
          return;
        }
        isDragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        updateValue(e);
      },
      [disabled, updateValue],
    );

    const handlePointerMove = useCallback(
      (e: PointerEvent<HTMLDivElement>) => {
        if (!isDragging.current || disabled) {
          return;
        }
        updateValue(e);
      },
      [disabled, updateValue],
    );

    const handlePointerUp = useCallback(() => {
      isDragging.current = false;
    }, []);

    const isHorizontal = orientation === "horizontal";

    const trackStyle = useMemo<CSSProperties>(
      () => ({
        position: "relative",
        width: isHorizontal ? "100%" : height,
        height: isHorizontal ? height : "100%",
        borderRadius: RADIUS_FULL,
        cursor: disabled ? "not-allowed" : "pointer",
        background,
        opacity: disabled ? 0.5 : 1,
        touchAction: "none",
      }),
      [isHorizontal, height, disabled, background],
    );

    const handlePosition = getHandlePosition(isHorizontal, value);

    const handleStyle = useMemo<CSSProperties>(
      () => ({
        position: "absolute",
        width: handleSize,
        height: handleSize,
        borderRadius: "50%",
        border: "2px solid white",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        transition: `box-shadow ${DURATION_FAST} ${EASING_DEFAULT}`,
        ...handlePosition,
      }),
      [handleSize, handlePosition],
    );

    return (
      <div
        ref={(node) => {
          trackRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        role="slider"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={className}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={trackStyle}
      >
        <div style={handleStyle} />
      </div>
    );
  }),
);
