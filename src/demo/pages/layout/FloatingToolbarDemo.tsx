/**
 * @file FloatingToolbar demo page
 */

import { useState, useCallback, useRef } from "react";
import { DemoContainer, DemoSection } from "../../components";
import { DemoStateDisplay } from "../../components/display/DemoStateDisplay";
import { FloatingToolbar } from "../../../components/FloatingToolbar/FloatingToolbar";
import type { FloatingToolbarAnchor, FloatingToolbarOperation } from "../../../components/FloatingToolbar/FloatingToolbar";
import { LuBold, LuItalic, LuUnderline, LuStrikethrough, LuLink, LuCode, LuHighlighter } from "react-icons/lu";

// =============================================================================
// Demo Icons
// =============================================================================

const BoldIcon = () => <LuBold size={14} />;
const ItalicIcon = () => <LuItalic size={14} />;
const UnderlineIcon = () => <LuUnderline size={14} />;
const StrikethroughIcon = () => <LuStrikethrough size={14} />;
const LinkIcon = () => <LuLink size={14} />;
const CodeIcon = () => <LuCode size={14} />;
const HighlightIcon = () => <LuHighlighter size={14} />;

// =============================================================================
// Styles
// =============================================================================

const surfaceStyle = {
  backgroundColor: "var(--rei-color-surface, #1e1f24)",
  borderRadius: 4,
  position: "relative" as const,
};

const selectionStyle = {
  display: "inline-block",
  padding: "4px 8px",
  backgroundColor: "var(--rei-color-accent-bg)",
  borderRadius: 4,
  fontSize: 14,
  userSelect: "none" as const,
};

// =============================================================================
// Demo Component
// =============================================================================

export function FloatingToolbarDemo() {
  const [lastOperation, setLastOperation] = useState<string | null>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set(["bold"]));
  const [showToolbar, setShowToolbar] = useState(true);
  const [placement, setPlacement] = useState<"top" | "bottom">("top");
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleOperationSelect = useCallback((id: string) => {
    setLastOperation(id);
    setActiveFormats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const getAnchor = useCallback((): FloatingToolbarAnchor => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }
    return { x: 200, y: 100, width: 300, height: 24 };
  }, []);

  const basicOperations: FloatingToolbarOperation[] = [
    { id: "bold", label: "Bold", icon: <BoldIcon />, shortcut: "⌘B", active: activeFormats.has("bold") },
    { id: "italic", label: "Italic", icon: <ItalicIcon />, shortcut: "⌘I", active: activeFormats.has("italic") },
    { id: "underline", label: "Underline", icon: <UnderlineIcon />, shortcut: "⌘U", active: activeFormats.has("underline") },
    { id: "strikethrough", label: "Strikethrough", icon: <StrikethroughIcon />, active: activeFormats.has("strikethrough") },
  ];

  const extendedOperations: FloatingToolbarOperation[] = [
    { id: "bold", label: "Bold", icon: <BoldIcon />, shortcut: "⌘B", active: activeFormats.has("bold") },
    { id: "italic", label: "Italic", icon: <ItalicIcon />, shortcut: "⌘I", active: activeFormats.has("italic") },
    { id: "underline", label: "Underline", icon: <UnderlineIcon />, shortcut: "⌘U", active: activeFormats.has("underline") },
    { id: "code", label: "Code", icon: <CodeIcon />, active: activeFormats.has("code") },
    { id: "link", label: "Add Link", icon: <LinkIcon />, shortcut: "⌘K" },
    { id: "highlight", label: "Highlight", icon: <HighlightIcon />, disabled: true },
  ];

  return (
    <DemoContainer title="FloatingToolbar">
      <DemoSection label="Interactive Demo">
        <div style={{ ...surfaceStyle, height: 200 }}>
          <div style={{ padding: 16 }}>
            <p style={{ fontSize: 13, color: "var(--rei-color-text-secondary)", marginBottom: 12 }}>
              Click the operations in the toolbar to toggle formatting. The toolbar appears above the simulated selection.
            </p>
            <div ref={anchorRef} style={selectionStyle}>
              Selected text content
            </div>
          </div>
          {showToolbar && (
            <FloatingToolbar
              anchor={getAnchor()}
              operations={extendedOperations}
              onOperationSelect={handleOperationSelect}
              placement={placement}
            />
          )}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={showToolbar}
              onChange={(e) => setShowToolbar(e.target.checked)}
            />
            Show toolbar
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            Placement:
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value as "top" | "bottom")}
              style={{ fontSize: 13 }}
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </label>
        </div>
        <DemoStateDisplay
          value={{
            lastOperation,
            activeFormats: Array.from(activeFormats),
            placement,
          }}
        />
      </DemoSection>

      <DemoSection label="Basic Text Formatting">
        <div style={{ ...surfaceStyle, height: 120 }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              ...selectionStyle,
            }}
          >
            Selected text
          </div>
          <FloatingToolbar
            anchor={{ x: 150, y: 60, width: 100, height: 20 }}
            operations={basicOperations}
            onOperationSelect={handleOperationSelect}
          />
        </div>
      </DemoSection>

      <DemoSection label="With Disabled Operations">
        <div style={{ ...surfaceStyle, height: 120 }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              ...selectionStyle,
            }}
          >
            Read-only content
          </div>
          <FloatingToolbar
            anchor={{ x: 150, y: 60, width: 120, height: 20 }}
            operations={[
              { id: "bold", label: "Bold", icon: <BoldIcon />, disabled: true },
              { id: "italic", label: "Italic", icon: <ItalicIcon />, disabled: true },
              { id: "link", label: "Add Link", icon: <LinkIcon /> },
            ]}
            onOperationSelect={handleOperationSelect}
          />
        </div>
      </DemoSection>

      <DemoSection label="Bottom Placement">
        <div style={{ ...surfaceStyle, height: 120 }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 24,
              transform: "translateX(-50%)",
              ...selectionStyle,
            }}
          >
            Selection near top
          </div>
          <FloatingToolbar
            anchor={{ x: 150, y: 24, width: 130, height: 20 }}
            operations={basicOperations}
            onOperationSelect={handleOperationSelect}
            placement="bottom"
          />
        </div>
      </DemoSection>
    </DemoContainer>
  );
}
