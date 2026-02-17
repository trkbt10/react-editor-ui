<p align="center">
  <h1 align="center">React Editor UI</h1>
  <p align="center">
    <strong>Modern design system components for editor interfaces</strong>
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-editor-ui"><img src="https://img.shields.io/npm/v/react-editor-ui.svg?style=flat-square&color=0066ff" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/react-editor-ui"><img src="https://img.shields.io/npm/dm/react-editor-ui.svg?style=flat-square&color=0066ff" alt="npm downloads"></a>
  <a href="https://github.com/trkbt10/react-editor-ui/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Unlicense-blue.svg?style=flat-square" alt="license"></a>
  <a href="https://github.com/trkbt10/react-editor-ui"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19+-61dafb.svg?style=flat-square&logo=react&logoColor=black" alt="React"></a>
</p>

<p align="center">
  <a href="https://trkbt10.github.io/react-editor-ui/">Demo</a> &bull;
  <a href="#installation">Installation</a> &bull;
  <a href="#components">Components</a> &bull;
  <a href="#theming">Theming</a>
</p>

---

A collection of UI components designed for building editor interfaces, design tools, and creative applications. Inspired by modern design tools.

## Features

- **Modern design** - Clean, minimal aesthetics with attention to detail
- **CSS-in-JS free** - Uses CSS custom properties for zero-runtime theming
- **Tree-shakeable** - Import only what you need for optimal bundle size
- **TypeScript first** - Full type definitions with strict typing
- **Zero dependencies** - No runtime CSS or styling library required

## Installation

```bash
npm install react-editor-ui
```

```bash
bun add react-editor-ui
```

## Quick Start

```tsx
import { Button, Input, Toolbar } from "react-editor-ui";

function App() {
  return (
    <Toolbar>
      <Input placeholder="Search..." />
      <Button variant="primary">Save</Button>
    </Toolbar>
  );
}
```


## Usage

### Individual Component Imports

For optimal bundle size, import components directly:

```tsx
import { Button } from "react-editor-ui/Button";
import { Input } from "react-editor-ui/Input";
import { Select } from "react-editor-ui/Select";
```

### Theming

The library uses CSS custom properties for theming. Import the theme utilities:

```tsx
import { injectTheme, ThemeSelector } from "react-editor-ui/themes";

// Apply dark theme
injectTheme("dark");

// Or use the theme selector component
<ThemeSelector />
```


## Components

<!-- AUTO:COMPONENTS -->
### Primitives

> Basic UI components for building interfaces

#### Badge

Small status indicator

```tsx
import { Badge } from "react-editor-ui/Badge";
```

#### Button

Text button with optional icons

Clean, minimal design with attention to detail. Supports primary, secondary, ghost, and danger variants.

```tsx
import { Button } from "react-editor-ui/Button";

<Button variant="primary" onClick={() => console.log("clicked")}>
  Save Changes
</Button>
```

#### Checkbox

Toggle input with checkbox and switch variants

Supports both checkbox and switch visual styles with labels. Includes indeterminate state for partial selection.

```tsx
import { Checkbox } from "react-editor-ui/Checkbox";
import { useState } from "react";

const [checked, setChecked] = useState(false);

<Checkbox
  checked={checked}
  onChange={setChecked}
  label="Enable feature"
/>
```

#### ColorInput

Compact color input with swatch

```tsx
import { ColorInput } from "react-editor-ui/ColorInput";
```

#### ColorPicker

Color selection with HSV area and hue slider

```tsx
import { ColorPicker } from "react-editor-ui/ColorPicker";
```

#### IconButton

A button with only an icon

Compact button for toolbar actions and icon-only interactions. Supports multiple sizes and variants including ghost and filled.

```tsx
import { IconButton } from "react-editor-ui/IconButton";
import { FiPlus } from "react-icons/fi";

<IconButton
  icon={<FiPlus />}
  aria-label="Add item"
  onClick={() => console.log("add")}
/>
```

#### Input

Text input with optional icons

Versatile text input supporting icons, prefix/suffix, and clearable mode. Available in multiple sizes with consistent styling.

```tsx
import { Input } from "react-editor-ui/Input";
import { useState } from "react";

const [value, setValue] = useState("");

<Input
  value={value}
  onChange={setValue}
  placeholder="Enter text..."
  clearable
/>
```

#### SearchInput

Search input with icon and clear button

Compact search input with search icon prefix and clear button. Extends Input component styling with search-specific features.

```tsx
import { SearchInput } from "react-editor-ui/SearchInput";

<SearchInput
  value={query}
  onChange={setQuery}
  placeholder="Search files..."
/>
```

#### Select

Dropdown selection with portal rendering

Dropdown select with keyboard navigation and portal-based rendering. Supports custom option rendering and disabled states.

```tsx
import { Select } from "react-editor-ui/Select";

const options = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

<Select
  value="medium"
  options={options}
  onChange={(value) => console.log(value)}
/>
```

#### SegmentedControl

Button group for selecting options

```tsx
import { SegmentedControl } from "react-editor-ui/SegmentedControl";
```

#### Slider

Reusable drag slider for color/gradient editing

Draggable slider supporting horizontal and vertical orientations. Customizable track background for color pickers and gradient editors.

```tsx
import { Slider } from "react-editor-ui/Slider";
import { useState } from "react";

const [value, setValue] = useState(0.5);

<Slider
  value={value}
  onChange={setValue}
  background="linear-gradient(to right, red, blue)"
  aria-label="Color intensity"
/>
```

#### SplitButton

A button with dropdown menu for multiple actions

```tsx
import { SplitButton } from "react-editor-ui/SplitButton";
```

#### TabBar

Versatile tab bar with multiple variants

A compact tab bar for switching between views or sections. Supports multiple variants: pills (default), files (with close button), and icons (icon-only).

```tsx
import { TabBar } from "react-editor-ui/TabBar";

// Pills variant (default)
<TabBar
  tabs={[
    { id: "design", label: "Design" },
    { id: "prototype", label: "Prototype" },
  ]}
  activeTab="design"
  onChange={(tabId) => setActiveTab(tabId)}
/>

// Files variant with close buttons
<TabBar
  variant="files"
  tabs={[
    { id: "file1", label: "index.tsx", closable: true },
    { id: "file2", label: "styles.css", closable: true, isDirty: true },
  ]}
  activeTab="file1"
  onChange={(tabId) => setActiveTab(tabId)}
  onClose={(tabId) => closeTab(tabId)}
/>

// Icons variant
<TabBar
  variant="icons"
  tabs={[
    { id: "folder", label: "Files", icon: <LuFolder /> },
    { id: "search", label: "Search", icon: <LuSearch /> },
  ]}
  activeTab="folder"
  onChange={(tabId) => setActiveTab(tabId)}
/>
```

#### Tooltip

Displays contextual information on hover

Shows contextual help on hover with automatic positioning. Uses SVG for smooth background and arrow rendering.

```tsx
import { Tooltip } from "react-editor-ui/Tooltip";

<Tooltip content="Save your changes" placement="top">
  <button>Save</button>
</Tooltip>
```

#### UnitInput

Numeric input with unit support

```tsx
import { UnitInput } from "react-editor-ui/UnitInput";
```

### Layout

> Components for organizing and structuring UI

#### SelectionToolbar

Selection-based toolbar for inline operations

A toolbar that appears near selected content (text, shapes, etc.). Editor-agnostic: can be used with TextEditor, Canvas, or any selection-based UI.

```tsx
import { SelectionToolbar } from "react-editor-ui/SelectionToolbar";

<SelectionToolbar
  anchor={{ x: 100, y: 50, width: 200, height: 20 }}
  operations={[
    { id: "bold", label: "Bold", icon: <BoldIcon /> },
    { id: "italic", label: "Italic", icon: <ItalicIcon /> },
  ]}
  onOperationSelect={(id) => console.log("Selected:", id)}
/>
```

#### PropertyGrid

Grid layout for property panels

```tsx
import { PropertyGrid } from "react-editor-ui/PropertyGrid";
```

#### PropertySection

Section wrapper with collapsible header

```tsx
import { PropertySection } from "react-editor-ui/PropertySection";
```

#### Toolbar

Container for toolbar items

Flexible container for toolbar buttons and controls. Supports horizontal and vertical orientations with floating variant.

```tsx
import { Toolbar, ToolbarGroup, ToolbarDivider } from "react-editor-ui/Toolbar";
import { IconButton } from "react-editor-ui/IconButton";

<Toolbar variant="floating">
  <ToolbarGroup>
    <IconButton icon={<SelectIcon />} aria-label="Select" />
    <IconButton icon={<MoveIcon />} aria-label="Move" />
  </ToolbarGroup>
  <ToolbarDivider />
  <ToolbarGroup>
    <IconButton icon={<ZoomInIcon />} aria-label="Zoom in" />
  </ToolbarGroup>
</Toolbar>
```

### Panels

> Panel components for property editing and configuration

#### AnimationPanel

Animation settings panel with easing curve editor

Panel for configuring CSS animations with interactive bezier curve editor, duration and delay inputs. Supports preset easing functions and custom curves.

```tsx
import { AnimationPanel, createDefaultAnimationSettings } from "react-editor-ui/AnimationPanel";
import { useState } from "react";

const [settings, setSettings] = useState(createDefaultAnimationSettings());

<AnimationPanel
  settings={settings}
  onChange={setSettings}
  onClose={() => console.log("closed")}
/>
```

#### FontsPanel

Floating font picker panel with search and category filter

```tsx
import { FontsPanel } from "react-editor-ui/panels/FontsPanel";
```

#### Panel

Floating settings panel with header and close button

```tsx
import { Panel } from "react-editor-ui/panels/Panel";
```

#### PositionPanel

Position, alignment, constraints, and rotation settings

```tsx
import { PositionPanel } from "react-editor-ui/panels/PositionPanel";
```

#### StrokeSettingsPanel

Comprehensive stroke settings panel

```tsx
import { StrokeSettingsPanel } from "react-editor-ui/panels/StrokeSettingsPanel";
```

#### TypographyPanel

Typography settings panel for text properties

```tsx
import { TypographyPanel } from "react-editor-ui/panels/TypographyPanel";
```

### Composite

> Complex components combining multiple primitives

#### TransformButtons

Flexible transform operation buttons

```tsx
import { TransformButtons } from "react-editor-ui/TransformButtons";
```

### Navigation

> Components for navigation and wayfinding

#### Breadcrumb

Navigation path indicator

Displays hierarchical navigation path with clickable items. Supports icons, custom separators, and overflow handling.

```tsx
import { Breadcrumb } from "react-editor-ui/Breadcrumb";

<Breadcrumb
  items={[
    { label: "Project", icon: <LuFolder /> },
    { label: "src", icon: <LuFolder /> },
    { label: "index.tsx", icon: <LuFileCode /> },
  ]}
  onItemClick={(index) => navigateTo(index)}
/>
```

#### ProjectMenu

Sidebar project dropdown with status badges

Displays project name with status badges in a compact dropdown format. Designed for sidebar use, extends SectionHeader patterns.

```tsx
import { ProjectMenu } from "react-editor-ui/ProjectMenu";

<ProjectMenu
  name="My Project"
  badges={[
    { label: "Drafts" },
    { label: "Free", variant: "accent" },
  ]}
  onClick={() => openProjectMenu()}
/>
```

### Data Display

> Components for displaying and organizing data

#### ContextMenu

Reusable context menu for right-click actions

```tsx
import { ContextMenu } from "react-editor-ui/ContextMenu";
```

#### LayerItem

Layer panel item for hierarchical display

```tsx
import { LayerItem } from "react-editor-ui/LayerItem";
```

#### PropertyRow

Label and value pair for inspector

Displays property name and value in a consistent layout. Used in inspector panels for editing object properties.

```tsx
import { PropertyRow } from "react-editor-ui/PropertyRow";
import { Input } from "react-editor-ui/Input";

<PropertyRow label="Width">
  <Input value="100" onChange={() => {}} suffix="px" />
</PropertyRow>
```

#### SectionHeader

Collapsible section header

```tsx
import { SectionHeader } from "react-editor-ui/SectionHeader";
```

#### TreeItem

Tree node for hierarchical data

```tsx
import { TreeItem } from "react-editor-ui/TreeItem";
```

### Feedback

> Components for status and feedback display

#### LogEntry

Log message display

```tsx
import { LogEntry } from "react-editor-ui/LogEntry";
```

#### LogViewer

LogViewer - High-performance log display with virtual scrolling

```tsx
import { LogViewer } from "react-editor-ui/LogViewer";
```

#### StatusBar

Bottom status bar container

```tsx
import { StatusBar } from "react-editor-ui/StatusBar";
```

### Rich Text Editors

> Rich text and code editing components

#### RichTextEditors

RichTextEditors - Rich text and code editing components

Unified exports for all rich text editor components including CodeEditor and TextEditor. Both editors use BlockDocument for consistent architecture. Provides syntax highlighting, virtual scrolling, and rich text editing.

```tsx
import { CodeEditor, TextEditor, createBlockDocument } from "react-editor-ui/editors/RichTextEditors";

const [doc, setDoc] = useState(() => createBlockDocument(code));

// Code editor with syntax highlighting
<CodeEditor
  document={doc}
  onDocumentChange={setDoc}
  tokenizer={myTokenizer}
/>

// Rich text editor
<TextEditor
  document={doc}
  onDocumentChange={setDoc}
/>
```

### Utilities

> Utility components for specialized tasks

#### BezierCurveEditor

Interactive cubic bezier curve editor

SVG-based editor for cubic bezier easing curves with draggable control points. P0 (0,0) and P3 (1,1) are fixed; P1 and P2 are adjustable.

```tsx
import { BezierCurveEditor } from "react-editor-ui/BezierCurveEditor";
import { useState } from "react";

const [points, setPoints] = useState<[number, number, number, number]>([0.25, 0.1, 0.25, 1]);

<BezierCurveEditor
  value={points}
  onChange={setPoints}
  aria-label="Easing curve editor"
/>
```

#### Portal

Renders children into a DOM node outside the parent hierarchy

```tsx
import { Portal } from "react-editor-ui/Portal";
```

### Canvas

> Pan/zoom canvas components for visual editing

#### Canvas

SVG-based canvas with pan/zoom control

```tsx
import { Canvas } from "react-editor-ui/canvas/Canvas";
```

#### CanvasCheckerboard

CanvasCheckerboard - Checkerboard background pattern for Canvas

```tsx
import { CanvasCheckerboard } from "react-editor-ui/canvas/CanvasCheckerboard";
```

#### CanvasGridLayer

CanvasGridLayer - Grid/guideline layer for Canvas

```tsx
import { CanvasGridLayer } from "react-editor-ui/canvas/CanvasGridLayer";
```

#### CanvasGuide

CanvasGuide - Fixed guide lines for Canvas

```tsx
import { CanvasGuide } from "react-editor-ui/canvas/CanvasGuide";
```

#### CanvasRuler

CanvasRuler - Horizontal and Vertical rulers for Canvas

```tsx
import { CanvasRuler } from "react-editor-ui/canvas/CanvasRuler";
```
<!-- /AUTO:COMPONENTS -->

## Theming

All components use CSS custom properties (CSS variables) with the `--rei-` prefix for consistent theming.

### Built-in Themes

```tsx
import { injectTheme } from "react-editor-ui/themes";

// Available themes: "light" | "dark" | "high-contrast-light"
injectTheme("dark");
```

### Custom Theme

Create a custom theme by overriding CSS variables:

```css
.my-theme {
  --rei-color-surface: #2d2d2d;
  --rei-color-primary: #ff6b00;
}
```

Or use `injectTheme` with custom tokens:

```tsx
import { injectTheme } from "react-editor-ui/themes";

injectTheme({
  "color-primary": "#ff6b00",
  "color-surface": "#2d2d2d",
});
```

## Token Reference

<!-- AUTO:TOKENS -->
### Base Tokens

Theme-independent structural values shared across all themes.

#### Spacing

> Consistent spacing scale for margins, paddings, and gaps

| Token | CSS Variable | Default | Description |
|-------|--------------|---------|-------------|
| `space-2xs` | `--rei-space-2xs` | `1px` | 2x extra small spacing (1px) - hairline gaps, minimal separators |
| `space-xs` | `--rei-space-xs` | `2px` | Extra small spacing (2px) - tight spacing for dense UIs |
| `space-sm` | `--rei-space-sm` | `4px` | Small spacing (4px) - default gap between related elements |
| `space-md` | `--rei-space-md` | `8px` | Medium spacing (8px) - standard padding and margins |
| `space-lg` | `--rei-space-lg` | `12px` | Large spacing (12px) - section separators |
| `space-xl` | `--rei-space-xl` | `16px` | Extra large spacing (16px) - major section breaks |
| `space-2xl` | `--rei-space-2xl` | `24px` | 2x extra large spacing (24px) - page-level spacing |

#### Font Sizes

> Typography scale for consistent text hierarchy

| Token | CSS Variable | Default | Description |
|-------|--------------|---------|-------------|
| `size-font-xs` | `--rei-size-font-xs` | `9px` | Extra small font (9px) - labels, badges, timestamps |
| `size-font-sm` | `--rei-size-font-sm` | `11px` | Small font (11px) - secondary text, captions |
| `size-font-md` | `--rei-size-font-md` | `12px` | Medium font (12px) - default body text |
| `size-font-lg` | `--rei-size-font-lg` | `14px` | Large font (14px) - headings, emphasis |

#### Icon Sizes

> Standardized icon dimensions for visual consistency

| Token | CSS Variable | Default | Description |
|-------|--------------|---------|-------------|
| `size-icon-sm` | `--rei-size-icon-sm` | `12px` | Small icon (12px) - inline icons, indicators |
| `size-icon-md` | `--rei-size-icon-md` | `14px` | Medium icon (14px) - default button icons |
| `size-icon-lg` | `--rei-size-icon-lg` | `18px` | Large icon (18px) - toolbar icons, prominent actions |
| `size-icon-xl` | `--rei-size-icon-xl` | `24px` | Extra large icon (24px) - hero icons, empty states |

#### Component Heights

> Standard heights for interactive elements

| Token | CSS Variable | Default | Description |
|-------|--------------|---------|-------------|
| `size-height-xs` | `--rei-size-height-xs` | `14px` | Extra small height (14px) - badges, micro elements |
| `size-height-sm` | `--rei-size-height-sm` | `22px` | Small height (22px) - compact buttons, inputs |
| `size-height-md` | `--rei-size-height-md` | `28px` | Medium height (28px) - default buttons, inputs |
| `size-height-lg` | `--rei-size-height-lg` | `32px` | Large height (32px) - emphasized actions |
| `size-height-xl` | `--rei-size-height-xl` | `40px` | Extra large height (40px) - primary CTAs, hero elements |

#### Border Radius

> Corner rounding for visual softness

| Token | CSS Variable | Default | Description |
|-------|--------------|---------|-------------|
| `radius-sm` | `--rei-radius-sm` | `5px` | Small radius (5px) - subtle rounding |
| `radius-md` | `--rei-radius-md` | `6px` | Medium radius (6px) - default component rounding |
| `radius-lg` | `--rei-radius-lg` | `10px` | Large radius (10px) - cards, modals |
| `radius-full` | `--rei-radius-full` | `9999px` | Full radius (9999px) - pills, circular elements |

#### Z-Index

> Layering hierarchy for overlapping elements

| Token | CSS Variable | Default | Description |
|-------|--------------|---------|-------------|
| `z-dropdown` | `--rei-z-dropdown` | `1000` | Dropdown z-index (1000) - select menus, autocomplete |
| `z-sticky` | `--rei-z-sticky` | `1100` | Sticky z-index (1100) - sticky headers, toolbars |
| `z-modal` | `--rei-z-modal` | `1200` | Modal z-index (1200) - dialogs, modal overlays |
| `z-popover` | `--rei-z-popover` | `1300` | Popover z-index (1300) - popovers, floating panels |
| `z-tooltip` | `--rei-z-tooltip` | `1400` | Tooltip z-index (1400) - tooltips (topmost layer) |

#### Transition Duration

> Animation timing for smooth interactions

| Token | CSS Variable | Default | Description |
|-------|--------------|---------|-------------|
| `duration-fast` | `--rei-duration-fast` | `100ms` | Fast transition (100ms) - hover states, micro-interactions |
| `duration-normal` | `--rei-duration-normal` | `200ms` | Normal transition (200ms) - standard animations |
| `duration-slow` | `--rei-duration-slow` | `300ms` | Slow transition (300ms) - complex animations, modals |

#### Transition Easing

> Animation curves for natural motion

| Token | CSS Variable | Default | Description |
|-------|--------------|---------|-------------|
| `easing-default` | `--rei-easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default easing - smooth acceleration and deceleration |
| `easing-in` | `--rei-easing-in` | `cubic-bezier(0.4, 0, 1, 1)` | Ease-in - accelerating from zero velocity |
| `easing-out` | `--rei-easing-out` | `cubic-bezier(0, 0, 0.2, 1)` | Ease-out - decelerating to zero velocity |

#### Component Sizes

> Fixed dimensions for specific UI components

| Token | CSS Variable | Default | Description |
|-------|--------------|---------|-------------|
| `size-toolbar-height` | `--rei-size-toolbar-height` | `44px` | Toolbar height (44px) - main application toolbar |
| `size-tabbar-height` | `--rei-size-tabbar-height` | `32px` | Tab bar height (32px) - tab navigation |
| `size-statusbar-height` | `--rei-size-statusbar-height` | `24px` | Status bar height (24px) - bottom status bar |
| `size-panel-header-height` | `--rei-size-panel-header-height` | `40px` | Panel header height (40px) - collapsible panel headers |
| `size-tree-indent` | `--rei-size-tree-indent` | `16px` | Tree indent (16px) - hierarchical tree view indentation |
| `size-property-label` | `--rei-size-property-label` | `100px` | Property label width (100px) - form label column |
| `size-checkbox-sm` | `--rei-size-checkbox-sm` | `12px` | Small checkbox (12px) - compact checkbox size |
| `size-checkbox-md` | `--rei-size-checkbox-md` | `14px` | Medium checkbox (14px) - default checkbox size |
| `size-color-swatch-sm` | `--rei-size-color-swatch-sm` | `14px` | Small color swatch (14px) - inline color indicators |
| `size-color-swatch-md` | `--rei-size-color-swatch-md` | `18px` | Medium color swatch (18px) - default color picker swatch |
| `size-color-swatch-lg` | `--rei-size-color-swatch-lg` | `22px` | Large color swatch (22px) - prominent color selection |
| `size-divider-width` | `--rei-size-divider-width` | `1px` | Divider width (1px) - separator line thickness |
| `size-badge-sm` | `--rei-size-badge-sm` | `14px` | Small badge (14px) - compact badge height |
| `size-badge-md` | `--rei-size-badge-md` | `18px` | Medium badge (18px) - default badge height |
| `size-thumbnail-sm` | `--rei-size-thumbnail-sm` | `32px` | Small thumbnail (32px) - inline asset previews |
| `size-thumbnail-md` | `--rei-size-thumbnail-md` | `48px` | Medium thumbnail (48px) - default asset previews |
| `size-thumbnail-lg` | `--rei-size-thumbnail-lg` | `64px` | Large thumbnail (64px) - expanded asset previews |
| `canvas-ruler-size` | `--rei-canvas-ruler-size` | `20px` | Canvas ruler size (20px) - ruler bar width/height |
| `bounding-box-handle-size` | `--rei-bounding-box-handle-size` | `8px` | Bounding box handle size (8px) - resize handle dimensions |
| `bounding-box-stroke-width` | `--rei-bounding-box-stroke-width` | `1px` | Bounding box stroke width (1px) - selection outline thickness |
| `size-action-button` | `--rei-size-action-button` | `20px` | Action button size (20px) - small icon buttons in panels |
| `size-expander` | `--rei-size-expander` | `16px` | Expander button size (16px) - tree expand/collapse toggle |
| `size-close-button` | `--rei-size-close-button` | `16px` | Close button size (16px) - tab/panel close buttons |
| `size-dirty-indicator` | `--rei-size-dirty-indicator` | `8px` | Dirty indicator size (8px) - unsaved changes dot |
| `size-drag-handle` | `--rei-size-drag-handle` | `14px` | Drag handle size (14px) - reorder handle width |
| `size-layer-item-height` | `--rei-size-layer-item-height` | `28px` | Layer item min height (28px) - tree item row height |

#### Font Weights

> Typography weight scale

| Token | CSS Variable | Default | Description |
|-------|--------------|---------|-------------|
| `font-weight-normal` | `--rei-font-weight-normal` | `400` | Normal weight (400) - default body text |
| `font-weight-medium` | `--rei-font-weight-medium` | `500` | Medium weight (500) - slight emphasis |
| `font-weight-semibold` | `--rei-font-weight-semibold` | `600` | Semibold weight (600) - strong emphasis, headings |
| `font-weight-bold` | `--rei-font-weight-bold` | `700` | Bold weight (700) - maximum emphasis |

### Color Tokens

Theme-dependent color values. These are overridden by each theme preset.

#### Primary Colors

> Brand and accent colors for key actions

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `color-primary` | `--rei-color-primary` | Primary brand color - buttons, links, focus states |
| `color-primary-hover` | `--rei-color-primary-hover` | Primary hover - slightly darker/lighter on hover |
| `color-primary-active` | `--rei-color-primary-active` | Primary active - pressed/active state |

#### Surface Colors

> Background colors for containers and layers

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `color-surface` | `--rei-color-surface` | Base surface - main background color |
| `color-surface-raised` | `--rei-color-surface-raised` | Raised surface - cards, elevated panels |
| `color-surface-overlay` | `--rei-color-surface-overlay` | Overlay surface - modals, dropdowns |

#### Text Colors

> Typography colors for readability hierarchy

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `color-text` | `--rei-color-text` | Primary text - main content, headings |
| `color-text-muted` | `--rei-color-text-muted` | Muted text - secondary info, descriptions |
| `color-text-disabled` | `--rei-color-text-disabled` | Disabled text - inactive elements |
| `color-text-on-emphasis` | `--rei-color-text-on-emphasis` | Text on emphasis - text on primary/accent backgrounds |
| `color-text-on-warning` | `--rei-color-text-on-warning` | Text on warning - text on warning backgrounds |

#### Border Colors

> Stroke colors for boundaries and separation

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `color-border` | `--rei-color-border` | Default border - containers, dividers |
| `color-border-focus` | `--rei-color-border-focus` | Focus border - keyboard focus indicator |

#### State Colors

> Semantic colors for feedback and status

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `color-success` | `--rei-color-success` | Success state - confirmations, completed actions |
| `color-warning` | `--rei-color-warning` | Warning state - cautions, important notices |
| `color-error` | `--rei-color-error` | Error state - errors, destructive actions |

#### Error State Colors

> Extended error palette for complex error UIs

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `color-error-bg` | `--rei-color-error-bg` | Error background - subtle error container |
| `color-error-bg-hover` | `--rei-color-error-bg-hover` | Error background hover - error element hover |
| `color-error-bg-active` | `--rei-color-error-bg-active` | Error background active - error element pressed |
| `color-error-border` | `--rei-color-error-border` | Error border - error container stroke |
| `color-error-border-hover` | `--rei-color-error-border-hover` | Error border hover - error hover stroke |

#### Backdrop

> Overlay colors for modals and dialogs

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `color-backdrop` | `--rei-color-backdrop` | Modal backdrop - semi-transparent overlay |

#### Interactive State Colors

> Colors for hover, active, and selection states

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `color-hover` | `--rei-color-hover` | Hover state - subtle highlight on hover |
| `color-active` | `--rei-color-active` | Active state - pressed/active highlight |
| `color-selected` | `--rei-color-selected` | Selected state - selected items highlight |
| `color-selected-subtle` | `--rei-color-selected-subtle` | Subtle selected - lighter selection for backgrounds |
| `color-drop-target` | `--rei-color-drop-target` | Drop target - drag-and-drop target highlight |
| `color-focus-ring` | `--rei-color-focus-ring` | Focus ring - keyboard focus outline |

#### Icon Colors

> Colors for iconography

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `color-icon` | `--rei-color-icon` | Default icon - neutral icon color |
| `color-icon-hover` | `--rei-color-icon-hover` | Icon hover - icon on hover |
| `color-icon-active` | `--rei-color-icon-active` | Icon active - active/selected icon |

#### Divider Colors

> Separator and rule colors

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `color-divider` | `--rei-color-divider` | Divider line - horizontal/vertical separators |

#### Input Colors

> Form input styling

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `color-input-bg` | `--rei-color-input-bg` | Input background - text field background |
| `color-input-border` | `--rei-color-input-border` | Input border - text field stroke |
| `color-input-border-focus` | `--rei-color-input-border-focus` | Input border focus - focused input stroke |

#### Log Level Colors

> Console/log output styling

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `color-log-info` | `--rei-color-log-info` | Info log - informational messages |
| `color-log-warning` | `--rei-color-log-warning` | Warning log - warning messages |
| `color-log-error` | `--rei-color-log-error` | Error log - error messages |
| `color-log-debug` | `--rei-color-log-debug` | Debug log - debug messages |
| `color-log-success` | `--rei-color-log-success` | Success log - success messages |

#### Tooltip Colors

> Tooltip styling

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `tooltip-bg` | `--rei-tooltip-bg` | Tooltip background - tooltip container |
| `tooltip-color` | `--rei-tooltip-color` | Tooltip text - tooltip content color |

#### Canvas Colors

> Canvas/artboard specific colors

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `canvas-ruler-bg` | `--rei-canvas-ruler-bg` | Ruler background - canvas ruler bar |
| `canvas-ruler-text` | `--rei-canvas-ruler-text` | Ruler text - ruler numbers |
| `canvas-ruler-tick` | `--rei-canvas-ruler-tick` | Ruler tick - ruler tick marks |
| `canvas-ruler-indicator` | `--rei-canvas-ruler-indicator` | Ruler indicator - current position marker |
| `canvas-grid-major` | `--rei-canvas-grid-major` | Grid major - primary grid lines |
| `canvas-grid-minor` | `--rei-canvas-grid-minor` | Grid minor - secondary grid lines |
| `canvas-grid-origin` | `--rei-canvas-grid-origin` | Grid origin - origin axis lines |
| `canvas-guide` | `--rei-canvas-guide` | Guide lines - alignment guides |
| `canvas-checker-light` | `--rei-canvas-checker-light` | Checker light - transparency pattern light |
| `canvas-checker-dark` | `--rei-canvas-checker-dark` | Checker dark - transparency pattern dark |

#### Shadows

> Elevation and depth effects

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `shadow-sm` | `--rei-shadow-sm` | Small shadow - subtle elevation |
| `shadow-md` | `--rei-shadow-md` | Medium shadow - cards, dropdowns |
| `shadow-lg` | `--rei-shadow-lg` | Large shadow - modals, popovers |
| `shadow-thumb` | `--rei-shadow-thumb` | Thumb shadow - slider/scrollbar thumbs |

#### Bounding Box Colors

> Selection and transform handle styling

| Token | CSS Variable | Description |
|-------|--------------|-------------|
| `bounding-box-stroke` | `--rei-bounding-box-stroke` | Bounding box stroke - selection outline color |
| `bounding-box-handle-fill` | `--rei-bounding-box-handle-fill` | Handle fill - resize handle background |
| `bounding-box-handle-stroke` | `--rei-bounding-box-handle-stroke` | Handle stroke - resize handle border |
| `bounding-box-label-bg` | `--rei-bounding-box-label-bg` | Label background - dimension label background |
| `bounding-box-label-text` | `--rei-bounding-box-label-text` | Label text - dimension label text color |
<!-- /AUTO:TOKENS -->


## Documentation

- [Design Principles](./docs/design-principles.md)
- [Demo](https://trkbt10.github.io/react-editor-ui/)

## License

[Unlicense](./LICENSE) - Public Domain

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
