/**
 * @file Shared content and styles for Markdown Editor demos
 */

import type { CSSProperties } from "react";

// =============================================================================
// Sample Markdown Content
// =============================================================================

export const sampleMarkdown = `# Markdown Block Editor

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

export const containerStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  height: "calc(100vh - 140px)",
  minHeight: 500,
};

export const panelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  minHeight: 0,
};

export const panelHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid var(--rei-color-border)",
};

export const panelTitleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--rei-color-text-primary)",
};

export const editorContainerStyle: CSSProperties = {
  flex: 1,
  border: "1px solid var(--rei-color-border)",
  borderRadius: 6,
  overflow: "hidden",
  minHeight: 0,
};

export const previewContainerStyle: CSSProperties = {
  flex: 1,
  border: "1px solid var(--rei-color-border)",
  borderRadius: 6,
  overflow: "auto",
  minHeight: 0,
  backgroundColor: "var(--rei-color-bg-secondary)",
};

export const previewContentStyle: CSSProperties = {
  padding: 16,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 13,
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  color: "var(--rei-color-text-primary)",
};

export const infoBoxStyle: CSSProperties = {
  padding: "12px 16px",
  backgroundColor: "var(--rei-color-bg-tertiary)",
  borderRadius: 6,
  fontSize: 12,
  color: "var(--rei-color-text-secondary)",
  marginBottom: 16,
};

export const statsStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  marginBottom: 16,
  alignItems: "center",
};

export const statsTextStyle: CSSProperties = {
  fontSize: 12,
  color: "var(--rei-color-text-tertiary)",
};
