/**
 * @file Barrel export for StrokeSettingsPanel components
 */

// Types
export type {
  StrokeCap,
  StrokeJoin,
  StrokeAlign,
  DashCornerMode,
  ArrowheadType,
  ArrowheadAlign,
  WidthProfile,
  DashPattern,
  ArrowheadSettings,
  StrokePanelVariant,
} from "./types";

// Note: Import icons directly from "../../icons" (e.g., CapButtIcon, JoinMiterIcon)

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
export {
  StrokePanelExpanded,
  createDefaultExpandedSettings,
} from "./StrokePanelExpanded";
export type {
  StrokePanelExpandedProps,
  StrokePanelExpandedSettings,
} from "./StrokePanelExpanded";

export {
  StrokePanelCompact,
  createDefaultCompactSettings,
} from "./StrokePanelCompact";
export type {
  StrokePanelCompactProps,
  StrokePanelCompactSettings,
  StrokePanelCompactTab,
  StrokeLineStyle,
  BrushStyle,
  BrushDirection,
} from "./StrokePanelCompact";

// Legacy panel (backward compatibility)
export { StrokeSettingsPanel } from "./StrokeSettingsPanel";
export type {
  StrokeSettingsPanelProps,
  StrokeSettings,
  StrokeStyle,
  JoinType,
  StrokeTab,
} from "./StrokeSettingsPanel";
