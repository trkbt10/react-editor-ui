/**
 * @file VoiceInput component - Voice input with audio visualizer
 *
 * @description
 * A voice input component using the Web Speech API with real-time audio
 * visualization. Designed to work alongside ChatInput with seamless transitions.
 *
 * @example
 * ```tsx
 * import { VoiceInput } from "react-editor-ui/chat/VoiceInput";
 *
 * <VoiceInput
 *   onResult={(text) => console.log("Transcribed:", text)}
 *   onCancel={() => setIsVoiceMode(false)}
 * />
 * ```
 */

import { memo, useCallback, useMemo, useEffect } from "react";
import type { CSSProperties } from "react";
import {
  COLOR_SURFACE_RAISED,
  COLOR_TEXT_MUTED,
  COLOR_BORDER,
  RADIUS_LG,
  SIZE_FONT_MD,
  SPACE_SM,
  SPACE_MD,
  SHADOW_SM,
  SHADOW_MD,
} from "../../themes/styles";
import { AudioVisualizer } from "./AudioVisualizer";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { useMediaStream } from "../../hooks/useMediaStream";
import { CancelButton, VoiceSendButton } from "./VoiceInputButtons";

// =============================================================================
// Types
// =============================================================================

export type VoiceInputVariant = "default" | "ghost";

export type VoiceInputProps = {
  /** Called when speech recognition produces a result */
  onResult?: (text: string) => void;
  /** Called when the user cancels voice input */
  onCancel?: () => void;
  /** Called when an error occurs */
  onError?: (error: string) => void;
  /** Visual variant: "default" has border, "ghost" is borderless */
  variant?: VoiceInputVariant;
  /** Text to show while listening */
  listeningText?: string;
  /** Custom cancel button (replaces default) */
  cancelButton?: React.ReactNode;
  /** Custom send button (replaces default) */
  sendButton?: React.ReactNode;
  /** Aria label for the component */
  "aria-label"?: string;
  /** Custom class name */
  className?: string;
};

// =============================================================================
// Main Component
// =============================================================================

export const VoiceInput = memo(function VoiceInput({
  onResult,
  onCancel,
  onError,
  variant = "default",
  listeningText = "Listening",
  cancelButton,
  sendButton,
  "aria-label": ariaLabel,
  className,
}: VoiceInputProps) {
  // Media stream hook
  const { stream, stop: stopStream } = useMediaStream({ onError });

  // Speech recognition hook
  const {
    isListening,
    transcript,
    start: startRecognition,
    stop: stopRecognition,
    abort: abortRecognition,
  } = useSpeechRecognition({ onError });

  // Start recognition when stream is ready
  useEffect(() => {
    if (stream) {
      startRecognition();
    }
  }, [stream, startRecognition]);

  const handleCancel = useCallback(() => {
    abortRecognition();
    stopStream();
    onCancel?.();
  }, [abortRecognition, stopStream, onCancel]);

  const handleSend = useCallback(() => {
    stopRecognition();
    stopStream();
    if (transcript.trim()) {
      onResult?.(transcript.trim());
    }
  }, [stopRecognition, stopStream, onResult, transcript]);

  // Container style based on variant
  const containerStyle = useMemo<CSSProperties>(() => {
    const base: CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: SPACE_MD,
      padding: SPACE_MD,
      backgroundColor: COLOR_SURFACE_RAISED,
      borderRadius: RADIUS_LG,
      minHeight: 56,
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
  }, [variant]);

  const centerStyle = useMemo<CSSProperties>(
    () => ({
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACE_SM,
    }),
    [],
  );

  const textStyle = useMemo<CSSProperties>(
    () => ({
      fontSize: SIZE_FONT_MD,
      color: COLOR_TEXT_MUTED,
    }),
    [],
  );

  return (
    <div
      className={className}
      style={containerStyle}
      role="region"
      aria-label={ariaLabel || "Voice input"}
      aria-live="polite"
    >
      {/* Cancel button */}
      {cancelButton || <CancelButton onClick={handleCancel} />}

      {/* Center content: visualizer + text */}
      <div style={centerStyle}>
        <AudioVisualizer stream={stream} isActive={isListening} />
        <span style={textStyle}>{listeningText}</span>
      </div>

      {/* Send button */}
      {sendButton || (
        <VoiceSendButton onClick={handleSend} disabled={!transcript.trim()} />
      )}
    </div>
  );
});
