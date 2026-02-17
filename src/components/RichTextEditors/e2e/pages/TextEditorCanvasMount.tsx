/**
 * @file TextEditor Canvas mount page for E2E tests
 *
 * TextEditor with SVG/Canvas renderer toggle for testing Canvas rendering.
 */

import { useState } from "react";
import { TextEditor } from "../../text/TextEditor";
import { createBlockDocument } from "../../block/blockDocument";

const initialText = `Line 1: Hello World
Line 2: This is a test
Line 3: Editor content
Line 4: More text here
Line 5: Final line`;

type RendererType = "svg" | "canvas";

/**
 * TextEditor Canvas mount page for E2E testing.
 */
export default function TextEditorCanvasMount() {
  const [doc, setDoc] = useState(() => createBlockDocument(initialText));
  const [renderer, setRenderer] = useState<RendererType>("svg");

  return (
    <div className="editor-mount">
      <h1>TextEditor Canvas E2E</h1>

      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setRenderer("svg")}
          style={{
            padding: "8px 16px",
            marginRight: 8,
            backgroundColor: renderer === "svg" ? "#0066cc" : "#333",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          SVG
        </button>
        <button
          onClick={() => setRenderer("canvas")}
          style={{
            padding: "8px 16px",
            backgroundColor: renderer === "canvas" ? "#0066cc" : "#333",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Canvas
        </button>
      </div>

      <div className="editor-section">
        <TextEditor
          document={doc}
          onDocumentChange={setDoc}
          renderer={renderer}
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
