/**
 * @file FontsPanel demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoSurface,
  DemoPreview,
} from "../../components";
import { FontsPanel } from "../../../panels/FontsPanel/FontsPanel";
import { LocalFontList } from "../../../panels/FontsPanel/LocalFontList";
import type { FontItem } from "../../../sections/FontsSection/types";

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
    <DemoContainer title="FontsPanel">
      <DemoSection label="Basic Panel (with predefined fonts)">
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
      </DemoSection>

      <DemoSection label="Local Font List (via queryLocalFonts API)">
        <LocalFontList
          selectedFont={localSelectedFont}
          onSelectFont={(font) => {
            setLocalSelectedFont(font);
            setSelectedFont("");
          }}
          onClose={() => alert("Close clicked")}
          onSettings={() => alert("Settings clicked")}
        />
      </DemoSection>

      <DemoSection label={`Selected: ${localSelectedFont || selectedFont || "None"}`}>
        <DemoPreview
          style={{
            fontFamily: previewFontFamily,
            fontSize: "24px",
          }}
        >
          The quick brown fox jumps over the lazy dog
        </DemoPreview>
      </DemoSection>

      <DemoSection label="Custom Size">
        <FontsPanel
          fonts={sampleFonts}
          selectedFont={selectedFont}
          onSelectFont={setSelectedFont}
          width={350}
          maxHeight={300}
        />
      </DemoSection>
    </DemoContainer>
  );
}
