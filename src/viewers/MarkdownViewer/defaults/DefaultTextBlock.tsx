/**
 * @file DefaultTextBlock renderer
 */

import { memo } from "react";
import type { BaseBlockProps } from "../types";
import { textBlockStyle } from "../styles";

export const DefaultTextBlock = memo(function DefaultTextBlock({
  block,
}: BaseBlockProps) {
  return <div style={textBlockStyle}>{block.content}</div>;
});
