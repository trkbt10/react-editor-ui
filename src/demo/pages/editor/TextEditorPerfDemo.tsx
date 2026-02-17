/**
 * @file TextEditor performance demo page
 *
 * Demo page for measuring TextEditor re-render performance.
 * Contains a large document to test SingleBlock and BlockLine re-renders.
 */

import { useState, useMemo } from "react";
import { DemoContainer, DemoSection, DemoMutedText } from "../../components";
import { TextEditor } from "../../../editors/RichTextEditors/text/TextEditor";
import { createBlockDocument } from "../../../editors/RichTextEditors/block/blockDocument";

/**
 * Generate sample text with many lines for performance testing.
 */
function generateLargeDocument(lineCount: number): string {
  const lines: string[] = [];
  for (let i = 1; i <= lineCount; i++) {
    lines.push(`Line ${i}: The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet.`);
  }
  return lines.join("\n");
}

export function TextEditorPerfDemo() {
  // Create a document with 50 lines for performance testing
  const initialDoc = useMemo(
    () => createBlockDocument(generateLargeDocument(50)),
    []
  );
  const [doc, setDoc] = useState(() => initialDoc);

  return (
    <DemoContainer title="TextEditor Performance">
      <DemoMutedText>
        Performance test page for TextEditor. Open react-scan to monitor re-renders.
        Click and select text to observe SingleBlock and BlockLine re-render patterns.
      </DemoMutedText>

      <DemoSection label="Large Document (50 lines)">
        <TextEditor
          document={doc}
          onDocumentChange={setDoc}
          renderer="svg"
          style={{
            height: 400,
            border: "1px solid var(--rei-color-border, #3a3a3c)",
            borderRadius: 4,
          }}
        />
      </DemoSection>
    </DemoContainer>
  );
}
