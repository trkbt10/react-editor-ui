/**
 * @file TabBar demo page
 */

import { useState } from "react";
import { LuFolder, LuSearch, LuSettings, LuFile, LuCode } from "react-icons/lu";
import { DemoContainer, DemoSection } from "../../components";
import { TabBar } from "../../../components/TabBar/TabBar";

const basicTabs = [
  { id: "design", label: "Design" },
  { id: "prototype", label: "Prototype" },
  { id: "inspect", label: "Inspect" },
];

const disabledTabs = [
  { id: "layers", label: "Layers" },
  { id: "assets", label: "Assets" },
  { id: "plugins", label: "Plugins", disabled: true },
];

const fileTabs = [
  { id: "index", label: "index.tsx", icon: <LuCode size={14} />, closable: true },
  { id: "styles", label: "styles.css", closable: true, isDirty: true },
  { id: "readme", label: "README.md", icon: <LuFile size={14} />, closable: true },
];

const iconTabs = [
  { id: "folder", label: "Files", icon: <LuFolder size={16} /> },
  { id: "search", label: "Search", icon: <LuSearch size={16} /> },
  { id: "settings", label: "Settings", icon: <LuSettings size={16} /> },
];

export function TabBarDemo() {
  const [activeTab, setActiveTab] = useState("design");
  const [activeTab2, setActiveTab2] = useState("layers");
  const [activeFile, setActiveFile] = useState("index");
  const [activeIcon, setActiveIcon] = useState("folder");
  const [openFiles, setOpenFiles] = useState(fileTabs);

  const handleCloseFile = (tabId: string) => {
    setOpenFiles((prev) => prev.filter((t) => t.id !== tabId));
    if (activeFile === tabId) {
      const remaining = openFiles.filter((t) => t.id !== tabId);
      if (remaining.length > 0) {
        setActiveFile(remaining[0].id);
      }
    }
  };

  return (
    <DemoContainer title="TabBar">
      <DemoSection label="Pills (Default)">
        <TabBar
          tabs={basicTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </DemoSection>

      <DemoSection label="Pills - Full Width">
        <TabBar
          tabs={basicTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          fullWidth
        />
      </DemoSection>

      <DemoSection label="Pills - Sizes">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <TabBar
            tabs={basicTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            size="sm"
          />
          <TabBar
            tabs={basicTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            size="md"
          />
          <TabBar
            tabs={basicTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            size="lg"
          />
        </div>
      </DemoSection>

      <DemoSection label="Pills - With Disabled Tab">
        <TabBar
          tabs={disabledTabs}
          activeTab={activeTab2}
          onChange={setActiveTab2}
        />
      </DemoSection>

      <DemoSection label="Files Variant">
        <TabBar
          variant="files"
          tabs={openFiles}
          activeTab={activeFile}
          onChange={setActiveFile}
          onClose={handleCloseFile}
        />
      </DemoSection>

      <DemoSection label="Icons Variant">
        <TabBar
          variant="icons"
          tabs={iconTabs}
          activeTab={activeIcon}
          onChange={setActiveIcon}
        />
      </DemoSection>
    </DemoContainer>
  );
}
