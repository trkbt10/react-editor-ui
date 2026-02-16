/**
 * @file Click Count Hook Tests
 */

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

    const ref = { count: 0 };
    act(() => {
      ref.count = result.current.getClickCount(100, 100);
    });
    expect(ref.count).toBe(1);
  });

  it("returns 2 for double-click within interval", () => {
    const { result } = renderHook(() => useClickCount());

    act(() => {
      result.current.getClickCount(100, 100);
    });

    vi.advanceTimersByTime(200);

    const ref = { count: 0 };
    act(() => {
      ref.count = result.current.getClickCount(100, 100);
    });
    expect(ref.count).toBe(2);
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

    const ref = { count: 0 };
    act(() => {
      ref.count = result.current.getClickCount(100, 100);
    });
    expect(ref.count).toBe(3);
  });

  it("caps at 3 for more than triple-click", () => {
    const { result } = renderHook(() => useClickCount());

    // 4 rapid clicks
    Array.from({ length: 4 }).forEach(() => {
      act(() => {
        result.current.getClickCount(100, 100);
      });
      vi.advanceTimersByTime(100);
    });

    // Even 5th click should stay at 3
    const ref = { count: 0 };
    act(() => {
      ref.count = result.current.getClickCount(100, 100);
    });
    expect(ref.count).toBe(3);
  });

  it("resets count after timeout", () => {
    const { result } = renderHook(() => useClickCount({ maxInterval: 400 }));

    act(() => {
      result.current.getClickCount(100, 100);
    });

    vi.advanceTimersByTime(500); // Exceed interval

    const ref = { count: 0 };
    act(() => {
      ref.count = result.current.getClickCount(100, 100);
    });
    expect(ref.count).toBe(1);
  });

  it("resets count if click position changes significantly", () => {
    const { result } = renderHook(() => useClickCount({ maxDistance: 5 }));

    act(() => {
      result.current.getClickCount(100, 100);
    });
    vi.advanceTimersByTime(200);

    // Click 10 pixels away
    const ref = { count: 0 };
    act(() => {
      ref.count = result.current.getClickCount(110, 100);
    });
    expect(ref.count).toBe(1);
  });

  it("allows click within distance tolerance", () => {
    const { result } = renderHook(() => useClickCount({ maxDistance: 10 }));

    act(() => {
      result.current.getClickCount(100, 100);
    });
    vi.advanceTimersByTime(200);

    // Click 5 pixels away (within tolerance)
    const ref = { count: 0 };
    act(() => {
      ref.count = result.current.getClickCount(103, 104);
    });
    expect(ref.count).toBe(2);
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

    const ref = { count: 0 };
    act(() => {
      ref.count = result.current.getClickCount(100, 100);
    });
    expect(ref.count).toBe(1);
  });

  it("handles custom config", () => {
    const { result } = renderHook(() =>
      useClickCount({ maxInterval: 200, maxDistance: 3 })
    );

    act(() => {
      result.current.getClickCount(100, 100);
    });

    vi.advanceTimersByTime(250); // Exceed custom interval

    const ref = { count: 0 };
    act(() => {
      ref.count = result.current.getClickCount(100, 100);
    });
    expect(ref.count).toBe(1);
  });
});
