/**
 * @file ProjectMenu Demo
 */

import { useState, useRef } from "react";
import {
  LuFolder,
  LuGitBranch,
  LuSettings,
  LuPlus,
  LuFolderOpen,
  LuShare2,
  LuCopy,
  LuTrash2,
  LuStar,
  LuArchive,
  LuDownload,
  LuUsers,
} from "react-icons/lu";

import { ProjectMenu } from "../../../components/ProjectMenu/ProjectMenu";
import { PropertySection } from "../../../components/PropertySection/PropertySection";
import { IconButton } from "../../../components/IconButton/IconButton";
import { ContextMenu, type ContextMenuItem } from "../../../components/ContextMenu/ContextMenu";

const projectMenuItems: ContextMenuItem[] = [
  { id: "new-file", label: "New File", icon: <LuPlus size={14} />, shortcut: "⌘N" },
  { id: "new-folder", label: "New Folder", icon: <LuFolder size={14} />, shortcut: "⇧⌘N" },
  { id: "divider-1", label: "", divider: true },
  { id: "open", label: "Open in Finder", icon: <LuFolderOpen size={14} /> },
  { id: "share", label: "Share", icon: <LuShare2 size={14} />, children: [
    { id: "share-link", label: "Copy Link", icon: <LuCopy size={14} /> },
    { id: "share-invite", label: "Invite Members", icon: <LuUsers size={14} /> },
  ]},
  { id: "divider-2", label: "", divider: true },
  { id: "duplicate", label: "Duplicate Project", icon: <LuCopy size={14} /> },
  { id: "favorite", label: "Add to Favorites", icon: <LuStar size={14} /> },
  { id: "archive", label: "Archive", icon: <LuArchive size={14} /> },
  { id: "export", label: "Export", icon: <LuDownload size={14} />, shortcut: "⇧⌘E" },
  { id: "divider-3", label: "", divider: true },
  { id: "delete", label: "Delete Project", icon: <LuTrash2 size={14} />, danger: true },
];

export function ProjectMenuDemo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const menuTriggerRef = useRef<HTMLDivElement>(null);

  const handleOpenMenu = () => {
    if (menuTriggerRef.current) {
      const rect = menuTriggerRef.current.getBoundingClientRect();
      setMenuPosition({ x: rect.left, y: rect.bottom + 4 });
      setMenuOpen(true);
    }
  };

  const handleMenuSelect = (itemId: string) => {
    setSelectedAction(itemId);
    setMenuOpen(false);
  };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>ProjectMenu</h1>
      <p style={{ margin: 0, color: "var(--rei-color-text-muted)" }}>
        Sidebar project dropdown with status badges.
      </p>

      <PropertySection title="Basic" collapsible defaultExpanded>
        <div style={{ padding: "12px 0", maxWidth: 280 }}>
          <ProjectMenu name="My Project" />
        </div>
      </PropertySection>

      <PropertySection title="With Click Handler" collapsible defaultExpanded>
        <div style={{ padding: "12px 0", maxWidth: 280 }}>
          <ProjectMenu
            name="My Project"
            onClick={() => alert("Project menu clicked!")}
          />
        </div>
      </PropertySection>

      <PropertySection title="With Icon" collapsible defaultExpanded>
        <div style={{ padding: "12px 0", maxWidth: 280 }}>
          <ProjectMenu
            name="My Project"
            icon={<LuFolder size={14} />}
            onClick={() => {}}
          />
        </div>
      </PropertySection>

      <PropertySection title="With Badges (Figma Style)" collapsible defaultExpanded>
        <div style={{ padding: "12px 0", maxWidth: 280 }}>
          <ProjectMenu
            name="App Icon Template"
            badges={[
              { label: "Drafts" },
              { label: "Free", variant: "accent" },
            ]}
            onClick={() => {}}
          />
        </div>
      </PropertySection>

      <PropertySection title="Badge Variants" collapsible defaultExpanded>
        <div style={{ padding: "12px 0", maxWidth: 280, display: "flex", flexDirection: "column", gap: 12 }}>
          <ProjectMenu
            name="Production"
            badges={[
              { label: "Live", variant: "success" },
            ]}
            onClick={() => {}}
          />
          <ProjectMenu
            name="Staging"
            badges={[
              { label: "Warning", variant: "warning" },
            ]}
            onClick={() => {}}
          />
          <ProjectMenu
            name="Development"
            badges={[
              { label: "Local", variant: "default" },
              { label: "Pro", variant: "accent" },
            ]}
            onClick={() => {}}
          />
        </div>
      </PropertySection>

      <PropertySection title="With Badge Icons" collapsible defaultExpanded>
        <div style={{ padding: "12px 0", maxWidth: 280 }}>
          <ProjectMenu
            name="My App"
            badges={[
              { label: "main", icon: <LuGitBranch size={10} />, variant: "accent" },
            ]}
            onClick={() => {}}
          />
        </div>
      </PropertySection>

      <PropertySection title="With Description" collapsible defaultExpanded>
        <div style={{ padding: "12px 0", maxWidth: 280 }}>
          <ProjectMenu
            name="Design System"
            description="Last edited 2 hours ago"
            onClick={() => {}}
          />
        </div>
      </PropertySection>

      <PropertySection title="With Action Slot" collapsible defaultExpanded>
        <div style={{ padding: "12px 0", maxWidth: 280 }}>
          <ProjectMenu
            name="My Project"
            badges={[{ label: "Drafts" }]}
            onClick={() => {}}
            action={
              <IconButton
                icon={<LuSettings size={14} />}
                aria-label="Settings"
                size="sm"
                variant="ghost"
                onClick={() => alert("Settings clicked!")}
              />
            }
          />
        </div>
      </PropertySection>

      <PropertySection title="Full Example (Sidebar Context)" collapsible defaultExpanded>
        <div
          style={{
            padding: "0",
            maxWidth: 280,
            backgroundColor: "var(--rei-color-surface)",
            border: "1px solid var(--rei-color-border)",
            borderRadius: 8,
          }}
        >
          <ProjectMenu
            name="App Icon Template"
            icon={<LuFolder size={14} />}
            badges={[
              { label: "Drafts" },
              { label: "Free", variant: "accent" },
            ]}
            description="Updated today"
            onClick={() => {}}
          />
        </div>
      </PropertySection>

      <PropertySection title="With Dropdown Menu" collapsible defaultExpanded>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--rei-color-text-muted)" }}>
          Click the project menu to open a rich dropdown with actions.
        </p>
        <div
          ref={menuTriggerRef}
          style={{
            padding: "0",
            maxWidth: 280,
            backgroundColor: "var(--rei-color-surface)",
            border: "1px solid var(--rei-color-border)",
            borderRadius: 8,
          }}
        >
          <ProjectMenu
            name="Design System"
            icon={<LuFolder size={14} />}
            badges={[
              { label: "main", icon: <LuGitBranch size={10} />, variant: "accent" },
              { label: "Pro", variant: "success" },
            ]}
            description="Last edited 2 hours ago"
            onClick={handleOpenMenu}
            action={
              <IconButton
                icon={<LuSettings size={14} />}
                aria-label="Settings"
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  alert("Settings clicked!");
                }}
              />
            }
          />
        </div>
        {selectedAction ? (
          <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--rei-color-text-muted)" }}>
            Selected action: <strong>{selectedAction}</strong>
          </p>
        ) : null}
        {menuOpen ? (
          <ContextMenu
            items={projectMenuItems}
            position={menuPosition}
            onSelect={handleMenuSelect}
            onClose={() => setMenuOpen(false)}
          />
        ) : null}
      </PropertySection>
    </div>
  );
}
