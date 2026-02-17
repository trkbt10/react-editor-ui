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
import { Panel } from "../Panel/Panel";
import { AnimationSection } from "../../sections/AnimationSection/AnimationSection";
import type { AnimationData } from "../../sections/AnimationSection/types";
import type { AnimationSettings } from "../../components/BezierCurveEditor/bezierTypes";

export type AnimationPanelProps = {
  settings: AnimationSettings;
  onChange: (settings: AnimationSettings) => void;
  onClose?: () => void;
  width?: number;
  className?: string;
};

/**
 * Animation panel with easing curve editor and timing controls.
 */
export const AnimationPanel = memo(function AnimationPanel({
  settings,
  onChange,
  onClose,
  width = 320,
  className,
}: AnimationPanelProps) {
  const data = useMemo<AnimationData>(
    () => ({
      duration: settings.duration,
      delay: settings.delay,
      easing: settings.easing,
      bezierControlPoints: settings.bezierControlPoints,
    }),
    [settings],
  );

  const handleChange = useCallback(
    (newData: AnimationData) => {
      onChange(newData);
    },
    [onChange],
  );

  return (
    <Panel title="Animation" onClose={onClose} width={width} className={className}>
      <AnimationSection data={data} onChange={handleChange} />
    </Panel>
  );
});
