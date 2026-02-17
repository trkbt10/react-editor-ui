/**
 * @file DemoPreview - Preview area with surface background
 */

import { memo, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";

const basePreviewStyle: CSSProperties = {
  backgroundColor: "var(--rei-color-surface, #1e1f24)",
  borderRadius: "4px",
  padding: "24px",
  color: "var(--rei-color-text)",
};

export type DemoPreviewProps = {
  style?: CSSProperties;
  children: ReactNode;
};

export const DemoPreview = memo(function DemoPreview({ style, children }: DemoPreviewProps) {
  const mergedStyle = useMemo<CSSProperties>(
    () => (style ? { ...basePreviewStyle, ...style } : basePreviewStyle),
    [style],
  );

  return <div style={mergedStyle}>{children}</div>;
});
