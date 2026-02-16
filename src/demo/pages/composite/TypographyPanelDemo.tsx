/**
 * @file TypographyPanel demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoSurface,
  DemoStateDisplay,
  DemoPreview,
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
    <DemoSection label="FontsPanel (triggered from icon)">
      <FontsPanel
        fonts={sampleFonts}
        selectedFont={settings.fontFamily}
        onSelectFont={(font) => {
          setSettings({ ...settings, fontFamily: font });
        }}
        onClose={() => setShowFontsPanel(false)}
        onSettings={() => alert("Font settings clicked")}
      />
    </DemoSection>
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
    <DemoContainer title="TypographyPanel">
      <DemoSection label="Complete Panel">
        <DemoSurface>
          <div style={{ width: 320 }}>
            <TypographyPanel
              settings={settings}
              onChange={setSettings}
              onOpenFontsPanel={() => setShowFontsPanel(true)}
              onOpenSettings={() => alert("Settings clicked")}
            />
          </div>
        </DemoSurface>
      </DemoSection>

      <DemoSection label="Current Settings">
        <DemoStateDisplay value={settings} />
      </DemoSection>

      <DemoSection label="Preview">
        <DemoPreview
          style={{
            fontFamily: settings.fontFamily,
            fontWeight: Number(settings.fontWeight),
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight === "Auto" ? "normal" : settings.lineHeight,
            letterSpacing: settings.letterSpacing,
            textAlign: settings.textAlign,
          }}
        >
          The quick brown fox jumps over the lazy dog
        </DemoPreview>
      </DemoSection>

      {renderFontsPanelSection(showFontsPanel, settings, setSettings, setShowFontsPanel)}
    </DemoContainer>
  );
}
