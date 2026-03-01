/**
 * @file Default block renderer components and component map
 */

import type { BlockComponentMap } from "../types";
import { DefaultTextBlock } from "./DefaultTextBlock";
import { DefaultCodeBlock } from "./DefaultCodeBlock";
import { DefaultHeaderBlock } from "./DefaultHeaderBlock";
import { DefaultListBlock } from "./DefaultListBlock";
import { DefaultQuoteBlock } from "./DefaultQuoteBlock";
import { DefaultTableBlock } from "./DefaultTableBlock";
import { DefaultHorizontalRule } from "./DefaultHorizontalRule";
import { DefaultMathBlock } from "./DefaultMathBlock";

/** Default block renderers used as fallbacks when no override is provided. */
export const defaultComponents: Required<
  Omit<BlockComponentMap, "fallback">
> & Pick<BlockComponentMap, "fallback"> = {
  text: DefaultTextBlock,
  code: DefaultCodeBlock,
  header: DefaultHeaderBlock,
  list: DefaultListBlock,
  quote: DefaultQuoteBlock,
  table: DefaultTableBlock,
  horizontal_rule: DefaultHorizontalRule,
  math: DefaultMathBlock,
  fallback: DefaultTextBlock,
};

export {
  DefaultTextBlock,
  DefaultCodeBlock,
  DefaultHeaderBlock,
  DefaultListBlock,
  DefaultQuoteBlock,
  DefaultTableBlock,
  DefaultHorizontalRule,
  DefaultMathBlock,
};
