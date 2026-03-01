/**
 * @file MarkdownViewer demo page
 */

import { useState, useCallback, useMemo, memo } from "react";
import { DemoContainer, DemoSection, DemoMutedText } from "../../components";
import {
  MarkdownViewer,
  useMarkdownBlocks,
} from "../../../viewers/MarkdownViewer/MarkdownViewer";
import type {
  CodeBlockProps,
  BlockComponentMap,
} from "../../../viewers/MarkdownViewer/MarkdownViewer";
import { LogViewer } from "../../../viewers/LogViewer/LogViewer";
import type { LogItem } from "../../../viewers/LogViewer/LogViewer";
import {
  COLOR_SURFACE,
  COLOR_SURFACE_RAISED,
  COLOR_TEXT,
  COLOR_BORDER,
  SPACE_MD,
  SPACE_LG,
  SPACE_XL,
  RADIUS_SM,
} from "../../../themes/styles";

const SAMPLE_MARKDOWN = `# Markdown Viewer Demo

This is a **streaming markdown parser** demo. It parses markdown content incrementally.

## Features

- Headings (h1-h6)
- **Bold** and *italic* text
- ~~Strikethrough~~ support
- Inline \`code\` spans
- Unordered and ordered lists

## Code Block

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table

| Feature | Status |
|---------|--------|
| Headers | Done |
| Lists | Done |
| Code | Done |
| Tables | Done |

## Blockquote

> The streaming parser processes markdown as it arrives,
> enabling real-time rendering of LLM responses.

---

That's all for now!
`;

// Custom code block renderer demo: adds language label and line numbers
const customCodeStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "12px",
  backgroundColor: "#1e1e2e",
  color: "#cdd6f4",
  padding: `${SPACE_MD} ${SPACE_LG}`,
  borderRadius: RADIUS_SM,
  whiteSpace: "pre",
  overflow: "auto",
  display: "block",
  margin: "4px 0",
  position: "relative",
};

const langLabelStyle: React.CSSProperties = {
  position: "absolute",
  top: "4px",
  right: "8px",
  fontSize: "10px",
  color: "#a6adc8",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const CustomCodeBlock = memo(function CustomCodeBlock({
  block,
  language,
}: CodeBlockProps) {
  const lines = block.content.split("\n");
  return (
    <pre style={customCodeStyle}>
      {language ? <span style={langLabelStyle}>{language}</span> : null}
      <code>
        {lines.map((line, i) => (
          <span key={i}>
            <span style={{ color: "#585b70", marginRight: "16px", userSelect: "none" }}>
              {String(i + 1).padStart(3)}
            </span>
            {line}
            {"\n"}
          </span>
        ))}
      </code>
    </pre>
  );
});

const customComponents: BlockComponentMap = {
  code: CustomCodeBlock,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "200px",
  fontFamily: "monospace",
  fontSize: "12px",
  padding: SPACE_MD,
  borderRadius: RADIUS_SM,
  border: `1px solid ${COLOR_BORDER}`,
  backgroundColor: COLOR_SURFACE,
  color: COLOR_TEXT,
  resize: "vertical",
};

const buttonStyle: React.CSSProperties = {
  padding: `6px ${SPACE_XL}`,
  borderRadius: RADIUS_SM,
  border: `1px solid ${COLOR_BORDER}`,
  backgroundColor: COLOR_SURFACE_RAISED,
  color: COLOR_TEXT,
  cursor: "pointer",
  fontSize: "12px",
};

const viewerContainerStyle: React.CSSProperties = {
  padding: SPACE_LG,
  borderRadius: RADIUS_SM,
  border: `1px solid ${COLOR_BORDER}`,
  backgroundColor: COLOR_SURFACE,
  minHeight: "100px",
  fontSize: "13px",
  lineHeight: 1.5,
};

export function MarkdownViewerDemo() {
  const [source, setSource] = useState(SAMPLE_MARKDOWN);
  const [useCustomCode, setUseCustomCode] = useState(false);
  const { blocks, isStreaming, parse, streamParse } = useMarkdownBlocks();

  const handleParse = useCallback(() => {
    parse(source);
  }, [parse, source]);

  const handleStreamParse = useCallback(() => {
    streamParse(source, 20);
  }, [streamParse, source]);

  const handleSourceChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSource(e.target.value);
    },
    [],
  );

  const handleToggleCustomCode = useCallback(() => {
    setUseCustomCode((v) => !v);
  }, []);

  const logItems = useMemo<LogItem[]>(
    () =>
      blocks.map((block) => ({
        message: block.content.length > 80 ? `${block.content.slice(0, 80)}...` : block.content,
        level: "info" as const,
        source: `[${block.type}] ${block.id}`,
        details: block.metadata ? JSON.stringify(block.metadata) : undefined,
      })),
    [blocks],
  );

  const components = useCustomCode ? customComponents : undefined;

  return (
    <DemoContainer title="MarkdownViewer">
      <DemoMutedText size={12}>
        Streaming markdown parser with incremental block detection. Edit the source and parse to see
        results.
      </DemoMutedText>

      <DemoSection label="Markdown Source">
        <textarea
          style={textareaStyle}
          value={source}
          onChange={handleSourceChange}
        />
        <div style={{ display: "flex", gap: SPACE_MD, marginTop: SPACE_MD, alignItems: "center" }}>
          <button type="button" style={buttonStyle} onClick={handleParse}>
            Parse (instant)
          </button>
          <button type="button" style={buttonStyle} onClick={handleStreamParse}>
            Parse (streaming)
          </button>
          <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
            <input
              type="checkbox"
              checked={useCustomCode}
              onChange={handleToggleCustomCode}
            />
            Custom code block
          </label>
          {isStreaming ? (
            <DemoMutedText size={12}>Streaming...</DemoMutedText>
          ) : null}
        </div>
      </DemoSection>

      <DemoSection label="Parsed Output">
        <div style={viewerContainerStyle}>
          {blocks.length > 0 ? (
            <MarkdownViewer
              value={source}
              blocks={blocks}
              components={components}
              className="markdown-viewer-demo"
            />
          ) : (
            <DemoMutedText size={12}>
              Click &quot;Parse&quot; to see the rendered output.
            </DemoMutedText>
          )}
        </div>
      </DemoSection>

      <DemoSection label="Parsed Blocks (debug)">
        {logItems.length > 0 ? (
          <LogViewer items={logItems} height={300} showCount />
        ) : (
          <DemoMutedText size={11}>No blocks parsed yet.</DemoMutedText>
        )}
      </DemoSection>
    </DemoContainer>
  );
}
