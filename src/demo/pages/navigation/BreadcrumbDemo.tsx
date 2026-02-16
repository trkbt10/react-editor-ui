/**
 * @file Breadcrumb Demo
 */

import { useState } from "react";
import { LuFolder, LuFileCode, LuHouse, LuSettings } from "react-icons/lu";

import { Breadcrumb } from "../../../components/Breadcrumb/Breadcrumb";
import { PropertySection } from "../../../components/PropertySection/PropertySection";

export function BreadcrumbDemo() {
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const basicItems = [
    { label: "Home" },
    { label: "Projects" },
    { label: "My Project" },
  ];

  const itemsWithIcons = [
    { label: "Home", icon: <LuHouse size={12} /> },
    { label: "Settings", icon: <LuSettings size={12} /> },
    { label: "Profile" },
  ];

  const filePathItems = [
    { label: "src", icon: <LuFolder size={12} /> },
    { label: "components", icon: <LuFolder size={12} /> },
    { label: "Button", icon: <LuFolder size={12} /> },
    { label: "Button.tsx", icon: <LuFileCode size={12} style={{ color: "#3b82f6" }} /> },
  ];

  const manyItems = [
    { label: "Level 1" },
    { label: "Level 2" },
    { label: "Level 3" },
    { label: "Level 4" },
    { label: "Level 5" },
    { label: "Level 6" },
  ];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>Breadcrumb</h1>
      <p style={{ margin: 0, color: "var(--rei-color-text-muted)" }}>
        Navigation path indicator with clickable items.
      </p>

      <PropertySection title="Basic" collapsible defaultExpanded>
        <div style={{ padding: "12px 0" }}>
          <Breadcrumb items={basicItems} />
        </div>
      </PropertySection>

      <PropertySection title="With Icons" collapsible defaultExpanded>
        <div style={{ padding: "12px 0" }}>
          <Breadcrumb items={itemsWithIcons} />
        </div>
      </PropertySection>

      <PropertySection title="File Path Style" collapsible defaultExpanded>
        <div style={{ padding: "12px 0" }}>
          <Breadcrumb items={filePathItems} />
        </div>
      </PropertySection>

      <PropertySection title="With Click Handler" collapsible defaultExpanded>
        <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          <Breadcrumb
            items={basicItems}
            onItemClick={(index) => setClickedIndex(index)}
          />
          {clickedIndex !== null ? (
            <p style={{ margin: 0, fontSize: 12, color: "var(--rei-color-text-muted)" }}>
              Clicked item at index: {clickedIndex}
            </p>
          ) : null}
        </div>
      </PropertySection>

      <PropertySection title="Max Items (Overflow)" collapsible defaultExpanded>
        <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: "var(--rei-color-text-muted)" }}>
              All items (6):
            </p>
            <Breadcrumb items={manyItems} />
          </div>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: "var(--rei-color-text-muted)" }}>
              maxItems=3:
            </p>
            <Breadcrumb items={manyItems} maxItems={3} />
          </div>
        </div>
      </PropertySection>

      <PropertySection title="Sizes" collapsible defaultExpanded>
        <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: "var(--rei-color-text-muted)" }}>
              size="sm" (default):
            </p>
            <Breadcrumb items={filePathItems} size="sm" />
          </div>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: "var(--rei-color-text-muted)" }}>
              size="md":
            </p>
            <Breadcrumb items={filePathItems} size="md" />
          </div>
        </div>
      </PropertySection>

      <PropertySection title="Custom Separator" collapsible defaultExpanded>
        <div style={{ padding: "12px 0" }}>
          <Breadcrumb
            items={basicItems}
            separator={<span style={{ color: "var(--rei-color-text-muted)" }}>/</span>}
          />
        </div>
      </PropertySection>
    </div>
  );
}
