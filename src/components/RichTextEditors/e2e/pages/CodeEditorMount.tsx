/**
 * @file CodeEditor mount page for E2E tests
 *
 * Minimal CodeEditor setup with simple tokenizer.
 * Includes both editable and readonly editors for testing.
 */

import { useState } from "react";
import { CodeEditor } from "../../code/CodeEditor";
import { createBlockDocument } from "../../block/blockDocument";
import type { Token, Tokenizer } from "../../code/types";

const initialCode = `function hello() {
  console.log("Hello World");
}

hello();`;

// Simple tokenizer for testing
const simpleTokenizer: Tokenizer = {
  tokenize: (line: string): readonly Token[] => {
    const tokens: Token[] = [];

    for (let pos = 0; pos < line.length; ) {
      // Whitespace
      if (/\s/.test(line[pos])) {
        const start = pos;
        while (pos < line.length && /\s/.test(line[pos])) {pos++;}
        tokens.push({ type: "whitespace", text: line.slice(start, pos), start, end: pos });
        continue;
      }

      // String
      if (line[pos] === '"' || line[pos] === "'") {
        const quote = line[pos];
        const start = pos;
        pos++;
        while (pos < line.length && line[pos] !== quote) {
          if (line[pos] === "\\") {pos++;}
          pos++;
        }
        pos++;
        tokens.push({ type: "string", text: line.slice(start, pos), start, end: pos });
        continue;
      }

      // Keyword
      const remaining = line.slice(pos);
      const keywordMatch = remaining.match(/^(function|const|let|var|if|else|return|for|while)\b/);
      if (keywordMatch) {
        tokens.push({ type: "keyword", text: keywordMatch[0], start: pos, end: pos + keywordMatch[0].length });
        pos += keywordMatch[0].length;
        continue;
      }

      // Identifier
      const identMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
      if (identMatch) {
        tokens.push({ type: "identifier", text: identMatch[0], start: pos, end: pos + identMatch[0].length });
        pos += identMatch[0].length;
        continue;
      }

      // Default: single character
      tokens.push({ type: "punctuation", text: line[pos], start: pos, end: pos + 1 });
      pos++;
    }

    return tokens;
  },
};

const tokenStyles = {
  keyword: { color: "#569cd6" },
  string: { color: "#ce9178" },
  identifier: { color: "#9cdcfe" },
  punctuation: { color: "#d4d4d4" },
  whitespace: {},
};

/**
 * CodeEditor mount page for E2E testing.
 */
export default function CodeEditorMount() {
  const [doc, setDoc] = useState(() => createBlockDocument(initialCode));
  const [readOnlyDoc] = useState(() => createBlockDocument(initialCode));

  return (
    <div className="editor-mount">
      <h1>CodeEditor E2E</h1>

      <div className="editor-section">
        <h2>Editable</h2>
        <CodeEditor
          document={doc}
          onDocumentChange={setDoc}
          tokenizer={simpleTokenizer}
          tokenStyles={tokenStyles}
          renderer="svg"
          showLineNumbers
          style={{
            height: 200,
            border: "1px solid #3a3a3c",
            borderRadius: 4,
          }}
        />
      </div>

      <div className="editor-section">
        <h2>Read Only</h2>
        <CodeEditor
          document={readOnlyDoc}
          onDocumentChange={() => {}}
          tokenizer={simpleTokenizer}
          tokenStyles={tokenStyles}
          renderer="svg"
          showLineNumbers
          readOnly
          style={{
            height: 150,
            border: "1px solid #3a3a3c",
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}
