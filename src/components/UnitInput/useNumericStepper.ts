/**
 * @file useNumericStepper hook
 *
 * Provides value adjustment via arrow keys and mouse wheel.
 * Used by UnitInput for numeric value stepping.
 */

import { useCallback } from "react";
import { clampValue, formatNumber } from "./unitInputUtils";

/**
 * Minimal keyboard event interface for stepping.
 */
export type StepKeyboardEvent = {
  key: string;
  shiftKey: boolean;
  preventDefault: () => void;
};

/**
 * Minimal wheel event interface for stepping.
 */
export type StepWheelEvent = {
  deltaY: number;
  shiftKey: boolean;
  preventDefault: () => void;
};

export type NumericStepperOptions = {
  /** Current numeric value */
  value: number;
  /** Step amount for normal adjustment */
  step: number;
  /** Step amount when shift is held */
  shiftStep: number;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Whether the control is disabled */
  disabled: boolean;
  /** Whether the control is focused (required for wheel events) */
  isFocused: boolean;
  /** Callback when value changes */
  onValueChange: (newValue: number) => void;
};

export type NumericStepperResult = {
  /**
   * Handle keyboard events for arrow key stepping.
   * Returns true if the event was handled.
   */
  handleKeyStep: (e: StepKeyboardEvent) => boolean;
  /**
   * Handle wheel events for value adjustment.
   */
  handleWheel: (e: StepWheelEvent) => void;
  /**
   * Adjust value by a given delta (positive = increase, negative = decrease).
   */
  adjustValue: (delta: number, useShiftStep: boolean) => void;
};

/**
 * Hook for numeric value stepping via keyboard and mouse wheel.
 *
 * @example
 * const { handleKeyStep, handleWheel } = useNumericStepper({
 *   value: 10,
 *   step: 1,
 *   shiftStep: 10,
 *   min: 0,
 *   max: 100,
 *   disabled: false,
 *   isFocused: true,
 *   onValueChange: (v) => console.log(v),
 * });
 */
export function useNumericStepper({
  value,
  step,
  shiftStep,
  min,
  max,
  disabled,
  isFocused,
  onValueChange,
}: NumericStepperOptions): NumericStepperResult {
  const adjustValue = useCallback(
    (delta: number, useShiftStep: boolean) => {
      if (disabled) {return;}
      const actualStep = useShiftStep ? shiftStep : step;
      const newValue = clampValue(value + delta * actualStep, min, max);
      onValueChange(newValue);
    },
    [disabled, value, step, shiftStep, min, max, onValueChange],
  );

  const handleKeyStep = useCallback(
    (e: StepKeyboardEvent): boolean => {
      if (disabled) {return false;}

      if (e.key === "ArrowUp") {
        e.preventDefault();
        adjustValue(1, e.shiftKey);
        return true;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        adjustValue(-1, e.shiftKey);
        return true;
      }

      return false;
    },
    [disabled, adjustValue],
  );

  const handleWheel = useCallback(
    (e: StepWheelEvent): void => {
      if (disabled || !isFocused) {return;}

      e.preventDefault();
      const delta = e.deltaY < 0 ? 1 : -1;
      adjustValue(delta, e.shiftKey);
    },
    [disabled, isFocused, adjustValue],
  );

  return {
    handleKeyStep,
    handleWheel,
    adjustValue,
  };
}

/**
 * Helper to format the adjusted value for display.
 */
export { formatNumber };
