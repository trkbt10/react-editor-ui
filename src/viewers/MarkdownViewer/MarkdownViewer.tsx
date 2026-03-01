/**
 * @file MarkdownViewer - Read-only Markdown renderer with customizable block components
 *
 * @description
 * Renders parsed Markdown blocks as styled HTML.
 * Supports three rendering modes:
 * 1. Manual children (escape hatch for full control)
 * 2. Data-driven blocks + components overrides
 * 3. Empty fallback
 *
 * @example
 * ```tsx
 * import { MarkdownViewer, useMarkdownBlocks } from "react-editor-ui/viewers/MarkdownViewer";
 *
 * const { blocks, parse } = useMarkdownBlocks();
 * // Parse on mount or user action
 * parse(markdownSource);
 *
 * // Basic usage
 * <MarkdownViewer value={source} blocks={blocks} />
 *
 * // With custom code block renderer
 * <MarkdownViewer
 *   value={source}
 *   blocks={blocks}
 *   components={{ code: MySyntaxHighlighter }}
 * />
 * ```
 */

import { memo, useMemo } from "react";
import type { MarkdownViewerProps } from "./types";
import { MarkdownBlockRenderer } from "./MarkdownBlockRenderer";

/**
 * Read-only Markdown viewer component.
 */
export const MarkdownViewer = memo(function MarkdownViewer({
  children,
  blocks,
  components,
  className,
}: MarkdownViewerProps) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (blocks && blocks.length > 0) {
      return blocks.map((block) => (
        <MarkdownBlockRenderer
          key={block.id}
          block={block}
          components={components}
        />
      ));
    }

    return null;
  }, [children, blocks, components]);

  return <div className={className}>{content}</div>;
});

// Re-exports
export { MarkdownBlockRenderer } from "./MarkdownBlockRenderer";
export { useMarkdownBlocks } from "./useMarkdownBlocks";
export type {
  UseMarkdownBlocksOptions,
  UseMarkdownBlocksReturn,
} from "./useMarkdownBlocks";
export {
  defaultComponents,
  DefaultTextBlock,
  DefaultCodeBlock,
  DefaultHeaderBlock,
  DefaultListBlock,
  DefaultQuoteBlock,
  DefaultTableBlock,
  DefaultHorizontalRule,
  DefaultMathBlock,
} from "./defaults";
export type {
  MarkdownViewerProps,
  MarkdownBlock,
  MarkdownBlockRendererProps,
  BlockComponentMap,
  BaseBlockProps,
  TextBlockProps,
  CodeBlockProps,
  HeaderBlockProps,
  ListBlockProps,
  QuoteBlockProps,
  TableBlockProps,
  HorizontalRuleBlockProps,
  MathBlockProps,
  BlockRendererProps,
} from "./types";
