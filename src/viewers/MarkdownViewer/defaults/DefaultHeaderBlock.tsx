/**
 * @file DefaultHeaderBlock renderer
 */

import { memo, useMemo } from "react";
import type { HeaderBlockProps } from "../types";
import { headerBlockStyle } from "../styles";

export const DefaultHeaderBlock = memo(function DefaultHeaderBlock({
  block,
  level,
}: HeaderBlockProps) {
  const style = useMemo(
    () => ({
      ...headerBlockStyle,
      fontSize: `${Math.max(1, 1.6 - level * 0.15)}em`,
    }),
    [level],
  );
  return <div style={style}>{block.content}</div>;
});
