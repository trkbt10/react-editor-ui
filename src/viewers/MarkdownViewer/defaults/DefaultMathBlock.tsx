/**
 * @file DefaultMathBlock renderer
 */

import { memo } from "react";
import type { MathBlockProps } from "../types";
import { codeBlockStyle } from "../styles";

export const DefaultMathBlock = memo(function DefaultMathBlock({
  block,
}: MathBlockProps) {
  return <pre style={codeBlockStyle}>{block.content}</pre>;
});
