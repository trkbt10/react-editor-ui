/**
 * @file VoiceInput demo page
 */

import { useState, useCallback, useMemo, useInsertionEffect } from "react";
import type { CSSProperties } from "react";
import { VoiceInput } from "../../../chat/VoiceInput/VoiceInput";
import { ChatInput } from "../../../chat/ChatInput/ChatInput";
import { IconButton } from "../../../components/IconButton/IconButton";
import {
  SPACE_MD,
  SPACE_LG,
  SIZE_FONT_SM,
  COLOR_TEXT_MUTED,
  COLOR_SURFACE,
  COLOR_BORDER,
  RADIUS_MD,
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

  return (
    <div style={containerStyle}>
      <ChatInput
        value={textValue}
        onChange={onTextChange}
        onSend={onTextSend}
        placeholder="Type a message..."
        variant="ghost"
        toolbar={
          <>
            <div style={{ flex: 1 }} />
            <IconButton
              icon={<MicIcon />}
              aria-label="Voice input"
              variant="ghost"
              size="sm"
              onClick={onMicClick}
            />
          </>
        }
      />
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

      {/* Standalone VoiceInput */}
      <h3 style={{ marginTop: SPACE_LG, marginBottom: SPACE_MD }}>Standalone VoiceInput</h3>
      <VoiceInput
        variant="ghost"
        onResult={(text) => console.log("Result:", text)}
        onCancel={() => console.log("Cancelled")}
        onError={(err) => console.log("Error:", err)}
      />

      {/* Default variant */}
      <h3 style={{ marginTop: SPACE_LG, marginBottom: SPACE_MD }}>variant="default"</h3>
      <VoiceInput
        variant="default"
        listeningText="Listening..."
        onResult={(text) => console.log("Result:", text)}
        onCancel={() => console.log("Cancelled")}
      />
    </div>
  );
}
