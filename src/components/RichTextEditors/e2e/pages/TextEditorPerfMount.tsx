/**
 * @file TextEditor performance mount page for E2E tests
 *
 * 50-line document for performance testing with react-scan.
 */

import { useState, useMemo } from "react";
import { TextEditor } from "../../text/TextEditor";
import { createBlockDocument } from "../../block/blockDocument";

function generateLargeDocument(lineCount: number): string {
  const lines: string[] = [];
  for (let i = 1; i <= lineCount; i++) {
    lines.push(`Line ${i}: The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet.`);
  }
  return lines.join("\n");
}

/**
 * TextEditor performance mount page for E2E testing.
 */
export default function TextEditorPerfMount() {
  const initialDoc = useMemo(
    () => createBlockDocument(generateLargeDocument(50)),
    []
  );
  const [doc, setDoc] = useState(() => initialDoc);

  return (
    <div className="editor-mount">
      <h1>TextEditor Performance (50 lines)</h1>
      <p style={{ color: "#888", margin: "8px 0 16px" }}>
        Open react-scan to monitor re-renders during cursor movement, selection, and typing.
      </p>

      <div className="editor-section">
        <TextEditor
          document={doc}
          onDocumentChange={setDoc}
          renderer="svg"
          style={{
            height: 400,
            border: "1px solid #3a3a3c",
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}
