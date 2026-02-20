/**
 * @file Selection Toolbar Demo
 *
 * Demonstrates TextEditorWithToolbar with configurable operations.
 * Select text to see the formatting toolbar appear.
 */

import { useState, useMemo, useRef } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoRow,
} from "../../components";
import { TextEditorWithToolbar } from "../../../editors/RichTextEditors/text/TextEditorWithToolbar";
import { TextEditor } from "../../../editors/RichTextEditors/text/TextEditor";
import { SelectionToolbar } from "../../../components/SelectionToolbar/SelectionToolbar";
import { useTextSelectionToolbar } from "../../../editors/RichTextEditors/text/useTextSelectionToolbar";
import { ColorOperationButton } from "../../../editors/RichTextEditors/text/ColorOperationButton";
import { hasColorOperation } from "../../../editors/RichTextEditors/text/defaultOperations";
import { Checkbox } from "../../../components/Checkbox/Checkbox";
import { createBlockDocumentWithStyles } from "../../../editors/RichTextEditors/block/blockDocument";
import { parseMarkdownToBlockDocument } from "../../../editors/RichTextEditors/block/markdownParser";
import type { TextEditorHandle } from "../../../editors/RichTextEditors/text/types";

// Available inline operations
const INLINE_OPERATIONS = [
  { id: "bold", label: "Bold", description: "⌘B" },
  { id: "italic", label: "Italic", description: "⌘I" },
  { id: "underline", label: "Underline", description: "⌘U" },
  { id: "strikethrough", label: "Strikethrough", description: "⌘S" },
  { id: "code", label: "Code", description: "⌘E" },
  { id: "textColor", label: "Text Color", description: "Color picker" },
] as const;

// Block-level operations (Markdown-style)
const BLOCK_OPERATIONS = [
  { id: "heading-1", label: "H1", description: "Heading 1" },
  { id: "heading-2", label: "H2", description: "Heading 2" },
  { id: "heading-3", label: "H3", description: "Heading 3" },
  { id: "bullet-list", label: "• List", description: "Bullet list" },
  { id: "numbered-list", label: "1. List", description: "Numbered list" },
  { id: "blockquote", label: "Quote", description: "Block quote" },
] as const;

// All operations combined
const ALL_OPERATIONS = [...INLINE_OPERATIONS, ...BLOCK_OPERATIONS] as const;

// Markdown sample with various block types for testing
const sampleMarkdown = `# Selection Toolbar Demo

Select any text in this editor to see the formatting toolbar appear.

## Features

You can apply various formatting styles:

- Bold, italic, and underline
- Strikethrough and code styling
- Text color changes

### Numbered Lists

1. First item in list
2. Second item in list
3. Third item in list

> This is a blockquote. It should have visual decoration with a left border and background color.

## Code Example

\`\`\`
function greet(name) {
  return "Hello, " + name;
}
\`\`\`

Regular paragraph after code block. Try selecting this text!`;

export function SelectionToolbarDemo() {
  // Simple demo with TextEditorWithToolbar - uses Markdown parser for block type styling
  const [simpleDoc, setSimpleDoc] = useState(() => parseMarkdownToBlockDocument(sampleMarkdown));
  const [enabledOps, setEnabledOps] = useState<Set<string>>(
    new Set(["bold", "italic", "underline", "textColor", "heading-1", "bullet-list"])
  );

  // Advanced demo with manual integration
  const [advancedDoc, setAdvancedDoc] = useState(() => createBlockDocumentWithStyles(
    "This demo shows manual integration using useTextSelectionToolbar hook.\n\nSelect text to see the custom toolbar with color picker button."
  ));
  const editorRef = useRef<TextEditorHandle>(null);
  const advancedEnabledOps = useMemo(
    () => ["bold", "italic", "textColor"],
    []
  );

  const {
    setSelectionEvent,
    toolbarProps,
    hasColorOperation: colorEnabled,
    currentColor,
    handleColorSelect,
  } = useTextSelectionToolbar({
    editorRef,
    enabledOperations: advancedEnabledOps,
  });

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
    <DemoContainer title="Selection Toolbar">
      <DemoSection label="Usage">
        <p style={{ fontSize: 13, color: "var(--rei-color-text-secondary)", margin: 0 }}>
          Select text in the editor below to show the formatting toolbar.
          Use the checkboxes to configure which operations are available.
        </p>
      </DemoSection>

      <DemoSection label="Configure Operations">
        <p style={{ fontSize: 12, color: "var(--rei-color-text-secondary)", marginBottom: 8 }}>
          <strong>Inline Operations</strong>
        </p>
        <DemoRow>
          {INLINE_OPERATIONS.map((op) => (
            <Checkbox
              key={op.id}
              checked={enabledOps.has(op.id)}
              onChange={() => handleToggleOp(op.id)}
              label={op.label}
            />
          ))}
        </DemoRow>
        <p style={{ fontSize: 12, color: "var(--rei-color-text-secondary)", marginTop: 12, marginBottom: 8 }}>
          <strong>Block Operations (Markdown-style)</strong>
        </p>
        <DemoRow>
          {BLOCK_OPERATIONS.map((op) => (
            <Checkbox
              key={op.id}
              checked={enabledOps.has(op.id)}
              onChange={() => handleToggleOp(op.id)}
              label={op.label}
            />
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection label="TextEditorWithToolbar">
        <TextEditorWithToolbar
          document={simpleDoc}
          onDocumentChange={setSimpleDoc}
          renderer="svg"
          enabledOperations={enabledOperations}
          style={{
            height: 300,
            border: "1px solid var(--rei-color-border, #3a3a3c)",
            borderRadius: 4,
          }}
        />
      </DemoSection>

      <DemoSection label="Manual Integration (useTextSelectionToolbar)">
        <p style={{ fontSize: 12, color: "var(--rei-color-text-secondary)", marginBottom: 8 }}>
          This example shows how to manually integrate the toolbar using the hook.
          Operations: Bold, Italic, Text Color
        </p>
        <div style={{ position: "relative" }}>
          <TextEditor
            ref={editorRef}
            document={advancedDoc}
            onDocumentChange={setAdvancedDoc}
            onTextSelectionChange={setSelectionEvent}
            renderer="svg"
            style={{
              height: 150,
              border: "1px solid var(--rei-color-border, #3a3a3c)",
              borderRadius: 4,
            }}
          />

          {toolbarProps && (
            <SelectionToolbar
              anchor={toolbarProps.anchor}
              operations={toolbarProps.operations}
              onOperationSelect={toolbarProps.onOperationSelect}
            />
          )}
        </div>

        {/* Show color picker button status */}
        {toolbarProps && colorEnabled && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--rei-color-text-secondary)" }}>
            <strong>Color Picker Available:</strong> Use ColorOperationButton component for color selection.
            <div style={{ marginTop: 4 }}>
              <ColorOperationButton
                currentColor={currentColor}
                onColorSelect={handleColorSelect}
                label="Text Color"
              />
            </div>
          </div>
        )}
      </DemoSection>

      <DemoSection label="API Reference">
        <div style={{ fontSize: 12, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
{`// Simple usage with TextEditorWithToolbar
<TextEditorWithToolbar
  document={doc}
  onDocumentChange={setDoc}
  enabledOperations={["bold", "italic", "textColor"]}
/>

// Manual integration with hook
const editorRef = useRef<TextEditorHandle>(null);
const { setSelectionEvent, toolbarProps } = useTextSelectionToolbar({
  editorRef,
  enabledOperations: ["bold", "italic"],
});

<TextEditor
  ref={editorRef}
  onTextSelectionChange={setSelectionEvent}
  ...
/>
{toolbarProps && <SelectionToolbar {...toolbarProps} />}`}
        </div>
      </DemoSection>
    </DemoContainer>
  );
}
