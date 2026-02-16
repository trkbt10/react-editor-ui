/**
 * @file DemoSurface - Background surface box with padding
 */

import type { ReactNode } from "react";

export type DemoSurfaceProps = {
  padding?: number;
  children: ReactNode;
};

export function DemoSurface({ padding = 0, children }: DemoSurfaceProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--rei-color-surface, #1e1f24)",
        borderRadius: "4px",
        ...(padding > 0 && { padding: `${padding}px` }),
      }}
    >
      {children}
    </div>
  );
}
