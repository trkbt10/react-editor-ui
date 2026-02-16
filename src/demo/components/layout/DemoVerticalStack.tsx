/**
 * @file DemoVerticalStack - Vertical flex layout with configurable gap
 */

import type { ReactNode } from "react";

export type DemoVerticalStackProps = {
  gap?: 8 | 12 | 16;
  children: ReactNode;
};

export function DemoVerticalStack({ gap = 8, children }: DemoVerticalStackProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
}
