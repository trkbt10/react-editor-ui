/**
 * @file SelectionToolbar demo page
 */

import { useState, useCallback, useRef, useMemo } from "react";
import { DemoContainer, DemoSection } from "../../components";
import { DemoStateDisplay } from "../../components/display/DemoStateDisplay";
import { SelectionToolbar } from "../../../components/SelectionToolbar/SelectionToolbar";
import type { SelectionToolbarAnchor, SelectionToolbarOperation } from "../../../components/SelectionToolbar/SelectionToolbar";
import { LuBold, LuItalic, LuUnderline, LuStrikethrough, LuLink, LuCode, LuHighlighter } from "react-icons/lu";

// =============================================================================
// Demo Icons - memoized as constants to prevent re-renders
// =============================================================================

const boldIcon = <LuBold size={14} />;
const italicIcon = <LuItalic size={14} />;
const underlineIcon = <LuUnderline size={14} />;
const strikethroughIcon = <LuStrikethrough size={14} />;
const linkIcon = <LuLink size={14} />;
const codeIcon = <LuCode size={14} />;
const highlightIcon = <LuHighlighter size={14} />;

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
  backgroundColor: "var(--rei-color-selected)",
  borderRadius: 4,
  fontSize: 14,
  userSelect: "none" as const,
};

// =============================================================================
// Demo Component
// =============================================================================

export function SelectionToolbarDemo() {
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

  const getAnchor = useCallback((): SelectionToolbarAnchor => {
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

  const basicOperations = useMemo<SelectionToolbarOperation[]>(
    () => [
      { id: "bold", label: "Bold", icon: boldIcon, shortcut: "⌘B", active: activeFormats.has("bold") },
      { id: "italic", label: "Italic", icon: italicIcon, shortcut: "⌘I", active: activeFormats.has("italic") },
      { id: "underline", label: "Underline", icon: underlineIcon, shortcut: "⌘U", active: activeFormats.has("underline") },
      { id: "strikethrough", label: "Strikethrough", icon: strikethroughIcon, active: activeFormats.has("strikethrough") },
    ],
    [activeFormats],
  );

  const extendedOperations = useMemo<SelectionToolbarOperation[]>(
    () => [
      { id: "bold", label: "Bold", icon: boldIcon, shortcut: "⌘B", active: activeFormats.has("bold") },
      { id: "italic", label: "Italic", icon: italicIcon, shortcut: "⌘I", active: activeFormats.has("italic") },
      { id: "underline", label: "Underline", icon: underlineIcon, shortcut: "⌘U", active: activeFormats.has("underline") },
      { id: "code", label: "Code", icon: codeIcon, active: activeFormats.has("code") },
      { id: "link", label: "Add Link", icon: linkIcon, shortcut: "⌘K" },
      { id: "highlight", label: "Highlight", icon: highlightIcon, disabled: true },
    ],
    [activeFormats],
  );

  return (
    <DemoContainer title="SelectionToolbar">
      <DemoSection label="Interactive Demo">
        <div style={{ ...surfaceStyle, height: 200 }}>
          <div style={{ padding: 16 }}>
            <p style={{ fontSize: 13, color: "var(--rei-color-text-muted)", marginBottom: 12 }}>
              Click the operations in the toolbar to toggle formatting. The toolbar appears above the simulated selection.
            </p>
            <div ref={anchorRef} style={selectionStyle}>
              Selected text content
            </div>
          </div>
          {showToolbar && (
            <SelectionToolbar
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
          <SelectionToolbar
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
          <SelectionToolbar
            anchor={{ x: 150, y: 60, width: 120, height: 20 }}
            operations={[
              { id: "bold", label: "Bold", icon: boldIcon, disabled: true },
              { id: "italic", label: "Italic", icon: italicIcon, disabled: true },
              { id: "link", label: "Add Link", icon: linkIcon },
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
          <SelectionToolbar
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
