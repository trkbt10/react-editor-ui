/**
 * @file FontsPanel demo page
 */

import { useState } from "react";
import {
  demoContainerStyle,
  demoSectionStyle,
  demoLabelStyle,
} from "../../components";
import { FontsPanel } from "../../../components/FontsPanel/FontsPanel";
import { LocalFontList } from "../../../components/FontsPanel/LocalFontList";
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

export function FontsPanelDemo() {
  const [selectedFont, setSelectedFont] = useState("SF Pro");
  const [localSelectedFont, setLocalSelectedFont] = useState("");

  // Get font family for preview (from sampleFonts or local font)
  const previewFontFamily = localSelectedFont
    ? `"${localSelectedFont}", sans-serif`
    : sampleFonts.find((f) => f.name === selectedFont)?.family ?? "inherit";

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>FontsPanel</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Basic Panel (with predefined fonts)</div>
        <FontsPanel
          fonts={sampleFonts}
          selectedFont={selectedFont}
          onSelectFont={(font) => {
            setSelectedFont(font);
            setLocalSelectedFont("");
          }}
          onClose={() => alert("Close clicked")}
          onSettings={() => alert("Settings clicked")}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>
          Local Font List (via queryLocalFonts API)
        </div>
        <LocalFontList
          selectedFont={localSelectedFont}
          onSelectFont={(font) => {
            setLocalSelectedFont(font);
            setSelectedFont("");
          }}
          onClose={() => alert("Close clicked")}
          onSettings={() => alert("Settings clicked")}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>
          Selected: {localSelectedFont || selectedFont || "None"}
        </div>
        <div
          style={{
            backgroundColor: "var(--rei-color-surface, #1e1f24)",
            borderRadius: "4px",
            padding: "24px",
            fontFamily: previewFontFamily,
            fontSize: "24px",
            color: "var(--rei-color-text)",
          }}
        >
          The quick brown fox jumps over the lazy dog
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Custom Size</div>
        <FontsPanel
          fonts={sampleFonts}
          selectedFont={selectedFont}
          onSelectFont={setSelectedFont}
          width={350}
          maxHeight={300}
        />
      </div>
    </div>
  );
}
