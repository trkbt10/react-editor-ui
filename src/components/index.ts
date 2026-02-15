/**
 * @file Barrel export for all public components
 */

// ========================================
// PRIMITIVES
// ========================================

export { IconButton } from "./IconButton/IconButton";
export type { IconButtonProps } from "./IconButton/IconButton";

export { Button } from "./Button/Button";
export type { ButtonProps } from "./Button/Button";

export { Input } from "./Input/Input";
export type { InputProps } from "./Input/Input";

export { Badge } from "./Badge/Badge";
export type { BadgeProps } from "./Badge/Badge";

export { Checkbox } from "./Checkbox/Checkbox";
export type { CheckboxProps } from "./Checkbox/Checkbox";

export { SegmentedControl } from "./SegmentedControl/SegmentedControl";
export type {
  SegmentedControlProps,
  SegmentedControlOption,
} from "./SegmentedControl/SegmentedControl";

export { ColorPicker } from "./ColorPicker/ColorPicker";
export type { ColorPickerProps } from "./ColorPicker/ColorPicker";

export { ColorInput } from "./ColorInput/ColorInput";
export type { ColorInputProps, ColorValue } from "./ColorInput/ColorInput";

export { Slider } from "./Slider/Slider";
export type { SliderProps } from "./Slider/Slider";

export { GradientEditor } from "./GradientEditor/GradientEditor";
export type { GradientEditorProps } from "./GradientEditor/GradientEditor";

export { GradientBar } from "./GradientEditor/GradientBar";
export type { GradientBarProps } from "./GradientEditor/GradientBar";

export { GradientStopRow } from "./GradientEditor/GradientStopRow";
export type { GradientStopRowProps } from "./GradientEditor/GradientStopRow";

export { GradientTypeSelector } from "./GradientEditor/GradientTypeSelector";
export type { GradientTypeSelectorProps } from "./GradientEditor/GradientTypeSelector";

export type {
  GradientType,
  GradientStop,
  GradientValue,
  FillType,
  FillValue,
} from "./GradientEditor/gradientTypes";

export {
  generateStopId,
  sortStopsByPosition,
  createDefaultGradient,
  gradientToCss,
  gradientToLinearCss,
  interpolateColor,
  getGradientTypeName,
} from "./GradientEditor/gradientUtils";

export { FillEditor } from "./FillEditor/FillEditor";
export type { FillEditorProps } from "./FillEditor/FillEditor";

export { ImageSelect } from "./ImageSelect/ImageSelect";
export type {
  ImageSelectProps,
  ImageSelectOption,
} from "./ImageSelect/ImageSelect";

// ========================================
// LAYOUT
// ========================================

export { Panel } from "./Panel/Panel";
export type { PanelProps } from "./Panel/Panel";


export { Toolbar } from "./Toolbar/Toolbar";
export type { ToolbarProps } from "./Toolbar/Toolbar";

export { ToolbarGroup } from "./Toolbar/ToolbarGroup";
export type { ToolbarGroupProps } from "./Toolbar/ToolbarGroup";

export { ToolbarDivider } from "./Toolbar/ToolbarDivider";
export type { ToolbarDividerProps } from "./Toolbar/ToolbarDivider";

export { PropertyGrid } from "./PropertyGrid/PropertyGrid";
export type { PropertyGridProps } from "./PropertyGrid/PropertyGrid";

export { PropertyGridItem } from "./PropertyGrid/PropertyGridItem";
export type { PropertyGridItemProps } from "./PropertyGrid/PropertyGridItem";

export { PropertySection } from "./PropertySection/PropertySection";
export type { PropertySectionProps } from "./PropertySection/PropertySection";

// ========================================
// DATA DISPLAY
// ========================================

export { PropertyRow } from "./PropertyRow/PropertyRow";
export type { PropertyRowProps } from "./PropertyRow/PropertyRow";

export { SectionHeader } from "./SectionHeader/SectionHeader";
export type { SectionHeaderProps } from "./SectionHeader/SectionHeader";

export { TreeItem } from "./TreeItem/TreeItem";
export type { TreeItemProps } from "./TreeItem/TreeItem";

export { Select } from "./Select/Select";
export type { SelectProps, SelectOption } from "./Select/Select";

// ========================================
// FEEDBACK
// ========================================

export { StatusBar } from "./StatusBar/StatusBar";
export type { StatusBarProps } from "./StatusBar/StatusBar";

export { StatusBarItem } from "./StatusBar/StatusBarItem";
export type { StatusBarItemProps } from "./StatusBar/StatusBarItem";

export { LogEntry } from "./LogEntry/LogEntry";
export type { LogEntryProps } from "./LogEntry/LogEntry";

// ========================================
// COMPOSITE
// ========================================

export { StrokeSettingsPanel } from "./StrokeSettingsPanel/StrokeSettingsPanel";
export type {
  StrokeSettingsPanelProps,
  StrokeSettings,
  StrokeStyle,
  JoinType,
  BrushDirection,
  WidthProfile,
  BrushType,
  StrokeTab,
} from "./StrokeSettingsPanel/StrokeSettingsPanel";
