/**
 * @file ChatInput mount page for E2E tests
 */

import { useState, useCallback, useMemo } from "react";
import { ChatInput } from "../../../../src/chat/ChatInput/ChatInput";
import { IconButton } from "../../../../src/components/IconButton/IconButton";
import { Select, type SelectOption } from "../../../../src/components/Select/Select";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

// Simple icons for testing
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

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
  </svg>
);

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

// Model option preview
function ModelPreview({ icon, name }: { icon: React.ReactNode; name: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ display: "flex", alignItems: "center", color: "#666" }}>{icon}</span>
      <span>{name}</span>
    </div>
  );
}

// Model options
type ModelId = "5.2-thinking" | "5.2-fast";

const modelOptions: SelectOption<ModelId>[] = [
  {
    value: "5.2-thinking",
    label: "5.2 Thinking",
    preview: <ModelPreview icon={<ThinkingIcon />} name="5.2 Thinking" />,
  },
  {
    value: "5.2-fast",
    label: "5.2 Fast",
    preview: <ModelPreview icon={<FastIcon />} name="5.2 Fast" />,
  },
];

/**
 * ChatInput mount page for E2E testing.
 */
export default function ChatInputMount() {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<ModelId>("5.2-thinking");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", content: "Hello! How can I help you?" },
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
        content: `You said: "${text}"`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 500);
  }, []);

  const modelSelector = useMemo(
    () => (
      <Select<ModelId>
        value={model}
        options={modelOptions}
        onChange={setModel}
        variant="ghost"
        size="sm"
        aria-label="Select model"
      />
    ),
    [model],
  );

  return (
    <div className="chat-mount">
      <h1>ChatInput E2E</h1>

      <div className="chat-section">
        <h2>Interactive Chat (variant="cta")</h2>

        {/* Message list */}
        <div className="message-list" data-testid="message-list">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.role}`}
              data-testid={`message-${msg.role}`}
            >
              <div className="message-role">
                {msg.role === "user" ? "You" : "Assistant"}
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="loading-indicator" data-testid="loading-indicator">
              Assistant is typing...
            </div>
          )}
        </div>

        {/* Chat input with flexible toolbar */}
        <ChatInput
          value={value}
          onChange={setValue}
          onSend={handleSend}
          isLoading={isLoading}
          placeholder="Ask anything"
          variant="ghost"
          aria-label="Chat message input"
          toolbar={
            <>
              <span data-testid="action-add">
                <IconButton
                  icon={<PlusIcon />}
                  aria-label="Add attachment"
                  variant="ghost"
                  size="sm"
                />
              </span>
              <span data-testid="action-web">
                <IconButton
                  icon={<GlobeIcon />}
                  aria-label="Web search"
                  variant="ghost"
                  size="sm"
                />
              </span>
              <span data-testid="action-image">
                <IconButton
                  icon={<ImageIcon />}
                  aria-label="Add image"
                  variant="ghost"
                  size="sm"
                />
              </span>
              {modelSelector}
              <div style={{ flex: 1 }} />
              <span data-testid="action-mic">
                <IconButton
                  icon={<MicIcon />}
                  aria-label="Voice input"
                  variant="ghost"
                  size="sm"
                />
              </span>
            </>
          }
        />
      </div>

      {/* State display for testing */}
      <div style={{ marginTop: 16, fontSize: 12, color: "#666" }}>
        <p data-testid="input-value">Input value: "{value}"</p>
        <p data-testid="message-count">Messages: {messages.length}</p>
        <p data-testid="loading-state">Loading: {isLoading ? "true" : "false"}</p>
        <p data-testid="selected-model">Model: {model}</p>
      </div>
    </div>
  );
}
