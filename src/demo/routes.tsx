/**
 * @file Demo route configuration
 */

import type { ReactNode } from "react";
import {
  LuBox,
  LuLayoutGrid,
  LuLayers,
  LuList,
  LuMessageSquare,
  LuCode,
  LuPenTool,
  LuAppWindow,
  LuCompass,
} from "react-icons/lu";

// Primitives demos
import { IconButtonDemo } from "./pages/primitives/IconButtonDemo";
import { ButtonDemo } from "./pages/primitives/ButtonDemo";
import { InputDemo } from "./pages/primitives/InputDemo";
import { SearchInputDemo } from "./pages/primitives/SearchInputDemo";
import { UnitInputDemo } from "./pages/primitives/UnitInputDemo";
import { BadgeDemo } from "./pages/primitives/BadgeDemo";
import { CheckboxDemo } from "./pages/primitives/CheckboxDemo";
import { SegmentedControlDemo } from "./pages/primitives/SegmentedControlDemo";
import { ColorPickerDemo } from "./pages/primitives/ColorPickerDemo";
import { ColorInputDemo } from "./pages/primitives/ColorInputDemo";
import { GradientSectionDemo } from "./pages/primitives/GradientSectionDemo";
import { FillPanelDemo } from "./pages/primitives/FillPanelDemo";
import { SelectWithPreviewDemo } from "./pages/primitives/SelectWithPreviewDemo";
import { TooltipDemo } from "./pages/primitives/TooltipDemo";
import { SplitButtonDemo } from "./pages/primitives/SplitButtonDemo";
import { TabBarDemo } from "./pages/primitives/TabBarDemo";

// Layout demos
import { ToolbarDemo } from "./pages/layout/ToolbarDemo";
import { SelectionToolbarDemo } from "./pages/layout/SelectionToolbarDemo";
import { PropertyGridDemo } from "./pages/layout/PropertyGridDemo";
import { PropertySectionDemo } from "./pages/layout/PropertySectionDemo";

// Panels demos
import { PanelDemo } from "./pages/panels/PanelDemo";
import { AnimationPanelDemo } from "./pages/panels/AnimationPanelDemo";
import { FontsPanelDemo } from "./pages/panels/FontsPanelDemo";
import { PositionPanelDemo } from "./pages/panels/PositionPanelDemo";
import { StrokeSettingsPanelDemo } from "./pages/panels/StrokeSettingsPanelDemo";
import { TypographyPanelDemo } from "./pages/panels/TypographyPanelDemo";

// Sections demos
import { AlignmentSectionDemo } from "./pages/sections/AlignmentSectionDemo";
import { PositionSectionDemo } from "./pages/sections/PositionSectionDemo";
import { SizeSectionDemo } from "./pages/sections/SizeSectionDemo";
import { RotationSectionDemo } from "./pages/sections/RotationSectionDemo";
import { ConstraintsSectionDemo } from "./pages/sections/ConstraintsSectionDemo";
import { TypographySectionDemo } from "./pages/sections/TypographySectionDemo";
import { AnimationSectionDemo } from "./pages/sections/AnimationSectionDemo";
import { StrokeSectionDemo } from "./pages/sections/StrokeSectionDemo";
import { FontsSectionDemo } from "./pages/sections/FontsSectionDemo";

// Composite demos
import { TransformButtonsDemo } from "./pages/composite/TransformButtonsDemo";

// Data display demos
import { PropertyRowDemo } from "./pages/data-display/PropertyRowDemo";
import { SectionHeaderDemo } from "./pages/data-display/SectionHeaderDemo";
import { TreeItemDemo } from "./pages/data-display/TreeItemDemo";
import { LayerItemDemo } from "./pages/data-display/LayerItemDemo";
import { SelectDemo } from "./pages/data-display/SelectDemo";
import { ContextMenuDemo } from "./pages/data-display/ContextMenuDemo";
import { LibraryBrowserDemo } from "./pages/data-display/LibraryBrowserDemo";

// Feedback demos
import { StatusBarDemo } from "./pages/feedback/StatusBarDemo";
import { LogEntryDemo } from "./pages/feedback/LogEntryDemo";
import { LogViewerDemo } from "./pages/feedback/LogViewerDemo";

// Editor demos
import { CodeEditorDemo } from "./pages/editor/CodeEditorDemo";
import { TextEditorDemo } from "./pages/editor/TextEditorDemo";
import { TextEditorPerfDemo } from "./pages/editor/TextEditorPerfDemo";

// Navigation demos
import { BreadcrumbDemo } from "./pages/navigation/BreadcrumbDemo";
import { ProjectMenuDemo } from "./pages/navigation/ProjectMenuDemo";

// Canvas demos
import { CanvasDemo } from "./pages/canvas/CanvasDemo";
import { BoundingBoxDemo } from "./pages/canvas/BoundingBoxDemo";
import { CanvasGridLayerDemo } from "./pages/canvas/CanvasGridLayerDemo";
import { CanvasRulerDemo } from "./pages/canvas/CanvasRulerDemo";
import { CanvasGuideDemo } from "./pages/canvas/CanvasGuideDemo";
import { CanvasCheckerboardDemo } from "./pages/canvas/CanvasCheckerboardDemo";

// App demos
import { DesignDemo } from "./pages/app-demo/design/DesignDemo";
import { IDEDemo } from "./pages/app-demo/IDEDemo";
import { DiagramDemo } from "./pages/app-demo/diagram/DiagramDemo";

// Dev/Test demos
import { IconGallery } from "./pages/IconGallery";

export type DemoPage = {
  id: string;
  label: string;
  path: string;
  element: ReactNode;
};

export type DemoCategory = {
  id: string;
  label: string;
  icon?: ReactNode;
  base: string;
  pages: DemoPage[];
};

export const demoCategories: DemoCategory[] = [
  {
    id: "primitives",
    label: "Primitives",
    icon: <LuBox size={18} />,
    base: "/components/primitives",
    pages: [
      {
        id: "icon-button",
        label: "IconButton",
        path: "icon-button",
        element: <IconButtonDemo />,
      },
      {
        id: "button",
        label: "Button",
        path: "button",
        element: <ButtonDemo />,
      },
      {
        id: "input",
        label: "Input",
        path: "input",
        element: <InputDemo />,
      },
      {
        id: "search-input",
        label: "SearchInput",
        path: "search-input",
        element: <SearchInputDemo />,
      },
      {
        id: "unit-input",
        label: "UnitInput",
        path: "unit-input",
        element: <UnitInputDemo />,
      },
      {
        id: "badge",
        label: "Badge",
        path: "badge",
        element: <BadgeDemo />,
      },
      {
        id: "checkbox",
        label: "Checkbox",
        path: "checkbox",
        element: <CheckboxDemo />,
      },
      {
        id: "segmented-control",
        label: "SegmentedControl",
        path: "segmented-control",
        element: <SegmentedControlDemo />,
      },
      {
        id: "color-picker",
        label: "ColorPicker",
        path: "color-picker",
        element: <ColorPickerDemo />,
      },
      {
        id: "color-input",
        label: "ColorInput",
        path: "color-input",
        element: <ColorInputDemo />,
      },
      {
        id: "select-preview",
        label: "Select (Preview)",
        path: "select-preview",
        element: <SelectWithPreviewDemo />,
      },
      {
        id: "tooltip",
        label: "Tooltip",
        path: "tooltip",
        element: <TooltipDemo />,
      },
      {
        id: "split-button",
        label: "SplitButton",
        path: "split-button",
        element: <SplitButtonDemo />,
      },
      {
        id: "tab-bar",
        label: "TabBar",
        path: "tab-bar",
        element: <TabBarDemo />,
      },
    ],
  },
  {
    id: "layout",
    label: "Layout",
    icon: <LuLayoutGrid size={18} />,
    base: "/components/layout",
    pages: [
      {
        id: "toolbar",
        label: "Toolbar",
        path: "toolbar",
        element: <ToolbarDemo />,
      },
      {
        id: "selection-toolbar",
        label: "SelectionToolbar",
        path: "selection-toolbar",
        element: <SelectionToolbarDemo />,
      },
      {
        id: "property-grid",
        label: "PropertyGrid",
        path: "property-grid",
        element: <PropertyGridDemo />,
      },
      {
        id: "property-section",
        label: "PropertySection",
        path: "property-section",
        element: <PropertySectionDemo />,
      },
    ],
  },
  {
    id: "panels",
    label: "Panels",
    icon: <LuLayers size={18} />,
    base: "/components/panels",
    pages: [
      {
        id: "panel",
        label: "Panel",
        path: "panel",
        element: <PanelDemo />,
      },
      {
        id: "animation-panel",
        label: "AnimationPanel",
        path: "animation-panel",
        element: <AnimationPanelDemo />,
      },
      {
        id: "fonts-panel",
        label: "FontsPanel",
        path: "fonts-panel",
        element: <FontsPanelDemo />,
      },
      {
        id: "position-panel",
        label: "PositionPanel",
        path: "position-panel",
        element: <PositionPanelDemo />,
      },
      {
        id: "stroke-settings-panel",
        label: "StrokeSettingsPanel",
        path: "stroke-settings-panel",
        element: <StrokeSettingsPanelDemo />,
      },
      {
        id: "typography-panel",
        label: "TypographyPanel",
        path: "typography-panel",
        element: <TypographyPanelDemo />,
      },
      {
        id: "fill-panel",
        label: "FillPanel",
        path: "fill-panel",
        element: <FillPanelDemo />,
      },
    ],
  },
  {
    id: "sections",
    label: "Sections",
    icon: <LuLayers size={18} />,
    base: "/components/sections",
    pages: [
      {
        id: "alignment-section",
        label: "AlignmentSection",
        path: "alignment",
        element: <AlignmentSectionDemo />,
      },
      {
        id: "position-section",
        label: "PositionSection",
        path: "position",
        element: <PositionSectionDemo />,
      },
      {
        id: "size-section",
        label: "SizeSection",
        path: "size",
        element: <SizeSectionDemo />,
      },
      {
        id: "rotation-section",
        label: "RotationSection",
        path: "rotation",
        element: <RotationSectionDemo />,
      },
      {
        id: "constraints-section",
        label: "ConstraintsSection",
        path: "constraints",
        element: <ConstraintsSectionDemo />,
      },
      {
        id: "typography-section",
        label: "TypographySection",
        path: "typography",
        element: <TypographySectionDemo />,
      },
      {
        id: "animation-section",
        label: "AnimationSection",
        path: "animation",
        element: <AnimationSectionDemo />,
      },
      {
        id: "stroke-section",
        label: "StrokeSection",
        path: "stroke",
        element: <StrokeSectionDemo />,
      },
      {
        id: "fonts-section",
        label: "FontsSection",
        path: "fonts",
        element: <FontsSectionDemo />,
      },
      {
        id: "gradient-section",
        label: "GradientSection",
        path: "gradient",
        element: <GradientSectionDemo />,
      },
    ],
  },
  {
    id: "composite",
    label: "Composite",
    icon: <LuBox size={18} />,
    base: "/components/composite",
    pages: [
      {
        id: "transform-buttons",
        label: "TransformButtons",
        path: "transform-buttons",
        element: <TransformButtonsDemo />,
      },
    ],
  },
  {
    id: "data-display",
    label: "Data Display",
    icon: <LuList size={18} />,
    base: "/components/data-display",
    pages: [
      {
        id: "property-row",
        label: "PropertyRow",
        path: "property-row",
        element: <PropertyRowDemo />,
      },
      {
        id: "section-header",
        label: "SectionHeader",
        path: "section-header",
        element: <SectionHeaderDemo />,
      },
      {
        id: "tree-item",
        label: "TreeItem",
        path: "tree-item",
        element: <TreeItemDemo />,
      },
      {
        id: "layer-item",
        label: "LayerItem",
        path: "layer-item",
        element: <LayerItemDemo />,
      },
      {
        id: "select",
        label: "Select",
        path: "select",
        element: <SelectDemo />,
      },
      {
        id: "context-menu",
        label: "ContextMenu",
        path: "context-menu",
        element: <ContextMenuDemo />,
      },
      {
        id: "library-browser",
        label: "LibraryBrowser",
        path: "library-browser",
        element: <LibraryBrowserDemo />,
      },
    ],
  },
  {
    id: "navigation",
    label: "Navigation",
    icon: <LuCompass size={18} />,
    base: "/components/navigation",
    pages: [
      {
        id: "breadcrumb",
        label: "Breadcrumb",
        path: "breadcrumb",
        element: <BreadcrumbDemo />,
      },
      {
        id: "project-menu",
        label: "ProjectMenu",
        path: "project-menu",
        element: <ProjectMenuDemo />,
      },
    ],
  },
  {
    id: "feedback",
    label: "Feedback",
    icon: <LuMessageSquare size={18} />,
    base: "/components/feedback",
    pages: [
      {
        id: "status-bar",
        label: "StatusBar",
        path: "status-bar",
        element: <StatusBarDemo />,
      },
      {
        id: "log-entry",
        label: "LogEntry",
        path: "log-entry",
        element: <LogEntryDemo />,
      },
      {
        id: "log-viewer",
        label: "LogViewer",
        path: "log-viewer",
        element: <LogViewerDemo />,
      },
    ],
  },
  {
    id: "editor",
    label: "Editor",
    icon: <LuCode size={18} />,
    base: "/components/editor",
    pages: [
      {
        id: "code-editor",
        label: "CodeEditor",
        path: "code-editor",
        element: <CodeEditorDemo />,
      },
      {
        id: "text-editor",
        label: "TextEditor",
        path: "text-editor",
        element: <TextEditorDemo />,
      },
      {
        id: "text-editor-perf",
        label: "TextEditor (Perf)",
        path: "text-editor-perf",
        element: <TextEditorPerfDemo />,
      },
    ],
  },
  {
    id: "canvas",
    label: "Canvas",
    icon: <LuPenTool size={18} />,
    base: "/components/canvas",
    pages: [
      {
        id: "canvas",
        label: "Canvas",
        path: "canvas",
        element: <CanvasDemo />,
      },
      {
        id: "bounding-box",
        label: "BoundingBox",
        path: "bounding-box",
        element: <BoundingBoxDemo />,
      },
      {
        id: "canvas-grid-layer",
        label: "CanvasGridLayer",
        path: "canvas-grid-layer",
        element: <CanvasGridLayerDemo />,
      },
      {
        id: "canvas-ruler",
        label: "CanvasRuler",
        path: "canvas-ruler",
        element: <CanvasRulerDemo />,
      },
      {
        id: "canvas-guide",
        label: "CanvasGuide",
        path: "canvas-guide",
        element: <CanvasGuideDemo />,
      },
      {
        id: "canvas-checkerboard",
        label: "CanvasCheckerboard",
        path: "canvas-checkerboard",
        element: <CanvasCheckerboardDemo />,
      },
    ],
  },
  {
    id: "app-demo",
    label: "App Demos",
    icon: <LuAppWindow size={18} />,
    base: "/app-demo",
    pages: [
      {
        id: "design",
        label: "Design Tool",
        path: "design",
        element: <DesignDemo />,
      },
      {
        id: "ide",
        label: "IDE",
        path: "ide",
        element: <IDEDemo />,
      },
      {
        id: "diagram",
        label: "Diagram Editor",
        path: "diagram",
        element: <DiagramDemo />,
      },
    ],
  },
  {
    id: "dev",
    label: "Dev",
    base: "/dev",
    pages: [
      {
        id: "icon-gallery",
        label: "Icon Gallery",
        path: "icon-gallery",
        element: <IconGallery />,
      },
    ],
  },
];
