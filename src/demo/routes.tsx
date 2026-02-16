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
} from "react-icons/lu";

// Primitives demos
import { IconButtonDemo } from "./pages/primitives/IconButtonDemo";
import { ButtonDemo } from "./pages/primitives/ButtonDemo";
import { InputDemo } from "./pages/primitives/InputDemo";
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

// Layout demos
import { ToolbarDemo } from "./pages/layout/ToolbarDemo";
import { PropertyGridDemo } from "./pages/layout/PropertyGridDemo";
import { PropertySectionDemo } from "./pages/layout/PropertySectionDemo";
import { PanelDemo } from "./pages/layout/PanelDemo";

// Composite demos
import { StrokeSettingsPanelDemo } from "./pages/composite/StrokeSettingsPanelDemo";
import { TransformButtonsDemo } from "./pages/composite/TransformButtonsDemo";
import { TypographyPanelDemo } from "./pages/composite/TypographyPanelDemo";
import { FontsPanelDemo } from "./pages/composite/FontsPanelDemo";
import { PositionPanelDemo } from "./pages/composite/PositionPanelDemo";

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

// Canvas demos
import { CanvasDemo } from "./pages/canvas/CanvasDemo";

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
    ],
  },
];
