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

import {
  memo,
  useState,
  useEffect,
  useEffectEvent,
  useRef,
  useCallback,
  useMemo,
} from "react";
import type { CSSProperties } from "react";
import {
  COLOR_SURFACE_RAISED,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_PRIMARY,
  COLOR_PRIMARY_HOVER,
  COLOR_BORDER,
  RADIUS_LG,
  RADIUS_FULL,
  DURATION_FAST,
  EASING_DEFAULT,
  SIZE_FONT_MD,
  SPACE_SM,
  SPACE_MD,
  SHADOW_SM,
  SHADOW_MD,
} from "../../themes/styles";
import { AudioVisualizer } from "./AudioVisualizer";

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
// Speech Recognition Types
// =============================================================================

type SpeechRecognitionEvent = {
  results: SpeechRecognitionResultList;
  resultIndex: number;
};

type SpeechRecognitionErrorEvent = {
  error: string;
  message?: string;
};

type SpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognition;

type WindowWithSpeechRecognition = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

// =============================================================================
// Sub-components
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

/**
 * Default cancel button.
 */
const DefaultCancelButton = memo(function DefaultCancelButton({
  onClick,
}: {
  onClick: () => void;
}) {
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
 * Default send button.
 */
const DefaultSendButton = memo(function DefaultSendButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
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
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Event handlers wrapped with useEffectEvent
  const handleRecognitionResult = useEffectEvent((event: SpeechRecognitionEvent) => {
    const results = Array.from({ length: event.results.length - event.resultIndex }, (_, i) => {
      const result = event.results[event.resultIndex + i];
      return { isFinal: result.isFinal, transcript: result[0].transcript };
    });

    const finalTranscript = results
      .filter((r) => r.isFinal)
      .map((r) => r.transcript)
      .join("");
    const interimTranscript = results
      .filter((r) => !r.isFinal)
      .map((r) => r.transcript)
      .join("");

    setTranscript(finalTranscript || interimTranscript);
  });

  const handleRecognitionError = useEffectEvent((event: SpeechRecognitionErrorEvent) => {
    if (event.error !== "aborted") {
      onError?.(event.error);
    }
    setIsListening(false);
  });

  const handleRecognitionEnd = useEffectEvent(() => {
    setIsListening(false);
  });

  const handleRecognitionStart = useEffectEvent(() => {
    setIsListening(true);
  });

  const handleStreamReady = useEffectEvent((stream: MediaStream) => {
    setAudioStream(stream);
    recognitionRef.current?.start();
  });

  const handleStreamError = useEffectEvent(() => {
    onError?.("Microphone access denied");
  });

  // Initialize speech recognition
  useEffect(() => {
    const win = window as WindowWithSpeechRecognition;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      onError?.("Speech recognition is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    recognition.onresult = handleRecognitionResult;
    recognition.onerror = handleRecognitionError;
    recognition.onend = handleRecognitionEnd;
    recognition.onstart = handleRecognitionStart;

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [handleRecognitionResult, handleRecognitionError, handleRecognitionEnd, handleRecognitionStart, onError]);

  // Start listening and get audio stream for visualizer
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(handleStreamReady)
      .catch(handleStreamError);

    return () => {
      audioStream?.getTracks().forEach((track) => track.stop());
      recognitionRef.current?.abort();
    };
  }, [handleStreamReady, handleStreamError, audioStream]);

  const handleCancel = useCallback(() => {
    recognitionRef.current?.abort();
    audioStream?.getTracks().forEach((track) => track.stop());
    onCancel?.();
  }, [audioStream, onCancel]);

  const handleSend = useCallback(() => {
    recognitionRef.current?.stop();
    audioStream?.getTracks().forEach((track) => track.stop());
    if (transcript.trim()) {
      onResult?.(transcript.trim());
    }
  }, [audioStream, onResult, transcript]);

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
      {cancelButton || <DefaultCancelButton onClick={handleCancel} />}

      {/* Center content: visualizer + text */}
      <div style={centerStyle}>
        <AudioVisualizer stream={audioStream} isActive={isListening} />
        <span style={textStyle}>{listeningText}</span>
      </div>

      {/* Send button */}
      {sendButton || (
        <DefaultSendButton onClick={handleSend} disabled={!transcript.trim()} />
      )}
    </div>
  );
});
