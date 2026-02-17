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
import { GradientEditorDemo } from "./pages/primitives/GradientEditorDemo";
import { FillEditorDemo } from "./pages/primitives/FillEditorDemo";
import { SelectWithPreviewDemo } from "./pages/primitives/SelectWithPreviewDemo";
import { TooltipDemo } from "./pages/primitives/TooltipDemo";
import { SplitButtonDemo } from "./pages/primitives/SplitButtonDemo";
import { TabBarDemo } from "./pages/primitives/TabBarDemo";

// Layout demos
import { ToolbarDemo } from "./pages/layout/ToolbarDemo";
import { FloatingToolbarDemo } from "./pages/layout/FloatingToolbarDemo";
import { PropertyGridDemo } from "./pages/layout/PropertyGridDemo";
import { PropertySectionDemo } from "./pages/layout/PropertySectionDemo";
import { PanelDemo } from "./pages/layout/PanelDemo";

// Composite demos
import { StrokeSettingsPanelDemo } from "./pages/composite/StrokeSettingsPanelDemo";
import { TransformButtonsDemo } from "./pages/composite/TransformButtonsDemo";
import { TypographyPanelDemo } from "./pages/composite/TypographyPanelDemo";
import { FontsPanelDemo } from "./pages/composite/FontsPanelDemo";
import { PositionPanelDemo } from "./pages/composite/PositionPanelDemo";
import { AnimationPanelDemo } from "./pages/composite/AnimationPanelDemo";

// Data display demos
import { PropertyRowDemo } from "./pages/data-display/PropertyRowDemo";
import { SectionHeaderDemo } from "./pages/data-display/SectionHeaderDemo";
import { TreeItemDemo } from "./pages/data-display/TreeItemDemo";
import { LayerItemDemo } from "./pages/data-display/LayerItemDemo";
import { SelectDemo } from "./pages/data-display/SelectDemo";
import { ContextMenuDemo } from "./pages/data-display/ContextMenuDemo";

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
import { DesignDemo } from "./pages/app-demo/DesignDemo";
import { IDEDemo } from "./pages/app-demo/IDEDemo";

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
        id: "gradient-editor",
        label: "GradientEditor",
        path: "gradient-editor",
        element: <GradientEditorDemo />,
      },
      {
        id: "fill-editor",
        label: "FillEditor",
        path: "fill-editor",
        element: <FillEditorDemo />,
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
        id: "floating-toolbar",
        label: "FloatingToolbar",
        path: "floating-toolbar",
        element: <FloatingToolbarDemo />,
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
      {
        id: "panel",
        label: "Panel",
        path: "panel",
        element: <PanelDemo />,
      },
    ],
  },
  {
    id: "composite",
    label: "Composite",
    icon: <LuLayers size={18} />,
    base: "/components/composite",
    pages: [
      {
        id: "stroke-settings-panel",
        label: "StrokeSettingsPanel",
        path: "stroke-settings-panel",
        element: <StrokeSettingsPanelDemo />,
      },
      {
        id: "transform-buttons",
        label: "TransformButtons",
        path: "transform-buttons",
        element: <TransformButtonsDemo />,
      },
      {
        id: "typography-panel",
        label: "TypographyPanel",
        path: "typography-panel",
        element: <TypographyPanelDemo />,
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
        id: "animation-panel",
        label: "AnimationPanel",
        path: "animation-panel",
        element: <AnimationPanelDemo />,
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
