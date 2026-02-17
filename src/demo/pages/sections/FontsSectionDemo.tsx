/**
 * @file FontsSectionDemo - Demo page for FontsSection
 */

import { useState, type CSSProperties } from "react";
import { FontsSection } from "../../../sections/FontsSection/FontsSection";
import type { FontsData, FontItem } from "../../../sections/FontsSection/types";

const containerStyle: CSSProperties = {
  padding: 24,
  maxWidth: 400,
};

const sectionWrapperStyle: CSSProperties = {
  padding: 16,
  backgroundColor: "var(--rei-color-surface)",
  borderRadius: 8,
  border: "1px solid var(--rei-color-border)",
};

const stateDisplayStyle: CSSProperties = {
  marginTop: 12,
  padding: 8,
  backgroundColor: "var(--rei-color-surface-raised)",
  borderRadius: 4,
  fontSize: 11,
  fontFamily: "monospace",
  color: "var(--rei-color-text-muted)",
  whiteSpace: "pre-wrap",
  maxHeight: 100,
  overflow: "auto",
};

const sampleFonts: FontItem[] = [
  { name: "SF Pro", family: "SF Pro, -apple-system, sans-serif", category: "sans-serif" },
  { name: "Inter", family: "Inter, sans-serif", category: "sans-serif" },
  { name: "Roboto", family: "Roboto, sans-serif", category: "sans-serif" },
  { name: "Arial", family: "Arial, sans-serif", category: "sans-serif" },
  { name: "Georgia", family: "Georgia, serif", category: "serif" },
  { name: "Times New Roman", family: "Times New Roman, serif", category: "serif" },
  { name: "Fira Code", family: "Fira Code, monospace", category: "monospace" },
  { name: "JetBrains Mono", family: "JetBrains Mono, monospace", category: "monospace" },
  { name: "Pacifico", family: "Pacifico, cursive", category: "handwriting" },
  { name: "Lobster", family: "Lobster, cursive", category: "display" },
];

/**
 * FontsSection demo page.
 */
export function FontsSectionDemo() {
  const [data, setData] = useState<FontsData>({
    selectedFont: "Inter",
    searchQuery: "",
    category: "all",
  });

  const handleSelectFont = (fontName: string) => {
    console.log("Selected font:", fontName);
  };

  return (
    <div style={containerStyle}>
      <div style={sectionWrapperStyle}>
        <FontsSection
          fonts={sampleFonts}
          data={data}
          onChange={setData}
          onSelectFont={handleSelectFont}
          maxListHeight={200}
        />
        <div style={stateDisplayStyle}>{JSON.stringify(data, null, 2)}</div>
      </div>
    </div>
  );
}
