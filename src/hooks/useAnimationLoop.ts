/**
 * @file useAnimationLoop hook - requestAnimationFrame management
 */

import { useRef, useCallback, useEffect } from "react";

export type AnimationCallback = () => void;

export type UseAnimationLoopResult = {
  /** Start the animation loop */
  start: () => void;
  /** Stop the animation loop */
  stop: () => void;
};

/**
 * Manages a requestAnimationFrame loop with automatic cleanup.
 *
 * @param callback - Function to call on each frame
 * @param isRunning - Whether the loop should be running
 */
export function useAnimationLoop(
  callback: AnimationCallback,
  isRunning: boolean,
): UseAnimationLoopResult {
  const frameRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  callbackRef.current = callback;

  const loop = useCallback(() => {
    callbackRef.current();
    frameRef.current = requestAnimationFrame(loop);
  }, []);

  const start = useCallback(() => {
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(loop);
    }
  }, [loop]);

  const stop = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  // Auto start/stop based on isRunning
  useEffect(() => {
    if (isRunning) {
      start();
    } else {
      stop();
    }
  }, [isRunning, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { start, stop };
}
