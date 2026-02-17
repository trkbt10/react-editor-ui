/**
 * @file DemoSurface - Background surface box with padding
 */

import { memo, useMemo } from "react";
import type { ReactNode, CSSProperties } from "react";

export type DemoSurfaceProps = {
  padding?: number;
  children: ReactNode;
};

export const DemoSurface = memo(function DemoSurface({ padding = 0, children }: DemoSurfaceProps) {
  const style = useMemo<CSSProperties>(
    () => ({
      backgroundColor: "var(--rei-color-surface, #1e1f24)",
      borderRadius: "4px",
      ...(padding > 0 && { padding: `${padding}px` }),
    }),
    [padding],
  );

  return <div style={style}>{children}</div>;
});
