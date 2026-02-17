/**
 * @file DemoMutedText - Muted color description text
 */

import { memo, useMemo } from "react";
import type { ReactNode, CSSProperties } from "react";

export type DemoMutedTextProps = {
  size?: 11 | 12;
  children: ReactNode;
};

export const DemoMutedText = memo(function DemoMutedText({ size = 11, children }: DemoMutedTextProps) {
  const style = useMemo<CSSProperties>(
    () => ({
      color: "var(--rei-color-text-muted)",
      fontSize: `${size}px`,
    }),
    [size],
  );

  return <div style={style}>{children}</div>;
});
