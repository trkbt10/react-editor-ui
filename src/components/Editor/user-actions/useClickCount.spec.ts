/**
 * @file Click Count Hook Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useClickCount } from "./useClickCount";

describe("useClickCount", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 1 for first click", () => {
    const { result } = renderHook(() => useClickCount());

    let count: number;
    act(() => {
      count = result.current.getClickCount(100, 100);
    });
    expect(count!).toBe(1);
  });

  it("returns 2 for double-click within interval", () => {
    const { result } = renderHook(() => useClickCount());

    act(() => {
      result.current.getClickCount(100, 100);
    });

    vi.advanceTimersByTime(200);

    let count: number;
    act(() => {
      count = result.current.getClickCount(100, 100);
    });
    expect(count!).toBe(2);
  });

  it("returns 3 for triple-click within interval", () => {
    const { result } = renderHook(() => useClickCount());

    act(() => {
      result.current.getClickCount(100, 100);
    });
    vi.advanceTimersByTime(200);

    act(() => {
      result.current.getClickCount(100, 100);
    });
    vi.advanceTimersByTime(200);

    let count: number;
    act(() => {
      count = result.current.getClickCount(100, 100);
    });
    expect(count!).toBe(3);
  });

  it("caps at 3 for more than triple-click", () => {
    const { result } = renderHook(() => useClickCount());

    // 4 rapid clicks
    for (let i = 0; i < 4; i++) {
      act(() => {
        result.current.getClickCount(100, 100);
      });
      vi.advanceTimersByTime(100);
    }

    // Even 5th click should stay at 3
    let count: number;
    act(() => {
      count = result.current.getClickCount(100, 100);
    });
    expect(count!).toBe(3);
  });

  it("resets count after timeout", () => {
    const { result } = renderHook(() => useClickCount({ maxInterval: 400 }));

    act(() => {
      result.current.getClickCount(100, 100);
    });

    vi.advanceTimersByTime(500); // Exceed interval

    let count: number;
    act(() => {
      count = result.current.getClickCount(100, 100);
    });
    expect(count!).toBe(1);
  });

  it("resets count if click position changes significantly", () => {
    const { result } = renderHook(() => useClickCount({ maxDistance: 5 }));

    act(() => {
      result.current.getClickCount(100, 100);
    });
    vi.advanceTimersByTime(200);

    // Click 10 pixels away
    let count: number;
    act(() => {
      count = result.current.getClickCount(110, 100);
    });
    expect(count!).toBe(1);
  });

  it("allows click within distance tolerance", () => {
    const { result } = renderHook(() => useClickCount({ maxDistance: 10 }));

    act(() => {
      result.current.getClickCount(100, 100);
    });
    vi.advanceTimersByTime(200);

    // Click 5 pixels away (within tolerance)
    let count: number;
    act(() => {
      count = result.current.getClickCount(103, 104);
    });
    expect(count!).toBe(2);
  });

  it("reset clears the state", () => {
    const { result } = renderHook(() => useClickCount());

    act(() => {
      result.current.getClickCount(100, 100);
    });
    vi.advanceTimersByTime(100);
    act(() => {
      result.current.getClickCount(100, 100);
    });

    act(() => {
      result.current.reset();
    });

    let count: number;
    act(() => {
      count = result.current.getClickCount(100, 100);
    });
    expect(count!).toBe(1);
  });

  it("handles custom config", () => {
    const { result } = renderHook(() =>
      useClickCount({ maxInterval: 200, maxDistance: 3 })
    );

    act(() => {
      result.current.getClickCount(100, 100);
    });

    vi.advanceTimersByTime(250); // Exceed custom interval

    let count: number;
    act(() => {
      count = result.current.getClickCount(100, 100);
    });
    expect(count!).toBe(1);
  });
});
