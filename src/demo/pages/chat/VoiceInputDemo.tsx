/**
 * @file VoiceInput demo page
 */

import { useState, useCallback, useMemo, useInsertionEffect } from "react";
import type { CSSProperties } from "react";
import { VoiceInput } from "../../../chat/VoiceInput/VoiceInput";
import { AudioVisualizer } from "../../../chat/VoiceInput/AudioVisualizer";
import { ChatInput, SendButton } from "../../../chat/ChatInput/ChatInput";
import { IconButton } from "../../../components/IconButton/IconButton";
import {
  SPACE_MD,
  SPACE_LG,
  SIZE_FONT_SM,
  SIZE_FONT_MD,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_SURFACE,
  COLOR_BORDER,
  RADIUS_MD,
  COLOR_SURFACE_RAISED,
  RADIUS_LG,
  SHADOW_SM,
} from "../../../themes/styles";

// Mic icon
const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
  </svg>
);

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  source?: "text" | "voice";
};

// =============================================================================
// View Transition CSS injection
// =============================================================================

const viewTransitionStyleId = "voice-input-view-transition-styles";
let styleRefCount = 0;

function injectViewTransitionStyles(): () => void {
  if (typeof document === "undefined") {
    return () => {};
  }

  styleRefCount++;

  if (!document.getElementById(viewTransitionStyleId)) {
    const style = document.createElement("style");
    style.id = viewTransitionStyleId;
    style.textContent = `
      @keyframes voice-fade-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes voice-fade-out {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.95); }
      }
      ::view-transition-old(chat-voice-input) {
        animation: voice-fade-out 0.2s ease-out forwards;
      }
      ::view-transition-new(chat-voice-input) {
        animation: voice-fade-in 0.2s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
  }

  return () => {
    styleRefCount--;
    if (styleRefCount === 0) {
      const style = document.getElementById(viewTransitionStyleId);
      style?.remove();
    }
  };
}

// =============================================================================
// TransitionSection - Uses View Transition API for smooth switching
// =============================================================================

type TransitionSectionProps = {
  isVoiceMode: boolean;
  textValue: string;
  onTextChange: (value: string) => void;
  onTextSend: (text: string) => void;
  onVoiceResult: (text: string) => void;
  onVoiceCancel: () => void;
  onVoiceError: (err: string) => void;
  onMicClick: () => void;
};

function TransitionSection({
  isVoiceMode,
  textValue,
  onTextChange,
  onTextSend,
  onVoiceResult,
  onVoiceCancel,
  onVoiceError,
  onMicClick,
}: TransitionSectionProps) {
  // Inject view transition styles before DOM mutations
  useInsertionEffect(() => {
    return injectViewTransitionStyles();
  }, []);

  // Style with view-transition-name for the API
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      viewTransitionName: "chat-voice-input",
    }),
    [],
  );

  if (isVoiceMode) {
    return (
      <div style={containerStyle}>
        <VoiceInput
          variant="ghost"
          onResult={onVoiceResult}
          onCancel={onVoiceCancel}
          onError={onVoiceError}
        />
      </div>
    );
  }

  const canSend = textValue.trim().length > 0;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.nativeEvent.isComposing) return;
      if (e.key === "Enter" && !e.shiftKey && canSend) {
        e.preventDefault();
        onTextSend(textValue);
      }
    },
    [canSend, onTextSend, textValue],
  );

  const textareaStyle = useMemo<CSSProperties>(
    () => ({
      width: "100%",
      minHeight: 24,
      maxHeight: 200,
      padding: 0,
      border: "none",
      backgroundColor: "transparent",
      color: COLOR_TEXT,
      fontSize: SIZE_FONT_MD,
      lineHeight: 1.5,
      resize: "none",
      outline: "none",
      overflow: "auto",
      fontFamily: "inherit",
    }),
    [],
  );

  return (
    <div style={containerStyle}>
      <ChatInput.Root variant="ghost">
        <ChatInput.Content>
          <textarea
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            style={textareaStyle}
          />
        </ChatInput.Content>
        <ChatInput.Toolbar>
          <div style={{ flex: 1 }} />
          <IconButton
            icon={<MicIcon />}
            aria-label="Voice input"
            variant="ghost"
            size="sm"
            onClick={onMicClick}
          />
          <SendButton canSend={canSend} isLoading={false} onClick={() => onTextSend(textValue)} />
        </ChatInput.Toolbar>
      </ChatInput.Root>
    </div>
  );
}

export function VoiceInputDemo() {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", content: "Hello! Try clicking the mic button to use voice input." },
  ]);
  const [error, setError] = useState<string | null>(null);

  const handleTextSend = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: text, source: "text" },
    ]);
    setTextValue("");

    // Simulate response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: `You typed: "${text}"` },
      ]);
    }, 500);
  }, []);

  const handleVoiceResult = useCallback((text: string) => {
    setIsVoiceMode(false);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: text, source: "voice" },
    ]);

    // Simulate response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: `You said: "${text}"` },
      ]);
    }, 500);
  }, []);

  // Use View Transition API for smooth mode switching
  const startViewTransition = useCallback((callback: () => void) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition) {
      doc.startViewTransition(callback);
    } else {
      callback();
    }
  }, []);

  const handleVoiceCancel = useCallback(() => {
    startViewTransition(() => setIsVoiceMode(false));
  }, [startViewTransition]);

  const handleVoiceError = useCallback((err: string) => {
    setError(err);
    startViewTransition(() => setIsVoiceMode(false));
  }, [startViewTransition]);

  const handleMicClick = useCallback(() => {
    setError(null);
    startViewTransition(() => setIsVoiceMode(true));
  }, [startViewTransition]);

  return (
    <div style={{ padding: SPACE_LG, maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ marginBottom: SPACE_MD }}>VoiceInput</h2>
      <p style={{ marginBottom: SPACE_LG, color: COLOR_TEXT_MUTED, fontSize: SIZE_FONT_SM }}>
        Voice input with Web Speech API and audio visualizer. Click the mic button to switch
        between text and voice input modes.
      </p>

      {/* Message list */}
      <div
        style={{
          minHeight: 200,
          maxHeight: 300,
          overflowY: "auto",
          marginBottom: SPACE_MD,
          padding: SPACE_MD,
          backgroundColor: COLOR_SURFACE,
          border: `1px solid ${COLOR_BORDER}`,
          borderRadius: RADIUS_MD,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: SPACE_MD,
              padding: SPACE_MD,
              backgroundColor: msg.role === "user" ? "rgba(59, 130, 246, 0.1)" : "transparent",
              borderRadius: RADIUS_MD,
            }}
          >
            <div
              style={{
                fontSize: SIZE_FONT_SM,
                fontWeight: 600,
                marginBottom: 4,
                color: msg.role === "user" ? "#3b82f6" : COLOR_TEXT_MUTED,
              }}
            >
              {msg.role === "user" ? `You ${msg.source === "voice" ? "🎤" : ""}` : "Assistant"}
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
          </div>
        ))}
      </div>

      {/* Error display */}
      {error && (
        <div
          style={{
            marginBottom: SPACE_MD,
            padding: SPACE_MD,
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderRadius: RADIUS_MD,
            color: "#ef4444",
            fontSize: SIZE_FONT_SM,
          }}
        >
          Error: {error}
        </div>
      )}

      {/* Seamless transition between ChatInput and VoiceInput */}
      <h3 style={{ marginBottom: SPACE_MD }}>Seamless Transition (click mic)</h3>
      <TransitionSection
        isVoiceMode={isVoiceMode}
        textValue={textValue}
        onTextChange={setTextValue}
        onTextSend={handleTextSend}
        onVoiceResult={handleVoiceResult}
        onVoiceCancel={handleVoiceCancel}
        onVoiceError={handleVoiceError}
        onMicClick={handleMicClick}
      />

      {/* Mock AudioVisualizer Preview */}
      <h3 style={{ marginTop: SPACE_LG, marginBottom: SPACE_MD }}>
        AudioVisualizer (Mock Mode - No Mic Required)
      </h3>
      <MockVisualizerDemo />

      {/* Lazy-loaded VoiceInput demos */}
      <h3 style={{ marginTop: SPACE_LG, marginBottom: SPACE_MD }}>
        Standalone VoiceInput (Click to Activate)
      </h3>
      <LazyVoiceInputDemo variant="ghost" />

      <h3 style={{ marginTop: SPACE_LG, marginBottom: SPACE_MD }}>
        variant="default" (Click to Activate)
      </h3>
      <LazyVoiceInputDemo variant="default" listeningText="Listening..." />
    </div>
  );
}

// =============================================================================
// Mock Visualizer Demo
// =============================================================================

function MockVisualizerDemo() {
  const [isActive, setIsActive] = useState(false);

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      gap: SPACE_MD,
      padding: SPACE_MD,
      backgroundColor: COLOR_SURFACE_RAISED,
      borderRadius: RADIUS_LG,
      boxShadow: SHADOW_SM,
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
    <div style={containerStyle}>
      <button
        type="button"
        onClick={() => setIsActive(!isActive)}
        style={{
          padding: `${SPACE_MD} ${SPACE_LG}`,
          borderRadius: RADIUS_MD,
          border: `1px solid ${COLOR_BORDER}`,
          backgroundColor: isActive ? COLOR_SURFACE : COLOR_SURFACE_RAISED,
          cursor: "pointer",
        }}
      >
        {isActive ? "Stop" : "Start"} Mock
      </button>
      <AudioVisualizer
        isActive={isActive}
        mockMode
        barCount={5}
        barWidth={4}
        barGap={3}
        maxHeight={28}
        minHeight={6}
      />
      <span style={textStyle}>{isActive ? "Playing mock audio..." : "Click Start to preview"}</span>
    </div>
  );
}

// =============================================================================
// Lazy VoiceInput Demo (Click to Activate)
// =============================================================================

type LazyVoiceInputDemoProps = {
  variant?: "default" | "ghost";
  listeningText?: string;
};

function LazyVoiceInputDemo({ variant = "ghost", listeningText }: LazyVoiceInputDemoProps) {
  const [isActive, setIsActive] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleResult = useCallback((text: string) => {
    console.log("Result:", text);
    setLastResult(text);
    setIsActive(false);
  }, []);

  const handleCancel = useCallback(() => {
    console.log("Cancelled");
    setIsActive(false);
  }, []);

  const handleError = useCallback((err: string) => {
    console.log("Error:", err);
    setIsActive(false);
  }, []);

  const placeholderStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      gap: SPACE_MD,
      padding: SPACE_MD,
      backgroundColor: COLOR_SURFACE_RAISED,
      borderRadius: RADIUS_LG,
      boxShadow: SHADOW_SM,
    }),
    [],
  );

  if (!isActive) {
    return (
      <div style={placeholderStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE_MD }}>
          <button
            type="button"
            onClick={() => setIsActive(true)}
            style={{
              padding: `${SPACE_MD} ${SPACE_LG}`,
              borderRadius: RADIUS_MD,
              border: `1px solid ${COLOR_BORDER}`,
              backgroundColor: COLOR_SURFACE_RAISED,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: SPACE_MD,
            }}
          >
            <MicIcon />
            Start Voice Input
          </button>
          {lastResult && (
            <span style={{ color: COLOR_TEXT_MUTED, fontSize: SIZE_FONT_SM }}>
              Last result: "{lastResult}"
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <VoiceInput
      variant={variant}
      listeningText={listeningText}
      onResult={handleResult}
      onCancel={handleCancel}
      onError={handleError}
    />
  );
}
