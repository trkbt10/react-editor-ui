/**
 * @file DefaultListBlock renderer
 */

import { memo, useMemo } from "react";
import type { ListBlockProps } from "../types";
import { listBlockStyle } from "../styles";

export const DefaultListBlock = memo(function DefaultListBlock({
  ordered,
  items,
}: ListBlockProps) {
  const ListTag = ordered ? "ol" : "ul";
  const listItems = useMemo(
    () =>
      items.map((line, i) => (
        <li key={i}>{line}</li>
      )),
    [items],
  );
  return <ListTag style={listBlockStyle}>{listItems}</ListTag>;
});
