/**
 * @file Soft Wrap Demo
 *
 * Demo page for testing soft wrap functionality in BlockTextEditor.
 * Used for E2E testing of text wrapping, cursor positioning, selection,
 * and keyboard navigation with wrapped text.
 */

import { useState, useMemo, useCallback, type CSSProperties } from "react";
import { BlockTextEditor } from "../../../editors/RichTextEditors/text/BlockTextEditor";
import { createBlockDocument } from "../../../editors/RichTextEditors/block/blockDocument";
import { Checkbox } from "../../../components/Checkbox/Checkbox";
import { Input } from "../../../components/Input/Input";
import { SPACE_SM, SPACE_MD } from "../../../themes/styles";

// =============================================================================
// Demo Content
// =============================================================================

const DEMO_CONTENT = `This is a long line of text that should wrap when soft wrap is enabled. It contains enough characters to exceed typical container widths and demonstrate the wrapping behavior.

Short line.

Another long line with various content including English text and 日本語のテキスト (Japanese text) to test CJK character handling and word boundaries.

Final paragraph with mixed content for testing cursor positioning and selection across wrapped lines.`;

// =============================================================================
// Styles
// =============================================================================

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_MD,
  padding: SPACE_MD,
  height: "100%",
  boxSizing: "border-box",
};

const controlsStyle: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  gap: SPACE_MD,
  alignItems: "center",
  flexShrink: 0,
};

const editorContainerStyle: CSSProperties = {
  flex: 1,
  border: "1px solid #ccc",
  borderRadius: 4,
  overflow: "hidden",
  minHeight: 200,
};

const labelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
  fontSize: 14,
};

// =============================================================================
// Component
// =============================================================================

export function SoftWrapDemo() {
  const [doc, setDoc] = useState(() => createBlockDocument(DEMO_CONTENT));
  const [softWrap, setSoftWrap] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [wrapColumnStr, setWrapColumnStr] = useState("0");

  const wrapColumn = useMemo(() => {
    const parsed = parseInt(wrapColumnStr, 10);
    return isNaN(parsed) ? 0 : Math.max(0, Math.min(200, parsed));
  }, [wrapColumnStr]);

  const handleWrapColumnChange = useCallback((value: string) => {
    setWrapColumnStr(value);
  }, []);

  const editorStyle = useMemo<CSSProperties>(
    () => ({
      height: "100%",
      width: wrapColumn > 0 ? `${wrapColumn}ch` : "100%",
    }),
    [wrapColumn]
  );

  return (
    <div style={containerStyle}>
      <div style={controlsStyle}>
        <label style={labelStyle}>
          <Checkbox
            checked={softWrap}
            onChange={setSoftWrap}
            aria-label="Enable soft wrap"
          />
          Soft Wrap
        </label>

        <label style={labelStyle}>
          <Checkbox
            checked={wordWrap}
            onChange={setWordWrap}
            disabled={!softWrap}
            aria-label="Enable word wrap"
          />
          Word Wrap
        </label>

        <label style={labelStyle}>
          Wrap Column (0=auto):
          <div style={{ width: 80 }}>
            <Input
              value={wrapColumnStr}
              onChange={handleWrapColumnChange}
              disabled={!softWrap}
              type="number"
              size="sm"
            />
          </div>
        </label>
      </div>

      <div style={editorContainerStyle} data-testid="soft-wrap-editor">
        <BlockTextEditor
          document={doc}
          onDocumentChange={setDoc}
          renderer="svg"
          softWrap={softWrap}
          wordWrap={wordWrap}
          wrapColumn={wrapColumn}
          style={editorStyle}
        />
      </div>
    </div>
  );
}
