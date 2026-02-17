/**
 * @file AnimationSection component - Animation settings with easing curve editor
 */

import { memo, useCallback, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import { UnitInput } from "../../components/UnitInput/UnitInput";
import { ControlRow } from "../../components/ControlRow/ControlRow";
import { ControlGroup } from "../../components/ControlRow/ControlGroup";
import { BezierCurveEditor } from "../../components/BezierCurveEditor/BezierCurveEditor";
import type { BezierControlPoints, EasingPreset } from "../../components/BezierCurveEditor/bezierTypes";
import { EASING_PRESETS, matchPreset } from "../../components/BezierCurveEditor/bezierPresets";
import { EasingPresetSelect } from "./EasingPresetSelect";
import { ClockIcon, HourglassIcon } from "../../icons";
import { SPACE_MD } from "../../constants/styles";
import type { AnimationSectionProps, AnimationData } from "./types";

type CallbackState = {
  data: AnimationData;
  onChange: (data: AnimationData) => void;
};

const timeUnits = [
  { value: "s", label: "s" },
  { value: "ms", label: "ms" },
];

/**
 * Animation section with easing curve editor and timing controls.
 */
export const AnimationSection = memo(function AnimationSection({
  data,
  onChange,
  className,
}: AnimationSectionProps) {
  const stateRef = useRef<CallbackState>({ data, onChange });
  stateRef.current = { data, onChange };

  const handleDurationChange = useCallback(
    (v: string) => stateRef.current.onChange({ ...stateRef.current.data, duration: v }),
    [],
  );

  const handleDelayChange = useCallback(
    (v: string) => stateRef.current.onChange({ ...stateRef.current.data, delay: v }),
    [],
  );

  const handlePresetChange = useCallback((preset: EasingPreset) => {
    if (preset !== "custom") {
      stateRef.current.onChange({
        ...stateRef.current.data,
        easing: preset,
        bezierControlPoints: EASING_PRESETS[preset],
      });
    }
  }, []);

  const handleBezierChange = useCallback((points: BezierControlPoints) => {
    const preset = matchPreset(points);
    stateRef.current.onChange({
      ...stateRef.current.data,
      bezierControlPoints: points,
      easing: preset,
    });
  }, []);

  const mainLayoutStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      gap: SPACE_MD,
      alignItems: "flex-start",
    }),
    [],
  );

  const rightColumnStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      gap: SPACE_MD,
      flex: 1,
      minWidth: 0,
    }),
    [],
  );

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      gap: SPACE_MD,
    }),
    [],
  );

  const bezierWidth = 150;
  const bezierHeight = 120;

  return (
    <div className={className} style={containerStyle}>
      <ControlRow label="Easing" labelWidth={50}>
        <EasingPresetSelect
          value={data.easing}
          onChange={handlePresetChange}
          size="sm"
          aria-label="Easing preset"
        />
      </ControlRow>

      <div style={mainLayoutStyle}>
        <BezierCurveEditor
          value={data.bezierControlPoints}
          onChange={handleBezierChange}
          width={bezierWidth}
          height={bezierHeight}
          aria-label="Easing curve editor"
        />

        <div style={rightColumnStyle}>
          <ControlGroup label="Duration">
            <UnitInput
              value={data.duration}
              onChange={handleDurationChange}
              units={timeUnits}
              iconStart={<ClockIcon />}
              min={0}
              step={0.1}
              size="sm"
              aria-label="Duration"
            />
          </ControlGroup>

          <ControlGroup label="Delay">
            <UnitInput
              value={data.delay}
              onChange={handleDelayChange}
              units={timeUnits}
              iconStart={<HourglassIcon />}
              min={0}
              step={0.1}
              size="sm"
              aria-label="Delay"
            />
          </ControlGroup>
        </div>
      </div>
    </div>
  );
});
