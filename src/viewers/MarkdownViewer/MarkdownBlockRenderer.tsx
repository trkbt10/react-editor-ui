/**
 * @file MarkdownBlockRenderer - Resolves and renders a single parsed block
 */

import { memo, useMemo } from "react";
import type { ReactNode } from "react";
import type {
  MarkdownBlockRendererProps,
  MarkdownBlock,
  BlockComponentMap,
} from "./types";
import { defaultComponents } from "./defaults";
import { parseTable } from "../../parsers/Markdown";

type MergedComponents = typeof defaultComponents & BlockComponentMap;

function mergeComponents(
  components: BlockComponentMap | undefined,
): MergedComponents {
  return components ? { ...defaultComponents, ...components } : defaultComponents;
}

function renderBlock(
  block: MarkdownBlock,
  merged: MergedComponents,
): ReactNode {
  switch (block.type) {
    case "code": {
      const C = merged.code;
      if (!C) {
        return null;
      }
      const language = block.metadata?.language as string | undefined;
      return <C block={block} type="code" language={language} />;
    }
    case "header": {
      const C = merged.header;
      if (!C) {
        return null;
      }
      const level = (block.metadata?.level as number) ?? 1;
      return <C block={block} type="header" level={level} />;
    }
    case "list": {
      const C = merged.list;
      if (!C) {
        return null;
      }
      const items = block.content.split("\n").filter(Boolean);
      const ordered = Boolean(block.metadata?.ordered);
      return <C block={block} type="list" ordered={ordered} items={items} />;
    }
    case "table": {
      const C = merged.table;
      if (!C) {
        return null;
      }
      const parsed = parseTable(block.content) ?? undefined;
      return <C block={block} type="table" parsed={parsed} />;
    }
    case "quote": {
      const C = merged.quote;
      if (!C) {
        return null;
      }
      return <C block={block} type="quote" />;
    }
    case "horizontal_rule": {
      const C = merged.horizontal_rule;
      if (!C) {
        return null;
      }
      return <C block={block} type="horizontal_rule" />;
    }
    case "math": {
      const C = merged.math;
      if (!C) {
        return null;
      }
      return <C block={block} type="math" />;
    }
    default: {
      const C = merged.text;
      if (!C) {
        return null;
      }
      return <C block={block} type="text" />;
    }
  }
}

export const MarkdownBlockRenderer = memo(function MarkdownBlockRenderer({
  block,
  components,
}: MarkdownBlockRendererProps) {
  const merged = useMemo(() => mergeComponents(components), [components]);

  return useMemo(() => renderBlock(block, merged), [block, merged]);
});
