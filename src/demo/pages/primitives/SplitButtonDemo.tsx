/**
 * @file SplitButton demo page
 */

import { useState } from "react";
import { DemoContainer, DemoSection } from "../../components";
import { SplitButton } from "../../../components/SplitButton/SplitButton";

export function SplitButtonDemo() {
  const [mode, setMode] = useState<"present" | "preview">("preview");
  const [lastAction, setLastAction] = useState<string>("");

  const presentIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );

  const previewIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9l6 3-6 3V9z" />
    </svg>
  );

  const options = [
    { value: "present" as const, label: "Present", icon: presentIcon, shortcut: "Option+Cmd+Enter" },
    { value: "preview" as const, label: "Preview", icon: previewIcon, shortcut: "Shift+Space" },
  ];

  return (
    <DemoContainer title="SplitButton">
      <DemoSection label="Basic SplitButton">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <SplitButton
            options={options}
            value={mode}
            onChange={setMode}
            onAction={() => setLastAction(`Executed: ${mode}`)}
            aria-label="Presentation mode"
          />
          <span style={{ color: "var(--rei-color-text-muted, #9ca3af)", fontSize: "12px" }}>
            Selected: {mode}
          </span>
        </div>
        {lastAction && (
          <div style={{ marginTop: "8px", color: "var(--rei-color-success, #16a34a)", fontSize: "12px" }}>
            {lastAction}
          </div>
        )}
      </DemoSection>

      <DemoSection label="Sizes">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <SplitButton
            options={options}
            value="preview"
            onChange={() => {}}
            size="sm"
            aria-label="Small"
          />
          <SplitButton
            options={options}
            value="preview"
            onChange={() => {}}
            size="md"
            aria-label="Medium"
          />
          <SplitButton
            options={options}
            value="preview"
            onChange={() => {}}
            size="lg"
            aria-label="Large"
          />
        </div>
      </DemoSection>

      <DemoSection label="Disabled">
        <SplitButton
          options={options}
          value="preview"
          onChange={() => {}}
          disabled
          aria-label="Disabled"
        />
      </DemoSection>
    </DemoContainer>
  );
}
