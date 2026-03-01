/**
 * @file ChatMessageDisplay - Compound components for displaying chat messages with virtual scrolling
 *
 * @description
 * A high-performance chat message display component with virtual scrolling for efficiently
 * rendering large conversation histories. Uses compound components pattern for flexibility.
 * Supports custom message renderers and thinking indicators.
 *
 * @example
 * ```tsx
 * import { ChatMessageDisplay } from "react-editor-ui/chat/ChatMessageDisplay";
 *
 * const messages = [
 *   { id: "1", role: "assistant", content: "Hello! How can I help you?" },
 *   { id: "2", role: "user", content: "What is React?" },
 * ];
 *
 * <ChatMessageDisplay.Root
 *   messages={messages}
 *   height={400}
 *   isThinking={isGenerating}
 * >
 *   <ChatMessageDisplay.Overlay visible={messages.length === 0}>
 *     <EmptyState />
 *   </ChatMessageDisplay.Overlay>
 * </ChatMessageDisplay.Root>
 * ```
 */

import {
  memo,
  useMemo,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useImperativeHandle,
  Children,
  isValidElement,
} from "react";
import type { CSSProperties, ReactNode } from "react";
import { useVirtualScroll, type VirtualItem } from "../../hooks/useVirtualScroll";
import { MessageRenderer, mergeComponents } from "./MessageRenderer";
import type {
  ChatMessage,
  ChatMessageDisplayRootProps,
  ChatMessageDisplayHeaderProps,
  ChatMessageDisplayFooterProps,
  ChatMessageDisplayOverlayProps,
  MessageDisplayOptions,
  ContentPartComponentMap,
  MessageAction,
} from "./types";
import {
  COLOR_SURFACE,
  COLOR_BORDER,
  RADIUS_MD,
  SPACE_SM,
  SPACE_MD,
} from "../../themes/styles";

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_HEIGHT = 400;
const DEFAULT_ITEM_HEIGHT = 80;

// =============================================================================
// Header Component
// =============================================================================

const Header = memo(function ChatMessageDisplayHeader({
  children,
  className,
}: ChatMessageDisplayHeaderProps) {
  const style = useMemo<CSSProperties>(
    () => ({
      flexShrink: 0,
      padding: SPACE_SM,
    }),
    [],
  );

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
});

// =============================================================================
// Footer Component
// =============================================================================

const Footer = memo(function ChatMessageDisplayFooter({
  children,
  className,
}: ChatMessageDisplayFooterProps) {
  const style = useMemo<CSSProperties>(
    () => ({
      flexShrink: 0,
      padding: SPACE_SM,
    }),
    [],
  );

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
});

// =============================================================================
// Overlay Component
// =============================================================================

const Overlay = memo(function ChatMessageDisplayOverlay({
  visible,
  children,
  className,
}: ChatMessageDisplayOverlayProps) {
  const style = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      inset: 0,
      zIndex: 10,
      display: visible ? "flex" : "none",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLOR_SURFACE,
    }),
    [visible],
  );

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
});

// =============================================================================
// Message Item Component
// =============================================================================

type MessageItemProps = {
  virtualItem: VirtualItem;
  message: ChatMessage | undefined;
  isThinkingSlot: boolean;
  components: ReturnType<typeof mergeComponents>;
  displayOptions?: MessageDisplayOptions;
  contentComponents?: ContentPartComponentMap;
  actions?: MessageAction[];
  isSelected: boolean;
  onClick?: (index: number, message: ChatMessage) => void;
  rowRefs: React.RefObject<Map<number, HTMLDivElement>>;
};

const MessageItem = memo(function MessageItem({
  virtualItem,
  message,
  isThinkingSlot,
  components,
  displayOptions,
  contentComponents,
  actions,
  isSelected,
  onClick,
  rowRefs,
}: MessageItemProps) {
  const itemStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      transform: `translateY(${virtualItem.start}px)`,
      padding: `0 ${SPACE_MD}`,
      boxSizing: "border-box",
      opacity: isSelected ? 0.8 : 1,
    }),
    [virtualItem.start, isSelected],
  );

  const handleClick = useCallback(() => {
    if (onClick && message) {
      onClick(virtualItem.index, message);
    }
  }, [onClick, message, virtualItem.index]);

  // Merge displayOptions with click handler for cursor styling
  const mergedDisplayOptions = useMemo(() => {
    if (!onClick || !message) {
      return displayOptions;
    }
    return {
      ...displayOptions,
      isClickable: true,
    };
  }, [displayOptions, onClick, message]);

  const content = useMemo(() => {
    if (isThinkingSlot) {
      const ThinkingComponent = components.thinking;
      return <ThinkingComponent />;
    }

    if (!message) {
      return null;
    }

    return (
      <MessageRenderer
        message={message}
        components={components}
        displayOptions={mergedDisplayOptions}
        contentComponents={contentComponents}
        actions={actions}
        onClick={onClick ? handleClick : undefined}
      />
    );
  }, [isThinkingSlot, message, components, mergedDisplayOptions, contentComponents, actions, onClick, handleClick]);

  return (
    <div
      ref={(el) => {
        if (el) {
          rowRefs.current?.set(virtualItem.index, el);
        } else {
          rowRefs.current?.delete(virtualItem.index);
        }
      }}
      style={itemStyle}
      data-index={virtualItem.index}
    >
      {content}
    </div>
  );
});

// =============================================================================
// Root Component
// =============================================================================

const Root = memo(function ChatMessageDisplayRoot({
  messages,
  height = DEFAULT_HEIGHT,
  estimatedItemHeight = DEFAULT_ITEM_HEIGHT,
  overscan = 3,
  components,
  contentComponents,
  displayOptions,
  renderActions,
  selectedIndex,
  onMessageClick,
  isThinking = false,
  className,
  children,
  ref,
}: ChatMessageDisplayRootProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [containerHeight, setContainerHeight] = useState(
    typeof height === "number" ? height : DEFAULT_HEIGHT,
  );

  // Extract slot children
  const { header, footer, overlay } = useMemo(() => {
    const childArray = Children.toArray(children);

    const findSlot = <T extends typeof Header | typeof Footer | typeof Overlay>(
      type: T,
    ): ReactNode => {
      const found = childArray.find(
        (child) => isValidElement(child) && child.type === type,
      );
      return found ?? null;
    };

    return {
      header: findSlot(Header),
      footer: findSlot(Footer),
      overlay: findSlot(Overlay),
    };
  }, [children]);

  // Calculate effective item count (messages + thinking indicator)
  const itemCount = isThinking ? messages.length + 1 : messages.length;

  // Virtual scrolling
  const {
    virtualItems,
    totalHeight,
    onScroll,
    measureItem,
    getScrollPosition,
  } = useVirtualScroll({
    itemCount,
    estimatedItemHeight,
    overscan,
    containerHeight,
  });

  // Measure container height
  useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.height > 0 && rect.height !== containerHeight) {
      setContainerHeight(rect.height);
    }
  }, [height, containerHeight]);

  // Measure item heights
  useLayoutEffect(() => {
    virtualItems.forEach((item) => {
      const el = rowRefs.current.get(item.index);
      if (el) {
        const rect = el.getBoundingClientRect();
        measureItem(item.index, rect.height);
      }
    });
  }, [virtualItems, measureItem]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      onScroll(e.currentTarget.scrollTop);
    },
    [onScroll],
  );

  // Helper to calculate scroll target for alignment
  const calculateScrollTarget = useCallback(
    (index: number, align: "start" | "center" | "end" = "start"): number => {
      const pos = getScrollPosition(index);
      const itemHeight = estimatedItemHeight;
      switch (align) {
        case "center":
          return Math.max(0, pos - containerHeight / 2 + itemHeight / 2);
        case "end":
          return Math.max(0, pos - containerHeight + itemHeight);
        case "start":
        default:
          return pos;
      }
    },
    [getScrollPosition, containerHeight, estimatedItemHeight],
  );

  // Imperative handle
  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index: number, align?: "start" | "center" | "end") => {
        if (!containerRef.current) {
          return;
        }
        const target = calculateScrollTarget(index, align);
        containerRef.current.scrollTop = target;
      },
      scrollToTop: () => {
        containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      },
      scrollToBottom: () => {
        containerRef.current?.scrollTo({
          top: totalHeight,
          behavior: "smooth",
        });
      },
      getVisibleRange: () => {
        if (virtualItems.length === 0) {
          return { start: 0, end: 0 };
        }
        return {
          start: virtualItems[0].index,
          end: virtualItems[virtualItems.length - 1].index,
        };
      },
    }),
    [calculateScrollTarget, totalHeight, virtualItems],
  );

  // Merged components
  const merged = useMemo(
    () => mergeComponents(components),
    [components],
  );

  const wrapperStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      height,
      position: "relative",
    }),
    [height],
  );

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      flex: 1,
      overflow: "auto",
      backgroundColor: COLOR_SURFACE,
      borderRadius: RADIUS_MD,
      border: `1px solid ${COLOR_BORDER}`,
      position: "relative",
    }),
    [],
  );

  const innerStyle = useMemo<CSSProperties>(
    () => ({
      height: totalHeight,
      width: "100%",
      position: "relative",
    }),
    [totalHeight],
  );

  return (
    <div className={className} style={wrapperStyle}>
      {header}
      <div ref={containerRef} style={containerStyle} onScroll={handleScroll}>
        <div style={innerStyle}>
          {virtualItems.map((item) => {
            const msg = messages[item.index];
            const actions = msg && renderActions ? renderActions(msg, item.index) : undefined;
            return (
              <MessageItem
                key={item.index}
                virtualItem={item}
                message={msg}
                isThinkingSlot={item.index === messages.length && isThinking}
                components={merged}
                displayOptions={displayOptions}
                contentComponents={contentComponents}
                actions={actions}
                isSelected={selectedIndex === item.index}
                onClick={onMessageClick}
                rowRefs={rowRefs}
              />
            );
          })}
        </div>
        {overlay}
      </div>
      {footer}
    </div>
  );
});

// =============================================================================
// Compound Export
// =============================================================================

export const ChatMessageDisplay = {
  Root,
  Header,
  Footer,
  Overlay,
};

// =============================================================================
// Re-exports
// =============================================================================

export { MessageRenderer, type MessageRendererProps } from "./MessageRenderer";
export {
  defaultComponents,
  DefaultUserMessage,
  DefaultAssistantMessage,
  DefaultSystemMessage,
  DefaultThinkingIndicator,
  DefaultFallbackMessage,
  ContentPartRenderer,
  defaultContentComponents,
  MessageActions,
  type MessageActionsProps,
} from "./defaults";
export {
  useStreamingContent,
  type UseStreamingContentOptions,
  type UseStreamingContentReturn,
} from "./useStreamingContent";
export type {
  ChatMessage,
  MessageRole,
  MessageContent,
  MessageComponentMap,
  MessageDisplayOptions,
  MessageVariant,
  ContentPart,
  TextContentPart,
  ImageContentPart,
  VideoContentPart,
  AudioContentPart,
  FileContentPart,
  EmbedContentPart,
  CustomContentPart,
  ContentPartComponentMap,
  ContentPartRendererProps,
  MessageAction,
  RenderActionsFunction,
  BaseMessageProps,
  UserMessageProps,
  AssistantMessageProps,
  SystemMessageProps,
  ThinkingIndicatorProps,
  ChatMessageDisplayRootProps,
  ChatMessageDisplayHandle,
  ChatMessageDisplayHeaderProps,
  ChatMessageDisplayFooterProps,
  ChatMessageDisplayOverlayProps,
} from "./types";
