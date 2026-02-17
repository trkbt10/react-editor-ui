/**
 * @file CodeEditor Viewport mount page for E2E tests
 *
 * CodeEditor with viewport mode enabled for testing fixed canvas rendering.
 */

import { useState, type CSSProperties } from "react";
import { CodeEditor } from "../../code/CodeEditor";
import { createBlockDocument } from "../../block/blockDocument";
import type { Token, Tokenizer } from "../../renderers/types";

// Generate 100 lines of code for testing scrolling
const generateCode = (): string => {
  const lines: string[] = [];
  for (let i = 1; i <= 100; i++) {
    lines.push(`// Line ${i}: function example${i}() { return ${i}; }`);
  }
  return lines.join("\n");
};

const initialCode = generateCode();

// Simple tokenizer for testing
const simpleTokenizer: Tokenizer = {
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

      // Comment
      if (line.slice(cursor.pos, cursor.pos + 2) === "//") {
        tokens.push({ type: "comment", text: line.slice(cursor.pos), start: cursor.pos, end: line.length });
        cursor.pos = line.length;
        continue;
      }

      // Keywords
      const keywordMatch = line.slice(cursor.pos).match(/^(function|return|const|let|var)\b/);
      if (keywordMatch) {
        const start = cursor.pos;
        cursor.pos += keywordMatch[0].length;
        tokens.push({ type: "keyword", text: keywordMatch[0], start, end: cursor.pos });
        continue;
      }

      // Numbers
      if (/[0-9]/.test(line[cursor.pos])) {
        const start = cursor.pos;
        while (cursor.pos < line.length && /[0-9]/.test(line[cursor.pos])) {
          cursor.pos++;
        }
        tokens.push({ type: "number", text: line.slice(start, cursor.pos), start, end: cursor.pos });
        continue;
      }

      // Identifiers
      if (/[a-zA-Z_]/.test(line[cursor.pos])) {
        const start = cursor.pos;
        while (cursor.pos < line.length && /[a-zA-Z0-9_]/.test(line[cursor.pos])) {
          cursor.pos++;
        }
        tokens.push({ type: "identifier", text: line.slice(start, cursor.pos), start, end: cursor.pos });
        continue;
      }

      // Other characters
      tokens.push({ type: "punctuation", text: line[cursor.pos], start: cursor.pos, end: cursor.pos + 1 });
      cursor.pos++;
    }

    return tokens;
  },
};

const tokenStyles: Record<string, CSSProperties> = {
  keyword: { color: "#c678dd" },
  number: { color: "#d19a66" },
  comment: { color: "#5c6370" },
  identifier: { color: "#e5c07b" },
  punctuation: { color: "#abb2bf" },
  whitespace: {},
};

/**
 * CodeEditor Viewport mount page for E2E testing.
 * Uses viewportConfig with canvas renderer for fixed viewport behavior.
 */
export default function CodeEditorViewportMount() {
  const [doc, setDoc] = useState(() => createBlockDocument(initialCode));
  const [viewportEnabled, setViewportEnabled] = useState(true);

  return (
    <div className="editor-mount">
      <h1>CodeEditor Viewport E2E</h1>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={viewportEnabled}
            onChange={(e) => setViewportEnabled(e.target.checked)}
            data-testid="viewport-toggle"
          />
          <span>Viewport Mode</span>
        </label>
        <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
          100 lines of code. Canvas should be fixed size when viewport mode is enabled.
        </p>
      </div>

      <div className="editor-section" data-testid="editor-container">
        <CodeEditor
          document={doc}
          onDocumentChange={setDoc}
          tokenizer={simpleTokenizer}
          tokenStyles={tokenStyles}
          showLineNumbers
          renderer="canvas"
          viewportConfig={viewportEnabled ? { mode: "text", fixedViewport: true } : undefined}
          style={{
            height: 300,
            border: "1px solid #3a3a3c",
            borderRadius: 4,
            backgroundColor: "#282c34",
          }}
        />
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: "#888" }}>
        <p>Document: {doc.blocks.reduce((sum, b) => sum + b.content.split("\n").length, 0)} lines</p>
      </div>
    </div>
  );
}
