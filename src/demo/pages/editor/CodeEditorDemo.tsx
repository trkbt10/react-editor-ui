/**
 * @file CodeEditor demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoRow,
} from "../../components";
import { CodeEditor } from "../../../components/Editor/code/CodeEditor";
import { createBlockDocument } from "../../../components/Editor/block/blockDocument";
import { Button } from "../../../components/Button/Button";
import type { Token, Tokenizer, BlockDocument } from "../../../components/Editor";

// Simple JSON tokenizer for demo purposes
const jsonTokenizer: Tokenizer = {
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
      if (/[0-9-]/.test(line[cursor.pos])) {
        const start = cursor.pos;
        while (cursor.pos < line.length && /[0-9.eE+-]/.test(line[cursor.pos])) {
          cursor.pos++;
        }
        tokens.push({ type: "number", text: line.slice(start, cursor.pos), start, end: cursor.pos });
        continue;
      }

      // Keywords: true, false, null
      const remaining = line.slice(cursor.pos);
      const keywordMatch = remaining.match(/^(true|false|null)/);
      if (keywordMatch) {
        tokens.push({ type: "keyword", text: keywordMatch[0], start: cursor.pos, end: cursor.pos + keywordMatch[0].length });
        cursor.pos += keywordMatch[0].length;
        continue;
      }

      // Punctuation
      if (/[{}[\]:,]/.test(line[cursor.pos])) {
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

const jsonTokenStyles = {
  string: { color: "#a31515" },
  number: { color: "#098658" },
  keyword: { color: "#0000ff" },
  punctuation: { color: "#333333" },
  whitespace: {},
  unknown: { color: "#666666" },
};

const sampleJson = `{
  "name": "react-editor-ui",
  "version": "1.0.0",
  "description": "UI components for editor applications",
  "features": [
    "syntax highlighting",
    "IME support",
    "virtual scrolling"
  ],
  "count": 42,
  "active": true,
  "nullable": null
}`;

export function CodeEditorDemo() {
  const [doc, setDoc] = useState<BlockDocument>(() => createBlockDocument(sampleJson));
  const [renderer, setRenderer] = useState<"svg" | "canvas">("svg");

  return (
    <DemoContainer title="CodeEditor">
      <DemoSection label="Renderer">
        <DemoRow>
          <Button
            variant={renderer === "svg" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setRenderer("svg")}
          >
            SVG
          </Button>
          <Button
            variant={renderer === "canvas" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setRenderer("canvas")}
          >
            Canvas
          </Button>
        </DemoRow>
      </DemoSection>

      <DemoSection label="With JSON Tokenizer">
        <CodeEditor
          document={doc}
          onDocumentChange={setDoc}
          tokenizer={jsonTokenizer}
          tokenStyles={jsonTokenStyles}
          renderer={renderer}
          showLineNumbers
          style={{
            height: 300,
            border: "1px solid var(--rei-color-border, #3a3a3c)",
            borderRadius: 4,
          }}
        />
      </DemoSection>

      <DemoSection label="Read Only">
        <CodeEditor
          document={doc}
          onDocumentChange={() => {}}
          tokenizer={jsonTokenizer}
          tokenStyles={jsonTokenStyles}
          renderer={renderer}
          showLineNumbers
          readOnly
          style={{
            height: 200,
            border: "1px solid var(--rei-color-border, #3a3a3c)",
            borderRadius: 4,
            opacity: 0.8,
          }}
        />
      </DemoSection>
    </DemoContainer>
  );
}
