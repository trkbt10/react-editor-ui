/**
 * @file useNumericStepper hook tests
 */

import { renderHook, act } from "@testing-library/react";
import { useNumericStepper, type StepKeyboardEvent, type StepWheelEvent } from "./useNumericStepper";

function createKeyboardEvent(key: string, shiftKey = false): StepKeyboardEvent {
  return {
    key,
    shiftKey,
    preventDefault: vi.fn(),
  };
}

function createWheelEvent(deltaY: number, shiftKey = false): StepWheelEvent {
  return {
    deltaY,
    shiftKey,
    preventDefault: vi.fn(),
  };
}

describe("useNumericStepper", () => {
  const defaultOptions = {
    value: 10,
    step: 1,
    shiftStep: 10,
    disabled: false,
    isFocused: true,
    onValueChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleKeyStep", () => {
    it("increases value on ArrowUp", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, onValueChange }),
      );

      const event = createKeyboardEvent("ArrowUp");
      act(() => {
        result.current.handleKeyStep(event);
      });

      expect(onValueChange).toHaveBeenCalledWith(11);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it("decreases value on ArrowDown", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, onValueChange }),
      );

      const event = createKeyboardEvent("ArrowDown");
      act(() => {
        result.current.handleKeyStep(event);
      });

      expect(onValueChange).toHaveBeenCalledWith(9);
    });

    it("uses shiftStep when shift is held", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, onValueChange }),
      );

      const event = createKeyboardEvent("ArrowUp", true);
      act(() => {
        result.current.handleKeyStep(event);
      });

      expect(onValueChange).toHaveBeenCalledWith(20);
    });

    it("returns true when event was handled", () => {
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions }),
      );

      const event = createKeyboardEvent("ArrowUp");
      const handled = result.current.handleKeyStep(event);

      expect(handled).toBe(true);
    });

    it("returns false for non-arrow keys", () => {
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions }),
      );

      const event = createKeyboardEvent("Enter");
      const handled = result.current.handleKeyStep(event);

      expect(handled).toBe(false);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("does nothing when disabled", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, disabled: true, onValueChange }),
      );

      const event = createKeyboardEvent("ArrowUp");
      const handled = result.current.handleKeyStep(event);

      expect(handled).toBe(false);
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("clamps to min value", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, value: 0, min: 0, onValueChange }),
      );

      const event = createKeyboardEvent("ArrowDown");
      act(() => {
        result.current.handleKeyStep(event);
      });

      expect(onValueChange).toHaveBeenCalledWith(0);
    });

    it("clamps to max value", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, value: 100, max: 100, onValueChange }),
      );

      const event = createKeyboardEvent("ArrowUp");
      act(() => {
        result.current.handleKeyStep(event);
      });

      expect(onValueChange).toHaveBeenCalledWith(100);
    });
  });

  describe("handleWheel", () => {
    it("increases value on wheel up (negative deltaY)", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, onValueChange }),
      );

      const event = createWheelEvent(-100);
      act(() => {
        result.current.handleWheel(event);
      });

      expect(onValueChange).toHaveBeenCalledWith(11);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it("decreases value on wheel down (positive deltaY)", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, onValueChange }),
      );

      const event = createWheelEvent(100);
      act(() => {
        result.current.handleWheel(event);
      });

      expect(onValueChange).toHaveBeenCalledWith(9);
    });

    it("uses shiftStep when shift is held", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, onValueChange }),
      );

      const event = createWheelEvent(-100, true);
      act(() => {
        result.current.handleWheel(event);
      });

      expect(onValueChange).toHaveBeenCalledWith(20);
    });

    it("does nothing when not focused", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, isFocused: false, onValueChange }),
      );

      const event = createWheelEvent(-100);
      act(() => {
        result.current.handleWheel(event);
      });

      expect(onValueChange).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("does nothing when disabled", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, disabled: true, onValueChange }),
      );

      const event = createWheelEvent(-100);
      act(() => {
        result.current.handleWheel(event);
      });

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("clamps to min value", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, value: 0, min: 0, onValueChange }),
      );

      const event = createWheelEvent(100);
      act(() => {
        result.current.handleWheel(event);
      });

      expect(onValueChange).toHaveBeenCalledWith(0);
    });

    it("clamps to max value", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, value: 100, max: 100, onValueChange }),
      );

      const event = createWheelEvent(-100);
      act(() => {
        result.current.handleWheel(event);
      });

      expect(onValueChange).toHaveBeenCalledWith(100);
    });
  });

  describe("adjustValue", () => {
    it("adjusts value by positive delta", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, onValueChange }),
      );

      act(() => {
        result.current.adjustValue(1, false);
      });

      expect(onValueChange).toHaveBeenCalledWith(11);
    });

    it("adjusts value by negative delta", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, onValueChange }),
      );

      act(() => {
        result.current.adjustValue(-1, false);
      });

      expect(onValueChange).toHaveBeenCalledWith(9);
    });

    it("uses shiftStep when specified", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, onValueChange }),
      );

      act(() => {
        result.current.adjustValue(1, true);
      });

      expect(onValueChange).toHaveBeenCalledWith(20);
    });

    it("supports custom step value", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, step: 0.5, onValueChange }),
      );

      act(() => {
        result.current.adjustValue(1, false);
      });

      expect(onValueChange).toHaveBeenCalledWith(10.5);
    });

    it("supports negative starting value", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, value: -10, onValueChange }),
      );

      act(() => {
        result.current.adjustValue(1, false);
      });

      expect(onValueChange).toHaveBeenCalledWith(-9);
    });

    it("does nothing when disabled", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, disabled: true, onValueChange }),
      );

      act(() => {
        result.current.adjustValue(1, false);
      });

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("handles both min and max bounds", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, value: 5, min: 0, max: 10, onValueChange }),
      );

      act(() => {
        result.current.adjustValue(10, false); // Would be 15, clamped to 10
      });
      expect(onValueChange).toHaveBeenCalledWith(10);

      act(() => {
        result.current.adjustValue(-20, false); // Would be -15, clamped to 0
      });
      expect(onValueChange).toHaveBeenCalledWith(0);
    });

    it("handles decimal step precision", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, value: 0, step: 0.1, onValueChange }),
      );

      act(() => {
        result.current.adjustValue(1, false);
      });

      expect(onValueChange).toHaveBeenCalledWith(0.1);
    });
  });

  describe("callback stability", () => {
    it("maintains callback reference stability across rerenders", () => {
      const onValueChange = vi.fn();
      const { result, rerender } = renderHook(
        (props) => useNumericStepper(props),
        { initialProps: { ...defaultOptions, onValueChange } },
      );

      const firstHandleKeyStep = result.current.handleKeyStep;
      const firstHandleWheel = result.current.handleWheel;
      const firstAdjustValue = result.current.adjustValue;

      // Rerender with same props
      rerender({ ...defaultOptions, onValueChange });

      // Callbacks should be stable (same reference) when props don't change
      expect(result.current.handleKeyStep).toBe(firstHandleKeyStep);
      expect(result.current.handleWheel).toBe(firstHandleWheel);
      expect(result.current.adjustValue).toBe(firstAdjustValue);
    });

    it("updates callback when value changes", () => {
      const onValueChange = vi.fn();
      const { result, rerender } = renderHook(
        (props) => useNumericStepper(props),
        { initialProps: { ...defaultOptions, value: 10, onValueChange } },
      );

      // First call with value=10
      act(() => {
        result.current.adjustValue(1, false);
      });
      expect(onValueChange).toHaveBeenLastCalledWith(11);

      // Rerender with new value
      rerender({ ...defaultOptions, value: 20, onValueChange });

      // Second call should use new value
      act(() => {
        result.current.adjustValue(1, false);
      });
      expect(onValueChange).toHaveBeenLastCalledWith(21);
    });
  });

  describe("edge cases", () => {
    it("handles zero deltaY in wheel event", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, onValueChange }),
      );

      // deltaY = 0 is treated as negative (no scroll), so increases
      const event = createWheelEvent(0);
      act(() => {
        result.current.handleWheel(event);
      });

      // 0 < 0 is false, so delta is -1
      expect(onValueChange).toHaveBeenCalledWith(9);
    });

    it("handles very large step values", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, step: 1000000, onValueChange }),
      );

      act(() => {
        result.current.adjustValue(1, false);
      });

      expect(onValueChange).toHaveBeenCalledWith(1000010);
    });

    it("handles very small step values", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericStepper({ ...defaultOptions, step: 0.001, onValueChange }),
      );

      act(() => {
        result.current.adjustValue(1, false);
      });

      expect(onValueChange).toHaveBeenCalledWith(10.001);
    });
  });
});
