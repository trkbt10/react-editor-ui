/**
 * @file Design Demo - Figma-like design tool interface
 */

import { useState, useMemo, useCallback, useRef, useEffect, memo, type CSSProperties, type ReactNode } from "react";
import {
  GridLayout,
  type PanelLayoutConfig,
  type LayerDefinition,
} from "react-panel-layout";
import {
  LuSquare,
  LuCircle,
  LuType,
  LuPenTool,
  LuFrame,
  LuMinus,
  LuHand,
  LuMousePointer2,
  LuX,
  LuHouse,
  LuMenu,
  LuSearch,
  LuChevronDown,
  LuPlus,
  LuSettings2,
  LuComponent,
  LuPencil,
  LuCode,
  LuCircleHelp,
} from "react-icons/lu";

import { Canvas } from "../../../canvas/Canvas/Canvas";
import { CanvasGridLayer } from "../../../canvas/CanvasGridLayer/CanvasGridLayer";
import {
  CanvasHorizontalRuler,
  CanvasVerticalRuler,
  CanvasRulerCorner,
} from "../../../canvas/CanvasRuler/CanvasRuler";
import { BoundingBox, type HandlePosition } from "../../../canvas/BoundingBox/BoundingBox";

import { TabBar } from "../../../components/TabBar/TabBar";
import { PropertySection } from "../../../components/PropertySection/PropertySection";
import { PropertyRow } from "../../../components/PropertyRow/PropertyRow";
import { LayerItem } from "../../../components/LayerItem/LayerItem";
import { Toolbar } from "../../../components/Toolbar/Toolbar";
import { ToolbarGroup } from "../../../components/Toolbar/ToolbarGroup";
import { ToolbarDivider } from "../../../components/Toolbar/ToolbarDivider";
import { IconButton } from "../../../components/IconButton/IconButton";
import { Button } from "../../../components/Button/Button";
import { ColorInput, type ColorValue } from "../../../components/ColorInput/ColorInput";
import { Input } from "../../../components/Input/Input";
import { Tooltip } from "../../../components/Tooltip/Tooltip";
import { SectionHeader } from "../../../components/SectionHeader/SectionHeader";
import { ProjectMenu } from "../../../components/ProjectMenu/ProjectMenu";

import type { ViewportState } from "../../../canvas/core/types";
import {
  designLayers,
  designTools,
  type DesignLayer,
} from "./mockData";
import {
  FrameLayerIcon,
  TextLayerIcon,
  EllipseLayerIcon,
  RectangleLayerIcon,
  GroupLayerIcon,
} from "../../components/DemoIcons";

// =====================================================================
// Types
// =====================================================================

type TransformState = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

// =====================================================================
// Utilities
// =====================================================================

function createLayerMap(layers: DesignLayer[]): Map<string, DesignLayer> {
  return new Map(layers.map((l) => [l.id, l]));
}

function createChildrenMap(layers: DesignLayer[]): Map<string | null, DesignLayer[]> {
  const map = new Map<string | null, DesignLayer[]>();
  for (const layer of layers) {
    const children = map.get(layer.parentId) ?? [];
    children.push(layer);
    map.set(layer.parentId, children);
  }
  for (const [, children] of map) {
    children.sort((a, b) => a.order - b.order);
  }
  return map;
}

function getDepthWithMap(id: string, layerMap: Map<string, DesignLayer>): number {
  const layer = layerMap.get(id);
  if (!layer || !layer.parentId) {
    return 0;
  }
  return getDepthWithMap(layer.parentId, layerMap) + 1;
}

function getVisibleLayersOrdered(
  childrenMap: Map<string | null, DesignLayer[]>,
  expandedIds: Set<string>,
  parentId: string | null = null,
): DesignLayer[] {
  const result: DesignLayer[] = [];
  const children = childrenMap.get(parentId) ?? [];
  for (const child of children) {
    result.push(child);
    if (expandedIds.has(child.id)) {
      result.push(...getVisibleLayersOrdered(childrenMap, expandedIds, child.id));
    }
  }
  return result;
}

function getLayerIcon(type: DesignLayer["type"]) {
  switch (type) {
    case "frame": return <FrameLayerIcon />;
    case "rectangle": return <RectangleLayerIcon />;
    case "ellipse": return <EllipseLayerIcon />;
    case "text": return <TextLayerIcon />;
    case "group": return <GroupLayerIcon />;
    case "image": return <RectangleLayerIcon />;
  }
}

function canHaveChildren(type: DesignLayer["type"]): boolean {
  return type === "frame" || type === "group";
}

function applyResize(
  state: TransformState,
  handle: HandlePosition,
  deltaX: number,
  deltaY: number,
): TransformState {
  const { x, y, width, height, rotation } = state;
  const rad = (-rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const localDX = deltaX * cos - deltaY * sin;
  const localDY = deltaX * sin + deltaY * cos;

  switch (handle) {
    case "top-left":
      return { ...state, x: x + localDX, y: y + localDY, width: Math.max(20, width - localDX), height: Math.max(20, height - localDY) };
    case "top":
      return { ...state, y: y + localDY, height: Math.max(20, height - localDY) };
    case "top-right":
      return { ...state, y: y + localDY, width: Math.max(20, width + localDX), height: Math.max(20, height - localDY) };
    case "right":
      return { ...state, width: Math.max(20, width + localDX) };
    case "bottom-right":
      return { ...state, width: Math.max(20, width + localDX), height: Math.max(20, height + localDY) };
    case "bottom":
      return { ...state, height: Math.max(20, height + localDY) };
    case "bottom-left":
      return { ...state, x: x + localDX, width: Math.max(20, width - localDX), height: Math.max(20, height + localDY) };
    case "left":
      return { ...state, x: x + localDX, width: Math.max(20, width - localDX) };
    default:
      return state;
  }
}

// =====================================================================
// Top File Tab Bar Component
// =====================================================================

const FileTabBar = memo(function FileTabBar() {
  const tabBarStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: 40,
    backgroundColor: "var(--rei-color-surface)",
    borderBottom: "1px solid var(--rei-color-border)",
    padding: "0 8px",
    gap: 4,
  };

  return (
    <div style={tabBarStyle}>
      <IconButton icon={<LuHouse size={16} />} aria-label="Home" size="sm" variant="ghost" />
      <IconButton icon={<LuMenu size={16} />} aria-label="Menu" size="sm" variant="ghost" />
      <div style={{ width: 1, height: 20, backgroundColor: "var(--rei-color-border)", margin: "0 4px" }} />
      <TabBar
        tabs={[{ id: "appicon", label: "App Icon Template", closable: true }]}
        activeTab="appicon"
        onChange={() => {}}
        onClose={() => {}}
        variant="files"
        size="sm"
      />
      <div style={{ marginLeft: "auto" }}>
        <IconButton icon={<LuPlus size={16} />} aria-label="New tab" size="sm" variant="ghost" />
      </div>
    </div>
  );
});

// =====================================================================
// Sidebar Component
// =====================================================================

type SidebarProps = {
  sidebarTab: string;
  onSidebarTabChange: (tab: string) => void;
  layers: DesignLayer[];
  expandedIds: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onVisibilityChange: (id: string, visible: boolean) => void;
  onLockChange: (id: string, locked: boolean) => void;
};

// Memoized wrapper for LayerItem to avoid inline function creation in map
type LayerItemWrapperProps = {
  layer: DesignLayer;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  selected: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onVisibilityChange: (id: string, visible: boolean) => void;
  onLockChange: (id: string, locked: boolean) => void;
};

const LayerItemWrapper = memo(function LayerItemWrapper({
  layer,
  depth,
  hasChildren,
  expanded,
  selected,
  onToggle,
  onSelect,
  onVisibilityChange,
  onLockChange,
}: LayerItemWrapperProps) {
  const handleToggle = useCallback(() => onToggle(layer.id), [onToggle, layer.id]);
  const handlePointerDown = useCallback(() => onSelect(layer.id), [onSelect, layer.id]);
  const handleVisibilityChange = useCallback(
    (visible: boolean) => onVisibilityChange(layer.id, visible),
    [onVisibilityChange, layer.id],
  );
  const handleLockChange = useCallback(
    (locked: boolean) => onLockChange(layer.id, locked),
    [onLockChange, layer.id],
  );

  const isContainer = canHaveChildren(layer.type);

  return (
    <LayerItem
      id={layer.id}
      label={layer.label}
      icon={getLayerIcon(layer.type)}
      depth={depth}
      hasChildren={hasChildren}
      expanded={expanded}
      onToggle={handleToggle}
      selected={selected}
      onPointerDown={handlePointerDown}
      visible={layer.visible}
      onVisibilityChange={handleVisibilityChange}
      locked={layer.locked}
      onLockChange={handleLockChange}
      canHaveChildren={isContainer}
    />
  );
});

const sidebarStyle: CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "var(--rei-color-surface)",
  borderRight: "1px solid var(--rei-color-border)",
};

const sidebarToolbarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "8px",
  gap: 4,
};

const SIDEBAR_PAGES = [
  { id: "cover", label: "Cover" },
  { id: "appicon", label: "App Icon Template" },
] as const;

const Sidebar = memo(function Sidebar({
  sidebarTab,
  onSidebarTabChange,
  layers,
  expandedIds,
  selectedId,
  onToggle,
  onSelect,
  onVisibilityChange,
  onLockChange,
}: SidebarProps) {
  const layerMap = useMemo(() => createLayerMap(layers), [layers]);
  const childrenMap = useMemo(() => createChildrenMap(layers), [layers]);
  const visibleLayers = useMemo(
    () => getVisibleLayersOrdered(childrenMap, expandedIds),
    [childrenMap, expandedIds],
  );

  // Pre-compute layer metadata to avoid recalculation in render
  const layerMetadata = useMemo(() => {
    const metadata = new Map<string, { depth: number; hasChildren: boolean }>();
    for (const layer of visibleLayers) {
      metadata.set(layer.id, {
        depth: getDepthWithMap(layer.id, layerMap),
        hasChildren: (childrenMap.get(layer.id)?.length ?? 0) > 0,
      });
    }
    return metadata;
  }, [visibleLayers, layerMap, childrenMap]);

  return (
    <div style={sidebarStyle}>
      {/* Toolbar icons */}
      <div style={sidebarToolbarStyle}>
        <IconButton icon={<LuMenu size={14} />} aria-label="Menu" size="sm" variant="ghost" />
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <IconButton icon={<span style={{ fontSize: 11, fontWeight: 600 }}>Ai</span>} aria-label="AI" size="sm" variant="ghost" />
          <IconButton icon={<LuComponent size={14} />} aria-label="Components" size="sm" variant="ghost" />
        </div>
      </div>

      {/* Project dropdown */}
      <ProjectMenu
        name="App Icon Template"
        badges={[
          { label: "Drafts" },
          { label: "Free", variant: "accent" },
        ]}
        onClick={() => {}}
      />

      {/* File/Assets tabs */}
      <TabBar
        tabs={[
          { id: "file", label: "File" },
          { id: "assets", label: "Assets" },
        ]}
        activeTab={sidebarTab}
        onChange={onSidebarTabChange}
        size="sm"
        fullWidth
      />

      {sidebarTab === "file" ? (
        <>
          {/* Pages section */}
          <SectionHeader
            title="Pages"
            action={<IconButton icon={<LuPlus size={12} />} aria-label="Add page" size="sm" variant="ghost" />}
          />
          <div style={{ padding: "0 4px" }}>
            {SIDEBAR_PAGES.map((page) => (
              <div
                key={page.id}
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  color: page.id === "appicon" ? "var(--rei-color-text)" : "var(--rei-color-text-muted)",
                  backgroundColor: page.id === "appicon" ? "var(--rei-color-selected)" : "transparent",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {page.label}
              </div>
            ))}
          </div>

          {/* Layers section */}
          <SectionHeader
            title="Layers"
            action={<IconButton icon={<LuSettings2 size={12} />} aria-label="Layer settings" size="sm" variant="ghost" />}
          />
          <div style={{ flex: 1, overflow: "auto", padding: "0 4px" }}>
            {visibleLayers.map((layer) => {
              const meta = layerMetadata.get(layer.id)!;
              return (
                <LayerItemWrapper
                  key={layer.id}
                  layer={layer}
                  depth={meta.depth}
                  hasChildren={meta.hasChildren}
                  expanded={expandedIds.has(layer.id)}
                  selected={selectedId === layer.id}
                  onToggle={onToggle}
                  onSelect={onSelect}
                  onVisibilityChange={onVisibilityChange}
                  onLockChange={onLockChange}
                />
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ padding: 16, fontSize: 11, color: "var(--rei-color-text-muted)", textAlign: "center" }}>
          <LuSearch size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
          <div>Search for components</div>
        </div>
      )}
    </div>
  );
});

// =====================================================================
// Inspector Component
// =====================================================================

type InspectorProps = {
  inspectorTab: string;
  onInspectorTabChange: (tab: string) => void;
  selectedLayer: DesignLayer | null;
  fillColor: ColorValue;
  onFillColorChange: (color: ColorValue) => void;
  zoomLevel: number;
};

const inspectorStyle: CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "var(--rei-color-surface)",
  borderLeft: "1px solid var(--rei-color-border)",
  overflow: "auto",
};

const inspectorHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 12px",
  borderBottom: "1px solid var(--rei-color-border)",
};

const inspectorAvatarStyle: CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: "50%",
  backgroundColor: "var(--rei-color-primary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontSize: 11,
  fontWeight: 600,
};

const inspectorTabContainerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 12px",
  borderBottom: "1px solid var(--rei-color-border)",
};

const inspectorZoomStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: 11,
  color: "var(--rei-color-text-muted)",
  cursor: "pointer",
};

const Inspector = memo(function Inspector({
  inspectorTab,
  onInspectorTabChange,
  fillColor,
  onFillColorChange,
  zoomLevel,
}: InspectorProps) {
  return (
    <div style={inspectorStyle}>
      {/* Header with avatar and share */}
      <div style={inspectorHeaderStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={inspectorAvatarStyle}>B</div>
          <LuChevronDown size={12} style={{ color: "var(--rei-color-text-muted)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconButton icon={<LuComponent size={14} />} aria-label="Components" size="sm" variant="ghost" />
          <Button variant="primary" size="sm">Share</Button>
        </div>
      </div>

      {/* Tab container with zoom */}
      <div style={inspectorTabContainerStyle}>
        <TabBar
          tabs={[
            { id: "design", label: "Design" },
            { id: "prototype", label: "Prototype" },
          ]}
          activeTab={inspectorTab}
          onChange={onInspectorTabChange}
          size="sm"
        />
        <div style={inspectorZoomStyle}>
          {zoomLevel}%
          <LuChevronDown size={12} />
        </div>
      </div>

      {inspectorTab === "design" ? (
        <>
          {/* Page section */}
          <SectionHeader title="Page" />
          <div style={{ padding: "8px 12px" }}>
            <ColorInput value={fillColor} onChange={onFillColorChange} size="sm" showVisibilityToggle />
          </div>

          {/* Variables section */}
          <SectionHeader
            title="Variables"
            action={<IconButton icon={<LuSettings2 size={12} />} aria-label="Variables settings" size="sm" variant="ghost" />}
          />

          {/* Styles section */}
          <SectionHeader
            title="Styles"
            action={<IconButton icon={<LuPlus size={12} />} aria-label="Add style" size="sm" variant="ghost" />}
          />

          {/* Export section */}
          <SectionHeader
            title="Export"
            action={<IconButton icon={<LuPlus size={12} />} aria-label="Add export" size="sm" variant="ghost" />}
          />
        </>
      ) : (
        <div style={{ padding: 16, fontSize: 11, color: "var(--rei-color-text-muted)", textAlign: "center" }}>
          Select a layer to add interactions
        </div>
      )}
    </div>
  );
});

// =====================================================================
// Canvas Area Component with Rulers
// =====================================================================

type CanvasAreaProps = {
  selectedId: string | null;
};

const canvasContainerStyle: CSSProperties = {
  height: "100%",
  width: "100%",
  backgroundColor: "#f5f5f5",
  display: "flex",
  flexDirection: "column",
};

const INITIAL_VIEWPORT: ViewportState = { x: -200, y: -100, scale: 0.25 };
const INITIAL_TRANSFORM: TransformState = {
  x: 100,
  y: 100,
  width: 500,
  height: 600,
  rotation: 0,
};

const CanvasArea = memo(function CanvasArea({
  selectedId,
}: CanvasAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Manage viewport and transform internally to avoid parent re-renders
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [transform, setTransform] = useState(INITIAL_TRANSFORM);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: width - 20, height: height - 20 });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Stable handlers using functional updates
  const handleMove = useCallback((deltaX: number, deltaY: number) => {
    setTransform((prev) => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  }, []);

  const handleResize = useCallback((handle: HandlePosition, deltaX: number, deltaY: number) => {
    setTransform((prev) => applyResize(prev, handle, deltaX, deltaY));
  }, []);

  const handleRotate = useCallback((angle: number) => {
    setTransform((prev) => ({ ...prev, rotation: angle }));
  }, []);

  // Memoize frame label style
  const frameLabelStyle = useMemo<CSSProperties>(() => ({
    position: "absolute",
    left: transform.x,
    top: transform.y - 24,
    fontSize: 11,
    color: "var(--rei-color-text-muted)",
    pointerEvents: "none",
  }), [transform.x, transform.y]);

  // Memoize app icon frame style
  const appIconFrameStyle = useMemo<CSSProperties>(() => ({
    position: "absolute",
    left: transform.x,
    top: transform.y,
    width: transform.width,
    height: transform.height,
    background: "#e8e8e8",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: `rotate(${transform.rotation}deg)`,
    transformOrigin: "center center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    pointerEvents: "none",
    overflow: "hidden",
  }), [transform.x, transform.y, transform.width, transform.height, transform.rotation]);

  // Memoize svgLayers to prevent re-creation
  const svgLayers = useMemo(() => (
    <>
      <CanvasGridLayer minorSize={10} majorSize={100} showOrigin />
      {selectedId ? (
        <BoundingBox
          x={transform.x}
          y={transform.y}
          width={transform.width}
          height={transform.height}
          rotation={transform.rotation}
          onMove={handleMove}
          onResize={handleResize}
          onRotate={handleRotate}
        />
      ) : null}
    </>
  ), [selectedId, transform.x, transform.y, transform.width, transform.height, transform.rotation, handleMove, handleResize, handleRotate]);

  return (
    <div ref={containerRef} style={canvasContainerStyle}>
      {/* Rulers */}
      <div style={{ display: "flex" }}>
        <CanvasRulerCorner size={20} />
        <CanvasHorizontalRuler viewport={viewport} width={dimensions.width} />
      </div>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <CanvasVerticalRuler viewport={viewport} height={dimensions.height} />
        <div style={{ flex: 1, position: "relative" }}>
          <Canvas
            viewport={viewport}
            onViewportChange={setViewport}
            width={dimensions.width}
            height={dimensions.height}
            svgLayers={svgLayers}
          >
            {/* Frame label */}
            <div style={frameLabelStyle}>
              App Icon Template
            </div>

            {/* App Icon Frame */}
            <div style={appIconFrameStyle}>
              {/* Grid overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `
                    linear-gradient(to right, rgba(100,180,255,0.3) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(100,180,255,0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: "50px 50px",
                }}
              />
              {/* Center circles */}
              <div
                style={{
                  width: "70%",
                  height: "70%",
                  borderRadius: "50%",
                  border: "2px solid rgba(100,180,255,0.5)",
                }}
              />
            </div>
          </Canvas>
        </div>
      </div>
    </div>
  );
});

// =====================================================================
// Floating Toolbar Component
// =====================================================================

type ToolButtonProps = {
  icon: ReactNode;
  label: string;
  shortcut?: string;
  selected: boolean;
  hasDropdown?: boolean;
  onClick: () => void;
};

const toolButtonWrapperStyle: CSSProperties = {
  position: "relative",
  display: "inline-flex",
};

const toolButtonDropdownStyle: CSSProperties = {
  position: "absolute",
  right: 2,
  bottom: 2,
  color: "var(--rei-color-icon)",
};

const ToolButton = memo(function ToolButton({ icon, label, shortcut, selected, hasDropdown, onClick }: ToolButtonProps) {
  const tooltipContent = shortcut ? `${label} (${shortcut})` : label;

  return (
    <Tooltip content={tooltipContent} placement="top">
      <div style={toolButtonWrapperStyle}>
        <IconButton
          icon={icon}
          aria-label={label}
          size="sm"
          variant={selected ? "selected" : "default"}
          onClick={onClick}
        />
        {hasDropdown ? (
          <LuChevronDown size={8} style={toolButtonDropdownStyle} />
        ) : null}
      </div>
    </Tooltip>
  );
});

type FloatingToolPaletteProps = {
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
};

const floatingToolbarStyle: CSSProperties = {
  position: "absolute",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 100,
};

const helpButtonWrapperStyle: CSSProperties = {
  position: "absolute",
  bottom: 20,
  right: 20,
};

// No-op handler for static buttons
const noop = () => {};

const FloatingToolPalette = memo(function FloatingToolPalette({ selectedTool, onToolSelect }: FloatingToolPaletteProps) {
  const handlers = useMemo(() => ({
    move: () => onToolSelect("move"),
    frame: () => onToolSelect("frame"),
    rectangle: () => onToolSelect("rectangle"),
    pen: () => onToolSelect("pen"),
    text: () => onToolSelect("text"),
    ellipse: () => onToolSelect("ellipse"),
  }), [onToolSelect]);

  return (
    <>
      <div style={floatingToolbarStyle}>
        <Toolbar variant="floating" orientation="horizontal" fitContent>
          <ToolbarGroup>
            <ToolButton
              icon={<LuMousePointer2 size={16} />}
              label="Move"
              shortcut="V"
              selected={selectedTool === "move"}
              hasDropdown
              onClick={handlers.move}
            />
            <ToolButton
              icon={<LuFrame size={16} />}
              label="Frame"
              shortcut="F"
              selected={selectedTool === "frame"}
              hasDropdown
              onClick={handlers.frame}
            />
          </ToolbarGroup>
          <ToolbarDivider />
          <ToolbarGroup>
            <ToolButton
              icon={<LuSquare size={16} />}
              label="Rectangle"
              shortcut="R"
              selected={selectedTool === "rectangle"}
              hasDropdown
              onClick={handlers.rectangle}
            />
            <ToolButton
              icon={<LuPenTool size={16} />}
              label="Pen"
              shortcut="P"
              selected={selectedTool === "pen"}
              hasDropdown
              onClick={handlers.pen}
            />
            <ToolButton
              icon={<LuType size={16} />}
              label="Text"
              shortcut="T"
              selected={selectedTool === "text"}
              onClick={handlers.text}
            />
            <ToolButton
              icon={<LuCircle size={16} />}
              label="Ellipse"
              shortcut="O"
              selected={selectedTool === "ellipse"}
              onClick={handlers.ellipse}
            />
            <ToolButton
              icon={<LuComponent size={16} />}
              label="Resources"
              selected={false}
              onClick={noop}
            />
          </ToolbarGroup>
          <ToolbarDivider />
          <ToolbarGroup>
            <ToolButton
              icon={<LuPencil size={16} />}
              label="Draw"
              selected={false}
              onClick={noop}
            />
            <ToolButton
              icon={<LuCode size={16} />}
              label="Dev Mode"
              selected={false}
              onClick={noop}
            />
          </ToolbarGroup>
        </Toolbar>
      </div>
      <div style={helpButtonWrapperStyle}>
        <IconButton icon={<LuCircleHelp size={16} />} aria-label="Help" size="md" variant="default" />
      </div>
    </>
  );
});

// =====================================================================
// Design size constants
// =====================================================================

const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 900;

// =====================================================================
// Main Component
// =====================================================================

export function DesignDemo() {
  // Container ref and size for contain-fit scaling
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Calculate scale to fit container while maintaining aspect ratio
  const scale = useMemo(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return 1;
    const scaleX = containerSize.width / DESIGN_WIDTH;
    const scaleY = containerSize.height / DESIGN_HEIGHT;
    return Math.min(scaleX, scaleY);
  }, [containerSize.width, containerSize.height]);

  // State
  const [layers, setLayers] = useState(designLayers);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["1", "4"]));
  const [selectedId, setSelectedId] = useState<string | null>("1");
  const [sidebarTab, setSidebarTab] = useState("file");
  const [inspectorTab, setInspectorTab] = useState("design");
  const [selectedTool, setSelectedTool] = useState("move");
  const [fillColor, setFillColor] = useState<ColorValue>({
    hex: "#f5f5f5",
    opacity: 100,
    visible: true,
  });
  // Note: viewport and transform are now managed inside CanvasArea to prevent
  // parent re-renders when dragging canvas elements

  const layerMap = useMemo(() => createLayerMap(layers), [layers]);
  const selectedLayer = selectedId ? layerMap.get(selectedId) ?? null : null;

  // Handlers
  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleVisibilityChange = useCallback((id: string, visible: boolean) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible } : l)),
    );
  }, []);

  const handleLockChange = useCallback((id: string, locked: boolean) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, locked } : l)),
    );
  }, []);

  // Layout configuration
  const config = useMemo<PanelLayoutConfig>(() => ({
    areas: [
      ["filetabs", "filetabs", "filetabs"],
      ["sidebar", "canvas", "inspector"],
    ],
    columns: [
      { size: "260px", resizable: true, minSize: 200, maxSize: 360 },
      { size: "1fr" },
      { size: "280px", resizable: true, minSize: 240, maxSize: 400 },
    ],
    rows: [
      { size: "40px" },
      { size: "1fr" },
    ],
  }), []);

  // Memoize each layer component individually to prevent unnecessary re-renders
  const fileTabBarLayer = useMemo(
    () => <FileTabBar />,
    []
  );

  const sidebarLayer = useMemo(
    () => (
      <Sidebar
        sidebarTab={sidebarTab}
        onSidebarTabChange={setSidebarTab}
        layers={layers}
        expandedIds={expandedIds}
        selectedId={selectedId}
        onToggle={handleToggle}
        onSelect={setSelectedId}
        onVisibilityChange={handleVisibilityChange}
        onLockChange={handleLockChange}
      />
    ),
    [sidebarTab, layers, expandedIds, selectedId, handleToggle, handleVisibilityChange, handleLockChange]
  );

  const canvasLayer = useMemo(
    () => (
      <div style={{ position: "relative", height: "100%" }}>
        <CanvasArea selectedId={selectedId} />
        <FloatingToolPalette selectedTool={selectedTool} onToolSelect={setSelectedTool} />
      </div>
    ),
    [selectedId, selectedTool]
  );

  // Note: zoomLevel is now managed inside CanvasArea; using initial value for display
  const inspectorLayer = useMemo(
    () => (
      <Inspector
        inspectorTab={inspectorTab}
        onInspectorTabChange={setInspectorTab}
        selectedLayer={selectedLayer}
        fillColor={fillColor}
        onFillColorChange={setFillColor}
        zoomLevel={25}
      />
    ),
    [inspectorTab, selectedLayer, fillColor]
  );

  const layers_ = useMemo<LayerDefinition[]>(() => [
    { id: "filetabs", gridArea: "filetabs", component: fileTabBarLayer },
    { id: "sidebar", gridArea: "sidebar", component: sidebarLayer },
    { id: "canvas", gridArea: "canvas", component: canvasLayer },
    { id: "inspector", gridArea: "inspector", component: inspectorLayer },
  ], [fileTabBarLayer, sidebarLayer, canvasLayer, inspectorLayer]);

  const containerStyle: CSSProperties = {
    height: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--rei-color-surface-sunken)",
    overflow: "hidden",
  };

  const contentStyle: CSSProperties = {
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    transform: `scale(${scale})`,
    transformOrigin: "center center",
    flexShrink: 0,
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.15)",
    borderRadius: 8,
    overflow: "hidden",
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <div style={contentStyle}>
        <GridLayout config={config} layers={layers_} />
      </div>
    </div>
  );
}
