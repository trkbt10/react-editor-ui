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
import { Button } from "../../../components/Button/Button";
import type { Token, Tokenizer } from "../../../components/Editor/code/types";

// Simple JSON tokenizer for demo purposes
const jsonTokenizer: Tokenizer = {
  tokenize: (line: string): readonly Token[] => {
    const tokens: Token[] = [];
    // eslint-disable-next-line no-restricted-syntax -- Mutable accumulator for tokenizer position
    let pos = 0;

    while (pos < line.length) {
      // Skip whitespace
      if (/\s/.test(line[pos])) {
        const start = pos;
        while (pos < line.length && /\s/.test(line[pos])) {
          pos++;
        }
        tokens.push({ type: "whitespace", text: line.slice(start, pos), start, end: pos });
        continue;
      }

      // String
      if (line[pos] === '"') {
        const start = pos;
        pos++;
        while (pos < line.length && line[pos] !== '"') {
          if (line[pos] === '\\') {
            pos++;
          }
          pos++;
        }
        pos++;
        tokens.push({ type: "string", text: line.slice(start, pos), start, end: pos });
        continue;
      }

      // Number
      if (/[0-9-]/.test(line[pos])) {
        const start = pos;
        while (pos < line.length && /[0-9.eE+-]/.test(line[pos])) {
          pos++;
        }
        tokens.push({ type: "number", text: line.slice(start, pos), start, end: pos });
        continue;
      }

      // Keywords: true, false, null
      const remaining = line.slice(pos);
      const keywordMatch = remaining.match(/^(true|false|null)/);
      if (keywordMatch) {
        tokens.push({ type: "keyword", text: keywordMatch[0], start: pos, end: pos + keywordMatch[0].length });
        pos += keywordMatch[0].length;
        continue;
      }

      // Punctuation
      if (/[{}[\]:,]/.test(line[pos])) {
        tokens.push({ type: "punctuation", text: line[pos], start: pos, end: pos + 1 });
        pos++;
        continue;
      }

      // Unknown
      tokens.push({ type: "unknown", text: line[pos], start: pos, end: pos + 1 });
      pos++;
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
  const [code, setCode] = useState(sampleJson);
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
          value={code}
          onChange={setCode}
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
          value={code}
          onChange={() => {}}
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
