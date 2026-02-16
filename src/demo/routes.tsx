/**
 * @file Demo route configuration
 */

import type { ReactNode } from "react";
import { useState } from "react";
import {
  IconButton,
  Button,
  Input,
  UnitInput,
  Badge,
  Checkbox,
  SegmentedControl,
  ColorPicker,
  ColorInput,
  Toolbar,
  ToolbarGroup,
  ToolbarDivider,
  PropertyGrid,
  PropertyGridItem,
  PropertyRow,
  PropertySection,
  SectionHeader,
  TreeItem,
  LayerItem,
  ContextMenu,
  Select,
  StatusBar,
  StatusBarItem,
  LogEntry,
  Panel,
  ImageSelect,
  StrokeSettingsPanel,
  StrokePanelExpanded,
  StrokePanelCompact,
  createDefaultExpandedSettings,
  createDefaultCompactSettings,
  GradientEditor,
  FillEditor,
  createDefaultGradient,
  Tooltip,
  TransformButtons,
  TypographyPanel,
  FontsPanel,
  PositionPanel,
  createDefaultPositionSettings,
  SplitButton,
} from "../components";
import {
  LuRotateCw,
  LuRotateCcw,
  LuFlipHorizontal,
  LuFlipVertical,
  LuAlignStartVertical,
  LuAlignCenterVertical,
  LuAlignEndVertical,
  LuAlignStartHorizontal,
  LuAlignCenterHorizontal,
  LuAlignEndHorizontal,
} from "react-icons/lu";
import type {
  ColorValue,
  StrokeSettings,
  StrokePanelExpandedSettings,
  StrokePanelCompactSettings,
  ImageSelectOption,
  GradientValue,
  FillValue,
  TypographySettings,
  FontItem,
  PositionSettings,
  Token,
  Tokenizer,
  TextStyleSegment,
} from "../components";
import {
  CodeEditor,
  TextEditor,
  Canvas,
  CanvasContent,
  CanvasGridLayer,
  CanvasHorizontalRuler,
  CanvasVerticalRuler,
  CanvasRulerCorner,
  CanvasGuides,
  CanvasCheckerboard,
} from "../components";
import type { ViewportState } from "../components";

export type DemoPage = {
  id: string;
  label: string;
  path: string;
  element: ReactNode;
};

export type DemoCategory = {
  id: string;
  label: string;
  base: string;
  pages: DemoPage[];
};

const demoContainerStyle = {
  padding: "var(--rei-demo-space-xl, 24px)",
  display: "flex",
  flexDirection: "column" as const,
  gap: "24px",
};

const demoSectionStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "12px",
};

const demoRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap" as const,
};

const demoLabelStyle = {
  color: "var(--rei-demo-text-secondary, #9ca3af)",
  fontSize: "12px",
  marginBottom: "4px",
};

// Demo Icons
const PlayIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// Floating Toolbar Icons (matching reference)
const CursorIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4l16 8-7 2-2 7z" />
  </svg>
);

const GridIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="16" y2="21" />
    <line x1="3" y1="8" x2="21" y2="8" />
    <line x1="3" y1="16" x2="21" y2="16" />
  </svg>
);

const RectangleIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="4" width="16" height="16" rx="1" />
  </svg>
);

const PenToolIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
);

const TextIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 4v3h5.5v12h3V7H19V4H5z" />
  </svg>
);

const CommentIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const ComponentsIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <line x1="17.5" y1="14" x2="17.5" y2="21" />
    <line x1="14" y1="17.5" x2="21" y2="17.5" />
  </svg>
);

const DrawIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
  </svg>
);

const DevModeIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

const CodeIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const FolderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

// Demo Components
function IconButtonDemo() {
  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>IconButton</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Sizes</div>
        <div style={demoRowStyle}>
          <IconButton icon={<PlayIcon />} aria-label="Play" size="sm" />
          <IconButton icon={<PlayIcon />} aria-label="Play" size="md" />
          <IconButton icon={<PlayIcon />} aria-label="Play" size="lg" />
          <IconButton icon={<PlayIcon />} aria-label="Play" size="xl" />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Variants</div>
        <div style={demoRowStyle}>
          <IconButton icon={<PlayIcon />} aria-label="Play" variant="default" />
          <IconButton icon={<PlayIcon />} aria-label="Play" variant="ghost" />
          <IconButton icon={<PlayIcon />} aria-label="Play" variant="filled" />
          <IconButton icon={<PlayIcon />} aria-label="Play" variant="minimal" />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>States</div>
        <div style={demoRowStyle}>
          <IconButton icon={<PlayIcon />} aria-label="Play" />
          <IconButton icon={<PauseIcon />} aria-label="Pause" active />
          <IconButton icon={<PlayIcon />} aria-label="Play" disabled />
        </div>
      </div>
    </div>
  );
}

function ButtonDemo() {
  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>Button</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Variants</div>
        <div style={demoRowStyle}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Sizes</div>
        <div style={demoRowStyle}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Icons</div>
        <div style={demoRowStyle}>
          <Button iconStart={<PlayIcon />}>Play</Button>
          <Button iconEnd={<SearchIcon />}>Search</Button>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Disabled</div>
        <div style={demoRowStyle}>
          <Button disabled>Disabled</Button>
          <Button variant="primary" disabled>Disabled Primary</Button>
        </div>
      </div>
    </div>
  );
}

function InputDemo() {
  const [value, setValue] = useState("");
  const [searchValue, setSearchValue] = useState("example search");

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>Input</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic</div>
        <Input
          value={value}
          onChange={setValue}
          placeholder="Type something..."
          aria-label="Basic input"
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Icons</div>
        <Input
          value={searchValue}
          onChange={setSearchValue}
          iconStart={<SearchIcon />}
          placeholder="Search..."
          aria-label="Search input"
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Clearable</div>
        <Input
          value={searchValue}
          onChange={setSearchValue}
          clearable
          placeholder="Clearable input"
          aria-label="Clearable input"
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Sizes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Input value="" onChange={() => {}} size="sm" placeholder="Small" aria-label="Small" />
          <Input value="" onChange={() => {}} size="md" placeholder="Medium" aria-label="Medium" />
          <Input value="" onChange={() => {}} size="lg" placeholder="Large" aria-label="Large" />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Disabled</div>
        <Input
          value="Disabled value"
          onChange={() => {}}
          disabled
          aria-label="Disabled input"
        />
      </div>
    </div>
  );
}

function UnitInputDemo() {
  const [width, setWidth] = useState("100px");
  const [height, setHeight] = useState("Auto");
  const [fontSize, setFontSize] = useState("16px");
  const [lineHeight, setLineHeight] = useState("1.5em");
  const [opacity, setOpacity] = useState("100%");

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>UnitInput</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic (with wheel &amp; arrow key support)</div>
        <div style={{ width: 200 }}>
          <UnitInput
            value={width}
            onChange={setWidth}
            units={[
              { value: "px", label: "px" },
              { value: "%", label: "%" },
              { value: "em", label: "em" },
              { value: "rem", label: "rem" },
            ]}
            aria-label="Width"
          />
        </div>
        <div style={{ color: "var(--rei-color-text-muted)", fontSize: 11 }}>
          Focus and use mouse wheel or arrow keys to adjust value. Hold Shift for larger steps.
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Auto support (click unit to cycle)</div>
        <div style={{ width: 200 }}>
          <UnitInput
            value={height}
            onChange={setHeight}
            units={[
              { value: "px", label: "px" },
              { value: "%", label: "%" },
              { value: "em", label: "em" },
            ]}
            allowAuto
            aria-label="Height"
          />
        </div>
        <div style={{ color: "var(--rei-color-text-muted)", fontSize: 11 }}>
          Click the unit button to cycle through: px → % → em → Auto
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Custom units</div>
        <div style={{ width: 200 }}>
          <UnitInput
            value={fontSize}
            onChange={setFontSize}
            units={[
              { value: "px", label: "px" },
              { value: "pt", label: "pt" },
              { value: "em", label: "em" },
              { value: "rem", label: "rem" },
            ]}
            aria-label="Font size"
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With min/max constraints</div>
        <div style={{ width: 200 }}>
          <UnitInput
            value={opacity}
            onChange={setOpacity}
            units={[{ value: "%", label: "%" }]}
            min={0}
            max={100}
            aria-label="Opacity"
          />
        </div>
        <div style={{ color: "var(--rei-color-text-muted)", fontSize: 11 }}>
          Constrained between 0% and 100%
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Custom step values</div>
        <div style={{ width: 200 }}>
          <UnitInput
            value={lineHeight}
            onChange={setLineHeight}
            units={[
              { value: "em", label: "em" },
              { value: "", label: "—" },
            ]}
            step={0.1}
            shiftStep={0.5}
            aria-label="Line height"
          />
        </div>
        <div style={{ color: "var(--rei-color-text-muted)", fontSize: 11 }}>
          Step: 0.1, Shift+Step: 0.5
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Many units (dropdown mode)</div>
        <div style={{ width: 200 }}>
          <UnitInput
            value="100px"
            onChange={(v) => console.log("Many units:", v)}
            units={[
              { value: "px", label: "px" },
              { value: "%", label: "%" },
              { value: "em", label: "em" },
              { value: "rem", label: "rem" },
              { value: "vw", label: "vw" },
              { value: "vh", label: "vh" },
              { value: "ch", label: "ch" },
            ]}
            aria-label="Many units"
          />
        </div>
        <div style={{ color: "var(--rei-color-text-muted)", fontSize: 11 }}>
          With 5+ units, clicking shows a dropdown instead of cycling
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Sizes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: 200 }}>
          <UnitInput value="10px" onChange={() => {}} size="sm" aria-label="Small" />
          <UnitInput value="10px" onChange={() => {}} size="md" aria-label="Medium" />
          <UnitInput value="10px" onChange={() => {}} size="lg" aria-label="Large" />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Disabled</div>
        <div style={{ width: 200 }}>
          <UnitInput
            value="100px"
            onChange={() => {}}
            disabled
            aria-label="Disabled"
          />
        </div>
      </div>
    </div>
  );
}

function BadgeDemo() {
  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>Badge</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Variants</div>
        <div style={demoRowStyle}>
          <Badge>Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Sizes</div>
        <div style={demoRowStyle}>
          <Badge size="sm">Small</Badge>
          <Badge size="md">Medium</Badge>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Numeric</div>
        <div style={demoRowStyle}>
          <Badge variant="error">3</Badge>
          <Badge variant="primary">42</Badge>
          <Badge variant="warning">99+</Badge>
        </div>
      </div>
    </div>
  );
}

function ToolbarDemo() {
  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>Toolbar</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic Toolbar</div>
        <Toolbar>
          <ToolbarGroup>
            <IconButton icon={<PlayIcon />} aria-label="Play" />
            <IconButton icon={<PauseIcon />} aria-label="Pause" />
          </ToolbarGroup>
          <ToolbarDivider />
          <ToolbarGroup>
            <IconButton icon={<SearchIcon />} aria-label="Search" />
          </ToolbarGroup>
        </Toolbar>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Buttons</div>
        <Toolbar>
          <ToolbarGroup>
            <Button size="sm" variant="primary">Run</Button>
            <Button size="sm" variant="secondary">Debug</Button>
          </ToolbarGroup>
          <ToolbarDivider />
          <ToolbarGroup>
            <Badge variant="success">Ready</Badge>
          </ToolbarGroup>
        </Toolbar>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Floating Toolbar</div>
        <div style={{ padding: "16px", backgroundColor: "var(--rei-color-surface-overlay, #f5f5f5)" }}>
          <Toolbar variant="floating">
            <ToolbarGroup>
              <IconButton icon={<CursorIcon />} aria-label="Select" size="lg" variant="selected" />
              <IconButton icon={<GridIcon />} aria-label="Grid" size="lg" variant="minimal" />
              <IconButton icon={<RectangleIcon />} aria-label="Rectangle" size="lg" variant="minimal" />
              <IconButton icon={<PenToolIcon />} aria-label="Pen" size="lg" variant="minimal" />
              <IconButton icon={<TextIcon />} aria-label="Text" size="lg" variant="minimal" />
              <IconButton icon={<CommentIcon />} aria-label="Comment" size="lg" variant="minimal" />
              <IconButton icon={<ComponentsIcon />} aria-label="Components" size="lg" variant="minimal" />
            </ToolbarGroup>
            <ToolbarDivider />
            <ToolbarGroup>
              <IconButton icon={<DrawIcon />} aria-label="Draw" size="lg" variant="minimal" />
              <IconButton icon={<DevModeIcon />} aria-label="Dev Mode" size="lg" variant="minimal" active />
              <IconButton icon={<CodeIcon />} aria-label="Code" size="lg" variant="minimal" />
            </ToolbarGroup>
          </Toolbar>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Floating Toolbar with fitContent</div>
        <div style={{ padding: "16px", backgroundColor: "var(--rei-color-surface-overlay, #f5f5f5)" }}>
          <Toolbar variant="floating" fitContent>
            <ToolbarGroup>
              <IconButton icon={<CursorIcon />} aria-label="Select" size="lg" variant="selected" />
              <IconButton icon={<GridIcon />} aria-label="Grid" size="lg" variant="minimal" />
              <IconButton icon={<RectangleIcon />} aria-label="Rectangle" size="lg" variant="minimal" />
            </ToolbarGroup>
          </Toolbar>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Vertical Toolbar</div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Toolbar orientation="vertical">
            <ToolbarGroup>
              <IconButton icon={<CursorIcon />} aria-label="Select" />
              <IconButton icon={<GridIcon />} aria-label="Grid" />
              <IconButton icon={<RectangleIcon />} aria-label="Rectangle" />
            </ToolbarGroup>
            <ToolbarDivider />
            <ToolbarGroup>
              <IconButton icon={<PenToolIcon />} aria-label="Pen" />
              <IconButton icon={<TextIcon />} aria-label="Text" />
            </ToolbarGroup>
          </Toolbar>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Vertical Floating Toolbar with fitContent</div>
        <div style={{ padding: "16px", backgroundColor: "var(--rei-color-surface-overlay, #f5f5f5)" }}>
          <Toolbar variant="floating" orientation="vertical" fitContent>
            <ToolbarGroup>
              <IconButton icon={<CursorIcon />} aria-label="Select" size="lg" variant="selected" />
              <IconButton icon={<GridIcon />} aria-label="Grid" size="lg" variant="minimal" />
              <IconButton icon={<RectangleIcon />} aria-label="Rectangle" size="lg" variant="minimal" />
            </ToolbarGroup>
            <ToolbarDivider />
            <ToolbarGroup>
              <IconButton icon={<PenToolIcon />} aria-label="Pen" size="lg" variant="minimal" />
              <IconButton icon={<TextIcon />} aria-label="Text" size="lg" variant="minimal" />
            </ToolbarGroup>
          </Toolbar>
        </div>
      </div>
    </div>
  );
}

function PropertyRowDemo() {
  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>PropertyRow</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic Properties</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <PropertyRow label="Name">MyComponent</PropertyRow>
          <PropertyRow label="Type">UIView</PropertyRow>
          <PropertyRow label="Position">x: 100, y: 200</PropertyRow>
          <PropertyRow label="Size">width: 300, height: 150</PropertyRow>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Clickable Row</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <PropertyRow label="Action" onClick={() => alert("Clicked!")}>
            Click to edit
          </PropertyRow>
        </div>
      </div>
    </div>
  );
}

function renderSectionContent(expanded: boolean) {
  if (!expanded) {
    return null;
  }
  return (
    <div
      style={{
        padding: "8px 12px",
        color: "var(--rei-color-text-muted, #9ca3af)",
        fontSize: "12px",
      }}
    >
      Section content here...
    </div>
  );
}

function SectionHeaderDemo() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>SectionHeader</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Static Header</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <SectionHeader title="Properties" />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Collapsible (Controlled)</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <SectionHeader
            title="Appearance"
            collapsible
            expanded={expanded}
            onToggle={setExpanded}
          />
          {renderSectionContent(expanded)}
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Action</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <SectionHeader
            title="Layers"
            collapsible
            action={<Button size="sm" variant="ghost">+ Add</Button>}
          />
        </div>
      </div>
    </div>
  );
}

function renderTreeChildren(
  expanded: boolean,
  selected: string,
  setSelected: (value: string) => void,
) {
  if (!expanded) {
    return null;
  }
  return (
    <>
      <TreeItem
        label="App.tsx"
        icon={<FileIcon />}
        depth={1}
        selected={selected === "file1"}
        onClick={() => setSelected("file1")}
      />
      <TreeItem
        label="index.tsx"
        icon={<FileIcon />}
        depth={1}
        selected={selected === "file2"}
        onClick={() => setSelected("file2")}
        badge={<Badge variant="warning" size="sm">M</Badge>}
      />
    </>
  );
}

function TreeItemDemo() {
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState("file1");

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>TreeItem</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>File Tree</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <TreeItem
            label="src"
            icon={<FolderIcon />}
            hasChildren
            expanded={expanded}
            onToggle={() => setExpanded(!expanded)}
            selected={selected === "src"}
            onClick={() => setSelected("src")}
          />
          {renderTreeChildren(expanded, selected, setSelected)}
          <TreeItem
            label="package.json"
            icon={<FileIcon />}
            selected={selected === "package"}
            onClick={() => setSelected("package")}
          />
        </div>
      </div>
    </div>
  );
}

// Layer Type Icons for LayerItemDemo
const FrameLayerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

const TextLayerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="8" y1="20" x2="16" y2="20" />
  </svg>
);

const ImageLayerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const ComponentLayerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

type LayerData = {
  id: string;
  label: string;
  type: "frame" | "text" | "image" | "component";
  visible: boolean;
  locked: boolean;
  parentId: string | null;
  order: number;
};

type DropInfo = {
  targetId: string;
  position: "before" | "inside" | "after";
} | null;

// Optimized layer tree utilities using Map for O(1) lookups
function createLayerMap(layers: LayerData[]): Map<string, LayerData> {
  return new Map(layers.map((l) => [l.id, l]));
}

function createChildrenMap(layers: LayerData[]): Map<string | null, LayerData[]> {
  const map = new Map<string | null, LayerData[]>();
  for (const layer of layers) {
    const children = map.get(layer.parentId) ?? [];
    children.push(layer);
    map.set(layer.parentId, children);
  }
  // Sort children by order
  for (const [, children] of map) {
    children.sort((a, b) => a.order - b.order);
  }
  return map;
}

function getDepthWithMap(id: string, layerMap: Map<string, LayerData>): number {
  const layer = layerMap.get(id);
  if (!layer || !layer.parentId) {
    return 0;
  }
  return getDepthWithMap(layer.parentId, layerMap) + 1;
}

function isDescendantWithMap(childId: string, ancestorId: string, layerMap: Map<string, LayerData>): boolean {
  const child = layerMap.get(childId);
  if (!child || !child.parentId) {
    return false;
  }
  if (child.parentId === ancestorId) {
    return true;
  }
  return isDescendantWithMap(child.parentId, ancestorId, layerMap);
}

function getVisibleLayersOrdered(
  childrenMap: Map<string | null, LayerData[]>,
  expandedIds: Set<string>,
  parentId: string | null = null,
): LayerData[] {
  const result: LayerData[] = [];
  const children = childrenMap.get(parentId) ?? [];
  for (const child of children) {
    result.push(child);
    if (expandedIds.has(child.id)) {
      result.push(...getVisibleLayersOrdered(childrenMap, expandedIds, child.id));
    }
  }
  return result;
}

function DragStatusDisplay({
  selectedIds,
  draggedId,
  dropInfo,
  layerMap,
  layers,
}: {
  selectedIds: Set<string>;
  draggedId: string;
  dropInfo: DropInfo;
  layerMap: Map<string, LayerData>;
  layers: LayerData[];
}) {
  const getDragLabel = () => {
    if (selectedIds.size > 1) {
      return `${selectedIds.size} layers`;
    }
    return layerMap.get(draggedId)?.label ?? "";
  };

  const getDropTarget = () => {
    if (!dropInfo) {
      return "";
    }
    const targetLabel = layers.find((l) => l.id === dropInfo.targetId)?.label ?? "";
    return ` → ${dropInfo.position} "${targetLabel}"`;
  };

  return (
    <div style={{ color: "var(--rei-color-primary)", fontSize: 11 }}>
      Dragging: {getDragLabel()}
      {getDropTarget()}
    </div>
  );
}

function LayerItemDemo() {
  const [layers, setLayers] = useState<LayerData[]>([
    { id: "1", label: "Main Frame", type: "frame", visible: true, locked: false, parentId: null, order: 0 },
    { id: "2", label: "Header", type: "frame", visible: true, locked: false, parentId: "1", order: 0 },
    { id: "3", label: "Logo", type: "image", visible: true, locked: false, parentId: "2", order: 0 },
    { id: "4", label: "Navigation", type: "text", visible: true, locked: false, parentId: "2", order: 1 },
    { id: "5", label: "Content", type: "frame", visible: true, locked: false, parentId: "1", order: 1 },
    { id: "6", label: "Card", type: "component", visible: false, locked: false, parentId: "5", order: 0 },
    { id: "7", label: "Footer", type: "text", visible: true, locked: true, parentId: "1", order: 2 },
    { id: "8", label: "Background", type: "frame", visible: true, locked: false, parentId: null, order: 1 },
  ]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["1", "2", "5"]));
  // Multi-selection support
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["1"]));
  const [lastClickedId, setLastClickedId] = useState<string | null>("1");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropInfo, setDropInfo] = useState<DropInfo>(null);
  const [lastAction, setLastAction] = useState<string>("");

  // Precompute maps for O(1) lookups
  const layerMap = createLayerMap(layers);
  const childrenMap = createChildrenMap(layers);
  const visibleLayers = getVisibleLayersOrdered(childrenMap, expandedIds);

  const getIcon = (type: LayerData["type"]) => {
    switch (type) {
      case "frame": return <FrameLayerIcon />;
      case "text": return <TextLayerIcon />;
      case "image": return <ImageLayerIcon />;
      case "component": return <ComponentLayerIcon />;
    }
  };

  const canHaveChildren = (type: LayerData["type"]) => type === "frame";

  const hasChildren = (id: string): boolean => {
    return (childrenMap.get(id)?.length ?? 0) > 0;
  };

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Selection handlers with Shift and Cmd/Ctrl support
  const handlePointerDownForSelection = (id: string, e: React.PointerEvent) => {
    const isMeta = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;

    // Right-click on selected item: preserve selection for context menu
    if (e.button === 2 && selectedIds.has(id)) {
      return;
    }

    if (isShift && lastClickedId) {
      // Shift+click: range selection
      const startIdx = visibleLayers.findIndex((l) => l.id === lastClickedId);
      const endIdx = visibleLayers.findIndex((l) => l.id === id);
      if (startIdx !== -1 && endIdx !== -1) {
        const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
        const rangeIds = visibleLayers.slice(from, to + 1).map((l) => l.id);

        if (isMeta) {
          // Shift+Cmd/Ctrl: add range to existing selection
          setSelectedIds((prev) => new Set([...prev, ...rangeIds]));
        } else {
          // Shift only: replace selection with range
          setSelectedIds(new Set(rangeIds));
        }
        setLastAction(`Selected ${rangeIds.length} layers (range)`);
      }
    } else if (isMeta) {
      // Cmd/Ctrl+click: toggle selection
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
      setLastClickedId(id);
      setLastAction(`Toggle selection: ${layerMap.get(id)?.label}`);
    } else {
      // Normal click: single selection
      setSelectedIds(new Set([id]));
      setLastClickedId(id);
    }
  };

  const handleVisibilityChange = (id: string, visible: boolean) => {
    // Apply to all selected if this layer is selected
    const idsToUpdate = selectedIds.has(id) ? [...selectedIds] : [id];
    setLayers((prev) =>
      prev.map((l) => (idsToUpdate.includes(l.id) ? { ...l, visible } : l))
    );
    setLastAction(`Set visibility=${visible} for ${idsToUpdate.length} layer(s)`);
  };

  const handleLockChange = (id: string, locked: boolean) => {
    // Apply to all selected if this layer is selected
    const idsToUpdate = selectedIds.has(id) ? [...selectedIds] : [id];
    setLayers((prev) =>
      prev.map((l) => (idsToUpdate.includes(l.id) ? { ...l, locked } : l))
    );
    setLastAction(`Set locked=${locked} for ${idsToUpdate.length} layer(s)`);
  };

  const handleRename = (id: string, newLabel: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, label: newLabel } : l))
    );
  };

  const handleDelete = (id: string) => {
    // Delete selected layers and all their descendants
    const idsToDelete = selectedIds.has(id) ? [...selectedIds] : [id];
    const toDelete = new Set<string>(idsToDelete);

    // Add all descendants
    let changed = true;
    while (changed) {
      changed = false;
      for (const layer of layers) {
        if (layer.parentId && toDelete.has(layer.parentId) && !toDelete.has(layer.id)) {
          toDelete.add(layer.id);
          changed = true;
        }
      }
    }

    setLayers((prev) => prev.filter((l) => !toDelete.has(l.id)));
    setSelectedIds(new Set());
    setLastClickedId(null);
    setLastAction(`Deleted ${toDelete.size} layer(s)`);
  };

  const handleContextMenu = (id: string, action: string) => {
    switch (action) {
      case "delete":
        handleDelete(id);
        break;
      case "duplicate": {
        // Duplicate all selected layers
        const idsToDuplicate = selectedIds.has(id) ? [...selectedIds] : [id];
        const newLayers: LayerData[] = [];

        for (const dupId of idsToDuplicate) {
          const layer = layerMap.get(dupId);
          if (layer) {
            const siblings = childrenMap.get(layer.parentId) ?? [];
            const maxOrder = Math.max(...siblings.map((l) => l.order), -1);
            newLayers.push({
              ...layer,
              id: `${Date.now()}-${dupId}`,
              label: `${layer.label} Copy`,
              order: maxOrder + 1 + newLayers.length,
            });
          }
        }

        setLayers((prev) => [...prev, ...newLayers]);
        setLastAction(`Duplicated ${newLayers.length} layer(s)`);
        break;
      }
      case "selectAll": {
        setSelectedIds(new Set(visibleLayers.map((l) => l.id)));
        setLastAction("Selected all visible layers");
        break;
      }
      case "deselectAll": {
        setSelectedIds(new Set());
        setLastClickedId(null);
        setLastAction("Deselected all");
        break;
      }
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    // If dragging an unselected item, select only that item
    if (!selectedIds.has(id)) {
      setSelectedIds(new Set([id]));
      setLastClickedId(id);
    }
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || selectedIds.has(targetId)) {
      setDropInfo(null);
      return;
    }

    // Prevent dropping onto descendants of any selected item
    for (const selId of selectedIds) {
      if (isDescendantWithMap(targetId, selId, layerMap)) {
        setDropInfo(null);
        return;
      }
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const targetLayer = layerMap.get(targetId);

    // Determine drop position based on mouse position
    if (y < height * 0.25) {
      setDropInfo({ targetId, position: "before" });
    } else if (y > height * 0.75) {
      setDropInfo({ targetId, position: "after" });
    } else if (targetLayer && canHaveChildren(targetLayer.type)) {
      setDropInfo({ targetId, position: "inside" });
    } else {
      setDropInfo({ targetId, position: y < height * 0.5 ? "before" : "after" });
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || !dropInfo || selectedIds.has(targetId)) {
      setDropInfo(null);
      setDraggedId(null);
      return;
    }

    const targetLayer = layerMap.get(targetId);
    if (!targetLayer) {
      setDropInfo(null);
      setDraggedId(null);
      return;
    }

    // Move all selected layers
    setLayers((prev) => {
      const newLayers = prev.filter((l) => !selectedIds.has(l.id));
      const movedLayers = prev.filter((l) => selectedIds.has(l.id)).map((l) => ({ ...l }));

      if (dropInfo.position === "inside") {
        // Insert as children of target
        const existingChildren = newLayers.filter((l) => l.parentId === targetId);
        let orderOffset = existingChildren.length;

        for (const moved of movedLayers) {
          moved.parentId = targetId;
          moved.order = orderOffset++;
        }

        setExpandedIds((prev) => new Set([...prev, targetId]));
        setLastAction(`Moved ${movedLayers.length} layer(s) into "${targetLayer.label}"`);
      } else {
        // Insert before or after target at same level
        const siblings = newLayers.filter((l) => l.parentId === targetLayer.parentId);
        const targetOrder = targetLayer.order;
        const insertOrder = dropInfo.position === "before" ? targetOrder : targetOrder + 1;

        // Shift orders of items at or after insert position
        for (const sibling of siblings) {
          if (sibling.order >= insertOrder) {
            sibling.order += movedLayers.length;
          }
        }

        let orderOffset = 0;
        for (const moved of movedLayers) {
          moved.parentId = targetLayer.parentId;
          moved.order = insertOrder + orderOffset++;
        }

        const getParentLabel = () => {
          if (!targetLayer.parentId) {
            return "root";
          }
          return layerMap.get(targetLayer.parentId)?.label ?? "unknown";
        };
        setLastAction(
          `Moved ${movedLayers.length} layer(s) ${dropInfo.position} "${targetLayer.label}" (in ${getParentLabel()})`
        );
      }

      return [...newLayers, ...movedLayers];
    });

    setDropInfo(null);
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropInfo(null);
  };

  const contextMenuItems = [
    { id: "rename", label: "Rename" },
    { id: "duplicate", label: `Duplicate${selectedIds.size > 1 ? ` (${selectedIds.size})` : ""}` },
    { id: "divider1", label: "", divider: true },
    { id: "selectAll", label: "Select All" },
    { id: "deselectAll", label: "Deselect All", disabled: selectedIds.size === 0 },
    { id: "divider2", label: "", divider: true },
    { id: "delete", label: `Delete${selectedIds.size > 1 ? ` (${selectedIds.size})` : ""}`, danger: true },
  ];

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>LayerItem</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Figma-style Layer Panel (Full DnD)</div>
        <div style={{ color: "var(--rei-color-text-muted)", fontSize: 11, marginBottom: 8 }}>
          Click to select. Shift+click for range. Cmd/Ctrl+click for multi-select. Drag to reorder.
        </div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", width: "300px" }}>
          {visibleLayers.map((layer) => {
            const parent = layer.parentId ? layerMap.get(layer.parentId) : null;
            const isDimmed = parent ? !parent.visible : false;
            const depth = getDepthWithMap(layer.id, layerMap);
            const isContainer = canHaveChildren(layer.type);
            const layerHasChildren = hasChildren(layer.id);
            const currentDropPosition = dropInfo?.targetId === layer.id ? dropInfo.position : null;
            const isSelected = selectedIds.has(layer.id);

            return (
              <LayerItem
                key={layer.id}
                id={layer.id}
                label={layer.label}
                icon={getIcon(layer.type)}
                depth={depth}
                hasChildren={layerHasChildren}
                expanded={expandedIds.has(layer.id)}
                onToggle={() => handleToggle(layer.id)}
                selected={isSelected}
                onPointerDown={(e) => handlePointerDownForSelection(layer.id, e)}
                visible={layer.visible}
                onVisibilityChange={(v) => handleVisibilityChange(layer.id, v)}
                locked={layer.locked}
                onLockChange={(l) => handleLockChange(layer.id, l)}
                renamable
                onRename={(newLabel) => handleRename(layer.id, newLabel)}
                contextMenuItems={contextMenuItems}
                onContextMenu={(action) => handleContextMenu(layer.id, action)}
                dimmed={isDimmed}
                badge={layer.type === "component" ? <Badge size="sm" variant="primary">C</Badge> : undefined}
                draggable
                canHaveChildren={isContainer}
                dropPosition={currentDropPosition}
                onDragStart={(e) => handleDragStart(e, layer.id)}
                onDragOver={(e) => handleDragOver(e, layer.id)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, layer.id)}
              />
            );
          })}
        </div>
        <div style={{ color: "var(--rei-color-text-muted)", fontSize: 11, marginTop: 8 }}>
          Selected: {selectedIds.size} layer(s)
          {lastAction ? ` | Last: ${lastAction}` : ""}
        </div>
        {draggedId && (
          <DragStatusDisplay
            selectedIds={selectedIds}
            draggedId={draggedId}
            dropInfo={dropInfo}
            layerMap={layerMap}
            layers={layers}
          />
        )}
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>States</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", width: "280px" }}>
          <LayerItem
            id="state-1"
            label="Selected"
            icon={<FrameLayerIcon />}
            selected
            visible
            onVisibilityChange={() => {}}
          />
          <LayerItem
            id="state-2"
            label="Hidden Layer"
            icon={<ImageLayerIcon />}
            visible={false}
            onVisibilityChange={() => {}}
          />
          <LayerItem
            id="state-3"
            label="Locked Layer"
            icon={<TextLayerIcon />}
            visible
            locked
            onLockChange={() => {}}
          />
          <LayerItem
            id="state-4"
            label="Dimmed Layer"
            icon={<FrameLayerIcon />}
            dimmed
            visible
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Minimal (no toggles)</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", width: "280px" }}>
          <LayerItem
            id="minimal-1"
            label="Simple Layer"
            icon={<FrameLayerIcon />}
            showVisibilityToggle={false}
            showLockToggle={false}
          />
        </div>
      </div>
    </div>
  );
}

function SelectDemo() {
  const [value, setValue] = useState("apple");

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>Select</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic Select</div>
        <Select
          options={[
            { value: "apple", label: "Apple" },
            { value: "banana", label: "Banana" },
            { value: "cherry", label: "Cherry" },
          ]}
          value={value}
          onChange={setValue}
          aria-label="Select fruit"
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Disabled Option</div>
        <Select
          options={[
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large", disabled: true },
          ]}
          value="medium"
          onChange={() => {}}
          aria-label="Select size"
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Disabled</div>
        <Select
          options={[{ value: "disabled", label: "Cannot change" }]}
          value="disabled"
          onChange={() => {}}
          disabled
          aria-label="Disabled select"
        />
      </div>
    </div>
  );
}

function SplitButtonDemo() {
  const [mode, setMode] = useState<"present" | "preview">("preview");
  const [lastAction, setLastAction] = useState<string>("");

  const presentIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );

  const previewIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9l6 3-6 3V9z" />
    </svg>
  );

  const options = [
    { value: "present" as const, label: "Present", icon: presentIcon, shortcut: "⌥⌘↵" },
    { value: "preview" as const, label: "Preview", icon: previewIcon, shortcut: "⇧Space" },
  ];

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>SplitButton</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic SplitButton</div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <SplitButton
            options={options}
            value={mode}
            onChange={setMode}
            onAction={() => setLastAction(`Executed: ${mode}`)}
            aria-label="Presentation mode"
          />
          <span style={{ color: "var(--rei-color-text-muted, #9ca3af)", fontSize: "12px" }}>
            Selected: {mode}
          </span>
        </div>
        {lastAction && (
          <div style={{ marginTop: "8px", color: "var(--rei-color-success, #16a34a)", fontSize: "12px" }}>
            {lastAction}
          </div>
        )}
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Sizes</div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <SplitButton
            options={options}
            value="preview"
            onChange={() => {}}
            size="sm"
            aria-label="Small"
          />
          <SplitButton
            options={options}
            value="preview"
            onChange={() => {}}
            size="md"
            aria-label="Medium"
          />
          <SplitButton
            options={options}
            value="preview"
            onChange={() => {}}
            size="lg"
            aria-label="Large"
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Disabled</div>
        <SplitButton
          options={options}
          value="preview"
          onChange={() => {}}
          disabled
          aria-label="Disabled"
        />
      </div>
    </div>
  );
}

function ContextMenuDemo() {
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [menuType, setMenuType] = useState<"basic" | "nested" | "long" | "edge">("basic");
  const [lastAction, setLastAction] = useState<string>("");

  const basicItems = [
    { id: "cut", label: "Cut", shortcut: "⌘X" },
    { id: "copy", label: "Copy", shortcut: "⌘C" },
    { id: "paste", label: "Paste", shortcut: "⌘V" },
    { id: "divider1", label: "", divider: true },
    { id: "delete", label: "Delete", danger: true, shortcut: "⌫" },
  ];

  const nestedItems = [
    { id: "new", label: "New", children: [
      { id: "new-file", label: "File", shortcut: "⌘N" },
      { id: "new-folder", label: "Folder", shortcut: "⇧⌘N" },
      { id: "new-template", label: "From Template", children: [
        { id: "template-react", label: "React Component" },
        { id: "template-vue", label: "Vue Component" },
        { id: "template-svelte", label: "Svelte Component" },
      ]},
    ]},
    { id: "open", label: "Open Recent", children: [
      { id: "recent-1", label: "project-a/index.ts" },
      { id: "recent-2", label: "project-b/main.tsx" },
      { id: "recent-3", label: "utils/helpers.ts" },
    ]},
    { id: "divider", label: "", divider: true },
    { id: "settings", label: "Settings", shortcut: "⌘," },
  ];

  const generateLongItems = () => {
    const items = [];
    for (let i = 1; i <= 30; i++) {
      items.push({ id: `item-${i}`, label: `Menu Item ${i}` });
    }
    return items;
  };

  const getItems = () => {
    switch (menuType) {
      case "nested":
        return nestedItems;
      case "long":
        return generateLongItems();
      default:
        return basicItems;
    }
  };

  const handleContextMenu = (e: React.MouseEvent, type: typeof menuType) => {
    e.preventDefault();
    setMenuType(type);
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleSelect = (itemId: string) => {
    setLastAction(`Selected: ${itemId}`);
  };

  const handleClose = () => {
    setMenuPosition(null);
  };

  const triggerBoxStyle: React.CSSProperties = {
    padding: "40px",
    backgroundColor: "var(--rei-color-surface, #1e1f24)",
    border: "1px dashed var(--rei-color-border, #3d3f46)",
    borderRadius: "4px",
    textAlign: "center",
    cursor: "context-menu",
    color: "var(--rei-color-text-muted, #8b8d94)",
    fontSize: "12px",
  };

  const cornerBoxStyle: React.CSSProperties = {
    ...triggerBoxStyle,
    position: "fixed",
    padding: "20px",
    width: "100px",
  };

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>ContextMenu</h2>
      <p style={{ color: "var(--rei-color-text-muted, #8b8d94)", fontSize: "13px", margin: "0 0 16px" }}>
        Last action: {lastAction || "None"}
      </p>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic Menu</div>
        <div
          style={triggerBoxStyle}
          onContextMenu={(e) => handleContextMenu(e, "basic")}
          data-testid="context-trigger-basic"
        >
          Right-click here for basic menu
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Nested Submenus</div>
        <div
          style={triggerBoxStyle}
          onContextMenu={(e) => handleContextMenu(e, "nested")}
          data-testid="context-trigger-nested"
        >
          Right-click here for nested menu
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Long Scrollable Menu (30 items)</div>
        <div
          style={triggerBoxStyle}
          onContextMenu={(e) => handleContextMenu(e, "long")}
          data-testid="context-trigger-long"
        >
          Right-click here for scrollable menu
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Edge Position Testing</div>
        <p style={{ color: "var(--rei-color-text-muted)", fontSize: "11px", margin: "0 0 8px" }}>
          Right-click on corner boxes to test viewport boundary handling
        </p>
        <div style={{ position: "relative", height: "120px" }}>
          {/* Top-right corner */}
          <div
            style={{ ...cornerBoxStyle, top: "60px", right: "20px" }}
            onContextMenu={(e) => handleContextMenu(e, "basic")}
            data-testid="context-trigger-top-right"
          >
            Top Right
          </div>
          {/* Bottom-right corner */}
          <div
            style={{ ...cornerBoxStyle, bottom: "20px", right: "20px" }}
            onContextMenu={(e) => handleContextMenu(e, "nested")}
            data-testid="context-trigger-bottom-right"
          >
            Bottom Right (nested)
          </div>
        </div>
      </div>

      {menuPosition && (
        <ContextMenu
          items={getItems()}
          position={menuPosition}
          onSelect={handleSelect}
          onClose={handleClose}
          maxHeight={250}
        />
      )}
    </div>
  );
}

function StatusBarDemo() {
  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>StatusBar</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic StatusBar</div>
        <StatusBar>
          <StatusBarItem>Ln 42, Col 10</StatusBarItem>
          <StatusBarItem>Spaces: 2</StatusBarItem>
          <StatusBarItem>UTF-8</StatusBarItem>
          <StatusBarItem onClick={() => alert("LF clicked")}>LF</StatusBarItem>
        </StatusBar>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Badges</div>
        <StatusBar>
          <StatusBarItem>
            <Badge variant="error" size="sm">2</Badge>
            Errors
          </StatusBarItem>
          <StatusBarItem>
            <Badge variant="warning" size="sm">5</Badge>
            Warnings
          </StatusBarItem>
          <StatusBarItem>Ready</StatusBarItem>
        </StatusBar>
      </div>
    </div>
  );
}

function LogEntryDemo() {
  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>LogEntry</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Log Levels</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <LogEntry message="Application started" level="info" timestamp={new Date()} />
          <LogEntry message="Component re-rendered" level="debug" timestamp={new Date()} />
          <LogEntry message="Build completed successfully" level="success" timestamp={new Date()} />
          <LogEntry message="Deprecated API usage" level="warning" timestamp={new Date()} />
          <LogEntry message="Failed to connect" level="error" timestamp={new Date()} />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Source and Details</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <LogEntry
            message="Uncaught TypeError"
            level="error"
            timestamp={new Date()}
            source="app.tsx:42"
            details="Cannot read property 'foo' of undefined\n  at handleClick (app.tsx:42)\n  at HTMLButtonElement.onclick"
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Selected State</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <LogEntry message="Selected log entry" level="info" selected />
        </div>
      </div>
    </div>
  );
}

// Demo Icons for new components
const AlignLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="17" y1="10" x2="3" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="17" y1="18" x2="3" y2="18" />
  </svg>
);

const AlignCenterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="10" x2="6" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="18" y1="18" x2="6" y2="18" />
  </svg>
);

const AlignRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="21" y1="10" x2="7" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="21" y1="18" x2="7" y2="18" />
  </svg>
);

const RotateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

function CheckboxDemo() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [checked3, setChecked3] = useState(false);
  const [switch1, setSwitch1] = useState(false);
  const [switch2, setSwitch2] = useState(true);

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>Checkbox</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Checkbox
            checked={checked1}
            onChange={setChecked1}
            label="Clip content"
          />
          <Checkbox
            checked={checked2}
            onChange={setChecked2}
            label="Show in exports"
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Sizes</div>
        <div style={demoRowStyle}>
          <Checkbox checked onChange={() => {}} label="Small" size="sm" />
          <Checkbox checked onChange={() => {}} label="Medium" size="md" />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Indeterminate</div>
        <Checkbox
          checked={checked3}
          onChange={setChecked3}
          indeterminate
          label="Select all"
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Disabled</div>
        <div style={demoRowStyle}>
          <Checkbox checked={false} onChange={() => {}} label="Disabled unchecked" disabled />
          <Checkbox checked onChange={() => {}} label="Disabled checked" disabled />
        </div>
      </div>

      <h2 style={{ margin: "24px 0 0 0", color: "var(--rei-color-text, #e4e6eb)" }}>Switch</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Checkbox
            variant="switch"
            checked={switch1}
            onChange={setSwitch1}
            label="Dark mode"
          />
          <Checkbox
            variant="switch"
            checked={switch2}
            onChange={setSwitch2}
            label="Notifications"
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Sizes</div>
        <div style={demoRowStyle}>
          <Checkbox variant="switch" checked onChange={() => {}} label="Small" size="sm" />
          <Checkbox variant="switch" checked onChange={() => {}} label="Medium" size="md" />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>States</div>
        <div style={demoRowStyle}>
          <Checkbox variant="switch" checked={false} onChange={() => {}} label="Off" />
          <Checkbox variant="switch" checked onChange={() => {}} label="On" />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Disabled</div>
        <div style={demoRowStyle}>
          <Checkbox variant="switch" checked={false} onChange={() => {}} label="Disabled off" disabled />
          <Checkbox variant="switch" checked onChange={() => {}} label="Disabled on" disabled />
        </div>
      </div>
    </div>
  );
}

function SegmentedControlDemo() {
  const [alignment, setAlignment] = useState("left");
  const [sizes, setSizes] = useState<string[]>(["md"]);

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>SegmentedControl</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Icons</div>
        <SegmentedControl
          options={[
            { value: "left", icon: <AlignLeftIcon />, "aria-label": "Align left" },
            { value: "center", icon: <AlignCenterIcon />, "aria-label": "Align center" },
            { value: "right", icon: <AlignRightIcon />, "aria-label": "Align right" },
          ]}
          value={alignment}
          onChange={(v) => setAlignment(v as string)}
          aria-label="Text alignment"
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Labels</div>
        <SegmentedControl
          options={[
            { value: "sm", label: "S" },
            { value: "md", label: "M" },
            { value: "lg", label: "L" },
            { value: "xl", label: "XL" },
          ]}
          value="md"
          onChange={() => {}}
          aria-label="Size selection"
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Multiple Selection</div>
        <SegmentedControl
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
          value={sizes}
          onChange={(v) => setSizes(v as string[])}
          multiple
          aria-label="Size options"
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Sizes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <SegmentedControl
            options={[
              { value: "a", label: "A" },
              { value: "b", label: "B" },
            ]}
            value="a"
            onChange={() => {}}
            size="sm"
            aria-label="Small control"
          />
          <SegmentedControl
            options={[
              { value: "a", label: "A" },
              { value: "b", label: "B" },
            ]}
            value="a"
            onChange={() => {}}
            size="md"
            aria-label="Medium control"
          />
          <SegmentedControl
            options={[
              { value: "a", label: "A" },
              { value: "b", label: "B" },
            ]}
            value="a"
            onChange={() => {}}
            size="lg"
            aria-label="Large control"
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Disabled</div>
        <SegmentedControl
          options={[
            { value: "a", label: "Option A" },
            { value: "b", label: "Option B" },
          ]}
          value="a"
          onChange={() => {}}
          disabled
          aria-label="Disabled control"
        />
      </div>
    </div>
  );
}

function ColorPickerDemo() {
  const [color, setColor] = useState("#3b82f6");

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>ColorPicker</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic</div>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Selected Color: {color}</div>
        <div
          style={{
            width: 100,
            height: 40,
            backgroundColor: color,
            borderRadius: "4px",
            border: "1px solid var(--rei-color-border)",
          }}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Custom Presets</div>
        <ColorPicker
          value="#ef4444"
          onChange={() => {}}
          presetColors={["#ef4444", "#22c55e", "#3b82f6", "#8b5cf6"]}
        />
      </div>
    </div>
  );
}

function getFillBackground(fill: FillValue): string {
  switch (fill.type) {
    case "solid": {
      return fill.color.hex;
    }
    case "gradient": {
      const stops = fill.gradient.stops.map((s) => `${s.color.hex} ${s.position}%`).join(", ");
      return `linear-gradient(${fill.gradient.angle}deg, ${stops})`;
    }
    case "image": {
      if (fill.image.url) {
        return `url(${fill.image.url})`;
      }
      return "#808080";
    }
    case "pattern": {
      if (fill.pattern.sourceUrl) {
        return `url(${fill.pattern.sourceUrl})`;
      }
      return "#808080";
    }
    case "video": {
      return "#1a1a2e";
    }
  }
}

function getGradientBackground(gradient: GradientValue): string {
  const stops = gradient.stops.map((s) => `${s.color.hex} ${s.position}%`).join(", ");
  return `linear-gradient(${gradient.angle}deg, ${stops})`;
}

function GradientEditorDemo() {
  const [gradient, setGradient] = useState<GradientValue>(createDefaultGradient());

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>GradientEditor</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic</div>
        <div style={{ width: 280 }}>
          <GradientEditor value={gradient} onChange={setGradient} />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Preview</div>
        <div
          style={{
            width: 280,
            height: 80,
            borderRadius: "4px",
            background: getGradientBackground(gradient),
            border: "1px solid var(--rei-color-border)",
          }}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Disabled</div>
        <div style={{ width: 280 }}>
          <GradientEditor value={gradient} onChange={() => {}} disabled />
        </div>
      </div>
    </div>
  );
}

function FillEditorDemo() {
  const [fill, setFill] = useState<FillValue>({
    type: "solid",
    color: { hex: "#3b82f6", opacity: 100, visible: true },
  });

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>FillEditor</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Solid/Gradient Toggle</div>
        <div style={{ width: 280 }}>
          <FillEditor value={fill} onChange={setFill} />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Preview</div>
        <div
          style={{
            width: 280,
            height: 80,
            borderRadius: "4px",
            background: getFillBackground(fill),
            border: "1px solid var(--rei-color-border)",
          }}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Current State</div>
        <div style={{
          backgroundColor: "var(--rei-color-surface, #1e1f24)",
          borderRadius: "4px",
          padding: "12px",
          fontSize: "11px",
          fontFamily: "monospace",
          color: "var(--rei-color-text-muted)",
          whiteSpace: "pre-wrap",
        }}>
          {JSON.stringify(fill, null, 2)}
        </div>
      </div>
    </div>
  );
}

function ColorInputDemo() {
  const [colorValue, setColorValue] = useState<ColorValue>({
    hex: "#3b82f6",
    opacity: 100,
    visible: true,
  });

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>ColorInput</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic</div>
        <ColorInput value={colorValue} onChange={setColorValue} />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Remove Button</div>
        <ColorInput
          value={{ hex: "#ef4444", opacity: 75, visible: true }}
          onChange={() => {}}
          showRemove
          onRemove={() => alert("Remove clicked")}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Without Visibility Toggle</div>
        <ColorInput
          value={{ hex: "#22c55e", opacity: 100, visible: true }}
          onChange={() => {}}
          showVisibilityToggle={false}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Sizes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <ColorInput
            value={{ hex: "#8b5cf6", opacity: 100, visible: true }}
            onChange={() => {}}
            size="sm"
          />
          <ColorInput
            value={{ hex: "#8b5cf6", opacity: 100, visible: true }}
            onChange={() => {}}
            size="md"
          />
          <ColorInput
            value={{ hex: "#8b5cf6", opacity: 100, visible: true }}
            onChange={() => {}}
            size="lg"
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Disabled</div>
        <ColorInput
          value={{ hex: "#6b7280", opacity: 50, visible: false }}
          onChange={() => {}}
          disabled
        />
      </div>
    </div>
  );
}

function PropertyGridDemo() {
  const [xValue, setXValue] = useState("0");
  const [yValue, setYValue] = useState("0");
  const [widthValue, setWidthValue] = useState("1920");
  const [heightValue, setHeightValue] = useState("1080");
  const [rotateValue, setRotateValue] = useState("0");

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>PropertyGrid</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>2 Column (Default)</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", padding: "8px" }}>
          <PropertyGrid>
            <PropertyGridItem>
              <Input value={xValue} onChange={setXValue} prefix="X" aria-label="X position" />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value={yValue} onChange={setYValue} prefix="Y" aria-label="Y position" />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value={widthValue} onChange={setWidthValue} prefix="W" aria-label="Width" />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value={heightValue} onChange={setHeightValue} prefix="H" aria-label="Height" />
            </PropertyGridItem>
          </PropertyGrid>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Full Span Item</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", padding: "8px" }}>
          <PropertyGrid>
            <PropertyGridItem span="full">
              <Input
                value={rotateValue}
                onChange={setRotateValue}
                prefix={<RotateIcon />}
                suffix="°"
                aria-label="Rotation"
              />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value="100" onChange={() => {}} suffix="%" aria-label="Scale X" />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value="100" onChange={() => {}} suffix="%" aria-label="Scale Y" />
            </PropertyGridItem>
          </PropertyGrid>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>4 Columns</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", padding: "8px" }}>
          <PropertyGrid columns={4}>
            <PropertyGridItem>
              <Input value="0" onChange={() => {}} prefix="T" aria-label="Top" />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value="0" onChange={() => {}} prefix="R" aria-label="Right" />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value="0" onChange={() => {}} prefix="B" aria-label="Bottom" />
            </PropertyGridItem>
            <PropertyGridItem>
              <Input value="0" onChange={() => {}} prefix="L" aria-label="Left" />
            </PropertyGridItem>
          </PropertyGrid>
        </div>
      </div>
    </div>
  );
}

function PropertySectionDemo() {
  const [expanded1, setExpanded1] = useState(true);
  const [expanded2, setExpanded2] = useState(true);

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>PropertySection</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic Section</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <PropertySection title="Properties">
            <PropertyRow label="Name">MyComponent</PropertyRow>
            <PropertyRow label="Type">UIView</PropertyRow>
          </PropertySection>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Collapsible</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <PropertySection
            title="Layout"
            collapsible
            expanded={expanded1}
            onToggle={setExpanded1}
          >
            <PropertyGrid>
              <PropertyGridItem>
                <Input value="0" onChange={() => {}} prefix="X" aria-label="X" />
              </PropertyGridItem>
              <PropertyGridItem>
                <Input value="0" onChange={() => {}} prefix="Y" aria-label="Y" />
              </PropertyGridItem>
            </PropertyGrid>
          </PropertySection>
          <PropertySection
            title="Appearance"
            collapsible
            expanded={expanded2}
            onToggle={setExpanded2}
          >
            <ColorInput
              value={{ hex: "#3b82f6", opacity: 100, visible: true }}
              onChange={() => {}}
            />
          </PropertySection>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Action</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px" }}>
          <PropertySection
            title="Effects"
            collapsible
            action={<Button size="sm" variant="ghost">+ Add</Button>}
          >
            <div style={{ color: "var(--rei-color-text-muted)", fontSize: "12px" }}>
              No effects applied
            </div>
          </PropertySection>
        </div>
      </div>
    </div>
  );
}

// Panel Demo
function PanelDemo() {
  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>Panel</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic Panel</div>
        <Panel title="Settings" onClose={() => alert("Close clicked")}>
          <div style={{ color: "var(--rei-color-text)", fontSize: "12px" }}>
            Panel content goes here
          </div>
        </Panel>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Without Close Button</div>
        <Panel title="Information" width={280}>
          <PropertyRow label="Name">Component</PropertyRow>
          <PropertyRow label="Type">UIView</PropertyRow>
        </Panel>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Custom Width</div>
        <Panel title="Wide Panel" width={400} onClose={() => {}}>
          <div style={{ color: "var(--rei-color-text)", fontSize: "12px" }}>
            This panel has a custom width of 400px
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ImageSelect Demo
function WidthProfilePreview({ variant = "uniform" }: { variant?: "uniform" | "taper" }) {
  return (
    <div style={{ width: "100%", height: "8px", display: "flex", alignItems: "center" }}>
      <svg width="100%" height="8" viewBox="0 0 160 8" preserveAspectRatio="none">
        <path
          d={variant === "uniform" ? "M0 4 L160 4" : "M0 4 Q40 2 80 4 Q120 6 160 4"}
          fill="none"
          stroke="currentColor"
          strokeWidth={variant === "uniform" ? "4" : "3"}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function getBrushDemoPath(type: "smooth" | "rough"): string {
  if (type === "rough") {
    return "M0 12 Q10 8 20 12 Q30 16 40 12 Q50 8 60 12 Q70 16 80 12 Q90 8 100 12 Q110 16 120 12 Q130 8 140 12 Q150 16 160 12 Q170 8 180 12 Q190 16 200 12";
  }
  return "M0 12 Q50 6 100 12 Q150 18 200 12";
}

function BrushPreviewDemo({ type = "smooth" }: { type?: "smooth" | "rough" }) {
  return (
    <div style={{ width: "100%", height: "24px", display: "flex", alignItems: "center" }}>
      <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none">
        <path
          d={getBrushDemoPath(type)}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function ImageSelectDemo() {
  const [widthProfile, setWidthProfile] = useState("uniform");
  const [brushType, setBrushType] = useState("smooth");
  const [selectedFruit, setSelectedFruit] = useState("apple");

  const widthOptions: ImageSelectOption<string>[] = [
    { value: "uniform", image: <WidthProfilePreview variant="uniform" /> },
    { value: "taper", image: <WidthProfilePreview variant="taper" /> },
  ];

  const brushOptions: ImageSelectOption<string>[] = [
    { value: "smooth", image: <BrushPreviewDemo type="smooth" /> },
    { value: "rough", image: <BrushPreviewDemo type="rough" /> },
  ];

  const fruitOptions: ImageSelectOption<string>[] = [
    { value: "apple", label: "Apple", image: <span style={{ fontSize: "20px" }}>&#127822;</span> },
    { value: "banana", label: "Banana", image: <span style={{ fontSize: "20px" }}>&#127820;</span> },
    { value: "cherry", label: "Cherry", image: <span style={{ fontSize: "20px" }}>&#127826;</span> },
  ];

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>ImageSelect</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Width Profile (Image Only)</div>
        <div style={{ width: "200px" }}>
          <ImageSelect
            options={widthOptions}
            value={widthProfile}
            onChange={setWidthProfile}
            aria-label="Width profile"
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Brush Type (Large Preview)</div>
        <div style={{ width: "250px" }}>
          <ImageSelect
            options={brushOptions}
            value={brushType}
            onChange={setBrushType}
            size="lg"
            aria-label="Brush type"
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Icon and Label</div>
        <div style={{ width: "200px" }}>
          <ImageSelect
            options={fruitOptions}
            value={selectedFruit}
            onChange={setSelectedFruit}
            aria-label="Select fruit"
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Disabled</div>
        <div style={{ width: "200px" }}>
          <ImageSelect
            options={widthOptions}
            value="uniform"
            onChange={() => {}}
            disabled
            aria-label="Disabled select"
          />
        </div>
      </div>
    </div>
  );
}

// Tooltip Demo
function TooltipDemo() {
  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>Tooltip</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic Tooltip</div>
        <div style={demoRowStyle}>
          <Tooltip content="Click to play">
            <IconButton icon={<PlayIcon />} aria-label="Play" />
          </Tooltip>
          <Tooltip content="Pause playback">
            <IconButton icon={<PauseIcon />} aria-label="Pause" />
          </Tooltip>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Placement</div>
        <div style={demoRowStyle}>
          <Tooltip content="Top tooltip" placement="top">
            <Button size="sm">Top</Button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" placement="bottom">
            <Button size="sm">Bottom</Button>
          </Tooltip>
          <Tooltip content="Left tooltip" placement="left">
            <Button size="sm">Left</Button>
          </Tooltip>
          <Tooltip content="Right tooltip" placement="right">
            <Button size="sm">Right</Button>
          </Tooltip>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Custom Delay</div>
        <div style={demoRowStyle}>
          <Tooltip content="Instant (0ms)" delay={0}>
            <Button size="sm">Instant</Button>
          </Tooltip>
          <Tooltip content="Default (300ms)" delay={300}>
            <Button size="sm">Default</Button>
          </Tooltip>
          <Tooltip content="Slow (800ms)" delay={800}>
            <Button size="sm">Slow</Button>
          </Tooltip>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Disabled</div>
        <Tooltip content="This won't show" disabled>
          <Button size="sm">Disabled Tooltip</Button>
        </Tooltip>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Arrow Size</div>
        <div style={demoRowStyle}>
          <Tooltip content="Small arrow (4px)" arrowSize={4}>
            <Button size="sm">Small</Button>
          </Tooltip>
          <Tooltip content="Default arrow (6px)" arrowSize={6}>
            <Button size="sm">Default</Button>
          </Tooltip>
          <Tooltip content="Large arrow (10px)" arrowSize={10}>
            <Button size="sm">Large</Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

// TransformButtons Demo
function TransformButtonsDemo() {
  const handleAction = (actionId: string) => {
    console.log("Transform action:", actionId);
  };

  const fullGroups = [
    {
      id: "rotate",
      actions: [
        { id: "rotate-cw", icon: <LuRotateCw size={14} />, label: "Rotate 90° right" },
        { id: "rotate-ccw", icon: <LuRotateCcw size={14} />, label: "Rotate 90° left" },
      ],
    },
    {
      id: "flip",
      actions: [
        { id: "flip-h", icon: <LuFlipHorizontal size={14} />, label: "Flip horizontal" },
        { id: "flip-v", icon: <LuFlipVertical size={14} />, label: "Flip vertical" },
      ],
    },
    {
      id: "align",
      actions: [
        { id: "align-left", icon: <LuAlignStartVertical size={14} />, label: "Align left" },
        { id: "align-center-h", icon: <LuAlignCenterVertical size={14} />, label: "Align center" },
        { id: "align-right", icon: <LuAlignEndVertical size={14} />, label: "Align right" },
        { id: "align-top", icon: <LuAlignStartHorizontal size={14} />, label: "Align top" },
        { id: "align-center-v", icon: <LuAlignCenterHorizontal size={14} />, label: "Align middle" },
        { id: "align-bottom", icon: <LuAlignEndHorizontal size={14} />, label: "Align bottom" },
      ],
    },
  ];

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>TransformButtons</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Full Transform Toolbar (react-icons)</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", padding: "8px" }}>
          <TransformButtons groups={fullGroups} onAction={handleAction} />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Rotate Only</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", padding: "8px" }}>
          <TransformButtons
            groups={[
              {
                id: "rotate",
                actions: [
                  { id: "rotate-cw", icon: <LuRotateCw size={14} />, label: "Rotate 90° right" },
                  { id: "rotate-ccw", icon: <LuRotateCcw size={14} />, label: "Rotate 90° left" },
                ],
              },
            ]}
            onAction={handleAction}
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Flip Only</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", padding: "8px" }}>
          <TransformButtons
            groups={[
              {
                id: "flip",
                actions: [
                  { id: "flip-h", icon: <LuFlipHorizontal size={14} />, label: "Flip horizontal" },
                  { id: "flip-v", icon: <LuFlipVertical size={14} />, label: "Flip vertical" },
                ],
              },
            ]}
            onAction={handleAction}
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Custom Actions</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", padding: "8px" }}>
          <TransformButtons
            groups={[
              {
                id: "custom",
                actions: [
                  { id: "rotate-45", icon: <LuRotateCw size={14} />, label: "Rotate 45°" },
                  { id: "rotate-180", icon: <LuRotateCw size={14} />, label: "Rotate 180°" },
                ],
              },
              {
                id: "scale",
                actions: [
                  { id: "scale-up", icon: <span style={{ fontSize: 12 }}>+</span>, label: "Scale up" },
                  { id: "scale-down", icon: <span style={{ fontSize: 12 }}>-</span>, label: "Scale down" },
                ],
              },
            ]}
            onAction={handleAction}
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Different Sizes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", padding: "8px" }}>
            <TransformButtons
              groups={[
                {
                  id: "tools",
                  actions: [
                    { id: "rotate", icon: <LuRotateCw size={12} />, label: "Rotate" },
                    { id: "flip", icon: <LuFlipHorizontal size={12} />, label: "Flip" },
                  ],
                },
              ]}
              onAction={handleAction}
              size="sm"
            />
          </div>
          <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", padding: "8px" }}>
            <TransformButtons
              groups={[
                {
                  id: "tools",
                  actions: [
                    { id: "rotate", icon: <LuRotateCw size={14} />, label: "Rotate" },
                    { id: "flip", icon: <LuFlipHorizontal size={14} />, label: "Flip" },
                  ],
                },
              ]}
              onAction={handleAction}
              size="md"
            />
          </div>
          <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", padding: "8px" }}>
            <TransformButtons
              groups={[
                {
                  id: "tools",
                  actions: [
                    { id: "rotate", icon: <LuRotateCw size={18} />, label: "Rotate" },
                    { id: "flip", icon: <LuFlipHorizontal size={18} />, label: "Flip" },
                  ],
                },
              ]}
              onAction={handleAction}
              size="lg"
            />
          </div>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Disabled Action</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", padding: "8px" }}>
          <TransformButtons
            groups={[
              {
                id: "tools",
                actions: [
                  { id: "rotate", icon: <LuRotateCw size={14} />, label: "Rotate (enabled)" },
                  { id: "flip", icon: <LuFlipHorizontal size={14} />, label: "Flip (disabled)", disabled: true },
                ],
              },
            ]}
            onAction={handleAction}
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>All Disabled</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", padding: "8px" }}>
          <TransformButtons
            groups={[
              {
                id: "tools",
                actions: [
                  { id: "rotate", icon: <LuRotateCw size={14} />, label: "Rotate" },
                  { id: "flip", icon: <LuFlipHorizontal size={14} />, label: "Flip" },
                ],
              },
            ]}
            onAction={handleAction}
            disabled
          />
        </div>
      </div>
    </div>
  );
}

// StrokeSettingsPanel Demo
function StrokeSettingsPanelDemo() {
  // Legacy settings
  const [legacySettings, setLegacySettings] = useState<StrokeSettings>({
    tab: "basic",
    style: "solid",
    widthProfile: "uniform",
    join: "miter",
    miterAngle: "28.96",
    frequency: "75",
    wiggle: "30",
    smoothen: "50",
    brushType: "smooth",
    brushDirection: "right",
    brushWidthProfile: "uniform",
  });

  // Expanded panel settings
  const [expandedSettings, setExpandedSettings] = useState<StrokePanelExpandedSettings>(
    createDefaultExpandedSettings(),
  );

  // Compact panel settings
  const [compactSettings, setCompactSettings] = useState<StrokePanelCompactSettings>(
    createDefaultCompactSettings(),
  );

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>StrokeSettingsPanel</h2>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <div style={demoSectionStyle}>
          <div style={demoLabelStyle}>Expanded (all options visible)</div>
          <StrokePanelExpanded
            settings={expandedSettings}
            onChange={setExpandedSettings}
            onClose={() => alert("Close")}
          />
        </div>

        <div style={demoSectionStyle}>
          <div style={demoLabelStyle}>Compact (tabbed interface)</div>
          <StrokePanelCompact
            settings={compactSettings}
            onChange={setCompactSettings}
            onClose={() => alert("Close")}
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Legacy Panel (backward compatible)</div>
        <StrokeSettingsPanel
          settings={legacySettings}
          onChange={setLegacySettings}
          onClose={() => alert("Close")}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Expanded Settings</div>
        <div style={{
          backgroundColor: "var(--rei-color-surface, #1e1f24)",
          borderRadius: "4px",
          padding: "12px",
          fontSize: "11px",
          fontFamily: "monospace",
          color: "var(--rei-color-text-muted)",
          whiteSpace: "pre-wrap",
          maxHeight: "200px",
          overflow: "auto",
        }}>
          {JSON.stringify(expandedSettings, null, 2)}
        </div>
      </div>
    </div>
  );
}

// TypographyPanel Demo
const sampleFonts: FontItem[] = [
  { name: "SF Pro", family: "'SF Pro', -apple-system, sans-serif", category: "sans-serif" },
  { name: "SF Pro Rounded", family: "'SF Pro Rounded', sans-serif", category: "sans-serif" },
  { name: "Inter", family: "'Inter', sans-serif", category: "sans-serif" },
  { name: "Roboto", family: "'Roboto', sans-serif", category: "sans-serif" },
  { name: "Open Sans", family: "'Open Sans', sans-serif", category: "sans-serif" },
  { name: "Lato", family: "'Lato', sans-serif", category: "sans-serif" },
  { name: "Playfair Display", family: "'Playfair Display', serif", category: "serif" },
  { name: "Georgia", family: "'Georgia', serif", category: "serif" },
  { name: "Merriweather", family: "'Merriweather', serif", category: "serif" },
  { name: "Fira Code", family: "'Fira Code', monospace", category: "monospace" },
  { name: "JetBrains Mono", family: "'JetBrains Mono', monospace", category: "monospace" },
  { name: "Pacifico", family: "'Pacifico', cursive", category: "display" },
  { name: "Dancing Script", family: "'Dancing Script', cursive", category: "handwriting" },
  { name: "Caveat", family: "'Caveat', cursive", category: "handwriting" },
];

function renderFontsPanelSection(
  showFontsPanel: boolean,
  settings: TypographySettings,
  setSettings: (settings: TypographySettings) => void,
  setShowFontsPanel: (show: boolean) => void,
) {
  if (!showFontsPanel) {
    return null;
  }
  return (
    <div style={demoSectionStyle}>
      <div style={demoLabelStyle}>FontsPanel (triggered from icon)</div>
      <FontsPanel
        fonts={sampleFonts}
        selectedFont={settings.fontFamily}
        onSelectFont={(font) => {
          setSettings({ ...settings, fontFamily: font });
        }}
        onClose={() => setShowFontsPanel(false)}
        onSettings={() => alert("Font settings clicked")}
      />
    </div>
  );
}

function TypographyPanelDemo() {
  const [settings, setSettings] = useState<TypographySettings>({
    fontFamily: "SF Pro",
    fontWeight: "400",
    fontSize: "28",
    lineHeight: "Auto",
    letterSpacing: "0px",
    textAlign: "left",
    verticalAlign: "top",
  });

  const [showFontsPanel, setShowFontsPanel] = useState(false);

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>TypographyPanel</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Complete Panel</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", width: 320 }}>
          <TypographyPanel
            settings={settings}
            onChange={setSettings}
            onOpenFontsPanel={() => setShowFontsPanel(true)}
            onOpenSettings={() => alert("Settings clicked")}
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Current Settings</div>
        <div style={{
          backgroundColor: "var(--rei-color-surface, #1e1f24)",
          borderRadius: "4px",
          padding: "12px",
          fontSize: "11px",
          fontFamily: "monospace",
          color: "var(--rei-color-text-muted)",
          whiteSpace: "pre-wrap",
        }}>
          {JSON.stringify(settings, null, 2)}
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Preview</div>
        <div
          style={{
            backgroundColor: "var(--rei-color-surface, #1e1f24)",
            borderRadius: "4px",
            padding: "24px",
            fontFamily: settings.fontFamily,
            fontWeight: Number(settings.fontWeight),
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight === "Auto" ? "normal" : settings.lineHeight,
            letterSpacing: settings.letterSpacing,
            textAlign: settings.textAlign,
            color: "var(--rei-color-text)",
          }}
        >
          The quick brown fox jumps over the lazy dog
        </div>
      </div>

      {renderFontsPanelSection(showFontsPanel, settings, setSettings, setShowFontsPanel)}
    </div>
  );
}

// PositionPanel Demo
function PositionPanelDemo() {
  const [settings, setSettings] = useState<PositionSettings>(createDefaultPositionSettings());

  const handleTransformAction = (action: string) => {
    console.log("Transform action:", action);
  };

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>PositionPanel</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Complete Panel</div>
        <PositionPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => alert("Close clicked")}
          onToggleConstraints={() => alert("Toggle constraints")}
          onTransformAction={handleTransformAction}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Current Settings</div>
        <div style={{
          backgroundColor: "var(--rei-color-surface, #1e1f24)",
          borderRadius: "4px",
          padding: "12px",
          fontSize: "11px",
          fontFamily: "monospace",
          color: "var(--rei-color-text-muted)",
          whiteSpace: "pre-wrap",
        }}>
          {JSON.stringify(settings, null, 2)}
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Without Close Button</div>
        <PositionPanel
          settings={{
            ...settings,
            x: "100",
            y: "200",
            rotation: "45",
          }}
          onChange={setSettings}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Custom Width</div>
        <PositionPanel
          settings={settings}
          onChange={setSettings}
          width={400}
        />
      </div>
    </div>
  );
}

// FontsPanel Demo
function FontsPanelDemo() {
  const [selectedFont, setSelectedFont] = useState("SF Pro");

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>FontsPanel</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic Panel</div>
        <FontsPanel
          fonts={sampleFonts}
          selectedFont={selectedFont}
          onSelectFont={setSelectedFont}
          onClose={() => alert("Close clicked")}
          onSettings={() => alert("Settings clicked")}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Selected: {selectedFont}</div>
        <div
          style={{
            backgroundColor: "var(--rei-color-surface, #1e1f24)",
            borderRadius: "4px",
            padding: "24px",
            fontFamily: sampleFonts.find((f) => f.name === selectedFont)?.family ?? "inherit",
            fontSize: "24px",
            color: "var(--rei-color-text)",
          }}
        >
          The quick brown fox jumps over the lazy dog
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Custom Size</div>
        <FontsPanel
          fonts={sampleFonts}
          selectedFont={selectedFont}
          onSelectFont={setSelectedFont}
          width={350}
          maxHeight={300}
        />
      </div>
    </div>
  );
}

// Simple JSON tokenizer for demo purposes
const jsonTokenizer: Tokenizer = {
  tokenize: (line: string): readonly Token[] => {
    const tokens: Token[] = [];
    // eslint-disable-next-line no-restricted-syntax -- Mutable accumulator for tokenizer position
    let pos = 0;

    while (pos < line.length) {
      // Skip whitespace
      if (/\s/.test(line[pos])) {
        const start = pos;
        while (pos < line.length && /\s/.test(line[pos])) {
          pos++;
        }
        tokens.push({ type: "whitespace", text: line.slice(start, pos), start, end: pos });
        continue;
      }

      // String
      if (line[pos] === '"') {
        const start = pos;
        pos++;
        while (pos < line.length && line[pos] !== '"') {
          if (line[pos] === '\\') {
            pos++;
          }
          pos++;
        }
        pos++;
        tokens.push({ type: "string", text: line.slice(start, pos), start, end: pos });
        continue;
      }

      // Number
      if (/[0-9-]/.test(line[pos])) {
        const start = pos;
        while (pos < line.length && /[0-9.eE+-]/.test(line[pos])) {
          pos++;
        }
        tokens.push({ type: "number", text: line.slice(start, pos), start, end: pos });
        continue;
      }

      // Keywords: true, false, null
      const remaining = line.slice(pos);
      const keywordMatch = remaining.match(/^(true|false|null)/);
      if (keywordMatch) {
        tokens.push({ type: "keyword", text: keywordMatch[0], start: pos, end: pos + keywordMatch[0].length });
        pos += keywordMatch[0].length;
        continue;
      }

      // Punctuation
      if (/[{}[\]:,]/.test(line[pos])) {
        tokens.push({ type: "punctuation", text: line[pos], start: pos, end: pos + 1 });
        pos++;
        continue;
      }

      // Unknown
      tokens.push({ type: "unknown", text: line[pos], start: pos, end: pos + 1 });
      pos++;
    }

    return tokens;
  },
};

const jsonTokenStyles = {
  string: { color: "#a31515" },
  number: { color: "#098658" },
  keyword: { color: "#0000ff" },
  punctuation: { color: "#333333" },
  whitespace: {},
  unknown: { color: "#666666" },
};

const sampleJson = `{
  "name": "react-editor-ui",
  "version": "1.0.0",
  "description": "UI components for editor applications",
  "features": [
    "syntax highlighting",
    "IME support",
    "virtual scrolling"
  ],
  "count": 42,
  "active": true,
  "nullable": null
}`;

const sampleText = `The quick brown fox jumps over the lazy dog.

This is a demonstration of the TextEditor component with rich text support.

You can apply different styles to different parts of the text.`;

const sampleTextStyles: readonly TextStyleSegment[] = [
  { start: 0, end: 3, style: { fontWeight: "bold" } },
  { start: 4, end: 9, style: { color: "#a52a2a", fontWeight: "bold" } },
  { start: 10, end: 15, style: { color: "#8b4513", fontSize: "18px" } },
  { start: 16, end: 19, style: { fontStyle: "italic" } },
  { start: 20, end: 25, style: { fontSize: "10px", color: "#666666" } },
  { start: 47, end: 51, style: { fontWeight: "bold", fontSize: "16px" } },
  { start: 74, end: 84, style: { fontWeight: "bold", color: "#0066cc" } },
  { start: 125, end: 142, style: { textDecoration: "underline" } },
  { start: 143, end: 148, style: { fontFamily: "Georgia, serif", fontStyle: "italic" } },
];

function CodeEditorDemo() {
  const [code, setCode] = useState(sampleJson);
  const [renderer, setRenderer] = useState<"svg" | "canvas">("svg");

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>CodeEditor</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Renderer</div>
        <div style={demoRowStyle}>
          <Button
            variant={renderer === "svg" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setRenderer("svg")}
          >
            SVG
          </Button>
          <Button
            variant={renderer === "canvas" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setRenderer("canvas")}
          >
            Canvas
          </Button>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With JSON Tokenizer</div>
        <CodeEditor
          value={code}
          onChange={setCode}
          tokenizer={jsonTokenizer}
          tokenStyles={jsonTokenStyles}
          renderer={renderer}
          showLineNumbers
          style={{
            height: 300,
            border: "1px solid var(--rei-color-border, #3a3a3c)",
            borderRadius: 4,
          }}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Read Only</div>
        <CodeEditor
          value={code}
          onChange={() => {}}
          tokenizer={jsonTokenizer}
          tokenStyles={jsonTokenStyles}
          renderer={renderer}
          showLineNumbers
          readOnly
          style={{
            height: 200,
            border: "1px solid var(--rei-color-border, #3a3a3c)",
            borderRadius: 4,
            opacity: 0.8,
          }}
        />
      </div>
    </div>
  );
}

function TextEditorDemo() {
  const [text, setText] = useState(sampleText);
  const [renderer, setRenderer] = useState<"svg" | "canvas">("svg");

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>TextEditor</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Renderer</div>
        <div style={demoRowStyle}>
          <Button
            variant={renderer === "svg" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setRenderer("svg")}
          >
            SVG
          </Button>
          <Button
            variant={renderer === "canvas" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setRenderer("canvas")}
          >
            Canvas
          </Button>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>With Rich Text Styles</div>
        <TextEditor
          value={text}
          onChange={setText}
          styles={sampleTextStyles}
          renderer={renderer}
          style={{
            height: 200,
            border: "1px solid var(--rei-color-border, #3a3a3c)",
            borderRadius: 4,
          }}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Plain Text (no styles)</div>
        <TextEditor
          value={text}
          onChange={setText}
          renderer={renderer}
          style={{
            height: 150,
            border: "1px solid var(--rei-color-border, #3a3a3c)",
            borderRadius: 4,
          }}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Read Only</div>
        <TextEditor
          value={text}
          onChange={() => {}}
          styles={sampleTextStyles}
          renderer={renderer}
          readOnly
          style={{
            height: 150,
            border: "1px solid var(--rei-color-border, #3a3a3c)",
            borderRadius: 4,
            opacity: 0.8,
          }}
        />
      </div>
    </div>
  );
}

// ========================================
// CANVAS
// ========================================

function CanvasDemo() {
  const [viewport, setViewport] = useState<ViewportState>({ x: -50, y: -150, scale: 1 });

  // Fixed guide positions (like dragging from ruler in Figma)
  const guides = [
    { orientation: "horizontal" as const, position: -134 },
    { orientation: "vertical" as const, position: 50 },
  ];

  return (
    <div style={demoContainerStyle}>
      <h2>Canvas</h2>
      <p style={{ color: "var(--rei-color-text-muted)" }}>
        Pan/zoom canvas for placing elements. Pan: middle mouse, Alt+left click, Space+left click.
        Zoom: mouse wheel or pinch.
      </p>

      <div style={demoSectionStyle}>
        <h3>Basic Canvas</h3>
        <div style={{ display: "flex", gap: 16 }}>
          <Canvas
            viewport={viewport}
            onViewportChange={setViewport}
            width={600}
            height={400}
            showGrid
            gridSize={50}
          >
            <CanvasContent x={100} y={100}>
              <div
                style={{
                  width: 200,
                  height: 150,
                  background: "var(--rei-color-primary)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                Drag me (pan)
              </div>
            </CanvasContent>
            <CanvasContent x={350} y={200}>
              <div
                style={{
                  width: 120,
                  height: 120,
                  background: "var(--rei-color-success)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                Circle
              </div>
            </CanvasContent>
          </Canvas>
          <div style={{ flex: "0 0 200px" }}>
            <h4 style={{ margin: "0 0 8px" }}>Viewport State</h4>
            <div style={{ fontSize: 12, color: "var(--rei-color-text-muted)" }}>
              <div>X: {viewport.x.toFixed(1)}</div>
              <div>Y: {viewport.y.toFixed(1)}</div>
              <div>Scale: {(viewport.scale * 100).toFixed(0)}%</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewport({ x: 0, y: 0, scale: 1 })}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div style={demoSectionStyle}>
        <h3>With Rulers, Guides, and Checkerboard (Figma-style)</h3>
        <p style={{ color: "var(--rei-color-text-muted)", marginBottom: 12 }}>
          Complete canvas with rulers, fixed guide lines, and checkerboard background.
          Guides are drawn at fixed positions (Y=-134, X=50).
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Horizontal ruler row */}
          <div style={{ display: "flex" }}>
            <CanvasRulerCorner size={20} />
            <CanvasHorizontalRuler viewport={viewport} width={600} />
          </div>
          {/* Canvas row with vertical ruler */}
          <div style={{ display: "flex" }}>
            <CanvasVerticalRuler viewport={viewport} height={400} />
            <Canvas
              viewport={viewport}
              onViewportChange={setViewport}
              width={600}
              height={400}
              svgLayers={
                <>
                  <CanvasCheckerboard size={8} />
                  <CanvasGridLayer minorSize={10} majorSize={100} showOrigin />
                  <CanvasGuides guides={guides} />
                </>
              }
            >
                <CanvasContent x={100} y={100}>
                  <div
                    style={{
                      width: 200,
                      height: 150,
                      background: "var(--rei-color-primary)",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    Element at (100, 100)
                  </div>
                </CanvasContent>
                <CanvasContent x={0} y={0}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      background: "var(--rei-color-error)",
                      borderRadius: "50%",
                      transform: "translate(-5px, -5px)",
                    }}
                    title="Origin (0, 0)"
                  />
                </CanvasContent>
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

export const demoCategories: DemoCategory[] = [
  {
    id: "primitives",
    label: "Primitives",
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
        id: "image-select",
        label: "ImageSelect",
        path: "image-select",
        element: <ImageSelectDemo />,
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
    ],
  },
  {
    id: "editor",
    label: "Editor",
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
