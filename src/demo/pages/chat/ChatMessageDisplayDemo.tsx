/**
 * @file ChatMessageDisplay demo page
 */

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import {
  ChatMessageDisplay,
  useStreamingContent,
  DefaultUserMessage,
  DefaultAssistantMessage,
  DefaultSystemMessage,
  DefaultThinkingIndicator,
  type ChatMessage,
  type ChatMessageDisplayHandle,
  type MessageAction,
  type ContentPart,
} from "../../../chat/ChatMessageDisplay/ChatMessageDisplay";
import { ChatInput, SendButton } from "../../../chat/ChatInput/ChatInput";
import { Button } from "../../../components/Button/Button";
import { Checkbox } from "../../../components/Checkbox/Checkbox";
import {
  SPACE_SM,
  SPACE_MD,
  SPACE_LG,
  COLOR_TEXT_MUTED,
  COLOR_SURFACE,
  SIZE_FONT_SM,
  SIZE_FONT_XS,
  RADIUS_MD,
} from "../../../themes/styles";

// Sample messages for demo (with avatar, timestamp, senderName)
const createInitialMessages = (): ChatMessage[] => [
  {
    id: "1",
    role: "assistant",
    content: "Hello! How can I help you today?",
    senderName: "Assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: "2",
    role: "user",
    content: "Can you explain virtual scrolling?",
    senderName: "You",
    timestamp: new Date(Date.now() - 1000 * 60 * 4), // 4 minutes ago
  },
  {
    id: "3",
    role: "assistant",
    content: `**Virtual scrolling** is a technique for efficiently rendering large lists by only rendering items that are currently visible in the viewport.

## How it works

1. Calculate which items are visible based on scroll position
2. Only render those items (plus a small overscan buffer)
3. Use absolute positioning to place items at correct positions

\`\`\`typescript
const { virtualItems, totalHeight } = useVirtualScroll({
  itemCount: 1000,
  estimatedItemHeight: 40,
  containerHeight: 400,
});
\`\`\`

This approach significantly improves performance for large datasets.`,
    senderName: "Assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3 minutes ago
  },
  {
    id: "4",
    role: "user",
    content: "That's helpful! Can you show me a code example?",
    senderName: "You",
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
  },
  {
    id: "5",
    role: "assistant",
    content: `Here's a simple example:

\`\`\`tsx
function VirtualList({ items }) {
  const { virtualItems, totalHeight, onScroll } = useVirtualScroll({
    itemCount: items.length,
    estimatedItemHeight: 50,
    containerHeight: 400,
  });

  return (
    <div style={{ height: 400, overflow: 'auto' }} onScroll={onScroll}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map(item => (
          <div
            key={item.index}
            style={{
              position: 'absolute',
              transform: \`translateY(\${item.start}px)\`
            }}
          >
            {items[item.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\``,
    senderName: "Assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 1), // 1 minute ago
  },
];

// Generate many messages for performance testing
function generateManyMessages(count: number): ChatMessage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `gen-${i}`,
    role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
    content:
      i % 2 === 0
        ? `User message ${i + 1}: What about topic ${Math.floor(i / 2) + 1}?`
        : `Assistant response ${i + 1}: Here's some information about topic ${Math.floor(i / 2) + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  }));
}

// Action Icons
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ThumbsUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const ThumbsDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 4v6h-6M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// Simple textarea style
const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 60,
  maxHeight: 200,
  resize: "vertical",
  border: "none",
  outline: "none",
  backgroundColor: "transparent",
  fontFamily: "inherit",
  fontSize: SIZE_FONT_SM,
  lineHeight: 1.5,
};

// =============================================================================
// Pattern Showcase Component
// =============================================================================

const showcaseSectionStyle: CSSProperties = {
  marginTop: SPACE_LG,
  paddingTop: SPACE_LG,
  borderTop: `1px solid ${COLOR_SURFACE}`,
};

const showcaseTitleStyle: CSSProperties = {
  fontSize: SIZE_FONT_SM,
  fontWeight: 600,
  marginBottom: SPACE_MD,
};

const showcaseGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
  gap: SPACE_MD,
};

const showcaseCardStyle: CSSProperties = {
  backgroundColor: COLOR_SURFACE,
  borderRadius: RADIUS_MD,
  padding: SPACE_MD,
  border: `1px solid ${COLOR_SURFACE}`,
};

const showcaseCardTitleStyle: CSSProperties = {
  fontSize: SIZE_FONT_XS,
  color: COLOR_TEXT_MUTED,
  marginBottom: SPACE_SM,
  fontWeight: 500,
};

/** Showcase card wrapper */
function ShowcaseCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={showcaseCardStyle}>
      <div style={showcaseCardTitleStyle}>{title}</div>
      {children}
    </div>
  );
}

/** Streaming demo component - demonstrates useStreamingContent + MarkdownViewer */
function StreamingDemo() {
  const { textContent, appendText, complete, reset, isStreaming } = useStreamingContent();
  const [isRunning, setIsRunning] = useState(false);

  // Markdown text that will be streamed character by character
  const streamingText =
    "Here's a **streaming** response with `markdown`:\n\n" +
    "- Item 1\n" +
    "- Item 2\n\n" +
    "```js\nconsole.log('Hello!');\n```";

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < streamingText.length) {
        appendText(streamingText[index]);
        index++;
      } else {
        complete();
        setIsRunning(false);
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isRunning, appendText, complete]);

  const handleStart = useCallback(() => {
    reset();
    setIsRunning(true);
  }, [reset]);

  // The message uses textContent from the hook
  // isStreaming controls whether plain text or markdown is rendered
  const message: ChatMessage = {
    id: "streaming-demo",
    role: "assistant",
    content: textContent || "Click 'Start' to see streaming with Markdown...",
    isStreaming, // When true: plain text, when false: MarkdownViewer
  };

  return (
    <div>
      <DefaultAssistantMessage
        role="assistant"
        message={message}
        displayOptions={{ showAvatar: false, showTimestamp: false, showSenderName: false }}
      />
      <div style={{ marginTop: SPACE_SM, display: "flex", gap: SPACE_SM, alignItems: "center" }}>
        <Button onClick={handleStart}>{isRunning ? "Streaming..." : "Start Stream"}</Button>
        <span style={{ fontSize: SIZE_FONT_XS, color: COLOR_TEXT_MUTED }}>
          {isStreaming ? "Plain text (streaming)" : "Markdown (complete)"}
        </span>
      </div>
    </div>
  );
}

/** Pattern showcase */
function PatternShowcase() {
  // Sample messages for different patterns
  const basicUserMessage: ChatMessage = {
    id: "basic-user",
    role: "user",
    content: "Hello, how are you?",
  };

  const basicAssistantMessage: ChatMessage = {
    id: "basic-assistant",
    role: "assistant",
    content: "I'm doing great! How can I help you today?",
  };

  const withAvatarUser: ChatMessage = {
    id: "avatar-user",
    role: "user",
    content: "Message with avatar",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    senderName: "John",
  };

  const withAvatarAssistant: ChatMessage = {
    id: "avatar-assistant",
    role: "assistant",
    content: "I have an avatar too!",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=bot",
    senderName: "Assistant",
  };

  const withTimestamp: ChatMessage = {
    id: "timestamp",
    role: "assistant",
    content: "This message has a timestamp.",
    senderName: "Assistant",
    timestamp: new Date(),
  };

  const markdownMessage: ChatMessage = {
    id: "markdown",
    role: "assistant",
    content: `Here's some **bold** and *italic* text.

\`\`\`typescript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

And a list:
- Item 1
- Item 2`,
  };

  const imageMessage: ChatMessage = {
    id: "image",
    role: "assistant",
    content: [
      { type: "text", text: "Here's an image for you:" },
      {
        type: "image",
        url: "https://picsum.photos/200/150",
        alt: "Random image",
        width: 200,
        height: 150,
      },
    ] as ContentPart[],
  };

  const multiContentMessage: ChatMessage = {
    id: "multi-content",
    role: "assistant",
    content: [
      { type: "text", text: "Multiple content types:" },
      {
        type: "image",
        url: "https://picsum.photos/150/100",
        alt: "Sample",
      },
      {
        type: "file",
        name: "document.pdf",
        mimeType: "application/pdf",
        size: 1024 * 512,
      },
    ] as ContentPart[],
  };

  const systemMessage: ChatMessage = {
    id: "system",
    role: "system",
    content: "This is a system message. It provides context or instructions.",
  };

  const longMessage: ChatMessage = {
    id: "long",
    role: "assistant",
    content:
      "This is a very long message that demonstrates how the component handles lengthy content. ".repeat(
        5,
      ) + "The text should wrap properly within the bubble.",
  };

  const withActions: ChatMessage = {
    id: "with-actions",
    role: "assistant",
    content: "This message has action buttons below it.",
  };

  const actions: MessageAction[] = [
    { id: "copy", icon: <CopyIcon />, label: "Copy", onClick: () => {} },
    { id: "like", icon: <ThumbsUpIcon />, label: "Like", onClick: () => {} },
    { id: "dislike", icon: <ThumbsDownIcon />, label: "Dislike", onClick: () => {} },
  ];

  return (
    <div style={showcaseSectionStyle}>
      <h3 style={showcaseTitleStyle}>Pattern Showcase</h3>
      <div style={showcaseGridStyle}>
        {/* Basic Messages */}
        <ShowcaseCard title="Basic User Message">
          <DefaultUserMessage
            role="user"
            message={basicUserMessage}
            displayOptions={{ showAvatar: false, showTimestamp: false, showSenderName: false }}
          />
        </ShowcaseCard>

        <ShowcaseCard title="Basic Assistant Message">
          <DefaultAssistantMessage
            role="assistant"
            message={basicAssistantMessage}
            displayOptions={{ showAvatar: false, showTimestamp: false, showSenderName: false }}
          />
        </ShowcaseCard>

        {/* With Avatars */}
        <ShowcaseCard title="User with Avatar">
          <DefaultUserMessage
            role="user"
            message={withAvatarUser}
            displayOptions={{ showAvatar: true, showSenderName: true }}
          />
        </ShowcaseCard>

        <ShowcaseCard title="Assistant with Avatar">
          <DefaultAssistantMessage
            role="assistant"
            message={withAvatarAssistant}
            displayOptions={{ showAvatar: true, showSenderName: true }}
          />
        </ShowcaseCard>

        {/* With Timestamp */}
        <ShowcaseCard title="With Timestamp & Sender Name">
          <DefaultAssistantMessage
            role="assistant"
            message={withTimestamp}
            displayOptions={{ showTimestamp: true, showSenderName: true }}
          />
        </ShowcaseCard>

        {/* Markdown Content */}
        <ShowcaseCard title="Markdown Content">
          <DefaultAssistantMessage
            role="assistant"
            message={markdownMessage}
            displayOptions={{ showAvatar: false }}
          />
        </ShowcaseCard>

        {/* Image Content */}
        <ShowcaseCard title="Image Content (ContentPart[])">
          <DefaultAssistantMessage
            role="assistant"
            message={imageMessage}
            displayOptions={{ showAvatar: false }}
          />
        </ShowcaseCard>

        {/* Multiple Content Types */}
        <ShowcaseCard title="Multiple Content Types">
          <DefaultAssistantMessage
            role="assistant"
            message={multiContentMessage}
            displayOptions={{ showAvatar: false }}
          />
        </ShowcaseCard>

        {/* System Message */}
        <ShowcaseCard title="System Message">
          <DefaultSystemMessage role="system" message={systemMessage} />
        </ShowcaseCard>

        {/* Thinking Indicator */}
        <ShowcaseCard title="Thinking Indicator">
          <DefaultThinkingIndicator />
        </ShowcaseCard>

        {/* Long Message */}
        <ShowcaseCard title="Long Message (Word Wrap)">
          <DefaultAssistantMessage
            role="assistant"
            message={longMessage}
            displayOptions={{ showAvatar: false }}
          />
        </ShowcaseCard>

        {/* With Actions */}
        <ShowcaseCard title="With Action Buttons">
          <DefaultAssistantMessage
            role="assistant"
            message={withActions}
            displayOptions={{ showAvatar: false, showActions: true }}
            actions={actions}
          />
        </ShowcaseCard>

        {/* Streaming Demo */}
        <ShowcaseCard title="Streaming Message (useStreamingContent)">
          <StreamingDemo />
        </ShowcaseCard>

        {/* Flat Variant Section */}
        <ShowcaseCard title="Flat Variant: User (gray bg)">
          <DefaultUserMessage
            role="user"
            message={basicUserMessage}
            displayOptions={{ variant: "flat", showAvatar: false }}
          />
        </ShowcaseCard>

        <ShowcaseCard title="Flat Variant: Assistant (no bg)">
          <DefaultAssistantMessage
            role="assistant"
            message={basicAssistantMessage}
            displayOptions={{ variant: "flat", showAvatar: false }}
          />
        </ShowcaseCard>

        <ShowcaseCard title="Flat Variant: Markdown">
          <DefaultAssistantMessage
            role="assistant"
            message={markdownMessage}
            displayOptions={{ variant: "flat", showAvatar: false }}
          />
        </ShowcaseCard>

        <ShowcaseCard title="Flat Variant: With Actions">
          <DefaultAssistantMessage
            role="assistant"
            message={withActions}
            displayOptions={{ variant: "flat", showAvatar: false, showActions: true }}
            actions={actions}
          />
        </ShowcaseCard>
      </div>
    </div>
  );
}

// =============================================================================
// Main Demo Component
// =============================================================================

export function ChatMessageDisplayDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>(createInitialMessages);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const [inputValue, setInputValue] = useState("");
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [showSenderName, setShowSenderName] = useState(true);
  const [showActions, setShowActions] = useState(true);
  const displayRef = useRef<ChatMessageDisplayHandle>(null);

  const displayOptions = useMemo(
    () => ({
      showTimestamp,
      showSenderName,
      showAvatar: false, // avatars not provided in demo messages
      showActions,
    }),
    [showTimestamp, showSenderName, showActions],
  );

  // Generate actions for assistant messages
  const renderActions = useCallback(
    (message: ChatMessage, index: number): MessageAction[] => {
      // Only show actions for assistant messages
      if (message.role !== "assistant") {
        return [];
      }

      return [
        {
          id: "copy",
          icon: <CopyIcon />,
          label: "Copy",
          onClick: () => {
            const text = typeof message.content === "string"
              ? message.content
              : message.content
                  .filter((p): p is { type: "text"; text: string } => p.type === "text")
                  .map((p) => p.text)
                  .join("\n");
            navigator.clipboard.writeText(text);
          },
        },
        {
          id: "thumbs-up",
          icon: <ThumbsUpIcon />,
          label: "Good response",
          onClick: () => console.log("Thumbs up:", index),
        },
        {
          id: "thumbs-down",
          icon: <ThumbsDownIcon />,
          label: "Bad response",
          onClick: () => console.log("Thumbs down:", index),
        },
        {
          id: "regenerate",
          icon: <RefreshIcon />,
          label: "Regenerate",
          onClick: () => console.log("Regenerate:", index),
        },
      ];
    },
    [],
  );

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isThinking) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      senderName: "You",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsThinking(true);

    // Scroll to bottom after adding message
    setTimeout(() => displayRef.current?.scrollToBottom(), 50);

    // Simulate response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Echo: "${userMessage.content}"\n\nThis is a simulated response to demonstrate the chat interface.`,
        senderName: "Assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);
      setTimeout(() => displayRef.current?.scrollToBottom(), 50);
    }, 1500);
  }, [inputValue, isThinking]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleMessageClick = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleLoadMany = useCallback(() => {
    setMessages(generateManyMessages(100));
    setSelectedIndex(undefined);
  }, []);

  const handleReset = useCallback(() => {
    setMessages(createInitialMessages());
    setSelectedIndex(undefined);
  }, []);

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      padding: SPACE_LG,
      maxWidth: 800,
      margin: "0 auto",
    }),
    [],
  );

  const headerStyle = useMemo<CSSProperties>(
    () => ({
      marginBottom: SPACE_LG,
    }),
    [],
  );

  const descriptionStyle = useMemo<CSSProperties>(
    () => ({
      color: COLOR_TEXT_MUTED,
      fontSize: SIZE_FONT_SM,
      marginBottom: SPACE_MD,
    }),
    [],
  );

  const controlsStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      gap: SPACE_SM,
      marginTop: SPACE_MD,
    }),
    [],
  );

  const statsStyle = useMemo<CSSProperties>(
    () => ({
      fontSize: SIZE_FONT_XS,
      color: COLOR_TEXT_MUTED,
      marginTop: SPACE_SM,
    }),
    [],
  );

  const emptyStateStyle = useMemo<CSSProperties>(
    () => ({
      textAlign: "center",
      color: COLOR_TEXT_MUTED,
      padding: SPACE_LG,
    }),
    [],
  );

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2>ChatMessageDisplay</h2>
        <p style={descriptionStyle}>
          High-performance chat message list with virtual scrolling and Markdown
          support. Only visible messages are rendered for optimal performance.
        </p>
      </div>

      {/* Message Display */}
      <ChatMessageDisplay.Root
        ref={displayRef}
        messages={messages}
        height={400}
        displayOptions={displayOptions}
        renderActions={showActions ? renderActions : undefined}
        isThinking={isThinking}
        selectedIndex={selectedIndex}
        onMessageClick={handleMessageClick}
      >
        <ChatMessageDisplay.Overlay visible={messages.length === 0}>
          <div style={emptyStateStyle}>
            <p>No messages yet</p>
            <p>Start a conversation below</p>
          </div>
        </ChatMessageDisplay.Overlay>
      </ChatMessageDisplay.Root>

      {/* Chat Input */}
      <div style={{ marginTop: SPACE_MD }}>
        <ChatInput.Root>
          <ChatInput.Content>
            <textarea
              style={textareaStyle}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isThinking}
            />
          </ChatInput.Content>
          <ChatInput.Toolbar>
            <div style={{ flex: 1 }} />
            <SendButton
              onClick={handleSend}
              canSend={!!inputValue.trim() && !isThinking}
              isLoading={isThinking}
            />
          </ChatInput.Toolbar>
        </ChatInput.Root>
      </div>

      {/* Controls */}
      <div style={controlsStyle}>
        <Button onClick={() => displayRef.current?.scrollToTop()}>
          Scroll to Top
        </Button>
        <Button onClick={() => displayRef.current?.scrollToBottom()}>
          Scroll to Bottom
        </Button>
        <Button onClick={handleLoadMany}>Load 100 Messages</Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>

      {/* Display Options */}
      <div style={{ ...controlsStyle, alignItems: "center" }}>
        <Checkbox
          checked={showSenderName}
          onChange={setShowSenderName}
          label="Show sender name"
        />
        <Checkbox
          checked={showTimestamp}
          onChange={setShowTimestamp}
          label="Show timestamp"
        />
        <Checkbox
          checked={showActions}
          onChange={setShowActions}
          label="Show actions"
        />
      </div>

      {/* Stats */}
      <div style={statsStyle}>
        Messages: {messages.length}
        {selectedIndex !== undefined && ` | Selected: #${selectedIndex + 1}`}
      </div>

      {/* Pattern Showcase */}
      <PatternShowcase />
    </div>
  );
}
