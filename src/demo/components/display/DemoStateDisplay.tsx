/**
 * @file DemoStateDisplay - JSON/state display with monospace font
 */

import { memo } from "react";
import type { CSSProperties } from "react";

const stateDisplayStyle: CSSProperties = {
  backgroundColor: "var(--rei-color-surface, #1e1f24)",
  borderRadius: "4px",
  padding: "12px",
  fontSize: "11px",
  fontFamily: "monospace",
  color: "var(--rei-color-text-muted)",
  whiteSpace: "pre-wrap",
};

export type DemoStateDisplayProps = {
  value: unknown;
};

export const DemoStateDisplay = memo(function DemoStateDisplay({ value }: DemoStateDisplayProps) {
  return (
    <div style={stateDisplayStyle}>
      {JSON.stringify(value, null, 2)}
    </div>
  );
});
