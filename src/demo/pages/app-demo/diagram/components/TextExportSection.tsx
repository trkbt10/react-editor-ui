/**
 * @file TextExportSection - Export diagram to text formats (Mermaid, Markdown, ASCII)
 */

import {
  memo,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type CSSProperties,
} from "react";
import mermaid from "mermaid";
import Markdown from "react-markdown";

import { SegmentedControl } from "../../../../../components/SegmentedControl/SegmentedControl";
import { Button } from "../../../../../components/Button/Button";
import { PropertySection } from "../../../../../components/PropertySection/PropertySection";
import { PropertyRow } from "../../../../../components/PropertyRow/PropertyRow";
import { SectionHeader } from "../../../../../components/SectionHeader/SectionHeader";
import { Select, type SelectOption } from "../../../../../components/Select/Select";
import {
  COLOR_SURFACE_RAISED,
  COLOR_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  SPACE_XS,
  SPACE_SM,
  SPACE_MD,
  SIZE_FONT_XS,
  SIZE_FONT_SM,
  RADIUS_SM,
  RADIUS_MD,
} from "../../../../../themes/styles";

import type { DiagramNode, FrameNode, Connection, SymbolDefinition } from "../types";
import { exportFrameToMermaid } from "../export/exportToMermaid";
import { exportFrameToMarkdown } from "../export/exportToMarkdown";
import { exportFrameToASCII } from "../export/exportToASCII";

// =============================================================================
// Types
// =============================================================================

export type TextExportFormat = "mermaid" | "markdown" | "ascii";

export type TextExportSectionProps = {
  /** All frames in the document */
  frames: FrameNode[];
  /** All nodes in the page */
  allNodes: DiagramNode[];
  /** All connections in the page */
  allConnections: Connection[];
  /** Symbol definition for resolving instance labels */
  symbolDef: SymbolDefinition | null;
};

// =============================================================================
// Styles
// =============================================================================

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_SM,
};

const formatSelectorStyle: CSSProperties = {
  padding: `0 ${SPACE_MD}`,
};

const previewContainerStyle: CSSProperties = {
  backgroundColor: COLOR_SURFACE_RAISED,
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: RADIUS_MD,
  overflow: "hidden",
  maxHeight: 300,
  overflowY: "auto",
};

const mermaidPreviewStyle: CSSProperties = {
  padding: SPACE_MD,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: 150,
  backgroundColor: "#fff",
};

const markdownPreviewStyle: CSSProperties = {
  padding: SPACE_MD,
  fontSize: SIZE_FONT_SM,
  color: COLOR_TEXT,
  lineHeight: 1.6,
};

const asciiPreviewStyle: CSSProperties = {
  padding: SPACE_MD,
  fontFamily: "monospace",
  fontSize: SIZE_FONT_XS,
  color: COLOR_TEXT,
  whiteSpace: "pre",
  overflowX: "auto",
  backgroundColor: "#1e1e1e",
};

const codePreviewStyle: CSSProperties = {
  padding: SPACE_MD,
  fontFamily: "monospace",
  fontSize: SIZE_FONT_XS,
  color: COLOR_TEXT_MUTED,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  maxHeight: 200,
  overflowY: "auto",
};

const buttonContainerStyle: CSSProperties = {
  display: "flex",
  gap: SPACE_SM,
  padding: `0 ${SPACE_MD}`,
};

const errorStyle: CSSProperties = {
  padding: SPACE_MD,
  color: "#ef4444",
  fontSize: SIZE_FONT_SM,
};

const emptyStateStyle: CSSProperties = {
  padding: SPACE_MD,
  color: COLOR_TEXT_MUTED,
  fontSize: SIZE_FONT_SM,
  textAlign: "center",
};

const tabOptions: Array<{ value: TextExportFormat; label: string }> = [
  { value: "mermaid", label: "Mermaid" },
  { value: "markdown", label: "Markdown" },
  { value: "ascii", label: "ASCII" },
];

// =============================================================================
// Mermaid Preview Component
// =============================================================================

const MermaidPreview = memo(function MermaidPreview({
  content,
}: {
  content: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const idRef = useRef(`mermaid-${Date.now()}`);

  useEffect(() => {
    const renderMermaid = async () => {
      if (!content) {
        setSvgContent("");
        return;
      }

      try {
        // Initialize mermaid with a fresh config each time
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          flowchart: {
            htmlLabels: true,
            curve: "basis",
          },
        });

        // Generate unique ID
        idRef.current = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

        const { svg } = await mermaid.render(idRef.current, content);
        setSvgContent(svg);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to render Mermaid diagram");
        setSvgContent("");
      }
    };

    renderMermaid();
  }, [content]);

  if (error) {
    return <div style={errorStyle}>Error: {error}</div>;
  }

  return (
    <div
      ref={containerRef}
      style={mermaidPreviewStyle}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
});

// =============================================================================
// Markdown Preview Component
// =============================================================================

const markdownComponents = {
  // Custom styling for code blocks
  pre: ({ children, ...props }: React.HTMLProps<HTMLPreElement>) => (
    <pre
      style={{
        backgroundColor: COLOR_SURFACE_RAISED,
        padding: SPACE_SM,
        borderRadius: RADIUS_SM,
        overflow: "auto",
        fontSize: SIZE_FONT_XS,
      }}
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ children, ...props }: React.HTMLProps<HTMLElement>) => (
    <code
      style={{
        fontFamily: "monospace",
        fontSize: SIZE_FONT_XS,
      }}
      {...props}
    >
      {children}
    </code>
  ),
  table: ({ children, ...props }: React.HTMLProps<HTMLTableElement>) => (
    <table
      style={{
        borderCollapse: "collapse",
        width: "100%",
        fontSize: SIZE_FONT_XS,
      }}
      {...props}
    >
      {children}
    </table>
  ),
  th: ({ children, ...props }: React.HTMLProps<HTMLTableCellElement>) => (
    <th
      style={{
        border: `1px solid ${COLOR_BORDER}`,
        padding: SPACE_XS,
        backgroundColor: COLOR_SURFACE_RAISED,
        textAlign: "left",
      }}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLProps<HTMLTableCellElement>) => (
    <td
      style={{
        border: `1px solid ${COLOR_BORDER}`,
        padding: SPACE_XS,
      }}
      {...props}
    >
      {children}
    </td>
  ),
};

const MarkdownPreview = memo(function MarkdownPreview({
  content,
}: {
  content: string;
}) {
  return (
    <div style={markdownPreviewStyle}>
      <Markdown components={markdownComponents}>{content}</Markdown>
    </div>
  );
});

// =============================================================================
// ASCII Preview Component
// =============================================================================

const ASCIIPreview = memo(function ASCIIPreview({
  content,
}: {
  content: string;
}) {
  return (
    <div style={asciiPreviewStyle}>
      <span style={{ color: "#d4d4d4" }}>{content}</span>
    </div>
  );
});

// =============================================================================
// Main Component
// =============================================================================

export const TextExportSection = memo(function TextExportSection({
  frames,
  allNodes,
  allConnections,
  symbolDef,
}: TextExportSectionProps) {
  const [format, setFormat] = useState<TextExportFormat>("mermaid");
  const [selectedFrameId, setSelectedFrameId] = useState<string>("");
  const [previewExpanded, setPreviewExpanded] = useState(true);
  const [sourceExpanded, setSourceExpanded] = useState(false);
  const [exportContent, setExportContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-select first frame when frames change
  useEffect(() => {
    if (frames.length > 0 && !selectedFrameId) {
      setSelectedFrameId(frames[0].id);
    } else if (frames.length === 0) {
      setSelectedFrameId("");
    }
  }, [frames, selectedFrameId]);

  // Frame select options
  const frameOptions: SelectOption[] = useMemo(() => {
    return frames.map((frame) => ({
      value: frame.id,
      label: frame.preset,
    }));
  }, [frames]);

  // Get selected frame
  const selectedFrame = useMemo(() => {
    return frames.find((f) => f.id === selectedFrameId);
  }, [frames, selectedFrameId]);

  // Generate export content when format, frame, or data changes
  useEffect(() => {
    if (!selectedFrame) {
      setExportContent("");
      return;
    }

    const generateContent = async () => {
      setIsLoading(true);
      try {
        switch (format) {
          case "mermaid":
            setExportContent(exportFrameToMermaid(selectedFrame, allNodes, allConnections, symbolDef));
            break;
          case "markdown":
            setExportContent(exportFrameToMarkdown(selectedFrame, allNodes, allConnections, symbolDef));
            break;
          case "ascii":
            setExportContent(exportFrameToASCII(selectedFrame, allNodes, allConnections, symbolDef));
            break;
        }
      } catch {
        setExportContent("Error generating export content");
      } finally {
        setIsLoading(false);
      }
    };

    generateContent();
  }, [format, selectedFrame, allNodes, allConnections, symbolDef]);

  const handleFormatChange = useCallback((value: TextExportFormat | TextExportFormat[]) => {
    if (Array.isArray(value)) return;
    setFormat(value);
  }, []);

  const handleFrameChange = useCallback((value: string) => {
    setSelectedFrameId(value);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportContent);
    } catch {
      // Fallback for older browsers
      const textarea = window.document.createElement("textarea");
      textarea.value = exportContent;
      window.document.body.appendChild(textarea);
      textarea.select();
      window.document.execCommand("copy");
      window.document.body.removeChild(textarea);
    }
  }, [exportContent]);

  const handleDownload = useCallback(() => {
    const frameName = selectedFrame?.preset ?? "diagram";
    const extension = format === "markdown" ? "md" : format === "mermaid" ? "mmd" : "txt";
    const mimeType = "text/plain";
    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${frameName}-export.${extension}`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportContent, format, selectedFrame]);

  const previewComponent = useMemo(() => {
    if (!selectedFrame) {
      return <div style={emptyStateStyle}>No frame selected</div>;
    }

    if (isLoading) {
      return <div style={{ padding: SPACE_MD, color: COLOR_TEXT_MUTED }}>Loading...</div>;
    }

    switch (format) {
      case "mermaid":
        return <MermaidPreview content={exportContent} />;
      case "markdown":
        return <MarkdownPreview content={exportContent} />;
      case "ascii":
        return <ASCIIPreview content={exportContent} />;
    }
  }, [format, exportContent, isLoading, selectedFrame]);

  // Don't show section if no frames
  if (frames.length === 0) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <SectionHeader title="Text Export" />

      <PropertyRow label="Frame">
        <Select
          options={frameOptions}
          value={selectedFrameId}
          onChange={handleFrameChange}
          size="sm"
        />
      </PropertyRow>

      <div style={formatSelectorStyle}>
        <SegmentedControl
          options={tabOptions}
          value={format}
          onChange={handleFormatChange}
          size="sm"
        />
      </div>

      <PropertySection
        title="Preview"
        collapsible
        expanded={previewExpanded}
        onToggle={setPreviewExpanded}
        contentPadding="sm"
      >
        <div style={previewContainerStyle}>{previewComponent}</div>
      </PropertySection>

      <PropertySection
        title="Source"
        collapsible
        expanded={sourceExpanded}
        onToggle={setSourceExpanded}
        contentPadding="sm"
      >
        <div style={{ ...previewContainerStyle, maxHeight: 200 }}>
          <div style={codePreviewStyle}>{exportContent}</div>
        </div>
      </PropertySection>

      <div style={buttonContainerStyle}>
        <Button variant="secondary" size="sm" onClick={handleCopy} disabled={!selectedFrame}>
          Copy to Clipboard
        </Button>
        <Button variant="secondary" size="sm" onClick={handleDownload} disabled={!selectedFrame}>
          Download
        </Button>
      </div>
    </div>
  );
});
