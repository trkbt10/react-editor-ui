/**
 * @file TextEditorWithToolbar component
 *
 * Convenience component that integrates TextEditor with SelectionToolbar.
 * Shows toolbar when text is selected, supporting formatting and color operations.
 */

import { memo, useRef, Fragment } from "react";
import type { ReactNode } from "react";
import { TextEditor } from "./TextEditor";
import type { TextEditorProps, TextEditorHandle } from "./types";
import { SelectionToolbar } from "../../../components/SelectionToolbar/SelectionToolbar";
import { useTextSelectionToolbar } from "./useTextSelectionToolbar";
import { ColorOperationButton } from "./ColorOperationButton";
import { hasColorOperation } from "./defaultOperations";

// =============================================================================
// Types
// =============================================================================

export type TextEditorWithToolbarProps = Omit<TextEditorProps, "onTextSelectionChange"> & {
  /**
   * Operation IDs to enable in the toolbar.
   * Available: "bold", "italic", "underline", "strikethrough", "code", "textColor"
   * @default ["bold", "italic", "underline"]
   */
  readonly enabledOperations?: readonly string[];
  /**
   * Whether to show toolbar during mouse drag selection.
   * When false (default), toolbar only appears after mouse up.
   * @default false
   */
  readonly showDuringDrag?: boolean;
  /**
   * Custom render function for additional toolbar content.
   * Called after built-in operations.
   */
  readonly renderToolbarExtras?: () => ReactNode;
};

// =============================================================================
// Component
// =============================================================================

/**
 * TextEditor with integrated SelectionToolbar.
 *
 * Shows a floating toolbar when text is selected, allowing users to:
 * - Apply formatting (bold, italic, underline, etc.)
 * - Change text color (when textColor operation is enabled)
 *
 * @example
 * ```tsx
 * const [doc, setDoc] = useState(() => createBlockDocument("Hello World"));
 *
 * <TextEditorWithToolbar
 *   document={doc}
 *   onDocumentChange={setDoc}
 *   enabledOperations={["bold", "italic", "textColor"]}
 * />
 * ```
 */
export const TextEditorWithToolbar = memo(function TextEditorWithToolbar({
  enabledOperations = ["bold", "italic", "underline"],
  showDuringDrag = false,
  renderToolbarExtras,
  ...textEditorProps
}: TextEditorWithToolbarProps) {
  const editorRef = useRef<TextEditorHandle>(null);

  const {
    setSelectionEvent,
    toolbarProps,
    hasColorOperation: colorEnabled,
    currentColor,
    handleColorSelect,
  } = useTextSelectionToolbar({
    editorRef,
    enabledOperations,
    showDuringDrag,
  });

  // Check if color operation is enabled
  const showColorButton = colorEnabled && hasColorOperation(enabledOperations);

  return (
    <Fragment>
      <TextEditor
        ref={editorRef}
        onTextSelectionChange={setSelectionEvent}
        {...textEditorProps}
      />

      {toolbarProps && (
        <SelectionToolbar
          anchor={toolbarProps.anchor}
          operations={toolbarProps.operations}
          onOperationSelect={toolbarProps.onOperationSelect}
        />
      )}

      {/* Color picker button - rendered outside SelectionToolbar for now */}
      {toolbarProps && showColorButton && (
        <ColorOperationButton
          currentColor={currentColor}
          onColorSelect={handleColorSelect}
        />
      )}

      {renderToolbarExtras?.()}
    </Fragment>
  );
});
