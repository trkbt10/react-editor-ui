/**
 * @file TextEditor demo page
 */

import { useState, useMemo } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoRow,
} from "../../components";
import { TextEditor } from "../../../editors/RichTextEditors/text/TextEditor";
import { TextEditorWithToolbar } from "../../../editors/RichTextEditors/text/TextEditorWithToolbar";
import { Button } from "../../../components/Button/Button";
import { Checkbox } from "../../../components/Checkbox/Checkbox";
import type { BlockDocument, LocalStyleSegment } from "../../../editors/RichTextEditors/block/blockDocument";
import { createBlockDocument, createBlockDocumentWithStyles, createBlockId } from "../../../editors/RichTextEditors/block/blockDocument";

const sampleText = `The quick brown fox jumps over the lazy dog.

This is a demonstration of the TextEditor component with rich text support.

You can apply different styles to different parts of the text.`;

/**
 * Create a styled BlockDocument with rich text formatting for the demo.
 */
function createSampleBlockDocument(): BlockDocument {
  // Split text into lines for blocks
  const lines = sampleText.split("\n");

  // Define styles
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
  // Apply styles: "The"(0-3 bold), "quick"(4-9 brown-bold), "brown"(10-15 brown-large),
  // "fox"(16-19 italic), "jumps"(20-25 small-muted)
  const firstLineStyles: LocalStyleSegment[] = [
    { start: 0, end: 3, style: styleDefinitions.bold },
    { start: 4, end: 9, style: styleDefinitions["brown-bold"] },
    { start: 10, end: 15, style: styleDefinitions["brown-large"] },
    { start: 16, end: 19, style: styleDefinitions.italic },
    { start: 20, end: 25, style: styleDefinitions["small-muted"] },
  ];

  // Third line (index 2 after splitting): "This is a demonstration of the TextEditor component with rich text support."
  // "This" at start (0-4 bold-large), "TextEditor" (27-37 bold-blue)
  const thirdLineStyles: LocalStyleSegment[] = [
    { start: 0, end: 4, style: styleDefinitions["bold-large"] },
    { start: 27, end: 37, style: styleDefinitions["bold-blue"] },
  ];

  // Fifth line (index 4): "You can apply different styles to different parts of the text."
  // "different styles" (14-30 underline), "to di" (31-36 serif-italic)
  const fifthLineStyles: LocalStyleSegment[] = [
    { start: 14, end: 30, style: styleDefinitions.underline },
    { start: 31, end: 36, style: styleDefinitions["serif-italic"] },
  ];

  const blocks = lines.map((content, index) => {
    const styles = getStylesForLine(index, firstLineStyles, thirdLineStyles, fifthLineStyles);
    return {
      id: createBlockId(),
      type: "paragraph" as const,
      content,
      styles,
    };
  });

  return {
    blocks,
    styleDefinitions,
    version: 1,
  };
}

function getStylesForLine(
  index: number,
  firstLineStyles: LocalStyleSegment[],
  thirdLineStyles: LocalStyleSegment[],
  fifthLineStyles: LocalStyleSegment[]
): readonly LocalStyleSegment[] {
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
}

// Available operations for toolbar demo
const ALL_OPERATIONS = [
  { id: "bold", label: "Bold" },
  { id: "italic", label: "Italic" },
  { id: "underline", label: "Underline" },
  { id: "strikethrough", label: "Strikethrough" },
  { id: "code", label: "Code" },
  { id: "textColor", label: "Text Color" },
] as const;

export function TextEditorDemo() {
  const [doc, setDoc] = useState(() => createSampleBlockDocument());
  const [plainDoc, setPlainDoc] = useState(() => createBlockDocument(sampleText));
  const [toolbarDoc, setToolbarDoc] = useState(() => createBlockDocumentWithStyles(
    "Select some text to see the toolbar. Try applying bold, italic, or change the color!"
  ));
  const [renderer, setRenderer] = useState<"svg" | "canvas">("svg");
  const [softWrap, setSoftWrap] = useState(false);

  // Toolbar configuration state
  const [enabledOps, setEnabledOps] = useState<Set<string>>(
    new Set(["bold", "italic", "underline", "textColor"])
  );

  const enabledOperations = useMemo(
    () => Array.from(enabledOps),
    [enabledOps]
  );

  const handleToggleOp = (id: string) => {
    setEnabledOps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
          <Checkbox
            checked={softWrap}
            onChange={setSoftWrap}
            label="Soft Wrap"
          />
        </DemoRow>
      </DemoSection>

      <DemoSection label="With Rich Text Styles">
        <TextEditor
          document={doc}
          onDocumentChange={setDoc}
          renderer={renderer}
          softWrap={softWrap}
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
          softWrap={softWrap}
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

      <DemoSection label="With Selection Toolbar">
        <p style={{ marginBottom: 8, fontSize: 12, color: "var(--rei-color-text-secondary)" }}>
          Select text to show the formatting toolbar. Configure enabled operations below.
        </p>
        <DemoRow>
          {ALL_OPERATIONS.map((op) => (
            <Checkbox
              key={op.id}
              checked={enabledOps.has(op.id)}
              onChange={() => handleToggleOp(op.id)}
              label={op.label}
            />
          ))}
        </DemoRow>
        <div style={{ marginTop: 8 }}>
          <TextEditorWithToolbar
            document={toolbarDoc}
            onDocumentChange={setToolbarDoc}
            renderer={renderer}
            enabledOperations={enabledOperations}
            style={{
              height: 200,
              border: "1px solid var(--rei-color-border, #3a3a3c)",
              borderRadius: 4,
            }}
          />
        </div>
      </DemoSection>
    </DemoContainer>
  );
}
