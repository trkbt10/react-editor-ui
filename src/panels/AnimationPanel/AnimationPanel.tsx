/**
 * @file AnimationPanel component - Animation settings panel with easing curve editor
 *
 * @description
 * Panel for configuring CSS animations with interactive bezier curve editor,
 * duration and delay inputs. Supports preset easing functions and custom curves.
 *
 * @example
 * ```tsx
 * import { AnimationPanel, createDefaultAnimationSettings } from "react-editor-ui/AnimationPanel";
 * import { useState } from "react";
 *
 * const [settings, setSettings] = useState(createDefaultAnimationSettings());
 *
 * <AnimationPanel
 *   settings={settings}
 *   onChange={setSettings}
 *   onClose={() => console.log("closed")}
 * />
 * ```
 */

import { memo, useCallback, useMemo } from "react";
import type { CSSProperties } from "react";
import { Panel } from "../Panel/Panel";
import { UnitInput } from "../../components/UnitInput/UnitInput";
import { ControlRow } from "../../components/ControlRow/ControlRow";
import { ControlGroup } from "../../components/ControlRow/ControlGroup";
import { BezierCurveEditor } from "../../components/BezierCurveEditor/BezierCurveEditor";
import type { BezierControlPoints, AnimationSettings, EasingPreset } from "../../components/BezierCurveEditor/bezierTypes";
import { EASING_PRESETS, matchPreset } from "../../components/BezierCurveEditor/bezierPresets";
import { EasingPresetSelect } from "./EasingPresetSelect";
import { ClockIcon, HourglassIcon } from "../../icons";
import { SPACE_MD } from "../../constants/styles";

export type AnimationPanelProps = {
  settings: AnimationSettings;
  onChange: (settings: AnimationSettings) => void;
  onClose?: () => void;
  width?: number;
  className?: string;
};

const timeUnits = [
  { value: "s", label: "s" },
  { value: "ms", label: "ms" },
];

export const AnimationPanel = memo(function AnimationPanel({
  settings,
  onChange,
  onClose,
  width = 320,
  className,
}: AnimationPanelProps) {
  const updateSetting = useCallback(
    <K extends keyof AnimationSettings>(key: K, value: AnimationSettings[K]) => {
      onChange({ ...settings, [key]: value });
    },
    [onChange, settings]
  );

  const handlePresetChange = useCallback(
    (preset: EasingPreset) => {
      if (preset !== "custom") {
        onChange({
          ...settings,
          easing: preset,
          bezierControlPoints: EASING_PRESETS[preset],
        });
      }
    },
    [onChange, settings]
  );

  const handleBezierChange = useCallback(
    (points: BezierControlPoints) => {
      const preset = matchPreset(points);
      onChange({
        ...settings,
        bezierControlPoints: points,
        easing: preset,
      });
    },
    [onChange, settings]
  );

  // Main horizontal layout: bezier on left, controls on right
  const mainLayoutStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      gap: SPACE_MD,
      alignItems: "flex-start",
    }),
    []
  );

  // Right column for Duration/Delay
  const rightColumnStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      gap: SPACE_MD,
      flex: 1,
      minWidth: 0,
    }),
    []
  );

  // Bezier editor size
  const bezierWidth = 150;
  const bezierHeight = 120;

  return (
    <Panel
      title="Animation"
      onClose={onClose}
      width={width}
      className={className}
    >
      {/* Easing preset selector */}
      <ControlRow label="Easing" labelWidth={50}>
        <EasingPresetSelect
          value={settings.easing}
          onChange={handlePresetChange}
          size="sm"
          aria-label="Easing preset"
        />
      </ControlRow>

      {/* Main content: bezier on left, Duration/Delay on right */}
      <div style={mainLayoutStyle}>
        {/* Left: Bezier curve editor */}
        <BezierCurveEditor
          value={settings.bezierControlPoints}
          onChange={handleBezierChange}
          width={bezierWidth}
          height={bezierHeight}
          aria-label="Easing curve editor"
        />

        {/* Right: Duration and Delay */}
        <div style={rightColumnStyle}>
          <ControlGroup label="Duration">
            <UnitInput
              value={settings.duration}
              onChange={(v) => updateSetting("duration", v)}
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
              value={settings.delay}
              onChange={(v) => updateSetting("delay", v)}
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
    </Panel>
  );
});
