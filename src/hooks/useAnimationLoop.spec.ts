import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAnimationLoop } from "./useAnimationLoop";

describe("useAnimationLoop", () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let rafId = 0;

  beforeEach(() => {
    rafCallbacks = [];
    rafId = 0;

    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return ++rafId;
    });

    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {
      rafCallbacks = [];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function flushRaf() {
    const callbacks = [...rafCallbacks];
    rafCallbacks = [];
    for (const cb of callbacks) {
      cb(performance.now());
    }
  }

  it("does not start loop when isRunning is false", () => {
    const callback = vi.fn();
    renderHook(() => useAnimationLoop(callback, false));

    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });

  it("starts loop when isRunning is true", () => {
    const callback = vi.fn();
    renderHook(() => useAnimationLoop(callback, true));

    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it("calls callback on each animation frame", () => {
    const callback = vi.fn();
    renderHook(() => useAnimationLoop(callback, true));

    flushRaf();
    expect(callback).toHaveBeenCalledTimes(1);

    flushRaf();
    expect(callback).toHaveBeenCalledTimes(2);

    flushRaf();
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("stops loop when isRunning changes to false", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ isRunning }) => useAnimationLoop(callback, isRunning),
      { initialProps: { isRunning: true } },
    );

    flushRaf();
    expect(callback).toHaveBeenCalledTimes(1);

    // Stop the loop
    rerender({ isRunning: false });
    expect(window.cancelAnimationFrame).toHaveBeenCalled();

    // Flush should not call callback anymore
    flushRaf();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("restarts loop when isRunning changes back to true", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ isRunning }) => useAnimationLoop(callback, isRunning),
      { initialProps: { isRunning: true } },
    );

    flushRaf();
    expect(callback).toHaveBeenCalledTimes(1);

    rerender({ isRunning: false });
    rerender({ isRunning: true });

    flushRaf();
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("cancels animation frame on unmount", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useAnimationLoop(callback, true));

    unmount();

    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("returns start and stop functions", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useAnimationLoop(callback, false));

    expect(result.current.start).toBeInstanceOf(Function);
    expect(result.current.stop).toBeInstanceOf(Function);
  });

  it("manual start triggers animation loop", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useAnimationLoop(callback, false));

    act(() => {
      result.current.start();
    });

    flushRaf();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("manual stop cancels animation loop", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useAnimationLoop(callback, true));

    flushRaf();
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.stop();
    });

    flushRaf();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("uses latest callback without restarting loop", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(
      ({ callback }) => useAnimationLoop(callback, true),
      { initialProps: { callback: callback1 } },
    );

    flushRaf();
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    // Update callback
    rerender({ callback: callback2 });

    flushRaf();
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it("does not start multiple loops when start is called multiple times", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useAnimationLoop(callback, false));

    act(() => {
      result.current.start();
      result.current.start();
      result.current.start();
    });

    // Should only have one pending RAF
    expect(rafCallbacks.length).toBe(1);
  });
});
