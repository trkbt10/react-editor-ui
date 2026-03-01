/**
 * @file SendButton component - Default send button with loading state
 */

import { memo, useState, useMemo, useCallback, useLayoutEffect } from "react";
import type { CSSProperties } from "react";
import {
  COLOR_PRIMARY,
  COLOR_PRIMARY_HOVER,
  COLOR_TEXT_MUTED,
  RADIUS_FULL,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../themes/styles";

// =============================================================================
// Keyframes injection
// =============================================================================

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

// =============================================================================
// Icons
// =============================================================================

/**
 * Send button icon (arrow up).
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

// =============================================================================
// Types
// =============================================================================

export type SendButtonProps = {
  /** Whether sending is allowed */
  canSend: boolean;
  /** Whether the send action is in progress */
  isLoading: boolean;
  /** Called when the button is clicked */
  onClick: () => void;
};

// =============================================================================
// Component
// =============================================================================

function getButtonBg(canSend: boolean, isHovered: boolean): string {
  if (!canSend) {
    return COLOR_TEXT_MUTED;
  }
  return isHovered ? COLOR_PRIMARY_HOVER : COLOR_PRIMARY;
}

/**
 * Default send button component with loading state.
 */
export const SendButton = memo(function SendButton({
  canSend,
  isLoading,
  onClick,
}: SendButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Inject spinner keyframes on mount
  useLayoutEffect(() => {
    injectKeyframes();
  }, []);

  const buttonBg = getButtonBg(canSend, isHovered);
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
