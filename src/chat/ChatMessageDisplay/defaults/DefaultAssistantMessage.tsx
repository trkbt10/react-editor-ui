/**
 * @file DefaultAssistantMessage - Default renderer for assistant messages (bubble style, left-aligned, with markdown)
 *
 * Optimizations:
 * - Deferred markdown parsing: only parses when message.isStreaming is false
 * - During streaming: displays plain text for performance
 * - Rich content parts (images, etc.) are rendered immediately
 */

import { memo, useEffect, useMemo, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { AssistantMessageProps, ContentPart, MessageVariant } from "../types";
import { MarkdownViewer, useMarkdownBlocks } from "../../../viewers/MarkdownViewer/MarkdownViewer";
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

// =============================================================================
// Styles
// =============================================================================

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

// Bubble variant (traditional)
const bubbleStyle: CSSProperties = {
  backgroundColor: COLOR_SURFACE_RAISED,
  color: COLOR_TEXT,
  padding: `${SPACE_SM} ${SPACE_MD}`,
  borderRadius: RADIUS_LG,
  wordBreak: "break-word",
  fontSize: SIZE_FONT_SM,
  lineHeight: 1.5,
};

// Flat variant (modern) - no background
const flatStyle: CSSProperties = {
  color: COLOR_TEXT,
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

const plainTextStyle: CSSProperties = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

// =============================================================================
// Helpers
// =============================================================================

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

  return senderName?.charAt(0).toUpperCase() ?? "A";
}

/** Get plain text from content (optimized - avoids creating new array if not needed) */
function getTextContent(content: string | ContentPart[]): string {
  if (typeof content === "string") {
    return content;
  }

  // Fast path: single text part
  if (content.length === 1 && content[0].type === "text") {
    return content[0].text;
  }

  // Multiple parts: join text parts
  const textParts: string[] = [];
  for (const part of content) {
    if (part.type === "text") {
      textParts.push(part.text);
    }
  }
  return textParts.join("\n");
}

/** Check if content has non-text parts */
function hasNonTextParts(content: string | ContentPart[]): boolean {
  if (typeof content === "string") {
    return false;
  }
  for (const part of content) {
    if (part.type !== "text") {
      return true;
    }
  }
  return false;
}

/** Get non-text parts only */
function getNonTextParts(content: ContentPart[]): ContentPart[] {
  return content.filter((part) => part.type !== "text");
}

// =============================================================================
// Component
// =============================================================================

export const DefaultAssistantMessage = memo(function DefaultAssistantMessage({
  message,
  displayOptions,
  contentComponents,
  actions,
  onClick,
}: AssistantMessageProps) {
  const { blocks, parse, reset: resetBlocks } = useMarkdownBlocks();
  const { avatar, senderName, timestamp, content, isStreaming } = message;
  const formatter = displayOptions?.formatTimestamp ?? formatTimestamp;
  const variant = displayOptions?.variant ?? "bubble";
  const isClickable = displayOptions?.isClickable ?? false;
  const prevContentRef = useRef<string>("");

  // Extract text content (memoized)
  const textContent = useMemo(() => getTextContent(content), [content]);

  // Parse markdown only when:
  // 1. Not streaming (message.isStreaming is false/undefined)
  // 2. Content has changed
  useEffect(() => {
    // Skip parsing during streaming for performance
    if (isStreaming) {
      return;
    }

    // Only parse if content changed
    if (textContent === prevContentRef.current) {
      return;
    }

    prevContentRef.current = textContent;
    parse(textContent);

    // Cleanup: reset blocks when content changes significantly
    return () => {
      // Don't reset if just completing streaming
    };
  }, [textContent, isStreaming, parse]);

  // Reset blocks when message changes completely (different id)
  useEffect(() => {
    return () => {
      resetBlocks();
    };
  }, [message.id, resetBlocks]);

  // Determine what to show
  const showAvatar = displayOptions?.showAvatar ?? avatar !== undefined;
  const showSenderName = displayOptions?.showSenderName ?? senderName !== undefined;
  const showTimestamp = displayOptions?.showTimestamp ?? timestamp !== undefined;
  const showActions = displayOptions?.showActions !== false && actions && actions.length > 0;
  const hasHeader = showSenderName || showTimestamp;
  const hasRichContent = useMemo(() => hasNonTextParts(content), [content]);

  // Get variant-specific content style with cursor
  const contentStyle = useMemo<CSSProperties>(() => {
    const base = getContentStyle(variant);
    if (isClickable) {
      return { ...base, cursor: "pointer" };
    }
    return base;
  }, [variant, isClickable]);

  // Memoized header
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

  // Memoized avatar
  const avatarContent = useMemo(() => {
    if (!showAvatar) {
      return null;
    }
    return <div style={avatarStyle}>{renderAvatar(avatar, senderName)}</div>;
  }, [showAvatar, avatar, senderName]);

  // Render text content:
  // - During streaming: plain text (fast)
  // - After complete: markdown (parsed)
  const textRendered = useMemo(() => {
    if (isStreaming) {
      // Plain text during streaming for performance
      return <div style={plainTextStyle}>{textContent}</div>;
    }

    // Markdown after streaming complete
    return <MarkdownViewer value={textContent} blocks={blocks} />;
  }, [isStreaming, textContent, blocks]);

  // Render rich content parts (non-text)
  const richContentParts = useMemo(() => {
    if (!hasRichContent || typeof content === "string") {
      return null;
    }

    const nonTextParts = getNonTextParts(content);
    return nonTextParts.map((part, index) => (
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
        <div style={contentStyle} onClick={onClick}>
          {textRendered}
          {richContentParts}
        </div>
        {showActions && <MessageActions actions={actions} />}
      </div>
    </div>
  );
});
