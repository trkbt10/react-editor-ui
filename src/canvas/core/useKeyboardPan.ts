/**
 * @file Hook to track Space key state for pan mode
 */

import { useState, useEffect, useEffectEvent } from "react";

export type UseKeyboardPanResult = {
  /** Whether Space key is currently pressed */
  readonly isSpacePanning: boolean;
};

/**
 * Hook to track Space key press state for enabling pan mode
 */
export function useKeyboardPan(): UseKeyboardPanResult {
  const [isSpacePanning, setIsSpacePanning] = useState(false);

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.code === "Space" && !e.repeat) {
      setIsSpacePanning(true);
    }
  });

  const onKeyUp = useEffectEvent((e: KeyboardEvent) => {
    if (e.code === "Space") {
      setIsSpacePanning(false);
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [onKeyDown, onKeyUp]);

  return { isSpacePanning };
}
