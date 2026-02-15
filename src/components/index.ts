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

export { UnitInput } from "./UnitInput/UnitInput";
export type { UnitInputProps, UnitOption } from "./UnitInput/UnitInput";

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

export { FillTypeSelector } from "./FillEditor/FillTypeSelector";
export type { FillTypeSelectorProps } from "./FillEditor/FillTypeSelector";

export { ImageFillEditor } from "./FillEditor/ImageFillEditor";
export type { ImageFillEditorProps } from "./FillEditor/ImageFillEditor";

export { ImageAdjustments } from "./FillEditor/ImageAdjustments";
export type { ImageAdjustmentsProps } from "./FillEditor/ImageAdjustments";

export { PatternEditor } from "./FillEditor/PatternEditor";
export type { PatternEditorProps } from "./FillEditor/PatternEditor";

export { VideoFillEditor } from "./FillEditor/VideoFillEditor";
export type { VideoFillEditorProps } from "./FillEditor/VideoFillEditor";

export type {
  FillType,
  FillValue,
  SolidFillValue,
  GradientFillValue,
  ImageFill,
  PatternFill,
  VideoFill,
  ImageAdjustments as ImageAdjustmentsType,
  ImageFillValue,
  ImageFillMode,
  PatternFillValue,
  TileType,
  AlignmentType,
  VideoFillValue,
} from "./FillEditor/fillTypes";

export {
  createDefaultImageAdjustments,
  createDefaultImageFill,
  createDefaultPatternFill,
  createDefaultVideoFill,
  createDefaultSolidColor,
  createDefaultFill,
  extractPrimaryColor,
  getFillTypeLabel,
  isSolidFill,
  isGradientFill,
  isImageFill,
  isPatternFill,
  isVideoFill,
} from "./FillEditor/fillUtils";

export { ImageSelect } from "./ImageSelect/ImageSelect";
export type {
  ImageSelectProps,
  ImageSelectOption,
} from "./ImageSelect/ImageSelect";

export { Tooltip } from "./Tooltip/Tooltip";
export type { TooltipProps, TooltipPlacement } from "./Tooltip/Tooltip";

export { SplitButton } from "./SplitButton/SplitButton";
export type { SplitButtonProps, SplitButtonOption } from "./SplitButton/SplitButton";

export { Portal } from "./Portal/Portal";
export type { PortalProps } from "./Portal/Portal";

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

export { LayerItem } from "./LayerItem/LayerItem";
export type { LayerItemProps, LayerContextMenuItem, DropPosition } from "./LayerItem/LayerItem";

export { ContextMenu } from "./ContextMenu/ContextMenu";
export type { ContextMenuProps, ContextMenuItem } from "./ContextMenu/ContextMenu";

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

// Legacy StrokeSettingsPanel (backward compatibility)
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

// New stroke panel variants
export {
  StrokePanelExpanded,
  createDefaultExpandedSettings,
} from "./StrokeSettingsPanel/StrokePanelExpanded";
export type {
  StrokePanelExpandedProps,
  StrokePanelExpandedSettings,
} from "./StrokeSettingsPanel/StrokePanelExpanded";

export {
  StrokePanelCompact,
  createDefaultCompactSettings,
} from "./StrokeSettingsPanel/StrokePanelCompact";
export type {
  StrokePanelCompactProps,
  StrokePanelCompactSettings,
  StrokePanelCompactTab,
  StrokeLineStyle,
  BrushStyle,
} from "./StrokeSettingsPanel/StrokePanelCompact";

// Stroke sub-components
export { StrokeCapSelect } from "./StrokeSettingsPanel/StrokeCapSelect";
export type { StrokeCapSelectProps } from "./StrokeSettingsPanel/StrokeCapSelect";

export { StrokeJoinSelect } from "./StrokeSettingsPanel/StrokeJoinSelect";
export type { StrokeJoinSelectProps } from "./StrokeSettingsPanel/StrokeJoinSelect";

export { StrokeAlignSelect } from "./StrokeSettingsPanel/StrokeAlignSelect";
export type { StrokeAlignSelectProps } from "./StrokeSettingsPanel/StrokeAlignSelect";

export { StrokeDashEditor } from "./StrokeSettingsPanel/StrokeDashEditor";
export type { StrokeDashEditorProps } from "./StrokeSettingsPanel/StrokeDashEditor";

export { StrokeArrowheadSelect } from "./StrokeSettingsPanel/StrokeArrowheadSelect";
export type { StrokeArrowheadSelectProps } from "./StrokeSettingsPanel/StrokeArrowheadSelect";

export { StrokeProfileSelect } from "./StrokeSettingsPanel/StrokeProfileSelect";
export type { StrokeProfileSelectProps } from "./StrokeSettingsPanel/StrokeProfileSelect";

export { StrokeWeightInput } from "./StrokeSettingsPanel/StrokeWeightInput";
export type { StrokeWeightInputProps, WeightUnit } from "./StrokeSettingsPanel/StrokeWeightInput";

// Stroke types
export type {
  StrokeCap,
  StrokeJoin,
  StrokeAlign,
  ArrowheadType,
  ArrowheadAlign,
  ArrowheadSettings,
  DashPattern,
  StrokePanelVariant,
} from "./StrokeSettingsPanel/types";

export { TransformButtons } from "./TransformButtons/TransformButtons";
export type {
  TransformButtonsProps,
  TransformAction,
  TransformActionGroup,
} from "./TransformButtons/TransformButtons";

export { TypographyPanel } from "./TypographyPanel/TypographyPanel";
export type {
  TypographyPanelProps,
  TypographySettings,
  TextAlign,
  VerticalAlign as TextVerticalAlign,
  FontOption,
  FontWeightOption,
} from "./TypographyPanel/TypographyPanel";

export { FontsPanel } from "./FontsPanel/FontsPanel";
export type {
  FontsPanelProps,
  FontItem,
  FontCategory,
} from "./FontsPanel/FontsPanel";

export { PositionPanel, createDefaultPositionSettings } from "./PositionPanel/PositionPanel";
export type {
  PositionPanelProps,
  PositionSettings,
  HorizontalAlign,
  VerticalAlign,
  HorizontalConstraint,
  VerticalConstraint,
} from "./PositionPanel/PositionPanel";

// ========================================
// EDITOR
// ========================================

export {
  CodeEditor,
  TextEditor,
  SvgRenderer,
  CanvasRenderer,
  useEditorStyles,
  useTokenCache,
  useTextStyles,
  useLineIndex,
  useVirtualScroll,
  useHistory,
  useFontMetrics,
  injectCursorAnimation,
} from "./Editor";

export type {
  CodeEditorProps,
  TextEditorProps,
  Token,
  Tokenizer,
  TokenStyleMap,
  TokenCache,
  RendererProps,
  RendererType,
  EditorConfig,
  CursorPosition,
  CursorState,
  SelectionRange,
  HighlightRange,
  HighlightType,
  TextStyle,
  TextStyleSegment,
  EditorStyles,
  EditorStylesConfig,
} from "./Editor";

// ========================================
// CANVAS
// ========================================

export {
  Canvas,
  CanvasContent,
  CanvasGridLayer,
  CanvasHorizontalRuler,
  CanvasVerticalRuler,
  CanvasRulerCorner,
  CanvasGuide,
  CanvasGuides,
  CanvasCheckerboard,
  useCanvasContext,
} from "./Canvas";
export {
  DEFAULT_VIEWPORT,
  DEFAULT_CONSTRAINTS,
  DEFAULT_GESTURE_CONFIG,
  DEFAULT_GRID_CONFIG,
  DEFAULT_RULER_CONFIG,
} from "./Canvas";
export type {
  CanvasProps,
  CanvasContentProps,
  CanvasGridLayerProps,
  CanvasHorizontalRulerProps,
  CanvasVerticalRulerProps,
  CanvasRulerCornerProps,
  CanvasGuideProps,
  CanvasGuidesProps,
  CanvasCheckerboardProps,
  ViewportState,
  ViewportConstraints,
  PanTrigger,
  GestureConfig,
  CanvasContextValue,
  Point,
  GridLayerConfig,
  RulerConfig,
} from "./Canvas";
