/**
 * @file Markdown Editor shared layout
 *
 * Provides shared state and layout for Markdown editor demos.
 * Uses Outlet context to inject doc, setDoc, and computed values to child routes.
 */

import { useState, useMemo, type CSSProperties } from "react";
import { Outlet, useOutletContext, NavLink, useLocation } from "react-router";
import { DemoContainer } from "../../../components";
import type { BlockDocument } from "../../../../editors/RichTextEditors/block/blockDocument";
import {
  parseMarkdownToBlockDocument,
  blockDocumentToMarkdown,
} from "../../../../editors/RichTextEditors/block/markdownParser";
import { sampleMarkdown } from "../markdownEditorCommon";

// =============================================================================
// Types
// =============================================================================

export type MarkdownOutletContext = {
  doc: BlockDocument;
  setDoc: (doc: BlockDocument) => void;
  markdownOutput: string;
  stats: { blocks: number; chars: number; styles: number };
};

// =============================================================================
// Hook for child routes
// =============================================================================

export function useMarkdownContext(): MarkdownOutletContext {
  return useOutletContext<MarkdownOutletContext>();
}

// =============================================================================
// Styles
// =============================================================================

const containerStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  height: "calc(100vh - 180px)",
  minHeight: 500,
};

const panelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  minHeight: 0,
};

const panelHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid var(--rei-color-border)",
};

const panelTitleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--rei-color-text-primary)",
};

const editorContainerStyle: CSSProperties = {
  flex: 1,
  border: "1px solid var(--rei-color-border)",
  borderRadius: 6,
  overflow: "hidden",
  minHeight: 0,
};

const previewContainerStyle: CSSProperties = {
  flex: 1,
  border: "1px solid var(--rei-color-border)",
  borderRadius: 6,
  overflow: "auto",
  minHeight: 0,
  backgroundColor: "var(--rei-color-bg-secondary)",
};

const previewContentStyle: CSSProperties = {
  padding: 16,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 13,
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  color: "var(--rei-color-text-primary)",
};

const infoBoxStyle: CSSProperties = {
  padding: "12px 16px",
  backgroundColor: "var(--rei-color-bg-tertiary)",
  borderRadius: 6,
  fontSize: 12,
  color: "var(--rei-color-text-secondary)",
  marginBottom: 16,
};

const tabsStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 16,
};

const tabStyle: CSSProperties = {
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 500,
  color: "var(--rei-color-text-secondary)",
  backgroundColor: "transparent",
  border: "1px solid var(--rei-color-border)",
  borderRadius: 4,
  textDecoration: "none",
  transition: "all 0.15s ease",
};

const activeTabStyle: CSSProperties = {
  ...tabStyle,
  color: "var(--rei-color-text-primary)",
  backgroundColor: "var(--rei-color-bg-secondary)",
  borderColor: "var(--rei-color-primary)",
};

const statsStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  marginBottom: 16,
  alignItems: "center",
};

const statsTextStyle: CSSProperties = {
  fontSize: 12,
  color: "var(--rei-color-text-tertiary)",
};

// =============================================================================
// Renderer tabs configuration
// =============================================================================

const rendererTabs = [
  { path: "svg", label: "SVG" },
  { path: "canvas", label: "Canvas" },
];

// =============================================================================
// Component
// =============================================================================

export function MarkdownLayout() {
  const location = useLocation();
  const [doc, setDoc] = useState<BlockDocument>(() =>
    parseMarkdownToBlockDocument(sampleMarkdown)
  );

  // Convert document back to Markdown for preview
  const markdownOutput = useMemo(() => blockDocumentToMarkdown(doc), [doc]);

  // Document stats
  const stats = useMemo(() => {
    const blocks = doc.blocks.length;
    const chars = doc.blocks.reduce((sum, b) => sum + b.content.length, 0);
    const styles = doc.blocks.reduce((sum, b) => sum + b.styles.length, 0);
    return { blocks, chars, styles };
  }, [doc]);

  // Get current renderer from path
  const currentRenderer = location.pathname.split("/").pop() ?? "svg";

  const context: MarkdownOutletContext = {
    doc,
    setDoc,
    markdownOutput,
    stats,
  };

  return (
    <DemoContainer title="Markdown Editor">
      <div style={infoBoxStyle}>
        <strong>Markdown Block Editor</strong> — Edit Markdown with visual
        block styling. The content is parsed into a BlockDocument, rendered with
        block-type styles (headings, lists, quotes, code), and can be exported
        back to Markdown. Inline styles like <code>**bold**</code>,{" "}
        <code>*italic*</code>, <code>`code`</code>, and{" "}
        <code>~~strikethrough~~</code> are preserved.
      </div>

      {/* Renderer tabs */}
      <div style={tabsStyle}>
        {rendererTabs.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            style={currentRenderer === path ? activeTabStyle : tabStyle}
          >
            {label}
          </NavLink>
        ))}
      </div>

      <div style={statsStyle}>
        <span style={statsTextStyle}>
          {stats.blocks} blocks · {stats.chars} chars · {stats.styles} styles
        </span>
        <span style={statsTextStyle}>
          Renderer: <strong>{currentRenderer.toUpperCase()}</strong>
        </span>
      </div>

      <div style={containerStyle}>
        {/* Editor Panel - rendered by child route */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span style={panelTitleStyle}>Editor</span>
            <span style={{ fontSize: 11, color: "var(--rei-color-text-tertiary)" }}>
              Select text to show toolbar
            </span>
          </div>
          <div style={editorContainerStyle}>
            <Outlet context={context} />
          </div>
        </div>

        {/* Preview Panel */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span style={panelTitleStyle}>Markdown Output</span>
          </div>
          <div style={previewContainerStyle}>
            <pre style={previewContentStyle}>{markdownOutput}</pre>
          </div>
        </div>
      </div>
    </DemoContainer>
  );
}
