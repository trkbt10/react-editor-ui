/**
 * @file TextEditor mount page for E2E tests
 *
 * Minimal TextEditor setup without demo UI.
 * Includes both editable and readonly editors for testing.
 */

import { useState } from "react";
import { TextEditor } from "../../text/TextEditor";
import { createBlockDocument } from "../../block/blockDocument";

const initialText = `Line 1: Hello World
Line 2: This is a test
Line 3: Editor content`;

/**
 * TextEditor mount page for E2E testing.
 */
export default function TextEditorMount() {
  const [doc, setDoc] = useState(() => createBlockDocument(initialText));
  const [readOnlyDoc] = useState(() => createBlockDocument(initialText));

  return (
    <div className="editor-mount">
      <h1>TextEditor E2E</h1>

      <div className="editor-section">
        <h2>Editable</h2>
        <TextEditor
          document={doc}
          onDocumentChange={setDoc}
          renderer="svg"
          style={{
            height: 200,
            border: "1px solid #3a3a3c",
            borderRadius: 4,
          }}
        />
      </div>

      <div className="editor-section">
        <h2>Read Only</h2>
        <TextEditor
          document={readOnlyDoc}
          onDocumentChange={() => {}}
          renderer="svg"
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
