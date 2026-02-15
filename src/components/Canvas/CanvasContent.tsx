/**
 * @file CanvasContent component - Wrapper for positioning children on canvas
 */

import type { ReactNode, CSSProperties } from "react";
import type { CanvasContentProps } from "./core/types";

/**
 * Wrapper component for positioning content at a specific canvas coordinate
 */
export function CanvasContent({ x, y, children }: CanvasContentProps): ReactNode {
  const style: CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
  };

  return <div style={style}>{children}</div>;
}
