/**
 * @file TypographyPanel demo page
 */

import { useState } from "react";
import {
  demoContainerStyle,
  demoSectionStyle,
  demoLabelStyle,
} from "../../components";
import { TypographyPanel } from "../../../components/TypographyPanel/TypographyPanel";
import { FontsPanel } from "../../../components/FontsPanel/FontsPanel";
import type { TypographySettings } from "../../../components/TypographyPanel/TypographyPanel";
import type { FontItem } from "../../../components/FontsPanel/FontsPanel";

const sampleFonts: FontItem[] = [
  { name: "SF Pro", family: "'SF Pro', -apple-system, sans-serif", category: "sans-serif" },
  { name: "SF Pro Rounded", family: "'SF Pro Rounded', sans-serif", category: "sans-serif" },
  { name: "Inter", family: "'Inter', sans-serif", category: "sans-serif" },
  { name: "Roboto", family: "'Roboto', sans-serif", category: "sans-serif" },
  { name: "Open Sans", family: "'Open Sans', sans-serif", category: "sans-serif" },
  { name: "Lato", family: "'Lato', sans-serif", category: "sans-serif" },
  { name: "Playfair Display", family: "'Playfair Display', serif", category: "serif" },
  { name: "Georgia", family: "'Georgia', serif", category: "serif" },
  { name: "Merriweather", family: "'Merriweather', serif", category: "serif" },
  { name: "Fira Code", family: "'Fira Code', monospace", category: "monospace" },
  { name: "JetBrains Mono", family: "'JetBrains Mono', monospace", category: "monospace" },
  { name: "Pacifico", family: "'Pacifico', cursive", category: "display" },
  { name: "Dancing Script", family: "'Dancing Script', cursive", category: "handwriting" },
  { name: "Caveat", family: "'Caveat', cursive", category: "handwriting" },
];

function renderFontsPanelSection(
  showFontsPanel: boolean,
  settings: TypographySettings,
  setSettings: (settings: TypographySettings) => void,
  setShowFontsPanel: (show: boolean) => void,
) {
  if (!showFontsPanel) {
    return null;
  }
  return (
    <div style={demoSectionStyle}>
      <div style={demoLabelStyle}>FontsPanel (triggered from icon)</div>
      <FontsPanel
        fonts={sampleFonts}
        selectedFont={settings.fontFamily}
        onSelectFont={(font) => {
          setSettings({ ...settings, fontFamily: font });
        }}
        onClose={() => setShowFontsPanel(false)}
        onSettings={() => alert("Font settings clicked")}
      />
    </div>
  );
}

export function TypographyPanelDemo() {
  const [settings, setSettings] = useState<TypographySettings>({
    fontFamily: "SF Pro",
    fontWeight: "400",
    fontSize: "28",
    lineHeight: "Auto",
    letterSpacing: "0px",
    textAlign: "left",
    verticalAlign: "top",
  });

  const [showFontsPanel, setShowFontsPanel] = useState(false);

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>TypographyPanel</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Complete Panel</div>
        <div style={{ backgroundColor: "var(--rei-color-surface, #1e1f24)", borderRadius: "4px", width: 320 }}>
          <TypographyPanel
            settings={settings}
            onChange={setSettings}
            onOpenFontsPanel={() => setShowFontsPanel(true)}
            onOpenSettings={() => alert("Settings clicked")}
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Current Settings</div>
        <div style={{
          backgroundColor: "var(--rei-color-surface, #1e1f24)",
          borderRadius: "4px",
          padding: "12px",
          fontSize: "11px",
          fontFamily: "monospace",
          color: "var(--rei-color-text-muted)",
          whiteSpace: "pre-wrap",
        }}>
          {JSON.stringify(settings, null, 2)}
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Preview</div>
        <div
          style={{
            backgroundColor: "var(--rei-color-surface, #1e1f24)",
            borderRadius: "4px",
            padding: "24px",
            fontFamily: settings.fontFamily,
            fontWeight: Number(settings.fontWeight),
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight === "Auto" ? "normal" : settings.lineHeight,
            letterSpacing: settings.letterSpacing,
            textAlign: settings.textAlign,
            color: "var(--rei-color-text)",
          }}
        >
          The quick brown fox jumps over the lazy dog
        </div>
      </div>

      {renderFontsPanelSection(showFontsPanel, settings, setSettings, setShowFontsPanel)}
    </div>
  );
}
