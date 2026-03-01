/**
 * @file DefaultUserMessage - Default renderer for user messages (bubble style, right-aligned)
 */

import { memo, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { UserMessageProps, ContentPart } from "../types";
import { ContentPartRenderer } from "./ContentPartRenderer";
import { MessageActions } from "./MessageActions";
import type { MessageVariant } from "../types";
import {
  COLOR_PRIMARY,
  COLOR_TEXT_ON_EMPHASIS,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_SURFACE_RAISED,
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
  justifyContent: "flex-end",
  alignItems: "flex-start",
  gap: SPACE_SM,
  padding: `${SPACE_SM} 0`,
};

const contentWrapperStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
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

// Bubble variant (traditional)
const bubbleStyle: CSSProperties = {
  backgroundColor: COLOR_PRIMARY,
  color: COLOR_TEXT_ON_EMPHASIS,
  padding: `${SPACE_SM} ${SPACE_MD}`,
  borderRadius: RADIUS_LG,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontSize: SIZE_FONT_SM,
  lineHeight: 1.5,
};

// Flat variant (modern)
const flatStyle: CSSProperties = {
  backgroundColor: COLOR_SURFACE_RAISED,
  color: COLOR_TEXT,
  padding: `${SPACE_SM} ${SPACE_MD}`,
  borderRadius: RADIUS_LG,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontSize: SIZE_FONT_SM,
  lineHeight: 1.5,
};

/** Get content style based on variant */
function getContentStyle(variant: MessageVariant): CSSProperties {
  if (variant === "flat") {
    return flatStyle;
  }
  return bubbleStyle;
}

const avatarStyle: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: RADIUS_FULL,
  backgroundColor: COLOR_PRIMARY,
  color: COLOR_TEXT_ON_EMPHASIS,
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

  return senderName?.charAt(0).toUpperCase() ?? "U";
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

export const DefaultUserMessage = memo(function DefaultUserMessage({
  message,
  displayOptions,
  contentComponents,
  actions,
  onClick,
}: UserMessageProps) {
  const { avatar, senderName, timestamp, content } = message;
  const formatter = displayOptions?.formatTimestamp ?? formatTimestamp;
  const variant = displayOptions?.variant ?? "bubble";
  const isClickable = displayOptions?.isClickable ?? false;

  // Determine what to show
  const showAvatar = displayOptions?.showAvatar ?? avatar !== undefined;
  const showSenderName = displayOptions?.showSenderName ?? senderName !== undefined;
  const showTimestamp = displayOptions?.showTimestamp ?? timestamp !== undefined;
  const showActions = displayOptions?.showActions !== false && actions && actions.length > 0;
  const hasHeader = showSenderName || showTimestamp;
  const hasRichContent = hasNonTextParts(content);
  const textContent = getTextContent(content);

  // Get variant-specific content style with cursor
  const contentStyle = useMemo<CSSProperties>(() => {
    const base = getContentStyle(variant);
    if (isClickable) {
      return { ...base, cursor: "pointer" };
    }
    return base;
  }, [variant, isClickable]);

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

  // Render rich content parts (non-text)
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
      <div style={contentWrapperStyle}>
        {headerContent}
        <div style={contentStyle} onClick={onClick}>
          {textContent}
          {richContentParts}
        </div>
        {showActions && <MessageActions actions={actions} />}
      </div>
      {avatarContent}
    </div>
  );
});
