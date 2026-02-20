/**
 * @file Markdown Canvas Editor child route
 *
 * Canvas renderer implementation for Markdown editor.
 * Receives doc/setDoc from MarkdownLayout via outlet context.
 */

import { TextEditorWithToolbar } from "../../../../editors/RichTextEditors/text/TextEditorWithToolbar";
import { useMarkdownContext } from "./MarkdownLayout";

export function MarkdownCanvasEditor() {
  const { doc, setDoc } = useMarkdownContext();

  return (
    <TextEditorWithToolbar
      document={doc}
      onDocumentChange={setDoc}
      renderer="canvas"
      enabledOperations={["bold", "italic", "underline", "strikethrough", "code"]}
      style={{ height: "100%", padding: 8 }}
    />
  );
}
