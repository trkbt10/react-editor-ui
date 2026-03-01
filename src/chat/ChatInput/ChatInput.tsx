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

import {
  memo,
  useState,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
  forwardRef,
} from "react";
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
  COLOR_TEXT_MUTED,
  COLOR_TEXT_DISABLED,
  COLOR_PRIMARY,
  COLOR_PRIMARY_HOVER,
  COLOR_BORDER,
  RADIUS_LG,
  RADIUS_FULL,
  DURATION_FAST,
  EASING_DEFAULT,
  SIZE_FONT_MD,
  SPACE_XS,
  SPACE_SM,
  SPACE_MD,
  SHADOW_SM,
  SHADOW_MD,
} from "../../themes/styles";

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
// Sub-components
// =============================================================================

/**
 * Default send button icon (arrow up).
 */
const SendIcon = memo(function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5" />
      <path d="M5 12L12 5L19 12" />
    </svg>
  );
});

/**
 * Loading spinner for send button.
 */
const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      style={{
        animation: "chat-input-spin 1s linear infinite",
      }}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
});

// Track keyframes injection state at module scope
const keyframesState = { injected: false };

function injectKeyframes(): void {
  if (keyframesState.injected || typeof document === "undefined") {
    return;
  }
  const style = document.createElement("style");
  style.textContent = `
    @keyframes chat-input-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  keyframesState.injected = true;
}

/**
 * Default send button component.
 */
const DefaultSendButton = memo(function DefaultSendButton({
  canSend,
  isLoading,
  onClick,
}: {
  canSend: boolean;
  isLoading: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonBg = canSend ? (isHovered ? COLOR_PRIMARY_HOVER : COLOR_PRIMARY) : COLOR_TEXT_MUTED;
  const buttonCursor = canSend ? "pointer" : "default";

  const buttonStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      padding: 0,
      border: "none",
      borderRadius: RADIUS_FULL,
      backgroundColor: buttonBg,
      color: "#fff",
      cursor: buttonCursor,
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      flexShrink: 0,
      opacity: canSend ? 1 : 0.5,
    }),
    [buttonBg, buttonCursor, canSend],
  );

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!canSend}
      aria-label={isLoading ? "Sending..." : "Send message"}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={buttonStyle}
    >
      {isLoading ? <LoadingSpinner /> : <SendIcon />}
    </button>
  );
});

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

    // Inject spinner keyframes on mount
    useLayoutEffect(() => {
      injectKeyframes();
    }, []);

    // Auto-resize textarea
    useLayoutEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      // Reset height to get accurate scrollHeight
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    }, [value, minHeight, maxHeight]);

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
        // Ghost: no border, subtle shadow
        return {
          ...base,
          border: "none",
          boxShadow: SHADOW_SM,
        };
      }

      // Default: with border
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
        (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
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
              <DefaultSendButton
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
