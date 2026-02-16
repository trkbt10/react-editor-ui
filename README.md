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

#### Panel

Floating settings panel with header and close button

```tsx
import { Panel } from "react-editor-ui/panels/Panel";
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

### Composite

> Complex components combining multiple primitives

#### FontsPanel

Floating font picker panel with search and category filter

```tsx
import { FontsPanel } from "react-editor-ui/panels/FontsPanel";
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

#### TransformButtons

Flexible transform operation buttons

```tsx
import { TransformButtons } from "react-editor-ui/TransformButtons";
```

#### TypographyPanel

Typography settings panel for text properties

```tsx
import { TypographyPanel } from "react-editor-ui/panels/TypographyPanel";
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

### Editor

> Code and text editing components

#### Editor

Editor module exports

Unified exports for all Editor components including CodeEditor and TextEditor. Provides syntax highlighting, virtual scrolling, and rich text editing.

```tsx
import { CodeEditor, TextEditor } from "react-editor-ui/Editor";

// Code editor with syntax highlighting
<CodeEditor
  value={code}
  onChange={setCode}
  language="typescript"
/>

// Rich text editor
<TextEditor
  value={text}
  onChange={setText}
/>
```

### Utilities

> Utility components for specialized tasks

#### FillEditor

Switch between solid, gradient, image, pattern, and video fill modes

```tsx
import { FillEditor } from "react-editor-ui/FillEditor";
```

#### GradientEditor

Full gradient editing interface

```tsx
import { GradientEditor } from "react-editor-ui/GradientEditor";
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

### CSS Custom Properties

All components use CSS custom properties (CSS variables) with the `--rei-` prefix for consistent theming.

```css
:root {
  --rei-color-bg: #1e1e1e;
  --rei-color-text: #ffffff;
  --rei-color-primary: #0066ff;
  --rei-radius-sm: 4px;
  --rei-space-sm: 8px;
}
```

### Built-in Themes

```tsx
import { injectTheme } from "react-editor-ui/themes";

// Available themes: "light" | "dark"
injectTheme("dark");
```

### Custom Theme

Create a custom theme by overriding CSS variables:

```css
.my-theme {
  --rei-color-bg: #2d2d2d;
  --rei-color-primary: #ff6b00;
}
```


## Documentation

- [Design Principles](./docs/design-principles.md)
- [Demo](https://trkbt10.github.io/react-editor-ui/)

## License

[Unlicense](./LICENSE) - Public Domain

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
