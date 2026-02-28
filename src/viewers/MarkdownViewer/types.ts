/**
 * @file MarkdownViewer types
 */

export type MarkdownViewerProps = {
  /** Markdown source text to render */
  value: string;
  /** Rendered block elements (when using external parser) */
  children?: React.ReactNode;
  className?: string;
};
