/**
 * @file TreeItem demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoSurface,
  FileIcon,
  FolderIcon,
} from "../../components";
import { TreeItem } from "../../../components/TreeItem/TreeItem";
import { Badge } from "../../../components/Badge/Badge";

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

export function TreeItemDemo() {
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState("file1");

  return (
    <DemoContainer title="TreeItem">
      <DemoSection label="File Tree">
        <DemoSurface>
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
        </DemoSurface>
      </DemoSection>
    </DemoContainer>
  );
}
