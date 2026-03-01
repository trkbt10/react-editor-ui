/**
 * @file DefaultHorizontalRule block renderer
 */

import { memo } from "react";
import type { HorizontalRuleBlockProps } from "../types";
import { horizontalRuleStyle } from "../styles";

export const DefaultHorizontalRule = memo<HorizontalRuleBlockProps>(
  function DefaultHorizontalRule() {
    return <hr style={horizontalRuleStyle} />;
  },
);
