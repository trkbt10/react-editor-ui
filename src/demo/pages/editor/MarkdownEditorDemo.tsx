/**
 * @file Markdown Editor demo page
 *
 * Demonstrates the block-based Markdown editor with:
 * - Live parsing of Markdown syntax
 * - Visual rendering of block types (headings, lists, quotes, code)
 * - Inline styles (bold, italic, code, strikethrough)
 * - Real-time Markdown export preview
 */

import { useState, useMemo, type CSSProperties } from "react";
import { DemoContainer } from "../../components";
import { TextEditorWithToolbar } from "../../../editors/RichTextEditors/text/TextEditorWithToolbar";
import type { BlockDocument } from "../../../editors/RichTextEditors/block/blockDocument";
import {
  parseMarkdownToBlockDocument,
  blockDocumentToMarkdown,
} from "../../../editors/RichTextEditors/block/markdownParser";

// =============================================================================
// Sample Markdown Content
// =============================================================================

const sampleMarkdown = `# Markdown Block Editor

This is a paragraph with **bold**, *italic*, and \`inline code\`.

## Features

The editor supports:

- **Bold** text with \`**\` delimiters
- *Italic* text with \`*\` delimiters
- \`Code\` with backticks
- ~~Strikethrough~~ with \`~~\`
- ***Bold and italic*** combined

### Nested Styles

You can have **bold with *nested italic* inside** for complex formatting.

## Block Types

### Headings

Three levels of headings are supported (H1, H2, H3).

### Lists

Unordered lists:

- First item
- Second item
- Third item

Ordered lists:

1. Step one
2. Step two
3. Step three

### Blockquotes

> This is a blockquote.
> It can span multiple lines.

### Code Blocks

\`\`\`
function greet(name: string) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");
\`\`\`

## Round-trip Integrity

Edit the content above and see the Markdown output update in real-time.
The parser ensures that Markdown → BlockDocument → Markdown preserves your content.`;

// =============================================================================
// Styles
// =============================================================================

const containerStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  height: "calc(100vh - 140px)",
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

// =============================================================================
// Component
// =============================================================================

export function MarkdownEditorDemo() {
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

      <div style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--rei-color-text-tertiary)" }}>
          {stats.blocks} blocks · {stats.chars} chars · {stats.styles} styles
        </span>
      </div>

      <div style={containerStyle}>
        {/* Editor Panel */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span style={panelTitleStyle}>Editor</span>
            <span style={{ fontSize: 11, color: "var(--rei-color-text-tertiary)" }}>
              Select text to show toolbar
            </span>
          </div>
          <div style={editorContainerStyle}>
            <TextEditorWithToolbar
              document={doc}
              onDocumentChange={setDoc}
              enabledOperations={["bold", "italic", "underline", "strikethrough", "code"]}
              style={{ height: "100%", padding: 8 }}
            />
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
