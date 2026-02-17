/**
 * @file TextEditor Styled mount page for E2E tests
 *
 * TextEditor with rich text styles for testing SVG/Canvas renderer consistency.
 * Uses different font families (serif vs sans-serif) to verify measurement accuracy.
 */

import { useState } from "react";
import { TextEditor } from "../../text/TextEditor";
import type { BlockDocument, LocalStyleSegment } from "../../block/blockDocument";
import { createBlockId } from "../../block/blockDocument";

const sampleText = `The quick brown fox jumps over the lazy dog.

This is a demonstration of the TextEditor component with rich text support.

You can apply different styles to different parts of the text.`;

/**
 * Create a styled BlockDocument with rich text formatting for testing.
 */
function createStyledBlockDocument(): BlockDocument {
  const lines = sampleText.split("\n");

  const styleDefinitions = {
    bold: { fontWeight: "bold" as const },
    "brown-bold": { color: "#a52a2a", fontWeight: "bold" as const },
    "brown-large": { color: "#8b4513", fontSize: "18px" },
    italic: { fontStyle: "italic" as const },
    "small-muted": { fontSize: "10px", color: "#666666" },
    "bold-large": { fontWeight: "bold" as const, fontSize: "16px" },
    "bold-blue": { fontWeight: "bold" as const, color: "#0066cc" },
    underline: { textDecoration: "underline" as const },
    "serif-italic": { fontFamily: "Georgia, serif", fontStyle: "italic" as const },
  };

  // First line: "The quick brown fox jumps over the lazy dog."
  const firstLineStyles: LocalStyleSegment[] = [
    { start: 0, end: 3, style: styleDefinitions.bold },
    { start: 4, end: 9, style: styleDefinitions["brown-bold"] },
    { start: 10, end: 15, style: styleDefinitions["brown-large"] },
    { start: 16, end: 19, style: styleDefinitions.italic },
    { start: 20, end: 25, style: styleDefinitions["small-muted"] },
  ];

  // Third line: "This is a demonstration of the TextEditor component with rich text support."
  const thirdLineStyles: LocalStyleSegment[] = [
    { start: 0, end: 4, style: styleDefinitions["bold-large"] },
    { start: 27, end: 37, style: styleDefinitions["bold-blue"] },
  ];

  // Fifth line: "You can apply different styles to different parts of the text."
  // This line tests serif font measurement: "to di" uses Georgia serif
  const fifthLineStyles: LocalStyleSegment[] = [
    { start: 14, end: 30, style: styleDefinitions.underline },
    { start: 31, end: 36, style: styleDefinitions["serif-italic"] },
  ];

  const getStylesForLine = (index: number): readonly LocalStyleSegment[] => {
    switch (index) {
      case 0:
        return firstLineStyles;
      case 2:
        return thirdLineStyles;
      case 4:
        return fifthLineStyles;
      default:
        return [];
    }
  };

  const blocks = lines.map((content, index) => ({
    id: createBlockId(),
    type: "paragraph" as const,
    content,
    styles: getStylesForLine(index),
  }));

  return {
    blocks,
    styleDefinitions,
    version: 1,
  };
}

type RendererType = "svg" | "canvas";

/**
 * TextEditor Styled mount page for E2E testing.
 * Tests rich text rendering consistency between SVG and Canvas renderers.
 */
export default function TextEditorStyledMount() {
  const [doc, setDoc] = useState(() => createStyledBlockDocument());
  const [renderer, setRenderer] = useState<RendererType>("svg");

  return (
    <div className="editor-mount">
      <h1>TextEditor Styled E2E</h1>
      <p style={{ color: "#888", marginBottom: 16 }}>
        Tests rich text with different font families (serif vs sans-serif).
        The word &quot;different&quot; in line 5 should render identically in both renderers.
      </p>

      <div style={{ marginBottom: 16 }}>
        <button
          data-testid="svg-button"
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
          data-testid="canvas-button"
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
        <span style={{ marginLeft: 16, color: "#aaa" }}>
          Current: <strong data-testid="current-renderer">{renderer.toUpperCase()}</strong>
        </span>
      </div>

      <div className="editor-section" data-testid="editor-container">
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
