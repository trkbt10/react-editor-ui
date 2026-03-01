/**
 * @file DefaultQuoteBlock renderer
 */

import { memo } from "react";
import type { QuoteBlockProps } from "../types";
import { quoteBlockStyle } from "../styles";

export const DefaultQuoteBlock = memo(function DefaultQuoteBlock({
  block,
}: QuoteBlockProps) {
  return <div style={quoteBlockStyle}>{block.content}</div>;
});
