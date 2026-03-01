/**
 * @file DefaultCodeBlock renderer
 */

import { memo } from "react";
import type { CodeBlockProps } from "../types";
import { codeBlockStyle } from "../styles";

export const DefaultCodeBlock = memo(function DefaultCodeBlock({
  block,
  language,
}: CodeBlockProps) {
  return (
    <pre style={codeBlockStyle} data-language={language}>
      <code>{block.content}</code>
    </pre>
  );
});
