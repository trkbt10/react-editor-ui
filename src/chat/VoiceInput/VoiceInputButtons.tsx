/**
 * @file VoiceInputButtons - Button components for VoiceInput
 */

import { memo, useState, useMemo, useCallback } from "react";
import type { CSSProperties } from "react";
import {
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_PRIMARY,
  COLOR_PRIMARY_HOVER,
  COLOR_BORDER,
  RADIUS_FULL,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../themes/styles";

// =============================================================================
// Icons
// =============================================================================

/**
 * Cancel button icon (X).
 */
const CancelIcon = memo(function CancelIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
});

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

// =============================================================================
// CancelButton
// =============================================================================

export type CancelButtonProps = {
  onClick: () => void;
};

/**
 * Default cancel button.
 */
export const CancelButton = memo(function CancelButton({
  onClick,
}: CancelButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      padding: 0,
      border: `1.5px solid ${COLOR_BORDER}`,
      borderRadius: RADIUS_FULL,
      backgroundColor: isHovered ? COLOR_BORDER : "transparent",
      color: COLOR_TEXT,
      cursor: "pointer",
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      flexShrink: 0,
    }),
    [isHovered],
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
      aria-label="Cancel voice input"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={buttonStyle}
    >
      <CancelIcon />
    </button>
  );
});

// =============================================================================
// VoiceSendButton
// =============================================================================

export type VoiceSendButtonProps = {
  onClick: () => void;
  disabled: boolean;
};

function getSendButtonBg(disabled: boolean, isHovered: boolean): string {
  if (disabled) {
    return COLOR_TEXT_MUTED;
  }
  if (isHovered) {
    return COLOR_PRIMARY_HOVER;
  }
  return COLOR_PRIMARY;
}

/**
 * Default send button for voice input.
 */
export const VoiceSendButton = memo(function VoiceSendButton({
  onClick,
  disabled,
}: VoiceSendButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonBg = getSendButtonBg(disabled, isHovered);

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
      cursor: disabled ? "default" : "pointer",
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      flexShrink: 0,
      opacity: disabled ? 0.5 : 1,
    }),
    [buttonBg, disabled],
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
      disabled={disabled}
      aria-label="Send voice input"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={buttonStyle}
    >
      <SendIcon />
    </button>
  );
});
