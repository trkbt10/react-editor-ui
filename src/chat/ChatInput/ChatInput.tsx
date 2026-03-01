/**
 * @file ChatInput - Compound components for building chat input UIs
 *
 * @description
 * A set of composable components for building flexible chat input interfaces.
 * Use ChatInput.Root as the container and compose with Badges, Content, Overlay, and Toolbar.
 *
 * @example
 * ```tsx
 * import { ChatInput } from "react-editor-ui/chat/ChatInput";
 *
 * <ChatInput.Root variant="ghost">
 *   <ChatInput.Badges>
 *     <FilePreview file={file} onRemove={handleRemove} />
 *   </ChatInput.Badges>
 *
 *   <ChatInput.Content>
 *     <textarea value={value} onChange={handleChange} />
 *   </ChatInput.Content>
 *
 *   <ChatInput.Overlay visible={isDragging}>
 *     <DropOverlay />
 *   </ChatInput.Overlay>
 *
 *   <ChatInput.Toolbar>
 *     <SendButton onClick={handleSend} />
 *   </ChatInput.Toolbar>
 * </ChatInput.Root>
 * ```
 */

import { memo, useMemo } from "react";
import type { CSSProperties, ReactNode, ComponentPropsWithoutRef } from "react";
import {
  COLOR_SURFACE_RAISED,
  COLOR_BORDER,
  RADIUS_LG,
  DURATION_FAST,
  EASING_DEFAULT,
  SPACE_SM,
  SPACE_MD,
  SHADOW_SM,
  SHADOW_MD,
} from "../../themes/styles";

// =============================================================================
// Re-exports
// =============================================================================

export { ContextBadge, type ContextBadgeProps } from "./ContextBadge";
export { FilePreview, type FilePreviewProps, type FileInfo } from "./FilePreview";
export { SendButton, type SendButtonProps } from "./SendButton";

// =============================================================================
// Types
// =============================================================================

export type ChatInputVariant = "default" | "ghost";

export type ChatInputRootProps = ComponentPropsWithoutRef<"div"> & {
  /** Visual variant */
  variant?: ChatInputVariant;
  /** Disable interaction styling */
  disabled?: boolean;
  /** Children components */
  children: ReactNode;
};

export type ChatInputBadgesProps = ComponentPropsWithoutRef<"div"> & {
  /** Badge/preview content */
  children: ReactNode;
};

export type ChatInputContentProps = ComponentPropsWithoutRef<"div"> & {
  /** Editor/input content */
  children: ReactNode;
};

export type ChatInputOverlayProps = ComponentPropsWithoutRef<"div"> & {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Overlay content */
  children: ReactNode;
};

export type ChatInputToolbarProps = ComponentPropsWithoutRef<"div"> & {
  /** Toolbar content */
  children: ReactNode;
};

// =============================================================================
// Root Component
// =============================================================================

const Root = memo(function ChatInputRoot({
  variant = "default",
  disabled = false,
  children,
  className,
  style,
  ...props
}: ChatInputRootProps) {
  const rootStyle = useMemo<CSSProperties>(() => {
    const base: CSSProperties = {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: SPACE_SM,
      padding: SPACE_MD,
      backgroundColor: COLOR_SURFACE_RAISED,
      borderRadius: RADIUS_LG,
      overflow: "hidden",
      opacity: disabled ? 0.6 : 1,
      transition: `opacity ${DURATION_FAST} ${EASING_DEFAULT}`,
    };

    if (variant === "ghost") {
      return {
        ...base,
        border: "none",
        boxShadow: SHADOW_SM,
        ...style,
      };
    }

    return {
      ...base,
      border: `1px solid ${COLOR_BORDER}`,
      boxShadow: SHADOW_MD,
      ...style,
    };
  }, [disabled, variant, style]);

  return (
    <div className={className} style={rootStyle} {...props}>
      {children}
    </div>
  );
});

// =============================================================================
// Badges Component
// =============================================================================

const Badges = memo(function ChatInputBadges({
  children,
  className,
  style,
  ...props
}: ChatInputBadgesProps) {
  const badgesStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexWrap: "wrap",
      gap: SPACE_SM,
      ...style,
    }),
    [style],
  );

  return (
    <div className={className} style={badgesStyle} {...props}>
      {children}
    </div>
  );
});

// =============================================================================
// Content Component
// =============================================================================

const Content = memo(function ChatInputContent({
  children,
  className,
  style,
  ...props
}: ChatInputContentProps) {
  const contentStyle = useMemo<CSSProperties>(
    () => ({
      ...style,
    }),
    [style],
  );

  return (
    <div className={className} style={contentStyle} {...props}>
      {children}
    </div>
  );
});

// =============================================================================
// Overlay Component
// =============================================================================

const Overlay = memo(function ChatInputOverlay({
  visible,
  children,
  className,
  style,
  ...props
}: ChatInputOverlayProps) {
  const overlayStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      inset: 0,
      zIndex: 10,
      display: visible ? "flex" : "none",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }),
    [visible, style],
  );

  return (
    <div className={className} style={overlayStyle} {...props}>
      {children}
    </div>
  );
});

// =============================================================================
// Toolbar Component
// =============================================================================

const Toolbar = memo(function ChatInputToolbar({
  children,
  className,
  style,
  ...props
}: ChatInputToolbarProps) {
  const toolbarStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      gap: SPACE_SM,
      ...style,
    }),
    [style],
  );

  return (
    <div className={className} style={toolbarStyle} {...props}>
      {children}
    </div>
  );
});

// =============================================================================
// Compound Export
// =============================================================================

export const ChatInput = {
  Root,
  Badges,
  Content,
  Overlay,
  Toolbar,
};
