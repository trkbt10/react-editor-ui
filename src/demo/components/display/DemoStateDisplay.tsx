/**
 * @file DemoStateDisplay - JSON/state display with monospace font
 */

export type DemoStateDisplayProps = {
  value: unknown;
};

export function DemoStateDisplay({ value }: DemoStateDisplayProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--rei-color-surface, #1e1f24)",
        borderRadius: "4px",
        padding: "12px",
        fontSize: "11px",
        fontFamily: "monospace",
        color: "var(--rei-color-text-muted)",
        whiteSpace: "pre-wrap",
      }}
    >
      {JSON.stringify(value, null, 2)}
    </div>
  );
}
