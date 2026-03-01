/**
 * @file ChatInput demo page
 */

import { useState, useCallback, useMemo, useInsertionEffect } from "react";
import type { CSSProperties } from "react";
import { ChatInput } from "../../../chat/ChatInput/ChatInput";
import { VoiceInput } from "../../../chat/VoiceInput/VoiceInput";
import { IconButton } from "../../../components/IconButton/IconButton";
import { Select, type SelectOption } from "../../../components/Select/Select";
import {
  COLOR_SURFACE,
  COLOR_BORDER,
  RADIUS_MD,
  SPACE_MD,
  SPACE_LG,
  SIZE_FONT_SM,
  COLOR_TEXT_MUTED,
} from "../../../themes/styles";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

// Icons
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M5 19l.5 1.5L7 21l-1.5.5L5 23l-.5-1.5L3 21l1.5-.5L5 19z" />
    <path d="M19 12l.5 1.5L21 14l-1.5.5L19 16l-.5-1.5L17 14l1.5-.5L19 12z" />
  </svg>
);

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
  </svg>
);

const RecordIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  </svg>
);

// Model icons for the selector
const ThinkingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const FastIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const CodeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
  </svg>
);

/**
 * Model option preview component.
 */
function ModelOptionPreview({ icon, name }: { icon: React.ReactNode; name: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ display: "flex", alignItems: "center", color: "#666" }}>{icon}</span>
      <span>{name}</span>
    </div>
  );
}

// Model options for the Select
type ModelId = "5.2-thinking" | "5.2-fast" | "4.0-code" | "4.0-standard";

const modelOptions: SelectOption<ModelId>[] = [
  {
    value: "5.2-thinking",
    label: "5.2 Thinking",
    preview: <ModelOptionPreview icon={<ThinkingIcon />} name="5.2 Thinking" />,
  },
  {
    value: "5.2-fast",
    label: "5.2 Fast",
    preview: <ModelOptionPreview icon={<FastIcon />} name="5.2 Fast" />,
  },
  {
    value: "4.0-code",
    label: "4.0 Code",
    preview: <ModelOptionPreview icon={<CodeIcon />} name="4.0 Code" />,
  },
  {
    value: "4.0-standard",
    label: "4.0 Standard",
    preview: <ModelOptionPreview icon={<SparklesIcon />} name="4.0 Standard" />,
  },
];

// =============================================================================
// View Transition CSS injection with reference counting
// =============================================================================

const viewTransitionStyleId = "chat-input-view-transition-styles";
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
      @keyframes chat-input-fade-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes chat-input-fade-out {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.95); }
      }
      ::view-transition-old(chat-input-container) {
        animation: chat-input-fade-out 0.2s ease-out forwards;
      }
      ::view-transition-new(chat-input-container) {
        animation: chat-input-fade-in 0.2s ease-out forwards;
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
// VoiceTransitionDemo - Uses View Transition API for smooth switching
// =============================================================================

type VoiceTransitionDemoProps = {
  isVoiceMode: boolean;
  value: string;
  model: ModelId;
  isLoading: boolean;
  onValueChange: (value: string) => void;
  onModelChange: (model: ModelId) => void;
  onSend: (text: string) => void;
  onVoiceResult: (text: string) => void;
  onVoiceCancel: () => void;
  onMicClick: () => void;
};

function VoiceTransitionDemo({
  isVoiceMode,
  value,
  model,
  isLoading,
  onValueChange,
  onModelChange,
  onSend,
  onVoiceResult,
  onVoiceCancel,
  onMicClick,
}: VoiceTransitionDemoProps) {
  // Inject view transition styles before DOM mutations
  useInsertionEffect(() => {
    return injectViewTransitionStyles();
  }, []);

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      position: "relative",
      viewTransitionName: "chat-input-container",
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
        />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <ChatInput
        value={value}
        onChange={onValueChange}
        onSend={onSend}
        isLoading={isLoading}
        placeholder="Ask anything"
        variant="ghost"
        toolbar={
          <>
            <IconButton icon={<PlusIcon />} aria-label="Add attachment" variant="ghost" size="sm" />
            <IconButton icon={<GlobeIcon />} aria-label="Web search" variant="ghost" size="sm" />
            <IconButton icon={<ImageIcon />} aria-label="Add image" variant="ghost" size="sm" />
            <IconButton icon={<SparklesIcon />} aria-label="AI features" variant="ghost" size="sm" />
            <Select<ModelId>
              value={model}
              options={modelOptions}
              onChange={onModelChange}
              variant="ghost"
              size="sm"
              aria-label="Select AI model"
            />
            <div style={{ flex: 1 }} />
            <IconButton icon={<RecordIcon />} aria-label="Record" variant="ghost" size="sm" />
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

export function ChatInputDemo() {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<ModelId>("5.2-thinking");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", content: "Hello! How can I help you today?" },
  ]);

  const handleSend = useCallback((text: string) => {
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setValue("");
    setIsLoading(true);

    // Simulate API response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: `[${model}] You said: "${text}"`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  }, [model]);

  // Use View Transition API for smooth mode switching
  const startViewTransition = useCallback((callback: () => void) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition) {
      doc.startViewTransition(callback);
    } else {
      callback();
    }
  }, []);

  const handleVoiceResult = useCallback((text: string) => {
    startViewTransition(() => setIsVoiceMode(false));
    handleSend(text);
  }, [handleSend, startViewTransition]);

  const handleVoiceCancel = useCallback(() => {
    startViewTransition(() => setIsVoiceMode(false));
  }, [startViewTransition]);

  const handleMicClick = useCallback(() => {
    startViewTransition(() => setIsVoiceMode(true));
  }, [startViewTransition]);

  return (
    <div style={{ padding: SPACE_LG, maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ marginBottom: SPACE_MD }}>ChatInput</h2>
      <p style={{ marginBottom: SPACE_LG, color: COLOR_TEXT_MUTED, fontSize: SIZE_FONT_SM }}>
        Chat input with flexible toolbar. Use `toolbar` prop to render any content.
        Use IconButton variant="ghost" and Select variant="ghost" for borderless controls.
      </p>

      {/* Message list */}
      <div
        style={{
          minHeight: 300,
          maxHeight: 400,
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
              {msg.role === "user" ? "You" : "Assistant"}
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div style={{ color: COLOR_TEXT_MUTED, fontSize: SIZE_FONT_SM }}>
            Assistant is thinking...
          </div>
        )}
      </div>

      {/* Voice Input Transition Demo */}
      <h3 style={{ marginBottom: SPACE_MD }}>Voice Input (click mic to switch)</h3>
      <VoiceTransitionDemo
        isVoiceMode={isVoiceMode}
        value={value}
        model={model}
        isLoading={isLoading}
        onValueChange={setValue}
        onModelChange={setModel}
        onSend={handleSend}
        onVoiceResult={handleVoiceResult}
        onVoiceCancel={handleVoiceCancel}
        onMicClick={handleMicClick}
      />

      {/* Static example: ghost variant with flexible toolbar */}
      <h3 style={{ marginTop: SPACE_LG, marginBottom: SPACE_MD }}>variant="ghost" + Select variant="ghost"</h3>
      <ChatInput
        value=""
        onChange={() => {}}
        placeholder="Static example..."
        variant="ghost"
        toolbar={
          <>
            <IconButton icon={<PlusIcon />} aria-label="Add attachment" variant="ghost" size="sm" />
            <IconButton icon={<GlobeIcon />} aria-label="Web search" variant="ghost" size="sm" />
            <IconButton icon={<ImageIcon />} aria-label="Add image" variant="ghost" size="sm" />
            <IconButton icon={<SparklesIcon />} aria-label="AI features" variant="ghost" size="sm" />
            <Select<ModelId>
              value={model}
              options={modelOptions}
              onChange={setModel}
              variant="ghost"
              size="sm"
              aria-label="Select AI model"
            />
            <div style={{ flex: 1 }} />
            <IconButton icon={<RecordIcon />} aria-label="Record" variant="ghost" size="sm" />
            <IconButton icon={<MicIcon />} aria-label="Voice input" variant="ghost" size="sm" />
          </>
        }
      />

      {/* Default variant with default Select */}
      <h3 style={{ marginTop: SPACE_LG, marginBottom: SPACE_MD }}>variant="default" + Select default</h3>
      <ChatInput
        value=""
        onChange={() => {}}
        placeholder="Default variant with bordered select..."
        variant="default"
        toolbar={
          <>
            <IconButton icon={<PlusIcon />} aria-label="Add" variant="ghost" size="sm" />
            <Select<ModelId>
              value={model}
              options={modelOptions}
              onChange={setModel}
              size="sm"
              aria-label="Select model"
            />
            <div style={{ flex: 1 }} />
          </>
        }
      />

      {/* Minimal - no toolbar */}
      <h3 style={{ marginTop: SPACE_LG, marginBottom: SPACE_MD }}>Minimal (no toolbar)</h3>
      <ChatInput
        value=""
        onChange={() => {}}
        placeholder="Simple input, just send button..."
        variant="ghost"
      />

      {/* Custom layout - anything goes */}
      <h3 style={{ marginTop: SPACE_LG, marginBottom: SPACE_MD }}>Custom toolbar layout</h3>
      <ChatInput
        value=""
        onChange={() => {}}
        placeholder="Toolbar is fully flexible..."
        variant="ghost"
        toolbar={
          <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
            <span style={{ fontSize: 12, color: "#888" }}>Custom:</span>
            <input
              type="range"
              min={0}
              max={100}
              defaultValue={50}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 12, color: "#888" }}>50%</span>
          </div>
        }
        hideSendButton
      />
    </div>
  );
}
