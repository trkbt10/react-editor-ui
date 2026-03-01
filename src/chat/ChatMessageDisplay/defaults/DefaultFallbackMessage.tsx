/**
 * @file DefaultFallbackMessage - Default renderer for unknown message roles
 */

import { memo, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { BaseMessageProps, ContentPart } from "../types";
import { ContentPartRenderer } from "./ContentPartRenderer";
import { MessageActions } from "./MessageActions";
import {
  COLOR_SURFACE_RAISED,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  RADIUS_LG,
  RADIUS_FULL,
  SPACE_XS,
  SPACE_SM,
  SPACE_MD,
  SIZE_FONT_SM,
  SIZE_FONT_XS,
} from "../../../themes/styles";

const baseStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  gap: SPACE_SM,
  padding: `${SPACE_SM} 0`,
};

const contentWrapperStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: SPACE_XS,
  maxWidth: "80%",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
  fontSize: SIZE_FONT_XS,
  color: COLOR_TEXT_MUTED,
};

const bubbleStyle: CSSProperties = {
  backgroundColor: COLOR_SURFACE_RAISED,
  color: COLOR_TEXT,
  padding: `${SPACE_SM} ${SPACE_MD}`,
  borderRadius: RADIUS_LG,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontSize: SIZE_FONT_SM,
  lineHeight: 1.5,
};

const avatarStyle: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: RADIUS_FULL,
  backgroundColor: COLOR_SURFACE_RAISED,
  color: COLOR_TEXT,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: SIZE_FONT_SM,
  fontWeight: 500,
  flexShrink: 0,
  overflow: "hidden",
};

const avatarImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

/** Default timestamp formatter */
function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Render avatar content */
function renderAvatar(avatar: string | ReactNode | undefined, senderName?: string): ReactNode {
  if (!avatar && !senderName) {
    return null;
  }

  if (typeof avatar === "string") {
    return <img src={avatar} alt="" style={avatarImageStyle} />;
  }

  if (avatar) {
    return avatar;
  }

  return senderName?.charAt(0).toUpperCase() ?? "?";
}

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

/** Check if content has non-text parts */
function hasNonTextParts(content: string | ContentPart[]): boolean {
  if (typeof content === "string") {
    return false;
  }
  return content.some((part) => part.type !== "text");
}

export const DefaultFallbackMessage = memo(function DefaultFallbackMessage({
  message,
  displayOptions,
  contentComponents,
  actions,
}: BaseMessageProps) {
  const { avatar, senderName, timestamp, content } = message;
  const formatter = displayOptions?.formatTimestamp ?? formatTimestamp;

  const showAvatar = displayOptions?.showAvatar ?? avatar !== undefined;
  const showSenderName = displayOptions?.showSenderName ?? senderName !== undefined;
  const showTimestamp = displayOptions?.showTimestamp ?? timestamp !== undefined;
  const showActions = displayOptions?.showActions !== false && actions && actions.length > 0;
  const hasHeader = showSenderName || showTimestamp;
  const hasRichContent = hasNonTextParts(content);
  const textContent = getTextContent(content);

  const headerContent = useMemo(() => {
    if (!hasHeader) {
      return null;
    }
    return (
      <div style={headerStyle}>
        {showSenderName && senderName && <span>{senderName}</span>}
        {showTimestamp && timestamp && <span>{formatter(timestamp)}</span>}
      </div>
    );
  }, [hasHeader, showSenderName, senderName, showTimestamp, timestamp, formatter]);

  const avatarContent = useMemo(() => {
    if (!showAvatar) {
      return null;
    }
    return <div style={avatarStyle}>{renderAvatar(avatar, senderName)}</div>;
  }, [showAvatar, avatar, senderName]);

  const richContentParts = useMemo(() => {
    if (!hasRichContent || typeof content === "string") {
      return null;
    }

    return content
      .filter((part) => part.type !== "text")
      .map((part, index) => (
        <ContentPartRenderer
          key={index}
          part={part}
          message={message}
          components={contentComponents}
        />
      ));
  }, [hasRichContent, content, message, contentComponents]);

  return (
    <div style={baseStyle}>
      {avatarContent}
      <div style={contentWrapperStyle}>
        {headerContent}
        <div style={bubbleStyle}>
          {textContent}
          {richContentParts}
        </div>
        {showActions && <MessageActions actions={actions} />}
      </div>
    </div>
  );
});
