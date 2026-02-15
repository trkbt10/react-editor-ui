/**
 * @file Canvas context for providing viewport state to children
 */

import { createContext, useContext } from "react";
import type { ViewportState } from "./types";

/**
 * Point in 2D space
 */
export type Point = {
  readonly x: number;
  readonly y: number;
};

/**
 * Canvas context value
 */
export type CanvasContextValue = {
  /** Current viewport state */
  readonly viewport: ViewportState;
  /** Canvas width in pixels */
  readonly canvasWidth: number;
  /** Canvas height in pixels */
  readonly canvasHeight: number;
  /** Convert screen coordinates to canvas coordinates */
  readonly screenToCanvas: (screenX: number, screenY: number) => Point;
  /** Convert canvas coordinates to screen coordinates */
  readonly canvasToScreen: (canvasX: number, canvasY: number) => Point;
};

/**
 * Canvas context
 */
export const CanvasContext = createContext<CanvasContextValue | null>(null);

/**
 * Hook to access canvas context
 * @throws Error if used outside Canvas component
 */
export function useCanvasContext(): CanvasContextValue {
  const ctx = useContext(CanvasContext);
  if (ctx === null) {
    throw new Error("useCanvasContext must be used within a Canvas component");
  }
  return ctx;
}
