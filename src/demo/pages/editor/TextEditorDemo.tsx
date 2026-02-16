/**
 * @file TextEditor demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoRow,
} from "../../components";
import { TextEditor } from "../../../components/Editor/text/TextEditor";
import { Button } from "../../../components/Button/Button";
import {
  createDocument,
  wrapWithTag,
  setStyleDefinition,
  type StyledDocument,
} from "../../../components/Editor/core/styledDocument";

const sampleText = `The quick brown fox jumps over the lazy dog.

This is a demonstration of the TextEditor component with rich text support.

You can apply different styles to different parts of the text.`;

/**
 * Create a styled document with rich text formatting for the demo.
 */
function createSampleTextDocument(): StyledDocument {
  let doc = createDocument(sampleText);

  // Define styles for tags
  doc = setStyleDefinition(doc, "bold", { fontWeight: "bold" });
  doc = setStyleDefinition(doc, "brown-bold", { color: "#a52a2a", fontWeight: "bold" });
  doc = setStyleDefinition(doc, "brown-large", { color: "#8b4513", fontSize: "18px" });
  doc = setStyleDefinition(doc, "italic", { fontStyle: "italic" });
  doc = setStyleDefinition(doc, "small-muted", { fontSize: "10px", color: "#666666" });
  doc = setStyleDefinition(doc, "bold-large", { fontWeight: "bold", fontSize: "16px" });
  doc = setStyleDefinition(doc, "bold-blue", { fontWeight: "bold", color: "#0066cc" });
  doc = setStyleDefinition(doc, "underline", { textDecoration: "underline" });
  doc = setStyleDefinition(doc, "serif-italic", { fontFamily: "Georgia, serif", fontStyle: "italic" });

  // Apply styles to ranges
  doc = wrapWithTag(doc, 0, 3, "bold");           // "The"
  doc = wrapWithTag(doc, 4, 9, "brown-bold");     // "quick"
  doc = wrapWithTag(doc, 10, 15, "brown-large");  // "brown"
  doc = wrapWithTag(doc, 16, 19, "italic");       // "fox"
  doc = wrapWithTag(doc, 20, 25, "small-muted");  // "jumps"
  doc = wrapWithTag(doc, 47, 51, "bold-large");   // "This"
  doc = wrapWithTag(doc, 74, 84, "bold-blue");    // "TextEditor"
  doc = wrapWithTag(doc, 125, 142, "underline");  // "different styles"
  doc = wrapWithTag(doc, 143, 148, "serif-italic"); // "to di"

  return doc;
}

export function TextEditorDemo() {
  const [doc, setDoc] = useState(() => createSampleTextDocument());
  const [plainDoc, setPlainDoc] = useState(() => createDocument(sampleText));
  const [renderer, setRenderer] = useState<"svg" | "canvas">("svg");

  return (
    <DemoContainer title="TextEditor">
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

      <DemoSection label="With Rich Text Styles">
        <TextEditor
          document={doc}
          onDocumentChange={setDoc}
          renderer={renderer}
          style={{
            height: 200,
            border: "1px solid var(--rei-color-border, #3a3a3c)",
            borderRadius: 4,
          }}
        />
      </DemoSection>

      <DemoSection label="Plain Text (no styles)">
        <TextEditor
          document={plainDoc}
          onDocumentChange={setPlainDoc}
          renderer={renderer}
          style={{
            height: 150,
            border: "1px solid var(--rei-color-border, #3a3a3c)",
            borderRadius: 4,
          }}
        />
      </DemoSection>

      <DemoSection label="Read Only">
        <TextEditor
          document={doc}
          onDocumentChange={() => {}}
          renderer={renderer}
          readOnly
          style={{
            height: 150,
            border: "1px solid var(--rei-color-border, #3a3a3c)",
            borderRadius: 4,
            opacity: 0.8,
          }}
        />
      </DemoSection>
    </DemoContainer>
  );
}
