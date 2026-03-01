/**
 * @file ChatInput component - Extensible chat input with toolbar
 *
 * @description
 * A multi-line text input optimized for chat interfaces. Features auto-resize,
 * Enter to send (Shift+Enter for newline), and a flexible toolbar slot.
 *
 * @example
 * ```tsx
 * import { ChatInput } from "react-editor-ui/chat/ChatInput";
 * import { IconButton } from "react-editor-ui/IconButton";
 * import { Select } from "react-editor-ui/Select";
 *
 * <ChatInput
 *   value={value}
 *   onChange={setValue}
 *   onSend={handleSend}
 *   placeholder="Ask anything"
 *   toolbar={
 *     <>
 *       <IconButton icon={<PlusIcon />} aria-label="Add" variant="ghost" size="sm" />
 *       <Select value={model} options={models} onChange={setModel} variant="ghost" size="sm" />
 *       <div style={{ flex: 1 }} />
 *       <IconButton icon={<MicIcon />} aria-label="Voice" variant="ghost" size="sm" />
 *     </>
 *   }
 * />
 * ```
 */

import { memo, useMemo, useCallback, useRef, forwardRef } from "react";
import type {
  CSSProperties,
  Ref,
  KeyboardEvent,
  ChangeEvent,
  ReactNode,
} from "react";
import {
  COLOR_SURFACE_RAISED,
  COLOR_TEXT,
  COLOR_TEXT_DISABLED,
  COLOR_BORDER,
  RADIUS_LG,
  DURATION_FAST,
  EASING_DEFAULT,
  SIZE_FONT_MD,
  SPACE_XS,
  SPACE_SM,
  SPACE_MD,
  SHADOW_SM,
  SHADOW_MD,
} from "../../themes/styles";
import { useAutoResize } from "../../hooks/useAutoResize";
import { SendButton } from "./SendButton";

// =============================================================================
// Types
// =============================================================================

export type ChatInputVariant = "default" | "ghost";

export type ChatInputProps = {
  /** Current input value */
  value: string;
  /** Called when the input value changes */
  onChange: (value: string) => void;
  /** Called when the user submits (Enter or send button) */
  onSend?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disable the input */
  disabled?: boolean;
  /** Show loading state on send button */
  isLoading?: boolean;
  /** Visual variant: "default" has border, "ghost" is borderless */
  variant?: ChatInputVariant;
  /** Maximum height before scrolling (in px) */
  maxHeight?: number;
  /** Minimum height for textarea (in px) */
  minHeight?: number;
  /** Toolbar content - fully flexible, render anything */
  toolbar?: ReactNode;
  /** Custom send button (replaces default) */
  sendButton?: ReactNode;
  /** Hide the default send button */
  hideSendButton?: boolean;
  /** Aria label for the textarea */
  "aria-label"?: string;
  /** Custom class name */
  className?: string;
};

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_MIN_HEIGHT = 24;
const DEFAULT_MAX_HEIGHT = 200;

// =============================================================================
// Main Component
// =============================================================================

export const ChatInput = memo(
  forwardRef(function ChatInput(
    {
      value,
      onChange,
      onSend,
      placeholder = "Ask anything",
      disabled = false,
      isLoading = false,
      variant = "default",
      maxHeight = DEFAULT_MAX_HEIGHT,
      minHeight = DEFAULT_MIN_HEIGHT,
      toolbar,
      sendButton,
      hideSendButton = false,
      "aria-label": ariaLabel,
      className,
    }: ChatInputProps,
    ref: Ref<HTMLTextAreaElement>,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea hook
    useAutoResize(textareaRef, value, { minHeight, maxHeight });

    // Container style based on variant
    const containerStyle = useMemo<CSSProperties>(() => {
      const base: CSSProperties = {
        display: "flex",
        flexDirection: "column",
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
        };
      }

      return {
        ...base,
        border: `1px solid ${COLOR_BORDER}`,
        boxShadow: SHADOW_MD,
      };
    }, [disabled, variant]);

    // Textarea wrapper style
    const textareaWrapperStyle = useMemo<CSSProperties>(
      () => ({
        padding: `${SPACE_MD} ${SPACE_MD} ${SPACE_XS} ${SPACE_MD}`,
      }),
      [],
    );

    // Textarea style
    const textareaStyle = useMemo<CSSProperties>(
      () => ({
        width: "100%",
        minHeight,
        maxHeight,
        padding: 0,
        border: "none",
        backgroundColor: "transparent",
        color: disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
        fontSize: SIZE_FONT_MD,
        lineHeight: 1.5,
        resize: "none",
        outline: "none",
        overflow: "auto",
        fontFamily: "inherit",
      }),
      [disabled, minHeight, maxHeight],
    );

    // Toolbar style
    const toolbarStyle = useMemo<CSSProperties>(
      () => ({
        display: "flex",
        alignItems: "center",
        gap: SPACE_XS,
        padding: `${SPACE_XS} ${SPACE_SM} ${SPACE_SM} ${SPACE_SM}`,
      }),
      [],
    );

    const canSend = value.trim().length > 0 && !disabled && !isLoading;

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
      },
      [onChange],
    );

    const handleSend = useCallback(() => {
      if (canSend && onSend) {
        onSend(value);
      }
    }, [canSend, onSend, value]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Enter without Shift sends the message
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      },
      [handleSend],
    );

    // Merge refs
    const mergedRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        (
          textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>
        ).current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (
            ref as React.MutableRefObject<HTMLTextAreaElement | null>
          ).current = node;
        }
      },
      [ref],
    );

    const showToolbar = toolbar || sendButton || !hideSendButton;

    return (
      <div className={className} style={containerStyle}>
        {/* Textarea area */}
        <div style={textareaWrapperStyle}>
          <textarea
            ref={mergedRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={ariaLabel || "Chat message input"}
            rows={1}
            style={textareaStyle}
          />
        </div>

        {/* Toolbar - fully flexible */}
        {showToolbar && (
          <div style={toolbarStyle}>
            {toolbar}
            {!hideSendButton && !sendButton && (
              <SendButton
                canSend={canSend}
                isLoading={isLoading}
                onClick={handleSend}
              />
            )}
            {sendButton}
          </div>
        )}
      </div>
    );
  }),
);
