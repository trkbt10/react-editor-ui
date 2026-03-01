/**
 * @file DefaultSystemMessage - Default renderer for system messages (centered, muted style)
 */

import { memo, useMemo } from "react";
import type { CSSProperties } from "react";
import type { SystemMessageProps, ContentPart } from "../types";
import {
  COLOR_TEXT_MUTED,
  SPACE_SM,
  SIZE_FONT_XS,
} from "../../../themes/styles";

const baseStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  padding: `${SPACE_SM} 0`,
};

const textStyle: CSSProperties = {
  color: COLOR_TEXT_MUTED,
  fontSize: SIZE_FONT_XS,
  fontStyle: "italic",
  textAlign: "center",
  maxWidth: "80%",
};

/** Get plain text from content */
function getTextContent(content: string | ContentPart[]): string {
  if (typeof content === "string") {
    return content;
  }

  return content
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

export const DefaultSystemMessage = memo(function DefaultSystemMessage({
  message,
  displayOptions,
  onClick,
}: SystemMessageProps) {
  const isClickable = displayOptions?.isClickable ?? false;

  const textContent = useMemo(
    () => getTextContent(message.content),
    [message.content],
  );

  const computedTextStyle = useMemo<CSSProperties>(() => {
    if (isClickable) {
      return { ...textStyle, cursor: "pointer" };
    }
    return textStyle;
  }, [isClickable]);

  return (
    <div style={baseStyle}>
      <div style={computedTextStyle} onClick={onClick}>
        {textContent}
      </div>
    </div>
  );
});
