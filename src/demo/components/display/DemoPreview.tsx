/**
 * @file DemoPreview - Preview area with surface background
 */

import type { CSSProperties, ReactNode } from "react";

export type DemoPreviewProps = {
  style?: CSSProperties;
  children: ReactNode;
};

export function DemoPreview({ style, children }: DemoPreviewProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--rei-color-surface, #1e1f24)",
        borderRadius: "4px",
        padding: "24px",
        color: "var(--rei-color-text)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
