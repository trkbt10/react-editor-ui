/**
 * @file DemoMutedText - Muted color description text
 */

import type { ReactNode } from "react";

export type DemoMutedTextProps = {
  size?: 11 | 12;
  children: ReactNode;
};

export function DemoMutedText({ size = 11, children }: DemoMutedTextProps) {
  return (
    <div
      style={{
        color: "var(--rei-color-text-muted)",
        fontSize: `${size}px`,
      }}
    >
      {children}
    </div>
  );
}
