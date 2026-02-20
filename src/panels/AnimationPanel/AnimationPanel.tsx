/**
 * @file AnimationPanel component - Animation settings with easing curve editor
 *
 * @description
 * Panel content for configuring CSS animations with interactive bezier curve editor,
 * duration and delay inputs. Supports preset easing functions and custom curves.
 * Wrap with PanelFrame for floating panel UI.
 *
 * @example
 * ```tsx
 * import { AnimationPanel } from "react-editor-ui/panels/AnimationPanel";
 * import { PanelFrame } from "react-editor-ui/PanelFrame";
 * import { useState } from "react";
 *
 * const [settings, setSettings] = useState(createDefaultAnimationSettings());
 *
 * <PanelFrame title="Animation" onClose={() => console.log("closed")}>
 *   <AnimationPanel settings={settings} onChange={setSettings} />
 * </PanelFrame>
 * ```
 */

import { memo, useCallback, useMemo } from "react";
import { AnimationSection } from "../../sections/AnimationSection/AnimationSection";
import type { AnimationData } from "../../sections/AnimationSection/types";
import type { AnimationSettings } from "../../components/BezierCurveEditor/bezierTypes";

export type AnimationPanelProps = {
  settings: AnimationSettings;
  onChange: (settings: AnimationSettings) => void;
  className?: string;
};

/**
 * Animation panel content with easing curve editor and timing controls.
 */
export const AnimationPanel = memo(function AnimationPanel({
  settings,
  onChange,
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

  return <AnimationSection data={data} onChange={handleChange} className={className} />;
});
