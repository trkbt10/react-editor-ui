/**
 * @file StrokeDashEditor - Dashed line configuration
 */

import type { CSSProperties } from "react";
import type { DashPattern } from "./types";
import { Checkbox } from "../Checkbox/Checkbox";
import { Input } from "../Input/Input";
import {
  COLOR_TEXT_MUTED,
  SIZE_FONT_XS,
  SPACE_SM,
} from "../../constants/styles";

export type StrokeDashEditorProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  pattern: DashPattern;
  onPatternChange: (pattern: DashPattern) => void;
  disabled?: boolean;
  columns?: 2 | 6;
};

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_SM,
};

const labelStyle: CSSProperties = {
  fontSize: SIZE_FONT_XS,
  color: COLOR_TEXT_MUTED,
  textAlign: "center",
};

export function StrokeDashEditor({
  enabled,
  onEnabledChange,
  pattern,
  onPatternChange,
  disabled = false,
  columns = 6,
}: StrokeDashEditorProps) {
  const updateValue = (index: number, value: string) => {
    const newValues = [...pattern.values];
    newValues[index] = value;
    onPatternChange({ values: newValues });
  };

  const labels = columns === 6
    ? ["dash", "gap", "dash", "gap", "dash", "gap"]
    : ["dash", "gap"];

  const values = columns === 6
    ? pattern.values.slice(0, 6)
    : pattern.values.slice(0, 2);

  // Ensure we have enough values
  while (values.length < columns) {
    values.push("");
  }

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: SPACE_SM,
  };

  return (
    <div style={containerStyle}>
      <Checkbox
        checked={enabled}
        onChange={onEnabledChange}
        label="Dashed Line"
        disabled={disabled}
      />

      {enabled ? (
        <>
          <div style={gridStyle}>
            {labels.map((label, i) => (
              <span key={`label-${i}`} style={labelStyle}>{label}</span>
            ))}
          </div>
          <div style={gridStyle}>
            {values.map((value, i) => (
              <Input
                key={`input-${i}`}
                value={value}
                onChange={(v) => updateValue(i, v)}
                type="number"
                disabled={disabled}
                aria-label={labels[i]}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
