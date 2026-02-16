/**
 * @file EasingPresetSelect - Dropdown for selecting easing presets
 */

import { memo, useMemo } from "react";
import { Select, type SelectOption } from "../../components/Select/Select";
import {
  EASING_PRESETS,
  PRESET_LABELS,
} from "../../components/BezierCurveEditor/bezierPresets";
import type { EasingPreset } from "../../components/BezierCurveEditor/bezierTypes";

export type EasingPresetSelectProps = {
  value: EasingPreset;
  onChange: (preset: EasingPreset) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  "aria-label"?: string;
};

/**
 * Mini SVG preview of easing curve for dropdown
 */
function EasingCurvePreview({ points }: { points: [number, number, number, number] }) {
  const [x1, y1, x2, y2] = points;
  const width = 40;
  const height = 20;
  const padding = 2;

  const toX = (x: number) => padding + x * (width - 2 * padding);
  const toY = (y: number) => padding + (1 - y) * (height - 2 * padding);

  const p0 = { x: toX(0), y: toY(0) };
  const p1 = { x: toX(x1), y: toY(y1) };
  const p2 = { x: toX(x2), y: toY(y2) };
  const p3 = { x: toX(1), y: toY(1) };

  const d = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

export const EasingPresetSelect = memo(function EasingPresetSelect({
  value,
  onChange,
  size = "md",
  disabled = false,
  "aria-label": ariaLabel,
}: EasingPresetSelectProps) {
  const options = useMemo<SelectOption<EasingPreset>[]>(() => {
    const presetOptions: SelectOption<EasingPreset>[] = Object.entries(
      EASING_PRESETS
    ).map(([preset, points]) => ({
      value: preset as Exclude<EasingPreset, "custom">,
      label: PRESET_LABELS[preset as EasingPreset],
      preview: <EasingCurvePreview points={points} />,
    }));

    presetOptions.push({
      value: "custom",
      label: PRESET_LABELS.custom,
    });

    return presetOptions;
  }, []);

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      size={size}
      disabled={disabled}
      aria-label={ariaLabel ?? "Easing preset"}
    />
  );
});
