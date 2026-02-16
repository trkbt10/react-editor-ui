/**
 * @file Toolbar demo page
 */

import {
  demoContainerStyle,
  demoSectionStyle,
  demoLabelStyle,
} from "../../components";
import {
  PlayIcon,
  PauseIcon,
  SearchIcon,
  CursorIcon,
  GridIcon,
  RectangleIcon,
  PenToolIcon,
  TextIcon,
  CommentIcon,
  ComponentsIcon,
  DrawIcon,
  DevModeIcon,
  CodeIcon,
} from "../../components";
import { IconButton } from "../../../components/IconButton/IconButton";
import { Button } from "../../../components/Button/Button";
import { Badge } from "../../../components/Badge/Badge";
import { Toolbar } from "../../../components/Toolbar/Toolbar";
import { ToolbarGroup } from "../../../components/Toolbar/ToolbarGroup";
import { ToolbarDivider } from "../../../components/Toolbar/ToolbarDivider";

export function ToolbarDemo() {
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
