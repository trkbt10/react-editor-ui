/**
 * @file Click Count Hook
 *
 * Tracks consecutive clicks for multi-click detection (double/triple-click).
 */

import { useRef, useCallback } from "react";

type ClickCountConfig = {
  /** Maximum time between clicks to count as consecutive (ms) */
  readonly maxInterval: number;
  /** Maximum distance between clicks to count as same location (px) */
  readonly maxDistance: number;
};

const DEFAULT_CONFIG: ClickCountConfig = {
  maxInterval: 400, // Standard double-click interval
  maxDistance: 5, // Slight movement tolerance
};

type ClickState = {
  count: number;
  lastTime: number;
  lastX: number;
  lastY: number;
};

type UseClickCountResult = {
  /** Get click count for current click, returns 1, 2, or 3 */
  getClickCount: (x: number, y: number) => number;
  /** Reset click count state */
  reset: () => void;
};

export function useClickCount(
  config: Partial<ClickCountConfig> = {}
): UseClickCountResult {
  const { maxInterval, maxDistance } = { ...DEFAULT_CONFIG, ...config };

  const stateRef = useRef<ClickState>({
    count: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
  });

  const getClickCount = useCallback(
    (x: number, y: number): number => {
      const now = Date.now();
      const state = stateRef.current;

      const timeDelta = now - state.lastTime;
      const dx = Math.abs(x - state.lastX);
      const dy = Math.abs(y - state.lastY);
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if this is a consecutive click
      const isConsecutive = timeDelta <= maxInterval && distance <= maxDistance;

      if (isConsecutive) {
        // Increment count, max at 3 (triple-click)
        state.count = Math.min(state.count + 1, 3);
      } else {
        // Reset to single click
        state.count = 1;
      }

      // Update state for next check
      state.lastTime = now;
      state.lastX = x;
      state.lastY = y;

      return state.count;
    },
    [maxInterval, maxDistance]
  );

  const reset = useCallback(() => {
    stateRef.current = {
      count: 0,
      lastTime: 0,
      lastX: 0,
      lastY: 0,
    };
  }, []);

  return { getClickCount, reset };
}
