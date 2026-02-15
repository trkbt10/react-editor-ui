/**
 * @file FontsPanel component - Floating font picker panel with search and category filter
 */

import { useState, useMemo, type CSSProperties } from "react";
import { Input } from "../Input/Input";
import { Select, type SelectOption } from "../Select/Select";
import { IconButton } from "../IconButton/IconButton";
import {
  COLOR_SURFACE,
  COLOR_SURFACE_RAISED,
  COLOR_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_HOVER,
  COLOR_SELECTED,
  COLOR_PRIMARY,
  RADIUS_LG,
  SHADOW_LG,
  SIZE_FONT_SM,
  SIZE_FONT_MD,
  SIZE_PANEL_HEADER_HEIGHT,
  SPACE_SM,
  SPACE_MD,
  SPACE_LG,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../constants/styles";

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
  className?: string;
};

const categoryOptions: SelectOption<FontCategory>[] = [
  { value: "all", label: "All fonts" },
  { value: "serif", label: "Serif" },
  { value: "sans-serif", label: "Sans Serif" },
  { value: "monospace", label: "Monospace" },
  { value: "display", label: "Display" },
  { value: "handwriting", label: "Handwriting" },
];

// Icons
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function formatWidth(width: number | string): string {
  if (typeof width === "number") {
    return `${width}px`;
  }
  return width;
}

function formatMaxHeight(maxHeight: number | string): string {
  if (typeof maxHeight === "number") {
    return `${maxHeight}px`;
  }
  return maxHeight;
}

function renderSettingsButton(onSettings?: () => void) {
  if (!onSettings) {
    return null;
  }
  return (
    <IconButton
      icon={<SettingsIcon />}
      aria-label="Font settings"
      size="sm"
      onClick={onSettings}
    />
  );
}

function renderCloseButton(onClose?: () => void) {
  if (!onClose) {
    return null;
  }
  return (
    <IconButton
      icon={<CloseIcon />}
      aria-label="Close"
      size="sm"
      onClick={onClose}
    />
  );
}

function renderFontList(
  fonts: FontItem[],
  selectedFont: string,
  onSelectFont: (fontName: string) => void,
  emptyStyle: CSSProperties,
) {
  if (fonts.length === 0) {
    return <div style={emptyStyle}>No fonts found</div>;
  }
  return fonts.map((font) => (
    <FontListItem
      key={font.name}
      font={font}
      isSelected={font.name === selectedFont}
      onSelect={() => onSelectFont(font.name)}
    />
  ));
}

function FontListItem({
  font,
  isSelected,
  onSelect,
}: {
  font: FontItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const itemStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: SPACE_MD,
    padding: `${SPACE_SM} ${SPACE_LG}`,
    backgroundColor: isSelected ? COLOR_SELECTED : isHovered ? COLOR_HOVER : "transparent",
    cursor: "pointer",
    transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
  };

  const checkboxStyle: CSSProperties = {
    width: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: isSelected ? COLOR_PRIMARY : "transparent",
  };

  const nameStyle: CSSProperties = {
    flex: 1,
    color: COLOR_TEXT,
    fontSize: SIZE_FONT_MD,
    fontFamily: font.family,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      style={itemStyle}
    >
      <span style={checkboxStyle}>
        {isSelected ? <CheckIcon /> : null}
      </span>
      <span style={nameStyle}>{font.name}</span>
    </div>
  );
}






export function FontsPanel({
  fonts,
  selectedFont,
  onSelectFont,
  onClose,
  onSettings,
  width = 280,
  maxHeight = 400,
  className,
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

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: formatWidth(width),
    maxHeight: formatMaxHeight(maxHeight),
    backgroundColor: COLOR_SURFACE,
    border: `1px solid ${COLOR_BORDER}`,
    borderRadius: RADIUS_LG,
    boxShadow: SHADOW_LG,
    overflow: "hidden",
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: SIZE_PANEL_HEADER_HEIGHT,
    padding: `0 ${SPACE_LG}`,
    borderBottom: `1px solid ${COLOR_BORDER}`,
    boxSizing: "border-box",
    flexShrink: 0,
  };

  const titleStyle: CSSProperties = {
    color: COLOR_TEXT,
    fontSize: SIZE_FONT_MD,
    fontWeight: 600,
    margin: 0,
  };

  const headerActionsStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: SPACE_SM,
  };

  const searchContainerStyle: CSSProperties = {
    padding: SPACE_MD,
    borderBottom: `1px solid ${COLOR_BORDER}`,
    flexShrink: 0,
  };

  const filterContainerStyle: CSSProperties = {
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

  return (
    <div className={className} style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h3 style={titleStyle}>Fonts</h3>
        <div style={headerActionsStyle}>
          {renderSettingsButton(onSettings)}
          {renderCloseButton(onClose)}
        </div>
      </div>

      {/* Search */}
      <div style={searchContainerStyle}>
        <Input
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search fonts..."
          iconStart={<SearchIcon />}
          clearable
          aria-label="Search fonts"
        />
      </div>

      {/* Category Filter */}
      <div style={filterContainerStyle}>
        <Select
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          aria-label="Font category"
        />
      </div>

      {/* Font List */}
      <div style={listStyle} role="listbox" aria-label="Fonts">
        {renderFontList(filteredFonts, selectedFont, onSelectFont, emptyStyle)}
      </div>
    </div>
  );
}
