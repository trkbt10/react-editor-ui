/**
 * @file MarkdownViewer - Read-only Markdown renderer
 *
 * @description
 * Renders Markdown source text as styled HTML.
 * Designed as a read-only companion to the rich text editors.
 *
 * @example
 * ```tsx
 * import { MarkdownViewer } from "react-editor-ui/viewers/MarkdownViewer";
 *
 * <MarkdownViewer value="# Hello\n\nSome **bold** text." />
 * ```
 */

import { memo } from "react";
import type { MarkdownViewerProps } from "./types";

/**
 * Read-only Markdown viewer component.
 */
export const MarkdownViewer = memo(function MarkdownViewer({
  children,
  className,
}: MarkdownViewerProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
});
