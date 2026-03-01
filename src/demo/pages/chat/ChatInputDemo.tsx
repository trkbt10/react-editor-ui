/**
 * @file ChatInput demo page
 */

import { useState, useCallback, useMemo, useRef } from "react";
import type { CSSProperties, DragEvent, ChangeEvent } from "react";
import { ChatInput, SendButton } from "../../../chat/ChatInput/ChatInput";
import { ContextBadge } from "../../../chat/ChatInput/ContextBadge";
import { FilePreview } from "../../../chat/ChatInput/FilePreview";
import { IconButton } from "../../../components/IconButton/IconButton";
import { Select, type SelectOption } from "../../../components/Select/Select";
import {
  COLOR_SURFACE,
  COLOR_BORDER,
  COLOR_PRIMARY,
  COLOR_TEXT,
  RADIUS_MD,
  RADIUS_LG,
  SPACE_MD,
  SPACE_LG,
  SIZE_FONT_SM,
  SIZE_FONT_MD,
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

const TerminalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 8l4 4-4 4" />
    <path d="M13 16h4" />
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
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

function ModelOptionPreview({ icon, name }: { icon: React.ReactNode; name: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ display: "flex", alignItems: "center", color: "#666" }}>{icon}</span>
      <span>{name}</span>
    </div>
  );
}

type ModelId = "5.2-thinking" | "5.2-fast" | "4.0-code" | "4.0-standard";

const modelOptions: SelectOption<ModelId>[] = [
  { value: "5.2-thinking", label: "5.2 Thinking", preview: <ModelOptionPreview icon={<ThinkingIcon />} name="5.2 Thinking" /> },
  { value: "5.2-fast", label: "5.2 Fast", preview: <ModelOptionPreview icon={<FastIcon />} name="5.2 Fast" /> },
  { value: "4.0-code", label: "4.0 Code", preview: <ModelOptionPreview icon={<CodeIcon />} name="4.0 Code" /> },
  { value: "4.0-standard", label: "4.0 Standard", preview: <ModelOptionPreview icon={<SparklesIcon />} name="4.0 Standard" /> },
];

// =============================================================================
// Shared textarea style
// =============================================================================

const textareaStyle: CSSProperties = {
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
};

// =============================================================================
// Main Demo
// =============================================================================

type ContextItem = {
  id: string;
  icon: React.ReactNode;
  label: string;
  type: string;
};

export function ChatInputDemo() {
  const [model, setModel] = useState<ModelId>("5.2-thinking");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", content: "Hello! How can I help you today?" },
  ]);

  return (
    <div style={{ padding: SPACE_LG, maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ marginBottom: SPACE_MD }}>ChatInput (Compound Components)</h2>
      <p style={{ marginBottom: SPACE_LG, color: COLOR_TEXT_MUTED, fontSize: SIZE_FONT_SM }}>
        Composable chat input built with ChatInput.Root, .Badges, .Content, .Overlay, .Toolbar.
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
            <div style={{ fontSize: SIZE_FONT_SM, fontWeight: 600, marginBottom: 4, color: msg.role === "user" ? "#3b82f6" : COLOR_TEXT_MUTED }}>
              {msg.role === "user" ? "You" : "Assistant"}
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
          </div>
        ))}
      </div>

      {/* Basic Example */}
      <h3 style={{ marginBottom: SPACE_MD }}>Basic</h3>
      <BasicDemo model={model} setModel={setModel} setMessages={setMessages} />

      {/* With Context Badges */}
      <h3 style={{ marginTop: SPACE_LG, marginBottom: SPACE_MD }}>With Context Badges</h3>
      <BadgesDemo />

      {/* DnD + FilePreview */}
      <h3 style={{ marginTop: SPACE_LG, marginBottom: SPACE_MD }}>DnD + FilePreview</h3>
      <DnDDemo />

      {/* Minimal */}
      <h3 style={{ marginTop: SPACE_LG, marginBottom: SPACE_MD }}>Minimal</h3>
      <MinimalDemo />
    </div>
  );
}

// =============================================================================
// Basic Demo
// =============================================================================

function BasicDemo({
  model,
  setModel,
  setMessages,
}: {
  model: ModelId;
  setModel: (m: ModelId) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}) {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSend = value.trim().length > 0 && !isLoading;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", content: value }]);
    setValue("");
    setIsLoading(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", content: `[${model}] Echo: "${value}"` }]);
      setIsLoading(false);
    }, 1000);
  }, [canSend, value, model, setMessages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.nativeEvent.isComposing) return;
      if (e.key === "Enter" && !e.shiftKey && canSend) {
        e.preventDefault();
        handleSend();
      }
    },
    [canSend, handleSend],
  );

  return (
    <ChatInput.Root variant="ghost">
      <ChatInput.Content>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          style={textareaStyle}
        />
      </ChatInput.Content>
      <ChatInput.Toolbar>
        <IconButton icon={<PlusIcon />} aria-label="Add" variant="ghost" size="md" />
        <IconButton icon={<GlobeIcon />} aria-label="Search" variant="ghost" size="md" />
        <IconButton icon={<ImageIcon />} aria-label="Image" variant="ghost" size="md" />
        <Select<ModelId> value={model} options={modelOptions} onChange={setModel} variant="ghost" size="sm" />
        <div style={{ flex: 1 }} />
        <IconButton icon={<MicIcon />} aria-label="Voice" variant="ghost" size="md" />
        <SendButton canSend={canSend} isLoading={isLoading} onClick={handleSend} />
      </ChatInput.Toolbar>
    </ChatInput.Root>
  );
}

// =============================================================================
// Badges Demo
// =============================================================================

function BadgesDemo() {
  const [value, setValue] = useState("");
  const [contexts, setContexts] = useState<ContextItem[]>([
    { id: "1", icon: <TerminalIcon />, label: "Work with iTerm2", type: "Tab" },
    { id: "2", icon: <FileIcon />, label: "ChatInput.tsx", type: "File" },
  ]);

  const handleRemove = useCallback((id: string) => {
    setContexts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const canSend = value.trim().length > 0;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    console.log("Send:", value, contexts);
    setValue("");
  }, [canSend, value, contexts]);

  return (
    <ChatInput.Root variant="ghost">
      {contexts.length > 0 && (
        <ChatInput.Badges>
          {contexts.map((ctx) => (
            <ContextBadge
              key={ctx.id}
              icon={ctx.icon}
              label={ctx.label}
              type={ctx.type}
              onRemove={() => handleRemove(ctx.id)}
            />
          ))}
        </ChatInput.Badges>
      )}
      <ChatInput.Content>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter" && !e.shiftKey && canSend) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask anything..."
          style={textareaStyle}
        />
      </ChatInput.Content>
      <ChatInput.Toolbar>
        <IconButton icon={<PlusIcon />} aria-label="Add context" variant="ghost" size="md" />
        <div style={{ flex: 1 }} />
        <SendButton canSend={canSend} isLoading={false} onClick={handleSend} />
      </ChatInput.Toolbar>
    </ChatInput.Root>
  );
}

// =============================================================================
// DnD Demo
// =============================================================================

function DnDDemo() {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
      e.target.value = ""; // Reset to allow selecting the same file again
    }
  }, []);

  const canSend = value.trim().length > 0 || files.length > 0;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    console.log("Send:", { value, files });
    setValue("");
    setFiles([]);
  }, [canSend, value, files]);

  const dropOverlayStyle = useMemo<CSSProperties>(
    () => ({
      backgroundColor: `${COLOR_PRIMARY}15`,
      border: `2px dashed ${COLOR_PRIMARY}`,
      borderRadius: RADIUS_LG,
      color: COLOR_PRIMARY,
      fontSize: SIZE_FONT_SM,
      fontWeight: 500,
    }),
    [],
  );

  return (
    <ChatInput.Root
      variant="ghost"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {files.length > 0 && (
        <ChatInput.Badges>
          {files.map((file, index) => (
            <FilePreview
              key={`${file.name}-${index}`}
              file={file}
              onRemove={() => handleRemoveFile(index)}
            />
          ))}
        </ChatInput.Badges>
      )}
      <ChatInput.Content>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter" && !e.shiftKey && canSend) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Drop files or type a message..."
          style={textareaStyle}
        />
      </ChatInput.Content>
      <ChatInput.Overlay visible={isDragging}>
        <div style={dropOverlayStyle}>Drop files here</div>
      </ChatInput.Overlay>
      <ChatInput.Toolbar>
        <IconButton icon={<PlusIcon />} aria-label="Add file" variant="ghost" size="md" onClick={handleAddFileClick} />
        <div style={{ flex: 1 }} />
        <SendButton canSend={canSend} isLoading={false} onClick={handleSend} />
      </ChatInput.Toolbar>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />
    </ChatInput.Root>
  );
}

// =============================================================================
// Minimal Demo
// =============================================================================

function MinimalDemo() {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0;

  return (
    <ChatInput.Root variant="default">
      <ChatInput.Content>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type here..."
          style={textareaStyle}
        />
      </ChatInput.Content>
      <ChatInput.Toolbar>
        <div style={{ flex: 1 }} />
        <SendButton canSend={canSend} isLoading={false} onClick={() => setValue("")} />
      </ChatInput.Toolbar>
    </ChatInput.Root>
  );
}
