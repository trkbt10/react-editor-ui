/**
 * @file StrokeSettingsPanel component - Comprehensive stroke settings
 *
 * @description
 * Panel content for stroke configuration with basic settings (style, width, join),
 * dynamic stroke options (frequency, wiggle), and brush presets.
 * Includes reusable sub-components for caps, joins, dashes, and arrowheads.
 * Wrap with PanelFrame for floating panel UI.
 *
 * @example
 * ```tsx
 * import { StrokeSettingsPanel } from "react-editor-ui/panels/StrokeSettingsPanel";
 * import { PanelFrame } from "react-editor-ui/PanelFrame";
 *
 * const [settings, setSettings] = useState({
 *   tab: "basic",
 *   style: "solid",
 *   widthProfile: "uniform",
 *   join: "miter",
 *   // ... other settings
 * });
 *
 * <PanelFrame title="Stroke settings" onClose={() => setOpen(false)}>
 *   <StrokeSettingsPanel settings={settings} onChange={setSettings} />
 * </PanelFrame>
 * ```
 */

import { memo, useCallback, useMemo } from "react";
import { StrokeSection } from "../../sections/StrokeSection/StrokeSection";
import type { StrokeData } from "../../sections/StrokeSection/types";

/** @deprecated Import from sections/StrokeSection/types instead */
export type StrokeSettings = StrokeData;

export type StrokeSettingsPanelProps = {
  settings: StrokeSettings;
  onChange: (settings: StrokeSettings) => void;
  className?: string;
};

/**
 * Stroke settings panel content with basic, dynamic, and brush settings.
 */
export const StrokeSettingsPanel = memo(function StrokeSettingsPanel({
  settings,
  onChange,
  className,
}: StrokeSettingsPanelProps) {
  const data = useMemo<StrokeData>(
    () => ({
      tab: settings.tab,
      style: settings.style,
      widthProfile: settings.widthProfile,
      join: settings.join,
      miterAngle: settings.miterAngle,
      frequency: settings.frequency,
      wiggle: settings.wiggle,
      smoothen: settings.smoothen,
      brushType: settings.brushType,
      brushDirection: settings.brushDirection,
      brushWidthProfile: settings.brushWidthProfile,
    }),
    [settings],
  );

  const handleChange = useCallback(
    (newData: StrokeData) => {
      onChange(newData);
    },
    [onChange],
  );

  return <StrokeSection data={data} onChange={handleChange} className={className} />;
});

// =============================================================================
// Re-exports for module entry point
// =============================================================================

// Types (WidthProfile is defined locally, not re-exported from types.ts)
export type {
  StrokeCap,
  StrokeJoin,
  StrokeAlign,
  DashCornerMode,
  ArrowheadType,
  ArrowheadAlign,
  DashPattern,
  ArrowheadSettings,
  StrokePanelVariant,
} from "./types";

// Sub-components
export { StrokeCapSelect } from "./StrokeCapSelect";
export type { StrokeCapSelectProps } from "./StrokeCapSelect";

export { StrokeJoinSelect } from "./StrokeJoinSelect";
export type { StrokeJoinSelectProps } from "./StrokeJoinSelect";

export { StrokeAlignSelect } from "./StrokeAlignSelect";
export type { StrokeAlignSelectProps } from "./StrokeAlignSelect";

export { StrokeDashEditor } from "./StrokeDashEditor";
export type { StrokeDashEditorProps } from "./StrokeDashEditor";

export { StrokeArrowheadSelect } from "./StrokeArrowheadSelect";
export type { StrokeArrowheadSelectProps } from "./StrokeArrowheadSelect";

export { StrokeProfileSelect } from "./StrokeProfileSelect";
export type { StrokeProfileSelectProps } from "./StrokeProfileSelect";

export { StrokeWeightInput } from "./StrokeWeightInput";
export type { StrokeWeightInputProps, WeightUnit } from "./StrokeWeightInput";

// Panel variants
export { StrokePanelExpanded, createDefaultExpandedSettings } from "./StrokePanelExpanded";
export type { StrokePanelExpandedProps, StrokePanelExpandedSettings } from "./StrokePanelExpanded";

export { StrokePanelCompact, createDefaultCompactSettings } from "./StrokePanelCompact";
export type {
  StrokePanelCompactProps,
  StrokePanelCompactSettings,
  StrokePanelCompactTab,
  StrokeLineStyle,
  BrushStyle,
} from "./StrokePanelCompact";
