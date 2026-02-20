/**
 * @file TextEditorWithToolbar mount page for E2E tests
 *
 * Tests selection toolbar integration with TextEditor.
 * Includes editable editors with different toolbar configurations.
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { TextEditorWithToolbar } from "../../text/TextEditorWithToolbar";
import { createBlockDocumentWithStyles, type BlockDocument } from "../../block/blockDocument";

const initialText = `Select some text to see the toolbar.
Try applying bold, italic, or change the color!
This is a test for selection toolbar integration.`;

/**
 * TextEditorWithToolbar mount page for E2E testing.
 */
export default function TextEditorToolbarMount() {
  const [doc, setDoc] = useState(() => createBlockDocumentWithStyles(initialText));
  const [allOpsDoc, setAllOpsDoc] = useState(() => createBlockDocumentWithStyles(initialText));
  const [blockOpsDoc, setBlockOpsDoc] = useState(() => createBlockDocumentWithStyles(initialText));

  // Debug: log when doc changes
  const handleDocChange = useCallback((newDoc: BlockDocument) => {
    console.log("Document changed!");
    console.log("Styles in first block:", JSON.stringify(newDoc.blocks[0]?.styles));
    console.log("Version:", newDoc.version);
    setDoc(newDoc);
  }, []);

  // Debug: log initial state
  useEffect(() => {
    console.log("Initial styleDefinitions:", Object.keys(doc.styleDefinitions));
  }, []);

  // Basic operations: bold, italic, underline
  const basicOps = useMemo(() => ["bold", "italic", "underline"], []);

  // All inline operations including color
  const allOps = useMemo(
    () => ["bold", "italic", "underline", "strikethrough", "code", "textColor"],
    []
  );

  // Block-level operations (Markdown-style)
  const blockOps = useMemo(
    () => ["bold", "italic", "heading-1", "heading-2", "bullet-list", "numbered-list", "blockquote"],
    []
  );

  return (
    <div className="editor-mount">
      <h1>TextEditorWithToolbar E2E</h1>

      <div className="editor-section" data-testid="basic-toolbar-section">
        <h2>Basic Toolbar (Bold, Italic, Underline)</h2>
        <TextEditorWithToolbar
          document={doc}
          onDocumentChange={handleDocChange}
          renderer="svg"
          enabledOperations={basicOps}
          style={{
            height: 200,
            border: "1px solid #3a3a3c",
            borderRadius: 4,
          }}
        />
      </div>

      <div className="editor-section" data-testid="all-ops-toolbar-section">
        <h2>All Operations (Including Color)</h2>
        <TextEditorWithToolbar
          document={allOpsDoc}
          onDocumentChange={setAllOpsDoc}
          renderer="svg"
          enabledOperations={allOps}
          style={{
            height: 200,
            border: "1px solid #3a3a3c",
            borderRadius: 4,
          }}
        />
      </div>

      <div className="editor-section" data-testid="block-ops-toolbar-section">
        <h2>Block Operations (Markdown-style)</h2>
        <TextEditorWithToolbar
          document={blockOpsDoc}
          onDocumentChange={setBlockOpsDoc}
          renderer="svg"
          enabledOperations={blockOps}
          style={{
            height: 200,
            border: "1px solid #3a3a3c",
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}
