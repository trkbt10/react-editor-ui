/**
 * @file CodeEditor Context Menu mount page for E2E tests
 *
 * Tests right-click context menu behavior and cursor visibility on dark backgrounds.
 * Provides both canvas and SVG renderer options.
 */

import { useState, type CSSProperties } from "react";
import { CodeEditor } from "../../code/CodeEditor";
import { createBlockDocument } from "../../block/blockDocument";
import type { Token, Tokenizer, RendererType } from "../../renderers/types";

const initialCode = `// Hello World
function greet(name) {
  return "Hello, " + name + "!";
}

// Select this text with mouse
const message = greet("World");
console.log(message);`;

// Simple tokenizer
const simpleTokenizer: Tokenizer = {
  tokenize: (line: string): readonly Token[] => {
    const tokens: Token[] = [];
    const cursor = { pos: 0 };

    while (cursor.pos < line.length) {
      if (/\s/.test(line[cursor.pos])) {
        const start = cursor.pos;
        while (cursor.pos < line.length && /\s/.test(line[cursor.pos])) {
          cursor.pos++;
        }
        tokens.push({ type: "whitespace", text: line.slice(start, cursor.pos), start, end: cursor.pos });
        continue;
      }

      if (line.slice(cursor.pos, cursor.pos + 2) === "//") {
        tokens.push({ type: "comment", text: line.slice(cursor.pos), start: cursor.pos, end: line.length });
        cursor.pos = line.length;
        continue;
      }

      const keywordMatch = line.slice(cursor.pos).match(/^(function|return|const|let|var)\b/);
      if (keywordMatch) {
        const start = cursor.pos;
        cursor.pos += keywordMatch[0].length;
        tokens.push({ type: "keyword", text: keywordMatch[0], start, end: cursor.pos });
        continue;
      }

      if (/[a-zA-Z_]/.test(line[cursor.pos])) {
        const start = cursor.pos;
        while (cursor.pos < line.length && /[a-zA-Z0-9_]/.test(line[cursor.pos])) {
          cursor.pos++;
        }
        tokens.push({ type: "identifier", text: line.slice(start, cursor.pos), start, end: cursor.pos });
        continue;
      }

      tokens.push({ type: "punctuation", text: line[cursor.pos], start: cursor.pos, end: cursor.pos + 1 });
      cursor.pos++;
    }

    return tokens;
  },
};

// Dark theme token styles
const darkTokenStyles: Record<string, CSSProperties> = {
  keyword: { color: "#c678dd" },
  comment: { color: "#5c6370" },
  identifier: { color: "#e5c07b" },
  punctuation: { color: "#abb2bf" },
  whitespace: {},
};

// Light theme token styles
const lightTokenStyles: Record<string, CSSProperties> = {
  keyword: { color: "#0000ff" },
  comment: { color: "#008000" },
  identifier: { color: "#795e26" },
  punctuation: { color: "#000000" },
  whitespace: {},
};

/**
 * CodeEditor Context Menu mount page for E2E testing.
 * Tests right-click selection preservation and cursor visibility.
 */
export default function CodeEditorContextMenuMount() {
  const [doc, setDoc] = useState(() => createBlockDocument(initialCode));
  const [renderer, setRenderer] = useState<RendererType>("canvas");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const isDark = theme === "dark";
  const tokenStyles = isDark ? darkTokenStyles : lightTokenStyles;
  const backgroundColor = isDark ? "#282c34" : "#ffffff";
  const borderColor = isDark ? "#3a3a3c" : "#cccccc";

  return (
    <div
      className="editor-mount"
      style={{
        backgroundColor: isDark ? "#1e1e1e" : "#f5f5f5",
        minHeight: "100vh",
        padding: 16,
      }}
    >
      <h1 style={{ color: isDark ? "#fff" : "#000" }}>CodeEditor Context Menu E2E</h1>

      <div style={{ marginBottom: 16, display: "flex", gap: 16 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, color: isDark ? "#ccc" : "#333" }}>
          <span>Renderer:</span>
          <select
            value={renderer}
            onChange={(e) => setRenderer(e.target.value as RendererType)}
            data-testid="renderer-select"
            style={{ padding: "4px 8px" }}
          >
            <option value="canvas">Canvas</option>
            <option value="svg">SVG</option>
          </select>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8, color: isDark ? "#ccc" : "#333" }}>
          <span>Theme:</span>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as "dark" | "light")}
            data-testid="theme-select"
            style={{ padding: "4px 8px" }}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: 16, fontSize: 12, color: isDark ? "#888" : "#666" }}>
        <p>1. Select text by dragging</p>
        <p>2. Right-click within selection to verify context menu shows &quot;Copy&quot; (not &quot;Copy Image&quot;)</p>
        <p>3. Verify cursor is visible in both dark and light themes</p>
      </div>

      <div className="editor-section" data-testid="editor-container">
        <CodeEditor
          document={doc}
          onDocumentChange={setDoc}
          tokenizer={simpleTokenizer}
          tokenStyles={tokenStyles}
          showLineNumbers
          renderer={renderer}
          style={{
            height: 300,
            border: `1px solid ${borderColor}`,
            borderRadius: 4,
            backgroundColor,
          }}
        />
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: isDark ? "#888" : "#666" }}>
        <p>Renderer: {renderer}</p>
        <p>Theme: {theme}</p>
        <p>Background: {backgroundColor}</p>
      </div>
    </div>
  );
}
