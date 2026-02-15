/**
 * @file Demo route configuration
 */

import type { ReactNode } from "react";
import { useState } from "react";
import {
  IconButton,
  Button,
  Input,
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
  Select,
  StatusBar,
  StatusBarItem,
  LogEntry,
  Panel,
  ImageSelect,
  StrokeSettingsPanel,
  GradientEditor,
  FillEditor,
  createDefaultGradient,
} from "../components";
import type {
  ColorValue,
  StrokeSettings,
  ImageSelectOption,
  GradientValue,
  FillValue,
} from "../components";

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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Variants</div>
        <div style={demoRowStyle}>
          <IconButton icon={<PlayIcon />} aria-label="Play" variant="default" />
          <IconButton icon={<PlayIcon />} aria-label="Play" variant="ghost" />
          <IconButton icon={<PlayIcon />} aria-label="Play" variant="filled" />
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
  if (fill.type === "solid") {
    return fill.color.hex;
  }
  const stops = fill.gradient.stops.map((s) => `${s.color.hex} ${s.position}%`).join(", ");
  return `linear-gradient(${fill.gradient.angle}deg, ${stops})`;
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

// StrokeSettingsPanel Demo
function StrokeSettingsPanelDemo() {
  const [settings, setSettings] = useState<StrokeSettings>({
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

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>StrokeSettingsPanel</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Complete Panel</div>
        <StrokeSettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => alert("Panel closed")}
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
        id: "select",
        label: "Select",
        path: "select",
        element: <SelectDemo />,
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
];
