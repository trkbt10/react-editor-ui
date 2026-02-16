/**
 * @file ContextMenu demo page
 */

import type { CSSProperties } from "react";
import { useState } from "react";
import {
  demoContainerStyle,
  demoSectionStyle,
  demoLabelStyle,
} from "../../components";
import { ContextMenu } from "../../../components/ContextMenu/ContextMenu";

export function ContextMenuDemo() {
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

  const triggerBoxStyle: CSSProperties = {
    padding: "40px",
    backgroundColor: "var(--rei-color-surface, #1e1f24)",
    border: "1px dashed var(--rei-color-border, #3d3f46)",
    borderRadius: "4px",
    textAlign: "center",
    cursor: "context-menu",
    color: "var(--rei-color-text-muted, #8b8d94)",
    fontSize: "12px",
  };

  const cornerBoxStyle: CSSProperties = {
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
