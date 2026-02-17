/**
 * @file IDE Demo - Xcode-like development environment
 */

import { useState, useMemo, useCallback, type CSSProperties } from "react";
import {
  GridLayout,
  type PanelLayoutConfig,
  type LayerDefinition,
} from "react-panel-layout";
import {
  LuPlay,
  LuSquare,
  LuFile,
  LuFolder,
  LuFolderOpen,
  LuFileCode,
  LuFileJson,
  LuFileText,
  LuImage,
  LuChevronRight,
  LuChevronDown,
  LuSearch,
  LuBookmark,
  LuGitBranch,
  LuMonitor,
  LuSmartphone,
  LuClock,
  LuMinus,
  LuPlus,
} from "react-icons/lu";

import { TabBar } from "../../../components/TabBar/TabBar";
import { SearchInput } from "../../../components/SearchInput/SearchInput";
import { PropertySection } from "../../../components/PropertySection/PropertySection";
import { PropertyRow } from "../../../components/PropertyRow/PropertyRow";
import { TreeItem } from "../../../components/TreeItem/TreeItem";
import { Toolbar } from "../../../components/Toolbar/Toolbar";
import { ToolbarGroup } from "../../../components/Toolbar/ToolbarGroup";
import { IconButton } from "../../../components/IconButton/IconButton";
import { Select } from "../../../components/Select/Select";
import { Checkbox } from "../../../components/Checkbox/Checkbox";
import { Badge } from "../../../components/Badge/Badge";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import { StatusBar } from "../../../components/StatusBar/StatusBar";
import { StatusBarItem } from "../../../components/StatusBar/StatusBarItem";
import { CodeEditor } from "../../../editors/RichTextEditors/code/CodeEditor";
import { createBlockDocument } from "../../../editors/RichTextEditors/block/blockDocument";
import { Breadcrumb } from "../../../components/Breadcrumb/Breadcrumb";
import type { Token, Tokenizer, BlockDocument } from "../../../editors/RichTextEditors";

import { ideFiles, swiftSampleCode, ideDevices, type IDEFile } from "./mockData";

// =====================================================================
// Swift Tokenizer
// =====================================================================

const swiftKeywords = new Set([
  "import", "struct", "class", "enum", "protocol", "extension", "func", "var", "let",
  "if", "else", "for", "while", "switch", "case", "default", "return", "guard",
  "private", "public", "internal", "fileprivate", "open", "static", "final",
  "some", "any", "self", "Self", "true", "false", "nil", "in", "where", "throw",
  "throws", "try", "catch", "async", "await", "actor", "typealias", "associatedtype",
]);

const swiftTypes = new Set([
  "View", "Body", "State", "Binding", "ObservedObject", "Published", "VStack", "HStack",
  "Text", "Button", "Image", "Color", "Font", "Int", "String", "Bool", "Double", "Float",
  "Array", "Dictionary", "Optional", "DispatchQueue",
]);

const swiftTokenizer: Tokenizer = {
  tokenize: (line: string): readonly Token[] => {
    const tokens: Token[] = [];
    const cursor = { pos: 0 };

    while (cursor.pos < line.length) {
      // Skip whitespace
      if (/\s/.test(line[cursor.pos])) {
        const start = cursor.pos;
        while (cursor.pos < line.length && /\s/.test(line[cursor.pos])) {
          cursor.pos++;
        }
        tokens.push({ type: "whitespace", text: line.slice(start, cursor.pos), start, end: cursor.pos });
        continue;
      }

      // Single-line comment
      if (line.slice(cursor.pos, cursor.pos + 2) === "//") {
        tokens.push({ type: "comment", text: line.slice(cursor.pos), start: cursor.pos, end: line.length });
        cursor.pos = line.length;
        continue;
      }

      // String
      if (line[cursor.pos] === '"') {
        const start = cursor.pos;
        cursor.pos++;
        while (cursor.pos < line.length && line[cursor.pos] !== '"') {
          if (line[cursor.pos] === '\\') {
            cursor.pos++;
          }
          cursor.pos++;
        }
        cursor.pos++;
        tokens.push({ type: "string", text: line.slice(start, cursor.pos), start, end: cursor.pos });
        continue;
      }

      // Number
      if (/[0-9]/.test(line[cursor.pos])) {
        const start = cursor.pos;
        while (cursor.pos < line.length && /[0-9.]/.test(line[cursor.pos])) {
          cursor.pos++;
        }
        tokens.push({ type: "number", text: line.slice(start, cursor.pos), start, end: cursor.pos });
        continue;
      }

      // Property wrapper (starts with @)
      if (line[cursor.pos] === '@') {
        const start = cursor.pos;
        cursor.pos++;
        while (cursor.pos < line.length && /[a-zA-Z0-9_]/.test(line[cursor.pos])) {
          cursor.pos++;
        }
        tokens.push({ type: "decorator", text: line.slice(start, cursor.pos), start, end: cursor.pos });
        continue;
      }

      // Identifier or keyword
      if (/[a-zA-Z_]/.test(line[cursor.pos])) {
        const start = cursor.pos;
        while (cursor.pos < line.length && /[a-zA-Z0-9_]/.test(line[cursor.pos])) {
          cursor.pos++;
        }
        const text = line.slice(start, cursor.pos);
        let type = "identifier";
        if (swiftKeywords.has(text)) {
          type = "keyword";
        } else if (swiftTypes.has(text)) {
          type = "type";
        }
        tokens.push({ type, text, start, end: cursor.pos });
        continue;
      }

      // Operators and punctuation
      const operators = ["->", "...", "..<", "==", "!=", "<=", ">=", "&&", "||", "+=", "-="];
      let matched = false;
      for (const op of operators) {
        if (line.slice(cursor.pos, cursor.pos + op.length) === op) {
          tokens.push({ type: "operator", text: op, start: cursor.pos, end: cursor.pos + op.length });
          cursor.pos += op.length;
          matched = true;
          break;
        }
      }
      if (matched) {
        continue;
      }

      // Single character punctuation
      if (/[{}()\[\]:,.=<>+\-*/%!?&|]/.test(line[cursor.pos])) {
        tokens.push({ type: "punctuation", text: line[cursor.pos], start: cursor.pos, end: cursor.pos + 1 });
        cursor.pos++;
        continue;
      }

      // Unknown
      tokens.push({ type: "unknown", text: line[cursor.pos], start: cursor.pos, end: cursor.pos + 1 });
      cursor.pos++;
    }

    return tokens;
  },
};

const swiftTokenStyles: Record<string, CSSProperties> = {
  keyword: { color: "#fc5fa3" },
  type: { color: "#5dd8ff" },
  string: { color: "#fc6a5d" },
  number: { color: "#d0bf69" },
  comment: { color: "#6c7986" },
  decorator: { color: "#b281eb" },
  punctuation: { color: "#ffffff" },
  operator: { color: "#ffffff" },
  identifier: { color: "#ffffff" },
  whitespace: {},
  unknown: { color: "#666666" },
};

// =====================================================================
// Utilities
// =====================================================================

function createFileMap(files: IDEFile[]): Map<string, IDEFile> {
  return new Map(files.map((f) => [f.id, f]));
}

function createChildrenMap(files: IDEFile[]): Map<string | null, IDEFile[]> {
  const map = new Map<string | null, IDEFile[]>();
  for (const file of files) {
    const children = map.get(file.parentId) ?? [];
    children.push(file);
    map.set(file.parentId, children);
  }
  for (const [, children] of map) {
    children.sort((a, b) => {
      // Folders first
      if (a.type === "folder" && b.type !== "folder") {
        return -1;
      }
      if (a.type !== "folder" && b.type === "folder") {
        return 1;
      }
      return a.order - b.order;
    });
  }
  return map;
}

function getDepthWithMap(id: string, fileMap: Map<string, IDEFile>): number {
  const file = fileMap.get(id);
  if (!file || !file.parentId) {
    return 0;
  }
  return getDepthWithMap(file.parentId, fileMap) + 1;
}

function getVisibleFilesOrdered(
  childrenMap: Map<string | null, IDEFile[]>,
  expandedIds: Set<string>,
  parentId: string | null = null,
): IDEFile[] {
  const result: IDEFile[] = [];
  const children = childrenMap.get(parentId) ?? [];
  for (const child of children) {
    result.push(child);
    if (child.type === "folder" && expandedIds.has(child.id)) {
      result.push(...getVisibleFilesOrdered(childrenMap, expandedIds, child.id));
    }
  }
  return result;
}

function getFileIcon(file: IDEFile, expanded: boolean) {
  switch (file.type) {
    case "folder":
      return expanded ? <LuFolderOpen size={14} /> : <LuFolder size={14} />;
    case "swift":
      return <LuFileCode size={14} style={{ color: "#fc5fa3" }} />;
    case "json":
      return <LuFileJson size={14} style={{ color: "#d0bf69" }} />;
    case "plist":
      return <LuFileText size={14} style={{ color: "#5dd8ff" }} />;
    case "asset":
      return <LuImage size={14} style={{ color: "#b281eb" }} />;
    default:
      return <LuFile size={14} />;
  }
}

// =====================================================================
// IDE Toolbar Component
// =====================================================================

type IDEToolbarProps = {
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  selectedDevice: string;
  onDeviceChange: (device: string) => void;
};

function IDEToolbar({ isRunning, onRun, onStop, selectedDevice, onDeviceChange }: IDEToolbarProps) {
  const toolbarStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: 44,
    padding: "0 12px",
    borderBottom: "1px solid var(--rei-color-border)",
    backgroundColor: "var(--rei-color-surface)",
    gap: 8,
  };

  const schemeGroupStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const statusGroupStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginLeft: "auto",
  };

  const utilityGroupStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 4,
    borderLeft: "1px solid var(--rei-color-border)",
    paddingLeft: 8,
    marginLeft: 8,
  };

  return (
    <div style={toolbarStyle}>
      <ToolbarGroup>
        <IconButton
          icon={<LuPlay size={16} />}
          aria-label="Run"
          size="md"
          variant="filled"
          disabled={isRunning}
          onClick={onRun}
        />
        <IconButton
          icon={<LuSquare size={14} />}
          aria-label="Stop"
          size="md"
          variant="default"
          disabled={!isRunning}
          onClick={onStop}
        />
      </ToolbarGroup>

      <div style={schemeGroupStyle}>
        <Button
          variant="ghost"
          size="sm"
          iconEnd={<LuChevronDown size={12} />}
          onClick={() => {}}
        >
          MyApp
        </Button>
        <Badge variant="primary" size="sm">
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <LuGitBranch size={12} />
            main
          </span>
        </Badge>
      </div>

      <Select
        value={selectedDevice}
        onChange={onDeviceChange}
        options={ideDevices.map((d) => ({ value: d.id, label: d.label }))}
        size="sm"
      />

      <div style={statusGroupStyle}>
        {isRunning ? (
          <Badge variant="success" size="sm">Building MyApp...</Badge>
        ) : (
          <Badge variant="default" size="sm">
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <LuClock size={12} />
              Finished running MyApp
            </span>
          </Badge>
        )}
      </div>

      <div style={utilityGroupStyle}>
        <IconButton icon={<LuMonitor size={14} />} aria-label="Library" size="sm" variant="ghost" />
        <IconButton icon={<LuSmartphone size={14} />} aria-label="Devices" size="sm" variant="ghost" />
      </div>
    </div>
  );
}

// =====================================================================
// Navigator Component
// =====================================================================

type NavigatorProps = {
  files: IDEFile[];
  expandedIds: Set<string>;
  selectedFileId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
};

function Navigator({
  files,
  expandedIds,
  selectedFileId,
  searchQuery,
  onSearchChange,
  onToggle,
  onSelect,
}: NavigatorProps) {
  const [activeNavTab, setActiveNavTab] = useState("project");
  const fileMap = useMemo(() => createFileMap(files), [files]);
  const childrenMap = useMemo(() => createChildrenMap(files), [files]);
  const visibleFiles = useMemo(
    () => getVisibleFilesOrdered(childrenMap, expandedIds),
    [childrenMap, expandedIds],
  );

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return visibleFiles;
    }
    const query = searchQuery.toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(query));
  }, [files, visibleFiles, searchQuery]);

  const hasChildren = (id: string): boolean => {
    return (childrenMap.get(id)?.length ?? 0) > 0;
  };

  const navigatorStyle: CSSProperties = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "var(--rei-color-surface)",
    borderRight: "1px solid var(--rei-color-border)",
  };

  const navTabContainerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "center",
    borderBottom: "1px solid var(--rei-color-border)",
  };

  const fileListStyle: CSSProperties = {
    flex: 1,
    overflow: "auto",
  };

  const searchContainerStyle: CSSProperties = {
    padding: 8,
    borderTop: "1px solid var(--rei-color-border)",
  };

  // Files that are "modified"
  const modifiedFiles = new Set(["4", "7"]);

  return (
    <div style={navigatorStyle}>
      {/* Icon-based nav tabs */}
      <div style={navTabContainerStyle}>
        <TabBar
          variant="icons"
          tabs={[
            { id: "project", label: "Project Navigator", icon: <LuFolder size={14} /> },
            { id: "search", label: "Search Navigator", icon: <LuSearch size={14} /> },
            { id: "bookmarks", label: "Bookmarks", icon: <LuBookmark size={14} /> },
          ]}
          activeTab={activeNavTab}
          onChange={setActiveNavTab}
        />
      </div>
      <div style={fileListStyle}>
        {filteredFiles.map((file) => {
          const depth = searchQuery.trim() ? 0 : getDepthWithMap(file.id, fileMap);
          const isFolder = file.type === "folder";
          const expanded = expandedIds.has(file.id);
          const isModified = modifiedFiles.has(file.id);
          const displayName = isModified ? `${file.name} (M)` : file.name;

          return (
            <TreeItem
              key={file.id}
              label={displayName}
              icon={getFileIcon(file, expanded)}
              depth={depth}
              hasChildren={isFolder && hasChildren(file.id)}
              expanded={expanded}
              onToggle={() => onToggle(file.id)}
              selected={selectedFileId === file.id}
              onClick={() => onSelect(file.id)}
            />
          );
        })}
      </div>
      <div style={searchContainerStyle}>
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Filter"
          size="sm"
        />
      </div>
    </div>
  );
}

// =====================================================================
// Editor Area Component
// =====================================================================

type EditorAreaProps = {
  document: BlockDocument;
  onDocumentChange: (doc: BlockDocument) => void;
};

function EditorArea({ document, onDocumentChange }: EditorAreaProps) {
  const editorStyle: CSSProperties = {
    height: "100%",
    display: "flex",
  };

  const codeEditorContainerStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid var(--rei-color-border)",
  };

  const breadcrumbContainerStyle: CSSProperties = {
    padding: "4px 12px",
    borderBottom: "1px solid var(--rei-color-border)",
    backgroundColor: "var(--rei-color-surface)",
  };

  const previewContainerStyle: CSSProperties = {
    flex: "0 0 300px",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "var(--rei-color-surface)",
  };

  const previewHeaderStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    borderBottom: "1px solid var(--rei-color-border)",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--rei-color-text-muted)",
  };

  const previewLabelStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const previewContentStyle: CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#1c1c1e",
    position: "relative",
  };

  const deviceLabelStyle: CSSProperties = {
    position: "absolute",
    top: 12,
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: 11,
    color: "var(--rei-color-text-muted)",
    display: "flex",
    alignItems: "center",
    gap: 4,
  };

  const deviceFrameStyle: CSSProperties = {
    width: 180,
    height: 360,
    backgroundColor: "#2c2c2e",
    borderRadius: 24,
    padding: 8,
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
    position: "relative",
  };

  const deviceNotchStyle: CSSProperties = {
    position: "absolute",
    top: 12,
    left: "50%",
    transform: "translateX(-50%)",
    width: 60,
    height: 24,
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    zIndex: 1,
  };

  const deviceScreenStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    backgroundColor: "#1c1c1e",
    borderRadius: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 16,
    overflow: "hidden",
  };

  return (
    <div style={editorStyle}>
      <div style={codeEditorContainerStyle}>
        {/* Breadcrumb navigation */}
        <div style={breadcrumbContainerStyle}>
          <Breadcrumb
            items={[
              { label: "MyApp", icon: <LuFolder size={12} /> },
              { label: "MyApp", icon: <LuFolder size={12} /> },
              { label: "ContentView.swift", icon: <LuFileCode size={12} style={{ color: "#fc5fa3" }} /> },
              { label: "ContentView" },
              { label: "body" },
            ]}
          />
        </div>
        <CodeEditor
          document={document}
          onDocumentChange={onDocumentChange}
          tokenizer={swiftTokenizer}
          tokenStyles={swiftTokenStyles}
          showLineNumbers
          renderer="canvas"
          viewportConfig={{ mode: "text", fixedViewport: true }}
          style={{
            flex: 1,
            backgroundColor: "#1e1e1e",
          }}
        />
      </div>
      <div style={previewContainerStyle}>
        <div style={previewHeaderStyle}>
          <div style={previewLabelStyle}>
            <LuPlay size={10} />
            Preview
          </div>
          <span style={{ fontSize: 10 }}>iPhone 15 Pro</span>
        </div>
        <div style={previewContentStyle}>
          <div style={deviceLabelStyle}>
            ContentView
          </div>
          <div style={deviceFrameStyle}>
            <div style={deviceNotchStyle} />
            <div style={deviceScreenStyle}>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
                Counter: 0
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <IconButton
                  icon={<LuMinus size={16} />}
                  aria-label="Decrement"
                  size="md"
                  variant="selected"
                  round
                  onClick={() => {}}
                />
                <IconButton
                  icon={<LuPlus size={16} />}
                  aria-label="Increment"
                  size="md"
                  variant="selected"
                  round
                  onClick={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// Inspector Component
// =====================================================================

type IDEInspectorProps = {
  selectedFile: IDEFile | null;
};

function IDEInspector({ selectedFile }: IDEInspectorProps) {
  const inspectorStyle: CSSProperties = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "var(--rei-color-surface)",
    borderLeft: "1px solid var(--rei-color-border)",
    overflow: "auto",
  };

  const inspectorTabContainerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "center",
    borderBottom: "1px solid var(--rei-color-border)",
  };

  const appIconStyle: CSSProperties = {
    width: 20,
    height: 20,
    borderRadius: 4,
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    marginRight: 8,
    flexShrink: 0,
  };

  const targetItemStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "4px 0",
  };

  const fullPathStyle: CSSProperties = {
    fontSize: 10,
    color: "var(--rei-color-text-muted)",
    wordBreak: "break-all",
    padding: "4px 0",
  };

  const targetMemberships = [
    { id: "myapp", label: "MyApp", checked: true, hasIcon: true },
    { id: "myapptests", label: "MyAppTests", checked: false, hasIcon: true },
    { id: "myappuitests", label: "MyAppUITests", checked: false, hasIcon: true },
  ];

  return (
    <div style={inspectorStyle}>
      {/* Icon-based inspector tabs */}
      <div style={inspectorTabContainerStyle}>
        <TabBar
          variant="icons"
          tabs={[
            { id: "file", label: "File Inspector", icon: <LuFile size={14} /> },
            { id: "help", label: "Quick Help", icon: <LuBookmark size={14} /> },
          ]}
          activeTab="file"
          onChange={() => {}}
        />
      </div>
      {selectedFile ? (
        <>
          <PropertySection title="Identity and Type" collapsible defaultExpanded>
            <PropertyRow label="Name">
              <Input value={selectedFile.name} onChange={() => {}} size="sm" />
            </PropertyRow>
            <PropertyRow label="Type">
              <Select
                value={selectedFile.type}
                onChange={() => {}}
                options={[
                  { value: "swift", label: "Swift Source" },
                  { value: "json", label: "JSON" },
                  { value: "plist", label: "Property List" },
                ]}
                size="sm"
              />
            </PropertyRow>
            <PropertyRow label="Location">
              <Select
                value="relative"
                onChange={() => {}}
                options={[
                  { value: "relative", label: "Relative to Group" },
                  { value: "absolute", label: "Absolute Path" },
                ]}
                size="sm"
              />
            </PropertyRow>
            <div style={fullPathStyle}>
              /Users/dev/MyApp/MyApp/{selectedFile.name}
            </div>
          </PropertySection>

          <PropertySection title="Target Membership" collapsible defaultExpanded>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {targetMemberships.map((target) => (
                <div key={target.id} style={targetItemStyle}>
                  <Checkbox
                    checked={target.checked}
                    onChange={() => {}}
                    size="sm"
                  />
                  {target.hasIcon ? <div style={appIconStyle} /> : null}
                  <span style={{ fontSize: 12, color: "var(--rei-color-text)" }}>{target.label}</span>
                </div>
              ))}
            </div>
          </PropertySection>

          <PropertySection title="Text Settings" collapsible defaultExpanded>
            <PropertyRow label="Text Encoding">
              <Select
                value="utf8"
                onChange={() => {}}
                options={[
                  { value: "utf8", label: "UTF-8" },
                  { value: "utf16", label: "UTF-16" },
                  { value: "ascii", label: "ASCII" },
                ]}
                size="sm"
              />
            </PropertyRow>
            <PropertyRow label="Line Endings">
              <Select
                value="lf"
                onChange={() => {}}
                options={[
                  { value: "lf", label: "macOS / Unix (LF)" },
                  { value: "crlf", label: "Windows (CRLF)" },
                  { value: "cr", label: "Classic Mac (CR)" },
                ]}
                size="sm"
              />
            </PropertyRow>
            <PropertyRow label="Indent Using">
              <Select
                value="spaces"
                onChange={() => {}}
                options={[
                  { value: "spaces", label: "Spaces" },
                  { value: "tabs", label: "Tabs" },
                ]}
                size="sm"
              />
            </PropertyRow>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "var(--rei-color-text-muted)", marginBottom: 4 }}>Tab</div>
                <Input value="4" onChange={() => {}} size="sm" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "var(--rei-color-text-muted)", marginBottom: 4 }}>Indent</div>
                <Input value="4" onChange={() => {}} size="sm" />
              </div>
            </div>
          </PropertySection>
        </>
      ) : (
        <div style={{ padding: 16, fontSize: 11, color: "var(--rei-color-text-muted)" }}>
          Select a file to view details
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Main Component
// =====================================================================

export function IDEDemo() {
  // State
  const [files] = useState(ideFiles);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["1", "2", "5", "8", "11"]));
  const [selectedFileId, setSelectedFileId] = useState<string | null>("4");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState("mac");
  const [document, setDocument] = useState<BlockDocument>(() => createBlockDocument(swiftSampleCode));

  const fileMap = useMemo(() => createFileMap(files), [files]);
  const selectedFile = selectedFileId ? fileMap.get(selectedFileId) ?? null : null;

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

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 3000);
  }, []);

  const handleStop = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Layout configuration
  const config = useMemo<PanelLayoutConfig>(() => ({
    areas: [
      ["toolbar", "toolbar", "toolbar"],
      ["navigator", "editor", "inspector"],
      ["statusbar", "statusbar", "statusbar"],
    ],
    columns: [
      { size: "240px", resizable: true, minSize: 180, maxSize: 360 },
      { size: "1fr" },
      { size: "260px", resizable: true, minSize: 200, maxSize: 360 },
    ],
    rows: [
      { size: "44px" },
      { size: "1fr" },
      { size: "24px" },
    ],
  }), []);

  // Memoize each layer component individually to prevent unnecessary re-renders
  const toolbarLayer = useMemo(
    () => (
      <IDEToolbar
        isRunning={isRunning}
        onRun={handleRun}
        onStop={handleStop}
        selectedDevice={selectedDevice}
        onDeviceChange={setSelectedDevice}
      />
    ),
    [isRunning, handleRun, handleStop, selectedDevice]
  );

  const navigatorLayer = useMemo(
    () => (
      <Navigator
        files={files}
        expandedIds={expandedIds}
        selectedFileId={selectedFileId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggle={handleToggle}
        onSelect={setSelectedFileId}
      />
    ),
    [files, expandedIds, selectedFileId, searchQuery, handleToggle]
  );

  const editorLayer = useMemo(
    () => <EditorArea document={document} onDocumentChange={setDocument} />,
    [document]
  );

  const inspectorLayer = useMemo(
    () => <IDEInspector selectedFile={selectedFile} />,
    [selectedFile]
  );

  const statusbarLayer = useMemo(
    () => (
      <StatusBar>
        <StatusBarItem>Ln 1, Col 1</StatusBarItem>
        <StatusBarItem>UTF-8</StatusBarItem>
        <StatusBarItem>Swift</StatusBarItem>
        <span style={{ marginLeft: "auto" }} />
        <StatusBarItem>{isRunning ? "Building..." : "Ready"}</StatusBarItem>
      </StatusBar>
    ),
    [isRunning]
  );

  const layers = useMemo<LayerDefinition[]>(() => [
    { id: "toolbar", gridArea: "toolbar", component: toolbarLayer },
    { id: "navigator", gridArea: "navigator", component: navigatorLayer },
    { id: "editor", gridArea: "editor", component: editorLayer },
    { id: "inspector", gridArea: "inspector", component: inspectorLayer },
    { id: "statusbar", gridArea: "statusbar", component: statusbarLayer },
  ], [toolbarLayer, navigatorLayer, editorLayer, inspectorLayer, statusbarLayer]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <GridLayout config={config} layers={layers} />
    </div>
  );
}
