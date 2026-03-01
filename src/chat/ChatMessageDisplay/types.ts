/**
 * @file ChatMessageDisplay types
 */

import type { ComponentType, ReactNode, RefObject } from "react";

// =============================================================================
// Content Parts (OpenAI-style content array support)
// =============================================================================

/** Text content part */
export type TextContentPart = {
  type: "text";
  text: string;
};

/** Image content part */
export type ImageContentPart = {
  type: "image";
  /** Image URL or base64 data URI */
  url: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Image dimensions (optional, for layout hints) */
  width?: number;
  height?: number;
};

/** Video content part */
export type VideoContentPart = {
  type: "video";
  /** Video URL */
  url: string;
  /** Poster image URL */
  poster?: string;
  /** Video dimensions (optional) */
  width?: number;
  height?: number;
};

/** Audio content part */
export type AudioContentPart = {
  type: "audio";
  /** Audio URL or base64 data URI */
  url: string;
  /** Duration in seconds (optional) */
  duration?: number;
};

/** File/document content part */
export type FileContentPart = {
  type: "file";
  /** File name */
  name: string;
  /** File URL (for download) */
  url?: string;
  /** MIME type */
  mimeType?: string;
  /** File size in bytes */
  size?: number;
};

/** Embedded content part (iframe, code sandbox, etc.) */
export type EmbedContentPart = {
  type: "embed";
  /** Embed URL or HTML */
  url?: string;
  html?: string;
  /** Embed dimensions */
  width?: number;
  height?: number;
};

/** Custom/extension content part */
export type CustomContentPart = {
  type: "custom";
  /** Custom content identifier */
  contentType: string;
  /** Custom data */
  data: unknown;
};

/** Union of all content part types */
export type ContentPart =
  | TextContentPart
  | ImageContentPart
  | VideoContentPart
  | AudioContentPart
  | FileContentPart
  | EmbedContentPart
  | CustomContentPart;

/** Content can be a simple string or an array of content parts */
export type MessageContent = string | ContentPart[];

// =============================================================================
// Message Actions
// =============================================================================

/** A single action button for a message */
export type MessageAction = {
  /** Unique identifier for the action */
  id: string;
  /** Icon to display (ReactNode) */
  icon: ReactNode;
  /** Tooltip/label for the action */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Whether the action is in active/selected state */
  active?: boolean;
};

/** Function to render actions for a message */
export type RenderActionsFunction = (message: ChatMessage, index: number) => MessageAction[];

// =============================================================================
// Message Data
// =============================================================================

/** Role of the message sender */
export type MessageRole = "user" | "assistant" | "system";

/** A single chat message */
export type ChatMessage = {
  /** Unique identifier */
  id: string;
  /** Role of the sender */
  role: MessageRole;
  /** Message content (string for simple text, array for rich content) */
  content: MessageContent;
  /** Optional sender name (displayed above message) */
  senderName?: string;
  /** Optional avatar (URL string or ReactNode for custom icon) */
  avatar?: string | ReactNode;
  /** Optional timestamp */
  timestamp?: Date | string;
  /** Optional metadata (e.g., model name) */
  metadata?: Record<string, unknown>;
  /** For streaming: marks message as still being generated */
  isStreaming?: boolean;
};

// =============================================================================
// Display Options
// =============================================================================

/** Message display style variant */
export type MessageVariant = "bubble" | "flat";

/** Options for controlling message display */
export type MessageDisplayOptions = {
  /** Display style variant (default: "bubble")
   * - "bubble": Traditional bubble style with colored backgrounds
   * - "flat": Modern flat style (user: gray bg, assistant: no bg)
   */
  variant?: MessageVariant;
  /** Show avatar/icon area (default: true if avatar provided) */
  showAvatar?: boolean;
  /** Show sender name (default: true if senderName provided) */
  showSenderName?: boolean;
  /** Show timestamp (default: true if timestamp provided) */
  showTimestamp?: boolean;
  /** Timestamp format function */
  formatTimestamp?: (timestamp: Date | string) => string;
  /** Show action buttons (default: true if renderActions provided) */
  showActions?: boolean;
  /** Internal: Whether the message is clickable (sets cursor: pointer on bubble) */
  isClickable?: boolean;
};

// =============================================================================
// Content Part Renderers
// =============================================================================

/** Props for content part renderers */
export type ContentPartRendererProps<T extends ContentPart = ContentPart> = {
  part: T;
  message: ChatMessage;
};

/** Map of content part type to custom renderer component */
export type ContentPartComponentMap = {
  text?: ComponentType<ContentPartRendererProps<TextContentPart>>;
  image?: ComponentType<ContentPartRendererProps<ImageContentPart>>;
  video?: ComponentType<ContentPartRendererProps<VideoContentPart>>;
  audio?: ComponentType<ContentPartRendererProps<AudioContentPart>>;
  file?: ComponentType<ContentPartRendererProps<FileContentPart>>;
  embed?: ComponentType<ContentPartRendererProps<EmbedContentPart>>;
  custom?: ComponentType<ContentPartRendererProps<CustomContentPart>>;
};

// =============================================================================
// Per-Message Renderer Props
// =============================================================================

/** Base props shared by all message renderers */
export type BaseMessageProps = {
  message: ChatMessage;
  /** Display options passed from root */
  displayOptions?: MessageDisplayOptions;
  /** Custom content part renderers */
  contentComponents?: ContentPartComponentMap;
  /** Actions to render below the message */
  actions?: MessageAction[];
  /** Click handler for the message bubble */
  onClick?: () => void;
  children?: ReactNode;
};

export type UserMessageProps = BaseMessageProps & { role: "user" };
export type AssistantMessageProps = BaseMessageProps & { role: "assistant" };
export type SystemMessageProps = BaseMessageProps & { role: "system" };

export type ThinkingIndicatorProps = {
  message?: ChatMessage;
};

// =============================================================================
// Component Override Map
// =============================================================================

/** Map of role to custom renderer component. Only override what you need. */
export type MessageComponentMap = {
  user?: ComponentType<UserMessageProps>;
  assistant?: ComponentType<AssistantMessageProps>;
  system?: ComponentType<SystemMessageProps>;
  /** Fallback renderer for unknown roles */
  fallback?: ComponentType<BaseMessageProps>;
  /** Custom thinking/loading indicator */
  thinking?: ComponentType<ThinkingIndicatorProps>;
};

// =============================================================================
// Compound Component Props
// =============================================================================

export type ChatMessageDisplayRootProps = {
  /** Array of messages to display */
  messages: ChatMessage[];
  /** Container height for virtual scrolling */
  height?: number | string;
  /** Estimated height for each message (for initial layout) */
  estimatedItemHeight?: number;
  /** Number of items to render beyond visible area */
  overscan?: number;
  /** Custom message renderers (merged with defaults) */
  components?: MessageComponentMap;
  /** Custom content part renderers */
  contentComponents?: ContentPartComponentMap;
  /** Display options (avatar, timestamp, sender name visibility) */
  displayOptions?: MessageDisplayOptions;
  /** Function to generate actions for each message */
  renderActions?: RenderActionsFunction;
  /** Index of currently selected message */
  selectedIndex?: number;
  /** Callback when a message is clicked */
  onMessageClick?: (index: number, message: ChatMessage) => void;
  /** Show a thinking indicator at the bottom */
  isThinking?: boolean;
  /** Custom class name */
  className?: string;
  /** Ref for imperative handle */
  ref?: RefObject<ChatMessageDisplayHandle | null>;
  /** Slot children (Header, Footer, Overlay) */
  children?: ReactNode;
};

export type ChatMessageDisplayHandle = {
  scrollToIndex: (index: number, align?: "start" | "center" | "end") => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  getVisibleRange: () => { start: number; end: number };
};

export type ChatMessageDisplayHeaderProps = {
  children: ReactNode;
  className?: string;
};

export type ChatMessageDisplayFooterProps = {
  children: ReactNode;
  className?: string;
};

export type ChatMessageDisplayOverlayProps = {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Overlay content */
  children: ReactNode;
  className?: string;
};
