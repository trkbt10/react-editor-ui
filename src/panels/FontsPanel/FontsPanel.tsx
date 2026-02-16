/**
 * @file FontsPanel component - Floating font picker panel with search and category filter
 */

import { useState, useMemo, type CSSProperties } from "react";
import { Select, type SelectOption } from "../../components/Select/Select";
import {
  COLOR_SURFACE,
  COLOR_SURFACE_RAISED,
  COLOR_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  RADIUS_LG,
  SHADOW_LG,
  SIZE_FONT_SM,
  SIZE_FONT_MD,
  SPACE_SM,
  SPACE_MD,
  SPACE_LG,
} from "../../constants/styles";
import { FontPanelHeader } from "./FontPanelHeader";
import { FontSearchInput } from "./FontSearchInput";
import { FontListItemBase } from "./FontListItemBase";

export type FontCategory = "all" | "serif" | "sans-serif" | "monospace" | "display" | "handwriting";

export type FontItem = {
  name: string;
  family: string;
  category?: FontCategory;
};

export type FontsPanelProps = {
  fonts: FontItem[];
  selectedFont: string;
  onSelectFont: (fontName: string) => void;
  onClose?: () => void;
  onSettings?: () => void;
  width?: number | string;
  maxHeight?: number | string;
};

const categoryOptions: SelectOption<FontCategory>[] = [
  { value: "all", label: "All fonts" },
  { value: "serif", label: "Serif" },
  { value: "sans-serif", label: "Sans Serif" },
  { value: "monospace", label: "Monospace" },
  { value: "display", label: "Display" },
  { value: "handwriting", label: "Handwriting" },
];

function formatDimension(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

// ============================================================================
// Styles
// ============================================================================

function createContainerStyle(width: number | string, maxHeight: number | string): CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    width: formatDimension(width),
    maxHeight: formatDimension(maxHeight),
    backgroundColor: COLOR_SURFACE,
    border: `1px solid ${COLOR_BORDER}`,
    borderRadius: RADIUS_LG,
    boxShadow: SHADOW_LG,
    overflow: "hidden",
  };
}

const filterSectionStyle: CSSProperties = {
  padding: `${SPACE_SM} ${SPACE_MD}`,
  borderBottom: `1px solid ${COLOR_BORDER}`,
  flexShrink: 0,
};

const listStyle: CSSProperties = {
  flex: 1,
  overflowY: "auto",
  backgroundColor: COLOR_SURFACE_RAISED,
};

const emptyStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: SPACE_LG,
  color: COLOR_TEXT_MUTED,
  fontSize: SIZE_FONT_SM,
};

const fontNameStyle: CSSProperties = {
  flex: 1,
  color: COLOR_TEXT,
  fontSize: SIZE_FONT_MD,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

// ============================================================================
// Sub Components
// ============================================================================

type FontListItemProps = {
  font: FontItem;
  isSelected: boolean;
  onSelect: () => void;
};

function FontListItem({ font, isSelected, onSelect }: FontListItemProps) {
  return (
    <FontListItemBase isSelected={isSelected} onSelect={onSelect}>
      <span style={{ ...fontNameStyle, fontFamily: font.family }}>{font.name}</span>
    </FontListItemBase>
  );
}

type FontListContentProps = {
  fonts: FontItem[];
  selectedFont: string;
  onSelectFont: (fontName: string) => void;
};

function FontListContent({ fonts, selectedFont, onSelectFont }: FontListContentProps) {
  if (fonts.length === 0) {
    return <div style={emptyStyle}>No fonts found</div>;
  }

  return (
    <>
      {fonts.map((font) => (
        <FontListItem
          key={font.name}
          font={font}
          isSelected={font.name === selectedFont}
          onSelect={() => onSelectFont(font.name)}
        />
      ))}
    </>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/** Scrollable font picker panel with search and family/style grouping */
export function FontsPanel({
  fonts,
  selectedFont,
  onSelectFont,
  onClose,
  onSettings,
  width = 280,
  maxHeight = 400,
}: FontsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<FontCategory>("all");

  const filteredFonts = useMemo(() => {
    return fonts.filter((font) => {
      const matchesSearch = font.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category === "all" || font.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [fonts, searchQuery, category]);

  return (
    <div style={createContainerStyle(width, maxHeight)}>
      <FontPanelHeader
        title="Fonts"
        onClose={onClose}
        onSettings={onSettings}
      />

      <FontSearchInput value={searchQuery} onChange={setSearchQuery} />

      <div style={filterSectionStyle}>
        <Select
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          aria-label="Font category"
        />
      </div>

      <div style={listStyle} role="listbox" aria-label="Fonts">
        <FontListContent
          fonts={filteredFonts}
          selectedFont={selectedFont}
          onSelectFont={onSelectFont}
        />
      </div>
    </div>
  );
}
