/**
 * @file MarkdownViewer types
 */

import type { ComponentType, ReactNode } from "react";
import type {
  MarkdownElementType,
  MarkdownElementMetadata,
} from "../../parsers/Markdown";
import type { ParsedTable } from "../../parsers/Markdown";

// =============================================================================
// Block Data
// =============================================================================

/** A parsed markdown block ready for rendering. */
export type MarkdownBlock = {
  id: string;
  type: MarkdownElementType;
  content: string;
  metadata?: MarkdownElementMetadata;
};

// =============================================================================
// Per-Block Renderer Props
// =============================================================================

/** Base props shared by all block renderers. */
export type BaseBlockProps = {
  block: MarkdownBlock;
  children?: ReactNode;
};

export type TextBlockProps = BaseBlockProps & { type: "text" };

export type CodeBlockProps = BaseBlockProps & {
  type: "code";
  language?: string;
};

export type HeaderBlockProps = BaseBlockProps & {
  type: "header";
  level: number;
};

export type ListBlockProps = BaseBlockProps & {
  type: "list";
  ordered: boolean;
  items: string[];
};

export type QuoteBlockProps = BaseBlockProps & { type: "quote" };

export type TableBlockProps = BaseBlockProps & {
  type: "table";
  parsed?: ParsedTable;
};

export type HorizontalRuleBlockProps = BaseBlockProps & {
  type: "horizontal_rule";
};

export type MathBlockProps = BaseBlockProps & { type: "math" };

/** Union of all typed block renderer props. */
export type BlockRendererProps =
  | TextBlockProps
  | CodeBlockProps
  | HeaderBlockProps
  | ListBlockProps
  | QuoteBlockProps
  | TableBlockProps
  | HorizontalRuleBlockProps
  | MathBlockProps;

// =============================================================================
// Component Override Map
// =============================================================================

/** Map of block type to custom renderer component. Only override what you need. */
export type BlockComponentMap = {
  text?: ComponentType<TextBlockProps>;
  code?: ComponentType<CodeBlockProps>;
  header?: ComponentType<HeaderBlockProps>;
  list?: ComponentType<ListBlockProps>;
  quote?: ComponentType<QuoteBlockProps>;
  table?: ComponentType<TableBlockProps>;
  horizontal_rule?: ComponentType<HorizontalRuleBlockProps>;
  math?: ComponentType<MathBlockProps>;
  /** Fallback renderer for unknown/custom block types. */
  fallback?: ComponentType<BaseBlockProps>;
};

// =============================================================================
// Component Props
// =============================================================================

export type MarkdownViewerProps = {
  /** Markdown source text */
  value: string;
  /** Pre-parsed blocks. Rendered using components overrides + defaults. */
  blocks?: MarkdownBlock[];
  /** Custom block renderer components (merged with defaults). */
  components?: BlockComponentMap;
  /** Manual children (escape hatch). When provided, blocks/components are ignored. */
  children?: ReactNode;
  className?: string;
};

export type MarkdownBlockRendererProps = {
  block: MarkdownBlock;
  components?: BlockComponentMap;
};
