/**
 * @file MarkdownViewer demo page
 */

import { useState, useCallback, useMemo } from "react";
import { DemoContainer, DemoSection, DemoMutedText } from "../../components";
import { MarkdownViewer } from "../../../viewers/MarkdownViewer/MarkdownViewer";
import { createStreamingMarkdownParser, parseTable } from "../../../parsers/Markdown";
import type { MarkdownParseEvent, EndEvent } from "../../../parsers/Markdown";
import { LogViewer } from "../../../viewers/LogViewer/LogViewer";
import type { LogItem } from "../../../viewers/LogViewer/LogViewer";
import {
  COLOR_SURFACE,
  COLOR_SURFACE_RAISED,
  COLOR_TEXT,
  COLOR_BORDER,
  SPACE_SM,
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

type ParsedBlock = {
  id: string;
  type: string;
  content: string;
  metadata?: Record<string, unknown>;
};

/** Snapshot finished + in-progress blocks for rendering. */
function snapshotBlocks(
  finishedBlocks: ParsedBlock[],
  pendingBlocks: Map<string, ParsedBlock>,
): ParsedBlock[] {
  // Clone pending blocks so React sees new object references
  const pending = Array.from(pendingBlocks.values(), (b) => ({ ...b }));
  return [...finishedBlocks, ...pending];
}

function useMarkdownParser() {
  const [blocks, setBlocks] = useState<ParsedBlock[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const parse = useCallback(async (text: string) => {
    setBlocks([]);
    setIsStreaming(true);

    const parser = createStreamingMarkdownParser();
    const pendingBlocks = new Map<string, ParsedBlock>();
    const finishedBlocks: ParsedBlock[] = [];

    for await (const event of parser.processChunk(text)) {
      handleEvent(event, pendingBlocks, finishedBlocks);
    }

    for await (const event of parser.complete()) {
      handleEvent(event, pendingBlocks, finishedBlocks);
    }

    setBlocks(finishedBlocks);
    setIsStreaming(false);
  }, []);

  const streamParse = useCallback(async (text: string, chunkSize: number) => {
    setBlocks([]);
    setIsStreaming(true);

    const parser = createStreamingMarkdownParser();
    const pendingBlocks = new Map<string, ParsedBlock>();
    const finishedBlocks: ParsedBlock[] = [];

    for (const [i] of Array.from({ length: Math.ceil(text.length / chunkSize) }).entries()) {
      const chunk = text.slice(i * chunkSize, (i + 1) * chunkSize);

      for await (const event of parser.processChunk(chunk)) {
        handleEvent(event, pendingBlocks, finishedBlocks);
      }

      // Include both finished and in-progress blocks for real-time text streaming
      setBlocks(snapshotBlocks(finishedBlocks, pendingBlocks));
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    for await (const event of parser.complete()) {
      handleEvent(event, pendingBlocks, finishedBlocks);
    }

    setBlocks([...finishedBlocks]);
    setIsStreaming(false);
  }, []);

  return { blocks, isStreaming, parse, streamParse };
}

function handleEvent(
  event: MarkdownParseEvent,
  pendingBlocks: Map<string, ParsedBlock>,
  finishedBlocks: ParsedBlock[],
): void {
  if (event.type === "begin") {
    pendingBlocks.set(event.elementId, {
      id: event.elementId,
      type: event.elementType,
      content: "",
      metadata: event.metadata,
    });
    return;
  }

  if (event.type === "delta") {
    const block = pendingBlocks.get(event.elementId);
    if (block) {
      block.content += event.content;
    }
    return;
  }

  if (event.type === "end") {
    const endEvent = event as EndEvent;
    const block = pendingBlocks.get(endEvent.elementId);
    if (block) {
      block.content = endEvent.finalContent;
      finishedBlocks.push(block);
      pendingBlocks.delete(endEvent.elementId);
    }
  }
}

const blockStyle: Record<string, React.CSSProperties> = {
  header: { fontWeight: "bold", fontSize: "1.2em", margin: `${SPACE_MD} 0 ${SPACE_SM}` },
  text: { margin: `${SPACE_SM} 0` },
  code: {
    fontFamily: "monospace",
    fontSize: "12px",
    backgroundColor: COLOR_SURFACE,
    color: COLOR_TEXT,
    padding: `${SPACE_MD} ${SPACE_LG}`,
    borderRadius: RADIUS_SM,
    whiteSpace: "pre",
    overflow: "auto",
    display: "block",
    margin: `${SPACE_SM} 0`,
  },
  list: { margin: `${SPACE_SM} 0`, paddingLeft: "20px" },
  quote: {
    borderLeft: `3px solid ${COLOR_BORDER}`,
    paddingLeft: SPACE_LG,
    margin: `${SPACE_SM} 0`,
    fontStyle: "italic",
    opacity: 0.85,
  },
  table: {
    borderCollapse: "collapse" as const,
    width: "100%",
    fontSize: "13px",
    margin: `${SPACE_SM} 0`,
  },
  th: {
    border: `1px solid ${COLOR_BORDER}`,
    padding: `${SPACE_SM} ${SPACE_MD}`,
    fontWeight: "bold",
    backgroundColor: COLOR_SURFACE,
    color: COLOR_TEXT,
  },
  td: {
    border: `1px solid ${COLOR_BORDER}`,
    padding: `${SPACE_SM} ${SPACE_MD}`,
    color: COLOR_TEXT,
  },
  horizontal_rule: {
    borderTop: `1px solid ${COLOR_BORDER}`,
    margin: `${SPACE_MD} 0`,
  },
};

function BlockView({ block }: { block: ParsedBlock }) {
  const style = blockStyle[block.type] ?? blockStyle.text;

  if (block.type === "horizontal_rule") {
    return <hr style={style} />;
  }

  if (block.type === "code") {
    return (
      <pre style={style}>
        <code>{block.content}</code>
      </pre>
    );
  }

  if (block.type === "table") {
    const parsed = parseTable(block.content);
    if (parsed) {
      const alignToTextAlign = (a: "left" | "center" | "right" | undefined): React.CSSProperties["textAlign"] =>
        a ?? "left";
      return (
        <table style={blockStyle.table}>
          <thead>
            <tr>
              {parsed.headers.map((h, i) => (
                <th key={i} style={{ ...blockStyle.th, textAlign: alignToTextAlign(parsed.alignments[i]) }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsed.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ ...blockStyle.td, textAlign: alignToTextAlign(parsed.alignments[ci]) }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    // Fallback: render as preformatted text if parseTable fails (e.g. streaming partial)
    return <pre style={blockStyle.code}>{block.content}</pre>;
  }

  if (block.type === "list") {
    const lines = block.content.split("\n").filter(Boolean);
    const ListTag = block.metadata?.ordered ? "ol" : "ul";
    return (
      <ListTag style={style}>
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ListTag>
    );
  }

  if (block.type === "header") {
    const level = (block.metadata?.level as number) ?? 1;
    const fontSize = `${Math.max(1, 1.6 - level * 0.15)}em`;
    return <div style={{ ...style, fontSize }}>{block.content}</div>;
  }

  return <div style={style}>{block.content}</div>;
}

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
  const { blocks, isStreaming, parse, streamParse } = useMarkdownParser();

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

  const renderedContent = useMemo(
    () => (
      <MarkdownViewer value={source} className="markdown-viewer-demo">
        {blocks.map((block) => (
          <BlockView key={block.id} block={block} />
        ))}
      </MarkdownViewer>
    ),
    [source, blocks],
  );

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
        <div style={{ display: "flex", gap: SPACE_MD, marginTop: SPACE_MD }}>
          <button type="button" style={buttonStyle} onClick={handleParse}>
            Parse (instant)
          </button>
          <button type="button" style={buttonStyle} onClick={handleStreamParse}>
            Parse (streaming)
          </button>
          {isStreaming ? (
            <DemoMutedText size={12}>Streaming...</DemoMutedText>
          ) : null}
        </div>
      </DemoSection>

      <DemoSection label="Parsed Output">
        <div style={viewerContainerStyle}>
          {blocks.length > 0 ? (
            renderedContent
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
